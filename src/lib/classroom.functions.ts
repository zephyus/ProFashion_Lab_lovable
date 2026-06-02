import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEFAULT_TEACHER_CODE = "TEACHER2026";

function teacherSignupCode() {
  return process.env.TEACHER_SIGNUP_CODE ?? DEFAULT_TEACHER_CODE;
}

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ===== 角色 =====

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r) => r.role as string), userId };
  });

export const claimTeacherRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.code.trim() !== teacherSignupCode()) {
      throw new Error("教師註冊碼錯誤");
    }
    // 用 admin client 寫入 user_roles（RLS 不允許 INSERT）
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "teacher" })
      .select();
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

// ===== 班級 =====

export const createClassroom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      name: z.string().min(1).max(80),
      school_name: z.string().max(120).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 確認是教師
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "teacher")) {
      throw new Error("僅教師可建立班級。請先到「我是老師」頁面註冊。");
    }

    // 生成不重複邀請碼（用 admin 查全表）
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let invite_code = randomCode();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabaseAdmin.from("classrooms").select("id").eq("invite_code", invite_code).maybeSingle();
      if (!exists) break;
      invite_code = randomCode();
    }

    const { data: row, error } = await supabase
      .from("classrooms")
      .insert({
        teacher_id: userId,
        name: data.name,
        school_name: data.school_name ?? null,
        invite_code,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { classroom: row };
  });

export const getMyClassrooms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [ownedRes, joinedRes] = await Promise.all([
      supabase.from("classrooms").select("*").eq("teacher_id", userId).order("created_at", { ascending: false }),
      supabase
        .from("classroom_members")
        .select("joined_at, classrooms(*)")
        .eq("student_id", userId),
    ]);

    if (ownedRes.error) throw new Error(ownedRes.error.message);
    if (joinedRes.error) throw new Error(joinedRes.error.message);

    return {
      owned: ownedRes.data ?? [],
      joined: (joinedRes.data ?? []).map((m) => ({
        joined_at: m.joined_at,
        classroom: m.classrooms,
      })),
    };
  });

export const joinClassroom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const code = data.code.trim().toUpperCase();

    // 用 admin 查邀請碼（RLS 不開放任意查詢，避免洩漏其他班級）
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: room, error: lookupErr } = await supabaseAdmin
      .from("classrooms")
      .select("id, name, school_name")
      .eq("invite_code", code)
      .maybeSingle();
    if (lookupErr) throw new Error(lookupErr.message);
    if (!room) throw new Error("找不到此邀請碼對應的班級");

    // 用 admin 寫入加入記錄（避免依賴使用者端 RLS INSERT 的後續查詢）
    const { error: joinErr } = await supabaseAdmin
      .from("classroom_members")
      .insert({ classroom_id: room.id, student_id: userId });
    if (joinErr && !joinErr.message.includes("duplicate")) throw new Error(joinErr.message);

    return { classroom: room };
  });

export const getClassroomStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ classroomId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 確認該班屬於這位教師
    const { data: room, error: roomErr } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", data.classroomId)
      .eq("teacher_id", userId)
      .maybeSingle();
    if (roomErr) throw new Error(roomErr.message);
    if (!room) throw new Error("找不到班級或你無權限查看");

    // 用 admin client 跨資料表聚合（profiles + exploration_events + call_sessions + quiz_results）
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: members } = await supabaseAdmin
      .from("classroom_members")
      .select("student_id, joined_at")
      .eq("classroom_id", data.classroomId);

    const studentIds = (members ?? []).map((m) => m.student_id);
    if (studentIds.length === 0) return { classroom: room, students: [] };

    const [profilesRes, eventsRes, callsRes, quizzesRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name, email").in("id", studentIds),
      supabaseAdmin.from("exploration_events").select("user_id, xp_delta, created_at, event_type").in("user_id", studentIds),
      supabaseAdmin.from("call_sessions").select("user_id, persona_name, created_at").in("user_id", studentIds),
      supabaseAdmin.from("quiz_results").select("user_id, archetype, created_at").in("user_id", studentIds).order("created_at", { ascending: false }),
    ]);

    const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const stats = new Map<string, { xp: number; events: number; calls: number; quizzes: number; lastActive: string | null; archetype: string | null }>();
    studentIds.forEach((id) => stats.set(id, { xp: 0, events: 0, calls: 0, quizzes: 0, lastActive: null, archetype: null }));

    (eventsRes.data ?? []).forEach((e) => {
      const s = stats.get(e.user_id)!;
      s.xp += e.xp_delta ?? 0;
      s.events += 1;
      if (!s.lastActive || e.created_at > s.lastActive) s.lastActive = e.created_at;
    });
    (callsRes.data ?? []).forEach((c) => {
      stats.get(c.user_id)!.calls += 1;
    });
    (quizzesRes.data ?? []).forEach((q) => {
      const s = stats.get(q.user_id)!;
      s.quizzes += 1;
      if (!s.archetype) s.archetype = q.archetype; // 第一筆是最新
    });

    const students = (members ?? []).map((m) => ({
      student_id: m.student_id,
      joined_at: m.joined_at,
      profile: profileById.get(m.student_id) ?? null,
      stats: stats.get(m.student_id)!,
    }));

    return { classroom: room, students };
  });
