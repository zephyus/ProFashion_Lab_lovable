import { useEffect, useRef, useState } from "react";
import { ChevronRight, RotateCcw, ArrowLeft } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveQuizResult } from "@/lib/portfolio.functions";
import { logActivity } from "@/hooks/useActivity";

// 不對外暴露量表名稱：內部使用代號
// H_* 為 Holland 六型；P_* 為人格傾向；C_* 為核心職能
type Axis =
  | "H_R" | "H_I" | "H_A" | "H_S" | "H_E" | "H_C"
  | "P_EI" | "P_SN" | "P_TF" | "P_JP"
  | "C_THINK" | "C_COMM" | "C_PLAN" | "C_SERVE";

type Q = { q: string; a: { text: string; axis: Axis; weight: number }[] };

const QUESTIONS: Q[] = [
  // —— 情境式：日常／學習偏好 ——
  { q: "週末的小組作業，你會……", a: [
    { text: "主動揪大家開會", axis: "P_EI", weight: 1 },
    { text: "在群組安靜整理資料", axis: "P_EI", weight: -1 },
  ]},
  { q: "面對新任務你習慣……", a: [
    { text: "先列流程與里程碑", axis: "P_JP", weight: 1 },
    { text: "邊做邊看靈感跑哪", axis: "P_JP", weight: -1 },
  ]},
  { q: "你比較相信……", a: [
    { text: "看得到的數據與事實", axis: "P_SN", weight: 1 },
    { text: "直覺與未來的可能性", axis: "P_SN", weight: -1 },
  ]},
  { q: "朋友吵架時你會……", a: [
    { text: "幫忙分析誰對誰錯", axis: "P_TF", weight: 1 },
    { text: "先安撫他們的情緒", axis: "P_TF", weight: -1 },
  ]},

  // —— 核心職能 ——
  { q: "你最享受的瞬間是……", a: [
    { text: "解開一道難題", axis: "C_THINK", weight: 2 },
    { text: "說服別人接受你的點子", axis: "C_COMM", weight: 2 },
  ]},
  { q: "若要辦一場活動，你會負責……", a: [
    { text: "排程、預算與場地", axis: "C_PLAN", weight: 2 },
    { text: "接待來賓、照顧需求", axis: "C_SERVE", weight: 2 },
  ]},
  { q: "面對陌生客戶你會……", a: [
    { text: "先研究他的背景", axis: "C_THINK", weight: 1 },
    { text: "直接打招呼閒聊", axis: "C_COMM", weight: 1 },
  ]},
  { q: "你比較想做的事……", a: [
    { text: "規劃一套新制度", axis: "C_PLAN", weight: 1 },
    { text: "幫人解決生活困難", axis: "C_SERVE", weight: 1 },
  ]},

  // —— Holland 六型（不顯示名稱） ——
  { q: "高中選修課，你最想選哪一門？", a: [
    { text: "機械加工 / 木工實作", axis: "H_R", weight: 2 },
    { text: "科學探究與實驗", axis: "H_I", weight: 2 },
  ]},
  { q: "下課後的活動，你會選……", a: [
    { text: "戲劇社 / 美術社 / 樂團", axis: "H_A", weight: 2 },
    { text: "志工服務 / 同儕輔導", axis: "H_S", weight: 2 },
  ]},
  { q: "如果開一家小店，你想當……", a: [
    { text: "拉投資、找通路的老闆", axis: "H_E", weight: 2 },
    { text: "把帳目、庫存管得井井有條的人", axis: "H_C", weight: 2 },
  ]},
  { q: "看到一台壞掉的腳踏車，你會……", a: [
    { text: "捲起袖子拆開來修", axis: "H_R", weight: 1 },
    { text: "上網查它的構造跟原理", axis: "H_I", weight: 1 },
  ]},
  { q: "假日獨處時，你最常做……", a: [
    { text: "畫畫、寫作、剪片、玩音樂", axis: "H_A", weight: 1 },
    { text: "陪家人聊天、聽朋友訴苦", axis: "H_S", weight: 1 },
  ]},
  { q: "如果班上要選幹部，你想當……", a: [
    { text: "班長（帶領大家、對外發聲）", axis: "H_E", weight: 1 },
    { text: "學藝股長（整理資料、製作講義）", axis: "H_C", weight: 1 },
  ]},
  { q: "看到一個新發明，你最先想……", a: [
    { text: "它的原理是什麼？", axis: "H_I", weight: 1 },
    { text: "怎麼把它賣出去？", axis: "H_E", weight: 1 },
  ]},
  { q: "面對社會議題，你比較想……", a: [
    { text: "投身第一線陪伴需要的人", axis: "H_S", weight: 1 },
    { text: "用作品讓更多人看見問題", axis: "H_A", weight: 1 },
  ]},
];

// Holland 代號 → 名稱 / 特質 / 職業
const HOLLAND_META: Record<"R" | "I" | "A" | "S" | "E" | "C", {
  name: string;
  traits: string[];
  careers: string[];
}> = {
  R: { name: "實作型", traits: ["動手能力強", "務實", "喜歡看得見的成果"],
       careers: ["機械工程師", "建築師", "獸醫", "農藝專家", "運動教練"] },
  I: { name: "研究型", traits: ["好奇心強", "邏輯清晰", "享受思考"],
       careers: ["資料科學家", "研究員", "醫師", "生技工程師", "天文學家"] },
  A: { name: "藝術型", traits: ["想像力豐富", "感受敏銳", "渴望表達"],
       careers: ["導演", "設計師", "作家", "音樂製作人", "策展人"] },
  S: { name: "社會型", traits: ["善解人意", "願意付出", "擅長傾聽"],
       careers: ["心理諮商師", "教師", "社工", "護理師", "人資"] },
  E: { name: "企業型", traits: ["有領導力", "敢冒險", "說服力強"],
       careers: ["創業家", "業務開發", "品牌經理", "律師", "政治幕僚"] },
  C: { name: "事務型", traits: ["細心可靠", "重視秩序", "執行力高"],
       careers: ["會計師", "財務分析", "專案管理", "法務助理", "資料庫管理"] },
};

const CORE_META: Record<string, { traits: string[] }> = {
  思考分析: { traits: ["拆解複雜問題", "重視證據", "享受推理"] },
  人際溝通: { traits: ["語言表達好", "讀懂氣氛", "說服力強"] },
  規劃組織: { traits: ["邏輯有條理", "重視時程", "能整合資源"] },
  關懷服務: { traits: ["同理心高", "願意傾聽", "讓人安心"] },
};

function analyze(scores: Record<Axis, number>) {
  // 人格四向（內部運算，不對外顯示英文代號）
  const personality = [
    scores.P_EI >= 0 ? "外向行動" : "內斂深思",
    scores.P_SN >= 0 ? "務實派" : "想像派",
    scores.P_TF >= 0 ? "重邏輯" : "重感受",
    scores.P_JP >= 0 ? "計畫型" : "彈性型",
  ];

  // 核心職能
  const core = [
    { key: "思考分析", v: scores.C_THINK },
    { key: "人際溝通", v: scores.C_COMM },
    { key: "規劃組織", v: scores.C_PLAN },
    { key: "關懷服務", v: scores.C_SERVE },
  ].sort((a, b) => b.v - a.v);

  // Holland 六型
  const holland = (["R", "I", "A", "S", "E", "C"] as const)
    .map((k) => ({ key: k, v: scores[`H_${k}` as Axis] }))
    .sort((a, b) => b.v - a.v);

  const top2 = [holland[0].key, holland[1].key] as const;
  const typeName = top2.map((k) => HOLLAND_META[k].name).join(" × ");

  // 合併職業推薦：Holland 前兩型 + 主要核心職能
  const careerPool = [
    ...HOLLAND_META[top2[0]].careers,
    ...HOLLAND_META[top2[1]].careers,
  ];
  const careers = Array.from(new Set(careerPool)).slice(0, 8);

  // 特質：Holland top2 + 主要核心
  const traits = Array.from(new Set([
    ...HOLLAND_META[top2[0]].traits,
    ...HOLLAND_META[top2[1]].traits,
    ...CORE_META[core[0].key].traits,
  ])).slice(0, 6);

  return { personality, core, holland, top2, typeName, careers, traits };
}

const EMPTY_SCORES: Record<Axis, number> = {
  H_R: 0, H_I: 0, H_A: 0, H_S: 0, H_E: 0, H_C: 0,
  P_EI: 0, P_SN: 0, P_TF: 0, P_JP: 0,
  C_THINK: 0, C_COMM: 0, C_PLAN: 0, C_SERVE: 0,
};

interface ExploreQuizProps {
  onBack: () => void;
  initialScores?: Record<Axis, number>;
  isReportOnly?: boolean;
}

export default function ExploreQuiz({ onBack, initialScores, isReportOnly = false }: ExploreQuizProps) {
  const [step, setStep] = useState(isReportOnly ? QUESTIONS.length : 0);
  const [scores, setScores] = useState<Record<Axis, number>>(initialScores ?? { ...EMPTY_SCORES });

  const done = step >= QUESTIONS.length;
  const progress = (step / QUESTIONS.length) * 100;

  const saveQuiz = useServerFn(saveQuizResult);
  const savedRef = useRef(isReportOnly);
  useEffect(() => {
    if (!done || savedRef.current) return;
    savedRef.current = true;
    const r = analyze(scores);
    logActivity({
      station: "explore",
      type: "quiz_completed",
      detail: `${r.typeName}・核心：${r.core[0].key}・方向：${r.careers.slice(0, 3).join("、")}`,
    });

    // 同時存到 localStorage，讓首頁不需登入也能顯示結果
    try {
      localStorage.setItem("profashion_latest_quiz", JSON.stringify({
        archetype: r.typeName,
        summary: `主要核心職能：${r.core[0].key}；推薦方向：${r.careers.slice(0, 4).join("、")}`,
        answers: scores,
        created_at: new Date().toISOString(),
      }));
    } catch { /* localStorage 不可用就跳過 */ }

    saveQuiz({
      data: {
        archetype: r.typeName,
        summary: `主要核心職能：${r.core[0].key}；推薦方向：${r.careers.slice(0, 4).join("、")}`,
        answers: scores,
      },
    }).catch(() => {
      // 未登入或網路錯誤都靜默；學生未必有帳號
    });
  }, [done, scores, saveQuiz]);

  const choose = (axis: Axis, weight: number) => {
    setScores((s) => ({ ...s, [axis]: s[axis] + weight }));
    setStep((s) => s + 1);
  };
  const reset = () => { setStep(0); setScores({ ...EMPTY_SCORES }); savedRef.current = false; };


  return (
    <div>
      <button
        onClick={onBack}
        className="press mb-4 flex items-center gap-1.5 text-footnote font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.7} /> 返回探索選單
      </button>

      <header className="mb-6 animate-rise">
        <p className="text-caption uppercase tracking-widest text-primary-deep">
          職感小測驗
        </p>
        <h1 className="mt-1 text-large-title text-foreground">發現小秘 me</h1>
        <p className="mt-2 text-body text-muted-foreground">
          {QUESTIONS.length} 題情境式選擇，幫你找出職涯傾向、特質與適合的職業類型。
        </p>
      </header>

      {!done && (
        <>
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${progress}%`, transitionTimingFunction: "var(--ease-spring)" }}
            />
          </div>
          <p className="mb-4 text-caption">第 {step + 1} / {QUESTIONS.length} 題</p>

          <div className="rounded-2xl border border-border bg-card p-6 animate-rise">
            <h2 className="text-title-3 text-foreground">{QUESTIONS[step].q}</h2>
            <div className="mt-5 space-y-2.5">
              {QUESTIONS[step].a.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(opt.axis, opt.weight)}
                  className="press group flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-4 text-left text-callout font-medium transition-colors hover:border-primary hover:bg-muted/40"
                >
                  <span>{opt.text}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary-deep" strokeWidth={1.7} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}


      {done && (() => {
        const r = analyze(scores);
        const maxH = Math.max(...r.holland.map((x) => Math.abs(x.v)), 1);
        const maxC = Math.max(...r.core.map((x) => Math.abs(x.v)), 1);
        return (
          <div className="space-y-4 animate-rise">
            {/* 主結果：單一 hero card */}
            <div className="rounded-2xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground">
              <p className="text-caption uppercase tracking-widest opacity-80">你的職感類型</p>
              <p className="mt-2 text-title-1 leading-tight">{r.typeName}</p>
              <p className="mt-3 text-subhead opacity-90">
                主要核心職能：<span className="font-semibold">{r.core[0].key}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.personality.map((p) => (
                  <span key={p} className="rounded-full bg-white/20 px-2.5 py-1 text-caption font-medium text-primary-foreground backdrop-blur">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* 特質 keywords */}
            <section>
              <p className="mb-2 px-1 text-caption uppercase tracking-wider">你的特質關鍵字</p>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap gap-2">
                  {r.traits.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-3 py-1.5 text-footnote font-medium text-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 職涯傾向 — iOS Health 風格條狀 */}
            <section>
              <p className="mb-2 px-1 text-caption uppercase tracking-wider">職涯傾向分布</p>
              <div className="list-group">
                {r.holland.map((u) => {
                  const w = Math.max(8, (Math.abs(u.v) / maxH) * 100);
                  return (
                    <div key={u.key} className="px-4 py-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-callout font-medium">{HOLLAND_META[u.key].name}</span>
                        <span className="text-caption tabular-nums">{u.v}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${w}%`, transition: "width var(--dur-slow) var(--ease-spring)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 核心職能 */}
            <section>
              <p className="mb-2 px-1 text-caption uppercase tracking-wider">核心職能</p>
              <div className="list-group">
                {r.core.map((u) => {
                  const w = Math.max(8, (Math.abs(u.v) / maxC) * 100);
                  return (
                    <div key={u.key} className="px-4 py-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-callout font-medium">{u.key}</span>
                        <span className="text-caption tabular-nums">{u.v}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary-deep"
                          style={{ width: `${w}%`, transition: "width var(--dur-slow) var(--ease-spring)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 推薦職業 */}
            <section>
              <p className="mb-2 px-1 text-caption uppercase tracking-wider">推薦你的職業方向</p>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap gap-2">
                  {r.careers.map((c) => (
                    <span key={c} className="rounded-full border border-border bg-background px-3 py-1.5 text-footnote font-medium text-foreground">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-caption">
                  結果依你的回答綜合產生，僅供職涯探索參考，不代表唯一答案。
                </p>
              </div>
            </section>

            <div className="flex gap-3 pt-2">
              <button
                onClick={reset}
                className="press flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-callout font-medium text-foreground"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.7} /> 重新測驗
              </button>
              <button
                onClick={onBack}
                className="press flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-callout font-semibold text-primary-foreground"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> 返回
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

