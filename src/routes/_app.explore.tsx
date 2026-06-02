import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Gamepad2, Radio, PhoneOff, ChevronRight } from "lucide-react";
import ExploreQuiz from "../components/ExploreQuiz";
import { dramaScenes, type DramaScene } from "../lib/drama-scenes";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({ meta: [{ title: "發現小秘 me · ProFashion Lab" }] }),
  component: ExplorePage,
});

type Game = "menu" | "quiz" | "drama";

function ExplorePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game>("menu");
  const [drama, setDrama] = useState<DramaScene | null>(null);
  const [dramaIdx, setDramaIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (drama) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [drama]);

  const exitDrama = () => { setDrama(null); setDramaIdx(0); setSeconds(0); };
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // —— 廣播劇沉浸全屏 ——
  if (drama) {
    const node = drama.nodes[dramaIdx];
    return (
      <div className={`fixed inset-0 z-[60] mx-auto flex max-w-md flex-col bg-gradient-to-br ${drama.color} px-6 py-10 text-white`}>
        <div className="text-center">
          <p className="text-xs opacity-80">廣播劇 · {fmt(seconds)}</p>
          <h2 className="mt-2 text-2xl font-bold">{drama.title}</h2>
        </div>
        <div className="mt-8 flex-1 space-y-4 overflow-y-auto">
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <p className="text-xs opacity-80">{node.speaker}</p>
            <p className="mt-2 text-base leading-relaxed">{node.line}</p>
          </div>
          {node.choices && (
            <div className="space-y-2">
              {node.choices.map((c, i) => (
                <button key={i} onClick={() => setDramaIdx(c.next)}
                  className="w-full rounded-2xl bg-white/20 p-4 text-left text-sm font-semibold backdrop-blur-sm active:scale-95">
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {node.ending && (
            <div className="rounded-2xl border border-white/30 bg-black/20 p-4 text-sm">
              <p className="font-bold">{node.ending}</p>
            </div>
          )}
          {!node.choices && !node.ending && dramaIdx < drama.nodes.length - 1 && (
            <button onClick={() => setDramaIdx(dramaIdx + 1)} className="w-full rounded-2xl bg-white/20 p-3 text-sm font-semibold">繼續 →</button>
          )}
        </div>
        <button onClick={exitDrama} className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-2xl active:scale-95">
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    );
  }

  // —— 測驗 ——
  if (game === "quiz") {
    return (
      <div className="px-5 pt-8 pb-8">
        <ExploreQuiz onBack={() => setGame("menu")} />
      </div>
    );
  }

  // —— 廣播劇列表 ——
  if (game === "drama") {
    return (
      <div className="px-5 pt-8 pb-8">
        <button onClick={() => setGame("menu")}
          className="mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
          ← 返回探索選單
        </button>
        <header className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-deep">
            <Radio className="h-3 w-3" /> 職場廣播劇
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">一日實境</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            5 分鐘高張力職場片段，在關鍵點做選擇，導向不同結局。
          </p>
        </header>
        <div className="space-y-3">
          {dramaScenes.map((d) => (
            <div key={d.id} className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
              <div className={`bg-gradient-to-r ${d.color} px-5 py-4 text-white`}>
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">{d.tag}</span>
                <h3 className="mt-2 text-lg font-bold">{d.title}</h3>
                <p className="text-xs opacity-90">{d.intro}</p>
              </div>
              <div className="flex items-center justify-end px-5 py-4">
                <button onClick={() => { setDrama(d); setDramaIdx(0); setSeconds(0); }}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground active:scale-95">
                  <Radio className="h-3.5 w-3.5" /> 進入劇情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // —— 選單：兩款遊戲 ——
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
          兩款互動遊戲，從不同角度認識自己——做測驗找出職涯傾向，或走進職場現場親身選擇。
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

        <button onClick={() => setGame("drama")}
          className="block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)] active:scale-[0.98]">
          <div className="bg-gradient-to-r from-rose-500 to-red-600 px-5 py-5 text-white">
            <div className="flex items-center gap-2 text-[11px] font-bold opacity-90">
              <Radio className="h-3.5 w-3.5" /> GAME 02 · 沉浸式體驗
            </div>
            <h3 className="mt-2 text-xl font-bold">職場廣播劇</h3>
            <p className="mt-1 text-xs opacity-90">5 分鐘高張力片段 · 多重結局</p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="pr-3 text-xs leading-relaxed text-muted-foreground">
              急診室、跨國併購桌邊——在關鍵時刻做選擇，看看你會走向什麼結局。
            </p>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary-deep" />
          </div>
        </button>
      </div>
    </div>
  );
}
