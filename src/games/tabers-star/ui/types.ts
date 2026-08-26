import type { Tri } from "../logic/geometry";

export type PieceState = {
  id: string;
  name: string;
  color: string;
  cells: Tri[];
};
