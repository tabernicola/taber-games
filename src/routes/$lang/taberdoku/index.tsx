import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { Home } from "@/games/taberdoku/components/Home";

export const Route = createFileRoute("/$lang/taberdoku/")({
  head: () => ({
    meta: pageMeta({
      title: "Taberdoku — The Taber Games",
      ogTitle: "Taberdoku",
      description:
        "Three Sudoku-style deduction games in one: Murdoku, Star Battle, and classic Sudoku. Choose your game.",
    }),
  }),
  component: Home,
});
