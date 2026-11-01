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
      image: z.string().nullable(),
      content: z.any(),
    }),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context as Ctx);
    return updateRow(context as Ctx, data.caseId, {
      title: data.title,
      image: data.image,
      content: data.content,
      status: "pending_review",
      rejection_note: null,
    });
  });
