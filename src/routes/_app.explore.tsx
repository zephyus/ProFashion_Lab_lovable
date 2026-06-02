import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gamepad2, Trophy, ChevronRight, Briefcase, RefreshCw } from "lucide-react";
import ExploreQuiz from "../components/ExploreQuiz";
import { internMissions } from "../lib/intern-missions";
import { useXp } from "@/hooks/useXp";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({ meta: [{ title: "發現小秘 me · ProFashion Lab" }] }),
  component: ExplorePage,
});

type Game = "menu" | "quiz" | "intern";

function ExplorePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game>("menu");

  // —— 測驗 ——
  if (game === "quiz") {
    return (
      <div className="px-5 pt-8 pb-8">
        <ExploreQuiz onBack={() => setGame("menu")} />
      </div>
    );
  }

  // —— 虛擬實習 ——
  if (game === "intern") {
    return <InternGame onBack={() => setGame("menu")} />;
  }

  // —— 選單 ——
  return (
    <div className="px-5 pt-8 pb-8">
      <button onClick={() => navigate({ to: "/" })}
        className="mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
        ← 返回 Lab 主頁
      </button>
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-deep">
          Station 01
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">發現小秘 me</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          兩種方式認識自己——做測驗看出你的職涯傾向，或走進虛擬實習，一關一關累積經驗值。
        </p>
      </header>

      <div className="space-y-4">
        <button onClick={() => setGame("quiz")}
          className="block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)] active:scale-[0.98]">
          <div className="bg-[image:var(--gradient-hero)] px-5 py-5 text-primary-foreground">
            <div className="flex items-center gap-2 text-[11px] font-bold opacity-90">
              <Gamepad2 className="h-3.5 w-3.5" /> GAME 01 · 性向測驗
            </div>
            <h3 className="mt-2 text-xl font-bold">職感小測驗</h3>
            <p className="mt-1 text-xs opacity-90">16 題情境式選擇 · 約 3 分鐘</p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="pr-3 text-xs leading-relaxed text-muted-foreground">
              綜合六型職業興趣與核心職能，分析你的特質與適合的職業類型。
            </p>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary-deep" />
          </div>
        </button>

        <button onClick={() => setGame("intern")}
          className="block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)] active:scale-[0.98]">
          <div className="bg-[image:var(--gradient-hero)] px-5 py-5 text-primary-foreground">
            <div className="flex items-center gap-2 text-[11px] font-bold opacity-90">
              <Trophy className="h-3.5 w-3.5" /> GAME 02 · 虛擬實習
            </div>
            <h3 className="mt-2 text-xl font-bold">魔王經理 · 林總監</h3>
            <p className="mt-1 text-xs opacity-90">無上限關卡 · 一關 30 秒</p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="pr-3 text-xs leading-relaxed text-muted-foreground">
              經歷職場上最常發生的小決策，做出選擇、累積經驗值，看看你能從新鮮人升到總監嗎？
            </p>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary-deep" />
          </div>
        </button>
      </div>
    </div>
  );
}

// —— 虛擬實習遊戲 ——
function InternGame({ onBack }: { onBack: () => void }) {
  const { xp, completed, addXp, reset, tierName } = useXp();
  const [step, setStep] = useState(0); // 當前 session 的關數
  const [result, setResult] = useState<{ text: string; gain: number } | null>(null);

  // 用 completed 當作種子，輪流出不同題；同時讓玩家不會重複連續看到同一題
  const mission = useMemo(() => {
    const idx = (completed + step) % internMissions.length;
    return internMissions[idx];
  }, [completed, step]);

  const choose = (which: "A" | "B") => {
    const gain = which === "A" ? mission.rewardA : mission.rewardB;
    const text = which === "A" ? mission.successA : mission.successB;
    addXp(gain);
    setResult({ text, gain });
  };

  const nextMission = () => {
    setResult(null);
    setStep((s) => s + 1);
  };

  return (
    <div className="px-5 pt-8 pb-8">
      <button onClick={onBack}
        className="mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
        ← 返回探索選單
      </button>

      {/* XP 顯示卡 */}
      <div className="rounded-3xl bg-[image:var(--gradient-hero)] p-5 text-primary-foreground shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] opacity-90">目前職等</p>
            <h3 className="text-xl font-bold">{tierName}</h3>
            <p className="mt-1 text-[11px] opacity-80">已完成 {completed} 關</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-80">總經驗值</p>
            <p className="text-3xl font-bold tabular-nums">{xp}</p>
            <p className="text-[10px] opacity-80">XP</p>
          </div>
        </div>
        <button onClick={reset}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm active:scale-95">
          <RefreshCw className="h-3 w-3" /> 重設紀錄
        </button>
      </div>

      {/* 任務卡 */}
      <div className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-primary">第 {completed + 1} 關</p>
        </div>
        <h4 className="text-base font-bold leading-snug">{mission.title}</h4>
        <div className="mt-3 rounded-2xl bg-muted/60 p-3">
          <p className="text-[11px] text-muted-foreground">📞 經理語音</p>
          <p className="mt-1 text-sm">{mission.manager}</p>
        </div>

        {result ? (
          <div className="mt-4">
            <p className="rounded-2xl bg-primary/10 p-3 text-sm font-medium leading-relaxed">
              {result.text}
            </p>
            <button onClick={nextMission}
              className="mt-3 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-95">
              下一關 →
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <button onClick={() => choose("A")}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-left text-sm font-semibold text-white active:scale-95">
              {mission.optionA}
            </button>
            <button onClick={() => choose("B")}
              className="w-full rounded-2xl bg-rose-400 px-4 py-3 text-left text-sm font-semibold text-white active:scale-95">
              {mission.optionB}
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        每完成一關自動累積經驗值 · 經驗值會同步顯示在你的個人檔案
      </p>
    </div>
  );
}
