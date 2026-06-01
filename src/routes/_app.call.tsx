import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, Volume2 } from "lucide-react";

export const Route = createFileRoute("/_app/call")({
  head: () => ({ meta: [{ title: "您撥的號碼是未來" }] }),
  component: CallPage,
});

type Persona = {
  id: string;
  name: string;
  job: string;
  number: string;
  tag: string;
  color: string;
  intro: string;
  script: string[];
};

const personas: Persona[] = [
  {
    id: "av", name: "綾瀨小姐", job: "AV 女優", number: "0900-181-001", tag: "成人產業",
    color: "from-rose-400 to-pink-500",
    intro: "從業 6 年，公開分享產業真實面",
    script: [
      "（接通）哈囉，我是綾瀨。你想知道這行什麼？",
      "其實片場最久的不是拍攝，是化妝跟等光。一場戲我們可能要重來十幾次。",
      "合約裡會明確寫清楚『可拍攝的內容』，超出範圍就是違約，你有拒絕權。",
      "最大的挑戰其實是身邊人的眼光，所以我學會把工作跟生活完全分開。",
      "想入行的話，先了解經紀公司的合約條款，不要被一時的錢誘惑。",
    ],
  },
  {
    id: "mortician", name: "阿明師傅", job: "禮儀師", number: "0900-181-002", tag: "生命產業",
    color: "from-slate-500 to-zinc-700",
    intro: "送行 20 年，把告別變成禮物",
    script: [
      "你好，我是阿明。年輕人會想做這行的不多，謝謝你打來。",
      "第一次幫往生者淨身，我哭了三天。後來我懂了，這是給家屬最後的安心。",
      "薪水其實比你想像高，但代價是隨叫隨到，半夜出門是日常。",
      "心理素質很重要，要學會把情緒放下，不然會被帶走。",
      "如果你有興趣，建議先去殯儀館志工試試，看自己能不能承受。",
    ],
  },
  {
    id: "esports", name: "Ray", job: "電競選手", number: "0900-181-003", tag: "新興職業",
    color: "from-teal-400 to-cyan-500",
    intro: "前職業隊隊長，現為教練",
    script: [
      "嘿，我是 Ray。問什麼都可以喔。",
      "黃金期很短，大概 18 到 24 歲，過了就是體力跟反應的下坡。",
      "每天練 10 小時是基本，假日只有一天，比上班還累。",
      "退役後出路很重要，可以走教練、賽評、實況主，要提早佈局。",
      "想入行的話，先在路人局打進前 100 名再說，不然只是夢。",
    ],
  },
  {
    id: "deepsea", name: "老陳", job: "遠洋漁工", number: "0900-181-004", tag: "傳統產業",
    color: "from-blue-500 to-indigo-600",
    intro: "出海 15 年，跑過三大洋",
    script: [
      "喂，訊號不太好（海風聲）。我是老陳。",
      "一趟出海要 6 個月到 2 年，這段時間完全沒有網路。",
      "賺得多，但代價是錯過小孩長大、爸媽生病。",
      "船上沒有星期幾，只有換班、捕撈、修網，重複到你忘記時間。",
      "如果你想試試，先從近海漁船開始，撐得住再考慮遠洋。",
    ],
  },
  {
    id: "perfumer", name: "Élise", job: "調香師", number: "0900-181-005", tag: "藝術職業",
    color: "from-amber-400 to-orange-500",
    intro: "巴黎學成，自創香水品牌",
    script: [
      "Bonjour，我是 Élise。聞香之前，先聞自己的呼吸。",
      "調香師至少要記得 500 種香料，這是門檻。",
      "一支香水從發想到上市要 1 到 3 年，過程不斷被否決。",
      "我們的鼻子要保護好，咖啡、辣食、感冒都會影響判斷。",
      "想入行就從便宜的精油開始練，每天聞、做筆記，三年再說。",
    ],
  },
];

function CallPage() {
  const [active, setActive] = useState<Persona | null>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [active]);

  const hangup = () => { setActive(null); setLineIdx(0); setSeconds(0); };
  const next = () => active && lineIdx < active.script.length - 1 && setLineIdx((i) => i + 1);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (active) {
    return (
      <div className={`fixed inset-0 z-50 mx-auto flex max-w-md flex-col items-center justify-between bg-gradient-to-br ${active.color} px-8 py-16 text-white`}>
        <div className="text-center">
          <p className="text-sm opacity-80">通話中 · {fmt(seconds)}</p>
          <h2 className="mt-4 text-4xl font-bold">{active.name}</h2>
          <p className="mt-1 text-sm opacity-90">{active.job}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Volume2 className="h-16 w-16" />
            </div>
          </div>
        </div>

        <div className="w-full">
          <button
            onClick={next}
            className="min-h-[100px] w-full rounded-3xl bg-white/15 p-5 text-left text-[15px] leading-relaxed backdrop-blur-sm transition-all active:bg-white/25"
          >
            {active.script[lineIdx]}
          </button>
          <p className="mt-2 text-center text-xs opacity-70">
            {lineIdx < active.script.length - 1 ? "點擊繼續聆聽 →" : "對話結束"}
          </p>

          <div className="mt-6 flex items-center justify-around">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Mic className="h-6 w-6" />
            </button>
            <button onClick={hangup} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-2xl active:scale-95">
              <PhoneOff className="h-7 w-7" />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Volume2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12">
      <header className="mb-5">
        <h1 className="text-3xl font-bold tracking-tight">您撥的號碼<br />是<span className="text-primary-deep">未來</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">撥通電話，聽見少數職業的真實聲音。</p>
      </header>

      <div className="space-y-3">
        {personas.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
            <div className={`bg-gradient-to-r ${p.color} px-5 py-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">{p.tag}</span>
                  <h3 className="mt-2 text-lg font-bold">{p.name}</h3>
                  <p className="text-xs opacity-90">{p.job}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs opacity-80">{p.number}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <p className="text-xs text-muted-foreground">{p.intro}</p>
              <button
                onClick={() => setActive(p)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)] active:scale-95"
              >
                <Phone className="h-3.5 w-3.5" /> 撥打
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        所有對話皆為模擬訪談，內容經當事人同意改編。
      </p>
    </div>
  );
}
