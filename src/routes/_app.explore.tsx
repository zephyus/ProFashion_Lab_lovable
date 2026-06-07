import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gamepad2, Trophy, ChevronRight, Briefcase, RefreshCw } from "lucide-react";
import ExploreQuiz from "../components/ExploreQuiz";
import { internMissions } from "../lib/intern-missions";
import { useXp } from "@/hooks/useXp";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({ meta: [{ title: "發現 — 職感 Zhígǎn" }] }),
  component: ExplorePage,
});

type Game = "menu" | "quiz" | "intern";

function ExplorePage() {
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
    <div className="px-5 pt-10 pb-8 animate-page">
      <header className="mb-7 animate-rise">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">
          發現小秘me
        </p>
        <p className="mt-3 text-body text-muted-foreground">
          從一道題、一場任務開始。把你不知道怎麼說的自己，變成可以指著看的資料。
        </p>
      </header>

      <div className="space-y-4">
        <button onClick={() => setGame("quiz")}
          className="press block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)] animate-rise"
          style={{ animationDelay: "60ms" }}>
          <div className="bg-[image:var(--gradient-hero)] px-5 py-5 text-primary-foreground">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-90">
              <Gamepad2 className="h-3.5 w-3.5" strokeWidth={2} /> 測驗 · 01
            </div>
            <h3 className="mt-2 text-title-2 font-semibold">職感小測驗</h3>
            <p className="mt-1 text-footnote text-primary-foreground/85">
              16 題情境選擇 · 約 3 分鐘
            </p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="pr-3 text-footnote leading-snug">
              不需要先想答案。選你最直覺的反應，我們替你把資料整理出來。
            </p>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary-deep" strokeWidth={1.85} />
          </div>
        </button>

        <button onClick={() => setGame("intern")}
          className="press block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)] animate-rise"
          style={{ animationDelay: "120ms" }}>
          <div className="bg-[image:var(--gradient-hero)] px-5 py-5 text-primary-foreground">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-90">
              <Trophy className="h-3.5 w-3.5" strokeWidth={2} /> 任務 · 02
            </div>
            <h3 className="mt-2 text-title-2 font-semibold">虛擬實習</h3>
            <p className="mt-1 text-footnote text-primary-foreground/85">
              一關 30 秒 · 無上限累積
            </p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="pr-3 text-footnote leading-snug">
              職場最常見的小決策，做一次選擇、累積一次經驗值。把判斷力當肌肉訓練。
            </p>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary-deep" strokeWidth={1.85} />
          </div>
        </button>
      </div>

      {/* 為什麼用這個 — 三行 manifesto */}
      <p className="mt-8 text-caption">
        為什麼需要這個 · 在還沒選之前，先把『感覺』變成可以被檢視的資料。
      </p>
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

  // 隨機決定上下哪個是 A（正確/穩健派），避免玩家用位置記憶答題
  const swap = useMemo(() => Math.random() < 0.5, [completed, step]);

  const stripPrefix = (s: string) => s.replace(/^\s*(?:🅰️|🅱️)\s*/u, "");
  const topLabel = stripPrefix(swap ? mission.optionB : mission.optionA);
  const bottomLabel = stripPrefix(swap ? mission.optionA : mission.optionB);
  const topChoice: "A" | "B" = swap ? "B" : "A";
  const bottomChoice: "A" | "B" = swap ? "A" : "B";

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
    <div className="px-5 pt-8 pb-8 animate-page">
      <button onClick={onBack}
        className="press mb-4 inline-flex items-center text-subhead text-muted-foreground hover:text-foreground">
        ← 回到發現
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
            <button onClick={() => choose(topChoice)}
              className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/40 active:scale-95">
              {topLabel}
            </button>
            <button onClick={() => choose(bottomChoice)}
              className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/40 active:scale-95">
              {bottomLabel}
            </button>
          </div>

        )}
      </div>

      <p className="mt-4 text-center text-caption">
        每完成一關，經驗值會自動跟著你。
      </p>
    </div>
  );
}
