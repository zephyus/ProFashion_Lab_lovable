import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ===== 綁定 =====

export const generateParentInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // 已有 pending 就回傳同一組
    const existing = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("student_id", context.userId)
      .eq("status", "pending")
      .maybeSingle();
    if (existing.data) return { link: existing.data };

    let code = randomCode();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabaseAdmin
        .from("parent_links")
        .select("id")
        .eq("invite_code", code)
        .maybeSingle();
      if (!exists) break;
      code = randomCode();
    }
    const { data, error } = await supabaseAdmin
      .from("parent_links")
      .insert({ student_id: context.userId, invite_code: code, status: "pending" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { link: data };
  });

export const bindParentByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ code: z.string().min(4).max(20) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.code.trim().toUpperCase();
    const { data: row, error } = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("invite_code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("找不到此邀請碼");
    if (row.student_id === context.userId) throw new Error("不能綁定自己");
    if (row.status === "active" && row.parent_id && row.parent_id !== context.userId) {
      throw new Error("此邀請碼已被使用");
    }

    const { error: updErr } = await supabaseAdmin
      .from("parent_links")
      .update({ parent_id: context.userId, status: "active" })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);

    // 雙方通知
    await supabaseAdmin.from("notifications").insert([
      {
        user_id: row.student_id,
        type: "parent_bound",
        title: "家長已綁定",
        body: "你的家長已成功完成綁定。",
        link: "/parent-link",
      },
      {
        user_id: context.userId,
        type: "parent_bound",
        title: "已成功綁定孩子",
        body: "你現在可以協助核可孩子的職涯活動。",
        link: "/parent",
      },
    ]);

    return { ok: true };
  });

export const unlinkParent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ linkId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("id", data.linkId)
      .maybeSingle();
    if (!row) throw new Error("找不到綁定");
    if (row.student_id !== context.userId && row.parent_id !== context.userId) {
      throw new Error("無權限");
    }
    const { error } = await supabaseAdmin
      .from("parent_links")
      .update({ status: "revoked" })
      .eq("id", data.linkId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyParents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links } = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("student_id", context.userId)
      .order("created_at", { ascending: false });
    const parentIds = (links ?? []).map((l) => l.parent_id).filter(Boolean) as string[];
    const profiles = parentIds.length
      ? (await supabaseAdmin.from("profiles").select("id, display_name, email").in("id", parentIds)).data ?? []
      : [];
    const byId = new Map(profiles.map((p) => [p.id, p]));
    return {
      links: (links ?? []).map((l) => ({
        ...l,
        parent_profile: l.parent_id ? byId.get(l.parent_id) ?? null : null,
      })),
    };
  });

export const listMyChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links } = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("parent_id", context.userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    const studentIds = (links ?? []).map((l) => l.student_id);
    const profiles = studentIds.length
      ? (await supabaseAdmin.from("profiles").select("id, display_name, email").in("id", studentIds)).data ?? []
      : [];
    const byId = new Map(profiles.map((p) => [p.id, p]));
    return {
      children: (links ?? []).map((l) => ({
        link_id: l.id,
        student_id: l.student_id,
        profile: byId.get(l.student_id) ?? null,
      })),
    };
  });

// ===== 同意請求 =====

export const submitConsentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      kind: z.enum(["intern_mission", "teacher_booking"]),
      payload: z.record(z.unknown()).default({}),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link } = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("student_id", context.userId)
      .eq("status", "active")
      .maybeSingle();
    if (!link?.parent_id) throw new Error("尚未綁定家長，請先邀請家長");

    const { data: req, error } = await supabaseAdmin
      .from("consent_requests")
      .insert({
        student_id: context.userId,
        parent_id: link.parent_id,
        kind: data.kind,
        payload: data.payload as never,
        status: "pending",
      })

      .select()
      .single();
    if (error) throw new Error(error.message);

    const title =
      data.kind === "teacher_booking" ? "新的職人預約請求" : "新的實習任務請求";
    await supabaseAdmin.from("notifications").insert({
      user_id: link.parent_id,
      type: `consent_${data.kind}`,
      title,
      body: "孩子送出了一筆需要你核可的請求。",
      link: "/parent",
    });
    return { request: req };
  });

export const listPendingConsents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reqs } = await supabaseAdmin
      .from("consent_requests")
      .select("*")
      .eq("parent_id", context.userId)
      .order("created_at", { ascending: false });
    const ids = Array.from(new Set((reqs ?? []).map((r) => r.student_id)));
    const profiles = ids.length
      ? (await supabaseAdmin.from("profiles").select("id, display_name, email").in("id", ids)).data ?? []
      : [];
    const byId = new Map(profiles.map((p) => [p.id, p]));
    return {
      requests: (reqs ?? []).map((r) => ({
        ...r,
        student_profile: byId.get(r.student_id) ?? null,
      })),
    };
  });

export const listMyConsents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("consent_requests")
      .select("*")
      .eq("student_id", context.userId)
      .order("created_at", { ascending: false });
    return { requests: data ?? [] };
  });

export const decideConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      decision: z.enum(["approved", "rejected"]),
      note: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("consent_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("找不到請求");
    if (row.parent_id !== context.userId) throw new Error("無權限");
    if (row.status !== "pending") throw new Error("已處理過");

    const { error } = await supabaseAdmin
      .from("consent_requests")
      .update({
        status: data.decision,
        parent_note: data.note ?? null,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const title = data.decision === "approved" ? "家長已同意你的請求" : "家長婉拒了你的請求";
    await supabaseAdmin.from("notifications").insert({
      user_id: row.student_id,
      type: `consent_${data.decision}`,
      title,
      body: data.note ?? (data.decision === "approved" ? "你可以繼續完成這項活動。" : "可以再和家長討論看看。"),
      link: "/inbox",
    });
    return { ok: true };
  });

// ===== 通知 =====

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return { notifications: data ?? [] };
  });

export const countUnread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .is("read_at", null);
    return { count: count ?? 0 };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .is("read_at", null);
    return { ok: true };
  });

// ===== Demo 設定（冪等）=====

const DEMO_STUDENT_EMAIL = "student@demo.profashion.lab";
const DEMO_PARENT_EMAIL = "parent@demo.profashion.lab";
const DEMO_INVITE_CODE = "DEMO01";

export const ensureDemoParentSetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ role: z.enum(["student", "parent"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 找出兩個 demo 帳號的 id（必須兩邊都登入過才存在）
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .in("email", [DEMO_STUDENT_EMAIL, DEMO_PARENT_EMAIL]);
    const studentRow = profiles?.find((p) => p.email === DEMO_STUDENT_EMAIL);
    const parentRow = profiles?.find((p) => p.email === DEMO_PARENT_EMAIL);
    const studentId = studentRow?.id;
    const parentId = parentRow?.id;

    if (!studentId) return { ok: true, note: "demo student not found yet" };

    // 確保 demo 邀請碼存在於該學生名下
    const { data: existing } = await supabaseAdmin
      .from("parent_links")
      .select("*")
      .eq("student_id", studentId)
      .eq("invite_code", DEMO_INVITE_CODE)
      .maybeSingle();

    let link = existing;
    if (!link) {
      const { data: inserted } = await supabaseAdmin
        .from("parent_links")
        .insert({
          student_id: studentId,
          invite_code: DEMO_INVITE_CODE,
          status: parentId ? "active" : "pending",
          parent_id: parentId ?? null,
        })
        .select()
        .single();
      link = inserted ?? null;
    } else if (parentId && (link.status !== "active" || link.parent_id !== parentId)) {
      const { data: updated } = await supabaseAdmin
        .from("parent_links")
        .update({ parent_id: parentId, status: "active" })
        .eq("id", link.id)
        .select()
        .single();
      link = updated ?? link;
    }

    // demo 學生：預先送一筆待核可請求（若還沒有任何 pending）
    if (data.role === "student" && context.userId === studentId && parentId) {
      const { data: pending } = await supabaseAdmin
        .from("consent_requests")
        .select("id")
        .eq("student_id", studentId)
        .eq("status", "pending")
        .maybeSingle();
      if (!pending) {
        const { data: req } = await supabaseAdmin
          .from("consent_requests")
          .insert({
            student_id: studentId,
            parent_id: parentId,
            kind: "teacher_booking",
            payload: {
              mentor_name: "陳師傅",
              mentor_job: "木工職人",
              slot: "週六 14:00–16:00",
            },
            status: "pending",
          })
          .select()
          .single();
        if (req) {
          await supabaseAdmin.from("notifications").insert({
            user_id: parentId,
            type: "consent_teacher_booking",
            title: "新的職人預約請求",
            body: "Demo 學生想預約陳師傅的木工體驗，需要你的核可。",
            link: "/parent",
          });
        }
      }
    }

    return { ok: true, link };
  });
