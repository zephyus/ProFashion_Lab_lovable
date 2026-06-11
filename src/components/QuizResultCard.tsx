import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, ArrowRight, GraduationCap } from "lucide-react";
import type { QuizResult } from "@/hooks/useLatestQuiz";

// ── Holland 代碼 → 適合學群 ──────────────────────────────────
// 每個 Holland 類型對應台灣十八學群中最相關的學群
const HOLLAND_TO_CLUSTERS: Record<string, { name: string; emoji: string }[]> = {
  R: [
    { name: "工程學群", emoji: "⚙️" },
    { name: "建築與設計學群", emoji: "🏗️" },
    { name: "農林漁牧學群", emoji: "🌾" },
    { name: "地球與環境學群", emoji: "🌍" },
  ],
  I: [
    { name: "數理化學群", emoji: "🔬" },
    { name: "醫藥衛生學群", emoji: "🏥" },
    { name: "生命科學學群", emoji: "🧬" },
    { name: "資訊學群", emoji: "💻" },
  ],
  A: [
    { name: "藝術學群", emoji: "🎨" },
    { name: "大眾傳播學群", emoji: "📺" },
    { name: "文史哲學群", emoji: "📖" },
    { name: "建築與設計學群", emoji: "🏗️" },
  ],
  S: [
    { name: "教育學群", emoji: "📚" },
    { name: "社會與心理學群", emoji: "🧠" },
    { name: "醫藥衛生學群", emoji: "🏥" },
    { name: "外語學群", emoji: "🌐" },
  ],
  E: [
    { name: "管理學群", emoji: "📊" },
    { name: "法政學群", emoji: "⚖️" },
    { name: "財經學群", emoji: "💰" },
    { name: "大眾傳播學群", emoji: "📺" },
  ],
  C: [
    { name: "財經學群", emoji: "💰" },
    { name: "管理學群", emoji: "📊" },
    { name: "資訊學群", emoji: "💻" },
    { name: "法政學群", emoji: "⚖️" },
  ],
};

// Holland 代碼 → 類型名稱
const HOLLAND_NAMES: Record<string, string> = {
  R: "實作型",
  I: "研究型",
  A: "藝術型",
  S: "社會型",
  E: "企業型",
  C: "事務型",
};

interface Props {
  quiz: QuizResult;
}

/**
 * 首頁用的測驗結果摘要卡片。
 * 從 answers 中的 Holland 分數推算適合的學群，最多顯示 4 個。
 */
export default function QuizResultCard({ quiz }: Props) {
  const result = useMemo(() => {
    const answers = quiz.answers ?? {};

    // 計算 Holland 六型分數
    const hollandScores = (["R", "I", "A", "S", "E", "C"] as const).map((k) => ({
      key: k,
      v: (answers[`H_${k}`] as number) ?? 0,
    }));

    hollandScores.sort((a, b) => b.v - a.v);
    const top2 = [hollandScores[0], hollandScores[1]];

    // 合併兩個 Holland 類型的學群，去重後取前 4 個
    const seen = new Set<string>();
    const clusters: { name: string; emoji: string }[] = [];

    for (const h of top2) {
      const list = HOLLAND_TO_CLUSTERS[h.key] ?? [];
      for (const c of list) {
        if (!seen.has(c.name)) {
          seen.add(c.name);
          clusters.push(c);
        }
      }
    }

    return {
      top2Keys: top2.map((h) => h.key),
      top2Names: top2.map((h) => HOLLAND_NAMES[h.key]),
      clusters: clusters.slice(0, 4),
    };
  }, [quiz.answers]);

  const formattedDate = new Date(quiz.created_at).toLocaleDateString("zh-TW", {
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl animate-rise"
      style={{ animationDelay: "90ms" }}
    >
      {/* 頂部漸層裝飾線 */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500/40 via-sky-400/40 to-violet-500/40" />

      {/* 背景光暈 */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/8 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-sky-400/8 blur-3xl" />

      <div className="relative p-5">
        {/* 標題列 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-sm">
              <Compass className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                你的測驗結果
              </p>
              <p className="mt-1 text-[20px] font-semibold leading-tight text-neutral-900">
                {quiz.archetype}
              </p>
            </div>
          </div>
          <p className="shrink-0 text-[11px] text-neutral-400">{formattedDate}</p>
        </div>

        {/* 適合學群 */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.9} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              適合你的學群
            </p>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {result.clusters.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-2 rounded-2xl border border-black/5 bg-neutral-50/80 px-3 py-2.5 transition-colors hover:bg-neutral-100/80"
              >
                <span className="text-base leading-none">{c.emoji}</span>
                <span className="text-[13px] font-medium leading-tight text-neutral-800">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA：前往詳細結果 */}
        <Link
          to="/explore"
          className="press mt-4 flex items-center justify-between rounded-2xl border border-black/5 bg-neutral-900 px-4 py-3 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <p className="text-[13px] font-semibold text-white">查看完整報告</p>
            <p className="text-[11px] text-neutral-400">
              含職涯傾向、核心職能與推薦方向
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-400" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
