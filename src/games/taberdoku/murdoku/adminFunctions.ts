import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function verifyAdmin(ctx: Ctx): Promise<void> {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Unauthorized: admin role required");
}

async function updateRow(ctx: Ctx, caseId: string, values: Record<string, unknown>) {
  const { data, error } = await ctx.supabase
    .from("murdoku_cases")
    .update(values)
    .eq("id", caseId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Case not found or not allowed");
  return { success: true };
}

export const approveCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ caseId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await verifyAdmin(context as Ctx);
    return updateRow(context as Ctx, data.caseId, { status: "approved", rejection_note: null });
  });

export const rejectCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      caseId: z.string().uuid(),
      note: z.string().min(1, "Rejection note is required"),
    }),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context as Ctx);
    return updateRow(context as Ctx, data.caseId, {
      status: "rejected",
      rejection_note: data.note,
    });
  });

export const updateCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      caseId: z.string().uuid(),
      title: z.string().min(1),
      titleI18n: z.record(z.string(), z.string()).optional(),
      boardId: z.string().uuid().nullable(),
      image: z.string().nullable(),
      content: z.any(),
      difficulty: z.number().min(1).max(5).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context as Ctx);

    // Leer el estado actual para preservarlo al guardar cambios
    const { data: currentCase } = await (context as Ctx).supabase
      .from("murdoku_cases")
      .select("status")
      .eq("id", data.caseId)
      .single();

    return updateRow(context as Ctx, data.caseId, {
      title: data.title,
      title_i18n: data.titleI18n,
      board_id: data.boardId,
      image: data.image,
      content: data.content,
      difficulty: data.difficulty ?? currentCase?.difficulty ?? 3,
      status: currentCase?.status ?? "pending_review",
      rejection_note: null,
    });
  });
