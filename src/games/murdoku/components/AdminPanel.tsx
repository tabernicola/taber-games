import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { approveCase, rejectCase } from "@/games/murdoku/adminFunctions";
import { fetchPendingCases } from "@/games/murdoku/logic/cases";
import { MurdokuGame } from "./MurdokuGame";
import type { MurdokuCase } from "@/games/murdoku/data/gameSchema";

export function AdminPanel() {
  const { t, slug } = useI18n();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [testCase, setTestCase] = useState<MurdokuCase | null>(null);
  const [rejectModal, setRejectModal] = useState<MurdokuCase | null>(null);

  const {
    data: pendingCases = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["murdoku-pending"],
    queryFn: fetchPendingCases,
  });

  const approveMutation = useMutation({
    mutationFn: (caseId: string) => approveCase({ data: { caseId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["murdoku-pending"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ caseId, note }: { caseId: string; note: string }) =>
      rejectCase({ data: { caseId, note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["murdoku-pending"] });
      setRejectModal(null);
    },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-20">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("admin.needsAuth")}{" "}
            <Link
              to="/$lang/auth"
              params={{ lang: slug }}
              className="text-neon-cyan hover:underline"
            >
              {t("creator.signIn")}
            </Link>
          </p>
        </main>
      </div>
    );
  }

  if (testCase) {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setTestCase(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t("admin.testCase")} ← {t("common.back")}
          </button>
        </header>
        <MurdokuGame case={testCase} onPlayAgain={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <h1
            className="text-2xl font-bold tracking-widest text-neon-pink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("admin.title")}
          </h1>
          <Link
            to="/$lang/murdoku"
            params={{ lang: slug }}
            className="text-sm text-muted-foreground hover:text-neon-cyan"
          >
            ← {t("common.back")}
          </Link>
        </header>

        {isPending && (
          <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        )}

        {isError && <p className="text-center text-sm text-destructive">{t("admin.error")}</p>}

        {pendingCases.length === 0 && !isPending && (
          <p className="text-center text-sm text-muted-foreground">{t("admin.noPending")}</p>
        )}

        <div className="mt-6 space-y-4">
          {pendingCases.map((c) => (
            <CaseRow
              key={c.id}
              caseData={c}
              onTest={() => setTestCase(c)}
              onApprove={() => void approveMutation.mutate(c.id)}
              onReject={() => setRejectModal(c)}
              approveLoading={approveMutation.isPending}
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
  onTest,
  onApprove,
  onReject,
  approveLoading,
}: {
  caseData: MurdokuCase;
  onTest: () => void;
  onApprove: () => void;
  onReject: () => void;
  approveLoading: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{caseData.title}</h3>
          <p className="text-xs text-muted-foreground">
            {t("admin.byCreator", { creator: caseData.creator_id ?? "anon" })}
            {" · "}
            {new Date(caseData.created_at).toLocaleDateString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {caseData.content.clues.length} {t("murdoku.clues")}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onTest}
            className="rounded border border-border bg-background px-2 py-1 text-xs font-semibold hover:border-neon-cyan hover:text-neon-cyan"
          >
            {t("admin.testCase")}
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={approveLoading}
            className="rounded border border-neon-cyan bg-neon-cyan/15 px-2 py-1 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/25"
          >
            {t("admin.approve")}
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded border border-destructive bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20"
          >
            {t("admin.reject")}
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 ${
        open ? "pointer-events-auto" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="rounded-xl border border-border bg-background p-6 w-full max-w-md">
        <h3 className="font-semibold">{t("admin.reject")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{caseData.title}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("admin.rejectNotePlaceholder")}
          rows={3}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
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
