import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { useIsAdmin } from "@/platform/hooks/useIsAdmin";
import { fetchBoards, type Board } from "@/games/taberdoku/murdoku/logic/cases";
import { BoardCreator } from "./BoardCreator";

export function BoardAdminSection() {
  const { t, lang } = useI18n();
  const { isAdmin, loading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const {
    data: boards = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["murdoku-boards"],
    queryFn: fetchBoards,
    enabled: isAdmin,
  });

  if (loading) {
    return <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!isAdmin) {
    return (
      <p role="alert" className="text-center text-sm text-destructive">
        {t("admin.notAdmin")}
      </p>
    );
  }

  if (selectedBoard || creatingBoard) {
    return (
      <BoardCreator
        initialBoard={selectedBoard}
        embedded
        onCancel={() => {
          setSelectedBoard(null);
          setCreatingBoard(false);
        }}
        onCreated={async () => {
          await queryClient.invalidateQueries({ queryKey: ["murdoku-boards"] });
          setSelectedBoard(null);
          setCreatingBoard(false);
        }}
      />
    );
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("boardAdmin.sharedBoardWarning")}</p>
      <button
        type="button"
        onClick={() => setCreatingBoard(true)}
        className="flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
      >
        <Plus className="h-4 w-4" />
        {t("boardAdmin.createBoard")}
      </button>
      {isPending && (
        <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>
      )}
      {isError && (
        <p role="alert" className="text-center text-sm text-destructive">
          {t("admin.error")}
        </p>
      )}
      {!isPending && boards.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">{t("creator.noBoards")}</p>
      )}
      <div className="space-y-3">
        {boards.map((board) => (
          <article
            key={board.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <h2 className="font-semibold text-foreground">
                {board.nameI18n?.[lang] || board.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {board.gridRows} × {board.gridCols} · {board.rooms.length} {t("murdoku.rooms")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedBoard(board)}
              className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
            >
              {t("boardAdmin.editBoard")}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
