import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const positionSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
});

const roomSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(100),
  nameI18n: z.record(z.string(), z.string()).optional(),
  emoji: z.string().max(16).optional(),
  cells: z.array(positionSchema),
  namePosition: positionSchema.optional(),
  nameOrientation: z.enum(["horizontal", "vertical"]).optional(),
  nameAlignment: z.enum(["top", "bottom"]).optional(),
});

const boardElementSchema = z.object({
  elementId: z.string().min(1).max(100),
  roomId: z.string().min(1).max(80),
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  sortOrder: z.number().int().min(0),
  instanceId: z.string().min(1).max(100),
});

const boardDataSchema = z.object({
  name: z.string().trim().min(1).max(100),
  gridRows: z.number().int().min(6).max(9),
  gridCols: z.number().int().min(6).max(9),
  rooms: z.array(roomSchema).min(1).max(81),
  elements: z.array(boardElementSchema).max(81),
});

function validateBoard(board: z.infer<typeof boardDataSchema>, context: z.RefinementCtx): void {
  const roomIds = new Set<string>();
  const roomByCell = new Map<string, string>();
  for (const [roomIndex, room] of board.rooms.entries()) {
    if (roomIds.has(room.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rooms", roomIndex, "id"],
        message: "Room IDs must be unique",
      });
    }
    roomIds.add(room.id);
    if (!room.cells.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rooms", roomIndex, "cells"],
        message: "Every room must contain at least one cell",
      });
    }
    for (const cell of room.cells) {
      const key = `${cell.row},${cell.col}`;
      if (cell.row >= board.gridRows || cell.col >= board.gridCols) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rooms", roomIndex, "cells"],
          message: "Room cells must be inside the board",
        });
      }
      if (roomByCell.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rooms", roomIndex, "cells"],
          message: "A cell can belong to only one room",
        });
      }
      roomByCell.set(key, room.id);
    }
  }

  for (let row = 0; row < board.gridRows; row += 1) {
    for (let col = 0; col < board.gridCols; col += 1) {
      if (!roomByCell.has(`${row},${col}`)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rooms"],
          message: "Every board cell must belong to a room",
        });
      }
    }
  }

  const occupiedCells = new Set<string>();
  for (const [index, element] of board.elements.entries()) {
    const key = `${element.row},${element.col}`;
    if (
      element.row >= board.gridRows ||
      element.col >= board.gridCols ||
      roomByCell.get(key) !== element.roomId
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["elements", index],
        message: "Elements must be placed in a cell belonging to their room",
      });
    }
    if (occupiedCells.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["elements", index],
        message: "Only one element can be placed in each cell",
      });
    }
    occupiedCells.add(key);
  }
}

const boardInputSchema = boardDataSchema.superRefine(validateBoard);
const updateBoardInputSchema = boardDataSchema
  .extend({ boardId: z.string().uuid() })
  .superRefine(validateBoard);

function toSlug(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${normalized || "board"}-${crypto.randomUUID()}`;
}

export const createMurdokuBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(boardInputSchema)
  .handler(async ({ data, context }) => {
    const { data: boardId, error } = await context.supabase.rpc("create_murdoku_board", {
      p_name: data.name,
      p_slug: toSlug(data.name),
      p_grid_rows: data.gridRows,
      p_grid_cols: data.gridCols,
      p_rooms: data.rooms,
      p_elements: data.elements.map((element) => ({
        element_id: element.elementId,
        room_id: element.roomId,
        row_index: element.row,
        col_index: element.col,
        sort_order: element.sortOrder,
        instance_id: element.instanceId,
      })),
    });
    if (error) throw error;
    return { boardId };
  });

export const updateMurdokuBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(updateBoardInputSchema)
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw roleError;
    if (!isAdmin) throw new Error("Unauthorized: admin role required.");

    const { data: boardId, error } = await context.supabase.rpc("update_murdoku_board", {
      p_board_id: data.boardId,
      p_name: data.name,
      p_grid_rows: data.gridRows,
      p_grid_cols: data.gridCols,
      p_rooms: data.rooms,
      p_elements: data.elements.map((element) => ({
        element_id: element.elementId,
        room_id: element.roomId,
        row_index: element.row,
        col_index: element.col,
        sort_order: element.sortOrder,
        instance_id: element.instanceId,
      })),
    });
    if (error) throw error;
    return { boardId };
  });
