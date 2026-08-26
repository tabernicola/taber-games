import type { Cell } from "../logic/pieces";

export type PieceState = {
  id: string;
  name: string;
  color: string;
  cells: Cell[];
};
