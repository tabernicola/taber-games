import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type Claims = Record<string, unknown>;

async function verifyAdmin(): Promise<void> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No authorization header");
  }
  const token = authHeader.replace("Bearer ", "");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const res = await supabaseAdmin.auth.getClaims(token);
  if (res.error || !res.data?.claims) {
    throw new Error("Unauthorized: Invalid token");
  }

  const claims = res.data.claims as Claims;
  const appMetadata = (claims.app_metadata ?? claims.app_meta) as
    | Record<string, unknown>
    | undefined;
  const userMetadata = claims.user_metadata as Record<string, unknown> | undefined;
  const roles = appMetadata?.roles as unknown[] | undefined;

  const isAdmin =
    appMetadata?.role === "admin" ||
    userMetadata?.role === "admin" ||
    (roles?.includes("admin") ?? false);

  if (!isAdmin) {
    throw new Error("Unauthorized: admin role required");
  }
}

export const approveCase = createServerFn({ method: "POST" })
  .validator(
    z.object({
      caseId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("murdoku_cases")
      .update({ status: "approved", rejection_note: null })
      .eq("id", data.caseId);
    if (error) throw error;
    return { success: true };
  });

export const rejectCase = createServerFn({ method: "POST" })
  .validator(
    z.object({
      caseId: z.string().uuid(),
      note: z.string().min(1, "Rejection note is required"),
    }),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("murdoku_cases")
      .update({ status: "rejected", rejection_note: data.note })
      .eq("id", data.caseId);
    if (error) throw error;
    return { success: true };
  });
