import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const LS_KEY = "profashion_latest_quiz";

export interface QuizResult {
  archetype: string;
  summary: string | null;
  answers: Record<string, number>;
  created_at: string;
}

/**
 * 取得最新測驗結果。
 * - 已登入 → 優先從 Supabase 拿；若有結果也同步寫入 localStorage
 * - 未登入 → 從 localStorage 讀取（測驗完成時 ExploreQuiz 會寫入）
 * - 都沒有 → 回傳 null（首頁不顯示卡片）
 */
export function useLatestQuiz() {
  const { user, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 等 auth 載入完再判斷
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      // 1. 先試 localStorage（不管有沒有登入都先讀，速度最快）
      let localResult: QuizResult | null = null;
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          localResult = JSON.parse(raw) as QuizResult;
        }
      } catch { /* 解析失敗就跳過 */ }

      // 2. 若已登入，再試 Supabase（可能有更新的結果）
      if (user) {
        try {
          const { data, error } = await supabase
            .from("quiz_results")
            .select("archetype, summary, answers, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!cancelled && !error && data) {
            const supaResult: QuizResult = {
              archetype: data.archetype ?? "",
              summary: data.summary,
              answers: (data.answers ?? {}) as Record<string, number>,
              created_at: data.created_at,
            };

            // Supabase 結果比 localStorage 新 → 用 Supabase 的
            if (
              !localResult ||
              new Date(supaResult.created_at) >= new Date(localResult.created_at)
            ) {
              localResult = supaResult;
              // 同步寫回 localStorage
              try {
                localStorage.setItem(LS_KEY, JSON.stringify(supaResult));
              } catch { /* 寫不進去就算了 */ }
            }
          }
        } catch { /* 網路錯誤就用 localStorage 的 */ }
      }

      if (!cancelled) {
        setQuiz(localResult);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { quiz, loading };
}
