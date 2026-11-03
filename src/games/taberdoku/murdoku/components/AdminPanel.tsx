import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { approveCase, rejectCase, updateCase } from "@/games/taberdoku/murdoku/adminFunctions";
import { fetchAllCases, fetchCase, type MurdokuCase } from "@/games/taberdoku/murdoku/logic/cases";
import { MurdokuGame } from "./MurdokuGame";
import { CaseEditor } from "./CaseEditor";
import { useMurdokuTheme } from "@/games/taberdoku/murdoku/hooks/useMurdokuTheme";

import "@/games/taberdoku/murdoku/light-theme.css";

type View = "list" | "test" | "edit";

export function AdminPanel() {
  const { t, slug } = useI18n();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("list");
  const [selectedCase, setSelectedCase] = useState<MurdokuCase | null>(null);
  const [approveMode, setApproveMode] = useState(false);
  const [rejectModal, setRejectModal] = useState<MurdokuCase | null>(null);

  useMurdokuTheme();

  const {
    data: cases = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["murdoku-all-cases"],
    queryFn: fetchAllCases,
  });

  const approveMutation = useMutation({
    mutationFn: (caseId: string) => approveCase({ data: { caseId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["murdoku-all-cases"] });
      setView("list");
      setSelectedCase(null);
      setApproveMode(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ caseId, note }: { caseId: string; note: string }) =>
      rejectCase({ data: { caseId, note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["murdoku-all-cases"] });
      setView("list");
      setSelectedCase(null);
      setApproveMode(false);
      setRejectModal(null);
    },
  });

  if (loading) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="murdoku-light min-h-screen pb-20">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <h1 className="text-lg font-bold tracking-widest text-primary">{t("admin.title")}</h1>
        </header>
        <main className="mx-auto px-4 py-12 text-center">
          <p className="mt-4 text-sm text-muted-foreground">
            {t("admin.needsAuth")}{" "}
            <Link to="/$lang/auth" params={{ lang: slug }} className="text-primary hover:underline">
              {t("creator.signIn")}
            </Link>
          </p>
        </main>
      </div>
    );
  }

  if (view === "edit" && selectedCase) {
    return (
      <div className="murdoku-light min-h-screen pb-20">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setView("list");
              setSelectedCase(null);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t("admin.backToList")}
          </button>
          <h1 className="text-lg font-bold tracking-widest text-primary">{t("admin.editCase")}</h1>
        </header>
        <main className="mx-auto px-4 py-6">
          <CaseEditor initialCase={selectedCase} />
        </main>
      </div>
    );
  }

  if (view === "test" && selectedCase) {
    return (
      <div className="murdoku-light min-h-screen pb-20">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setView("list");
              setSelectedCase(null);
              setApproveMode(false);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t("admin.backToList")}
          </button>
          <h1 className="text-lg font-bold tracking-widest text-primary">
            {approveMode ? t("admin.testBeforeApprove") : t("admin.testCase")}
          </h1>
        </header>
        <main className="mx-auto px-4 py-6">
          <MurdokuGame case={selectedCase} onPlayAgain={() => {}} />
          {approveMode && (
            <div className="mt-6 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => void approveMutation.mutate(selectedCase.id)}
                disabled={approveMutation.isPending}
                className="rounded border border-primary bg-primary/15 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/25 disabled:opacity-50"
              >
                {approveMutation.isPending ? t("admin.approving") : t("admin.approveCase")}
              </button>
              <button
                type="button"
                onClick={() => setRejectModal(selectedCase)}
                className="rounded border border-destructive bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20"
              >
                {t("admin.rejectCase")}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="murdoku-light min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            to="/$lang/taberdoku/murdoku"
            params={{ lang: slug }}
            aria-label={t("common.back")}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold tracking-widest text-primary">{t("admin.title")}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex justify-end">
          <Link
            to="/$lang/taberdoku/murdoku/create"
            params={{ lang: slug }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-4 w-4" />
            {t("murdoku.createCase")}
          </Link>
        </div>

        {isPending && (
          <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        )}

        {isError && <p className="text-center text-sm text-destructive">{t("admin.error")}</p>}

        {cases.length === 0 && !isPending && (
          <p className="text-center text-sm text-muted-foreground">{t("admin.noCases")}</p>
        )}

        <div className="mt-6 space-y-4">
          {cases.map((c) => (
            <CaseRow
              key={c.id}
              caseData={c}
              onApprove={() => {
                setSelectedCase(c);
                setView("test");
                setApproveMode(true);
              }}
              onReject={() => setRejectModal(c)}
              onEdit={() => {
                setSelectedCase(c);
                setView("edit");
              }}
              approveLoading={approveMutation.isPending && approveMode}
              rejecting={rejectMutation.isPending}
            />
          ))}
        </div>

        {rejectModal && (
          <RejectModal
            caseData={rejectModal}
            open={true}
            onClose={() => setRejectModal(null)}
            onReject={(note) => {
              void rejectMutation.mutate({ caseId: rejectModal.id, note });
            }}
            rejecting={rejectMutation.isPending}
          />
        )}
      </main>
    </div>
  );
}

function CaseRow({
  caseData,
  onApprove,
  onReject,
  onEdit,
  approveLoading,
  rejecting,
}: {
  caseData: MurdokuCase;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  approveLoading: boolean;
  rejecting: boolean;
}) {
  const { t } = useI18n();
  const isApproved = caseData.status === "approved";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{caseData.title}</h3>
          <p className="text-xs text-muted-foreground">
            {t("admin.byCreator", { creator: caseData.creator_id ?? "anon" })}
            {" · "}
            {new Date(caseData.created_at).toLocaleDateString()}
            {" · "}
            {caseData.status}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {caseData.content.clues.length} {t("murdoku.clues")}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={isApproved ? onReject : onApprove}
            disabled={isApproved ? rejecting : approveLoading}
            className={`rounded border px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
              isApproved
                ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "border-primary bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            {isApproved ? t("admin.reject") : t("admin.approve")}
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={rejecting}
            className="rounded border border-secondary bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary hover:bg-secondary/20 disabled:opacity-50"
          >
            {t("admin.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  caseData,
  open,
  onClose,
  onReject,
  rejecting,
}: {
  caseData: MurdokuCase;
  open: boolean;
  onClose: () => void;
  onReject: (note: string) => void;
  rejecting: boolean;
}) {
  const { t } = useI18n();
  const [note, setNote] = useState("");
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 ${
        open ? "pointer-events-auto" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="rounded-xl border border-border bg-background p-6 w-full max-w-md">
        <h3 className="font-semibold text-foreground">{t("admin.reject")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{caseData.title}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("admin.rejectNotePlaceholder")}
          rows={3}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            {t("murdoku.cancel")}
          </button>
          <button
            type="button"
            onClick={() => onReject(note)}
            disabled={rejecting || !note.trim()}
            className="flex-1 rounded border border-destructive bg-destructive/15 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/25 disabled:opacity-50"
          >
            {rejecting ? t("admin.rejecting") : t("admin.reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
