import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface QuizResult {
  archetype: string;
  summary: string | null;
  answers: Record<string, number>;
  created_at: string;
}

/**
 * 從 Supabase 取得目前登入使用者的最新一筆測驗結果。
 * 未登入或尚未做過測驗時回傳 null。
 */
export function useLatestQuiz() {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setQuiz(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quiz_results")
        .select("archetype, summary, answers, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (!error && data) {
        setQuiz({
          archetype: data.archetype ?? "",
          summary: data.summary,
          answers: (data.answers ?? {}) as Record<string, number>,
          created_at: data.created_at,
        });
      } else {
        setQuiz(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { quiz, loading };
}
