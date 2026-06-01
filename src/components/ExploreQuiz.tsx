import { useState } from "react";
import { Sparkles, ChevronRight, RotateCcw, ArrowLeft } from "lucide-react";

type Axis = "EI" | "SN" | "TF" | "JP" | "U_THINK" | "U_COMMUNICATE" | "U_PLAN" | "U_SERVE";
type Q = { q: string; a: { text: string; axis: Axis; weight: number }[] };

const QUESTIONS: Q[] = [
  { q: "週末的小組作業，你會……", a: [
    { text: "主動揪大家開會", axis: "EI", weight: 1 },
    { text: "在群組安靜整理資料", axis: "EI", weight: -1 },
  ]},
  { q: "面對新任務你習慣……", a: [
    { text: "先列流程與里程碑", axis: "JP", weight: 1 },
    { text: "邊做邊看靈感跑哪", axis: "JP", weight: -1 },
  ]},
  { q: "你比較相信……", a: [
    { text: "看得到的數據與事實", axis: "SN", weight: 1 },
    { text: "直覺與未來的可能性", axis: "SN", weight: -1 },
  ]},
  { q: "朋友吵架時你會……", a: [
    { text: "幫忙分析誰對誰錯", axis: "TF", weight: 1 },
    { text: "先安撫他們的情緒", axis: "TF", weight: -1 },
  ]},
  { q: "你最享受的瞬間是……", a: [
    { text: "解開一道難題", axis: "U_THINK", weight: 2 },
    { text: "說服別人接受你的點子", axis: "U_COMMUNICATE", weight: 2 },
  ]},
  { q: "如果要辦一場活動，你會負責……", a: [
    { text: "排程、預算與場地", axis: "U_PLAN", weight: 2 },
    { text: "接待來賓、照顧需求", axis: "U_SERVE", weight: 2 },
  ]},
  { q: "面對陌生客戶你會……", a: [
    { text: "先研究他的背景", axis: "U_THINK", weight: 1 },
    { text: "直接打招呼閒聊", axis: "U_COMMUNICATE", weight: 1 },
  ]},
  { q: "你比較想做的事……", a: [
    { text: "規劃一套新制度", axis: "U_PLAN", weight: 1 },
    { text: "幫人解決生活困難", axis: "U_SERVE", weight: 1 },
  ]},
];

function analyze(scores: Record<Axis, number>) {
  const mbti =
    (scores.EI >= 0 ? "E" : "I") +
    (scores.SN >= 0 ? "S" : "N") +
    (scores.TF >= 0 ? "T" : "F") +
    (scores.JP >= 0 ? "J" : "P");

  const ucan = [
    { key: "思考分析", v: scores.U_THINK },
    { key: "人際溝通", v: scores.U_COMMUNICATE },
    { key: "規劃組織", v: scores.U_PLAN },
    { key: "關懷服務", v: scores.U_SERVE },
  ].sort((a, b) => b.v - a.v);

  const careerMap: Record<string, string[]> = {
    思考分析: ["資料分析師", "研究員", "產品經理", "工程師"],
    人際溝通: ["業務開發", "公關行銷", "主持人", "顧問"],
    規劃組織: ["專案經理", "活動企劃", "行政管理", "金融規劃"],
    關懷服務: ["社工", "心理諮商", "教師", "護理人員"],
  };
  const top = ucan[0].key;
  return { mbti, ucan, careers: careerMap[top], topUcan: top };
}

interface ExploreQuizProps {
  onBack: () => void;
}

export default function ExploreQuiz({ onBack }: ExploreQuizProps) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Axis, number>>({
    EI: 0, SN: 0, TF: 0, JP: 0, U_THINK: 0, U_COMMUNICATE: 0, U_PLAN: 0, U_SERVE: 0,
  });

  const done = step >= QUESTIONS.length;
  const progress = (step / QUESTIONS.length) * 100;

  const choose = (axis: Axis, weight: number) => {
    setScores((s) => ({ ...s, [axis]: s[axis] + weight }));
    setStep((s) => s + 1);
  };
  const reset = () => { setStep(0); setScores({ EI: 0, SN: 0, TF: 0, JP: 0, U_THINK: 0, U_COMMUNICATE: 0, U_PLAN: 0, U_SERVE: 0 }); };

  return (
    <div className="px-5 pt-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 返回總頁
      </button>

      <header className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-deep">
          <Sparkles className="h-3 w-3" /> MBTI × UCAN
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">發現小秘 me</h1>
        <p className="mt-1 text-sm text-muted-foreground">玩八題，看看你適合哪些職涯方向。</p>
      </header>

      {!done && (
        <>
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
            <div className="h-full rounded-full bg-[image:var(--gradient-hero)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mb-3 text-xs text-muted-foreground">第 {step + 1} / {QUESTIONS.length} 題</p>

          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold leading-snug">{QUESTIONS[step].q}</h2>
            <div className="mt-5 space-y-3">
              {QUESTIONS[step].a.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(opt.axis, opt.weight)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left text-sm font-medium transition-all hover:border-primary hover:bg-primary-soft active:scale-[0.98]"
                >
                  <span>{opt.text}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary-deep" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {done && (() => {
        const r = analyze(scores);
        return (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-float)]">
              <p className="text-xs uppercase tracking-widest opacity-80">你的人格類型</p>
              <p className="mt-1 text-5xl font-bold">{r.mbti}</p>
              <p className="mt-3 text-sm opacity-90">職能優勢：<span className="font-semibold">{r.topUcan}</span></p>
            </div>

            <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-semibold text-muted-foreground">UCAN 職能分布</h3>
              <div className="mt-3 space-y-2.5">
                {r.ucan.map((u) => {
                  const max = Math.max(...r.ucan.map((x) => Math.abs(x.v)), 1);
                  const w = Math.max(8, (Math.abs(u.v) / max) * 100);
                  return (
                    <div key={u.key}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium">{u.key}</span>
                        <span className="text-muted-foreground">{u.v}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-primary-soft">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-semibold text-muted-foreground">推薦你的職業方向</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.careers.map((c) => (
                  <span key={c} className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary-soft">
                <RotateCcw className="h-4 w-4" /> 重新測驗
              </button>
              <button onClick={onBack} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90">
                <ArrowLeft className="h-4 w-4" /> 返回總頁
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
