import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ===== 學生事件記錄 =====

const LogEventInput = z.object({
  event_type: z.string().min(1).max(80),
  payload: z.record(z.string(), z.any()).optional(),
  xp_delta: z.number().int().min(0).max(500).optional(),
});

export const logExplorationEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LogEventInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("exploration_events").insert({
      user_id: userId,
      event_type: data.event_type,
      payload: data.payload ?? {},
      xp_delta: data.xp_delta ?? 0,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== 測驗結果 =====

const SaveQuizInput = z.object({
  archetype: z.string().min(1).max(120),
  summary: z.string().max(2000).optional(),
  answers: z.record(z.string(), z.any()),
});

export const saveQuizResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveQuizInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("quiz_results").insert({
      user_id: userId,
      archetype: data.archetype,
      summary: data.summary ?? null,
      answers: data.answers,
    });
    if (error) throw new Error(error.message);
    // 同時記事件
    await supabase.from("exploration_events").insert({
      user_id: userId,
      event_type: "quiz_completed",
      payload: { archetype: data.archetype },
      xp_delta: 30,
    });
    return { ok: true };
  });

// ===== 通話記錄 =====

const SaveCallInput = z.object({
  persona_id: z.string().min(1).max(80),
  persona_name: z.string().min(1).max(120),
  persona_job: z.string().max(200).optional(),
  script_lines_played: z.number().int().min(0).max(100),
  message_count: z.number().int().min(0).max(200),
  duration_seconds: z.number().int().min(0).max(36000).optional(),
  reflection: z.string().max(2000).optional(),
});

export const saveCallSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveCallInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("call_sessions").insert({
      user_id: userId,
      persona_id: data.persona_id,
      persona_name: data.persona_name,
      persona_job: data.persona_job ?? null,
      script_lines_played: data.script_lines_played,
      message_count: data.message_count,
      duration_seconds: data.duration_seconds ?? null,
      reflection: data.reflection ?? null,
    });
    if (error) throw new Error(error.message);
    await supabase.from("exploration_events").insert({
      user_id: userId,
      event_type: "call_completed",
      payload: { persona_id: data.persona_id, persona_name: data.persona_name },
      xp_delta: 20,
    });
    return { ok: true };
  });

// ===== 取得我的學習歷程（給 PDF 用）=====

export const getMyPortfolio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, quizRes, callRes, eventsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, email, created_at").eq("id", userId).maybeSingle(),
      supabase.from("quiz_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("call_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("exploration_events").select("event_type, payload, xp_delta, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    ]);

    const totalXp = (eventsRes.data ?? []).reduce((sum, e) => sum + (e.xp_delta ?? 0), 0);
    const firstEvent = (eventsRes.data ?? []).at(-1);
    const lastEvent = (eventsRes.data ?? [])[0];

    return {
      profile: profileRes.data,
      latestQuiz: (quizRes.data ?? [])[0] ?? null,
      allQuizzes: quizRes.data ?? [],
      calls: callRes.data ?? [],
      events: eventsRes.data ?? [],
      stats: {
        totalXp,
        totalEvents: (eventsRes.data ?? []).length,
        totalCalls: (callRes.data ?? []).length,
        totalQuizzes: (quizRes.data ?? []).length,
        firstActivityAt: firstEvent?.created_at ?? null,
        lastActivityAt: lastEvent?.created_at ?? null,
      },
    };
  });
