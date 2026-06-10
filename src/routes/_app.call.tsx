import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles, Atom, Radio, Send, Loader2, Cpu, Download,
} from "lucide-react";
import { dramaScenes, type DramaScene } from "@/lib/drama-scenes";
import { askPersona } from "@/lib/persona-chat.functions";
import { saveCallSession } from "@/lib/portfolio.functions";
import { useSpeech, type SpeechGender } from "@/hooks/use-speech";
import {
  initKokoroTts, synthesizeLocalSpeech, disposeKokoroTts, onKokoroProgress,
  type KokoroProgress,
} from "@/lib/local-tts/kokoroTts";
import { splitTextForTts } from "@/lib/local-tts/wav";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { useTrackVisit, logActivity } from "@/hooks/useActivity";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { CareerInsights } from "@/components/CareerInsights";
import { Crown } from "lucide-react";



export const Route = createFileRoute("/_app/call")({
  head: () => ({ meta: [{ title: "對話 — 職感 Zhígǎn" }] }),
  component: CallPage,
});


// 莫蘭迪色票 — 全頁子項目統一使用
const morandiPalette = [
  { name: "霧灰粉", from: "#D6AEBE", to: "#B98DA0" },
  { name: "鼠尾草綠", from: "#A7B2A0", to: "#8A9683" },
  { name: "霧霾藍", from: "#A7C6DA", to: "#7FA8C2" },
  { name: "奶油米色", from: "#E4DCD2", to: "#C9BDB0" },
  { name: "雲霧灰", from: "#D0D3D4", to: "#ADB1B3" },
];
const morandiBg = (i: number) => ({
  backgroundImage: `linear-gradient(135deg, ${morandiPalette[i % morandiPalette.length].from}, ${morandiPalette[i % morandiPalette.length].to})`,
});
// 文字色 — 莫蘭迪偏淺，採用深墨色保留可讀性
const morandiInk = "#2b2b2b";


type Mode = "real" | "timewarp" | "drama" | "hybrid";

type Persona = {
  id: string;
  name: string;
  job: string;
  tag: string;
  color: string;
  intro: string;
  gender: SpeechGender;
  script: string[];
};

type CareerInsight = {
  skills: string[];
  future: string[];
};


const realPersonas: Persona[] = [
  {
    id: "av", gender: "female", name: "綾瀨小姐", job: "AV 女優", tag: "成人產業",
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
    id: "mortician", gender: "male", name: "阿明師傅", job: "禮儀師", tag: "生命產業",
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
    id: "esports", gender: "male", name: "Ray", job: "電競選手", tag: "新興職業",
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
    id: "deepsea", gender: "male", name: "老陳", job: "遠洋漁工", tag: "傳統產業",
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
    id: "perfumer", gender: "female", name: "Élise", job: "調香師", tag: "藝術職業",
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

const timewarpPersonas: Persona[] = [
  {
    id: "jobs", gender: "male", name: "Steve Jobs", job: "Apple 創辦人 · 1985", tag: "歷史名人",
    color: "from-neutral-700 to-neutral-900",
    intro: "與賈伯斯聊產品開發哲學",
    script: [
      "（線路雜訊）Hi, this is Steve. 你想聊產品？我只有十分鐘。",
      "產品不是功能清單，是『一個你願意為它流淚的故事』。先想清楚，再寫一行 code。",
      "焦點不是『多做什麼』，是『不做什麼』。我們砍掉 70% 的點子才有 Mac。",
      "如果使用者要『更快的馬』，你給他汽車。不要問他要什麼，觀察他真正的痛。",
      "Stay hungry, stay foolish. 掛了，我要去開會。",
    ],
  },
  {
    id: "davinci", gender: "male", name: "達文西", job: "文藝復興斜槓王 · 1503", tag: "歷史名人",
    color: "from-amber-600 to-yellow-700",
    intro: "聊斜槓人生與跨領域學習",
    script: [
      "Buongiorno，我是 Leonardo。你說你想當斜槓？",
      "我畫畫、設計武器、解剖屍體、研究水流——它們其實是『同一件事』，叫做『觀察』。",
      "不要怕『學了沒用』。我研究鳥的翅膀，三百年後才有飛機。",
      "筆記本永遠帶在身上。每天記下 10 個你看不懂的東西，一年後你會驚訝。",
      "好奇心是唯一不會退流行的技能。Addio。",
    ],
  },
  {
    id: "asteroid", gender: "neutral", name: "K-7 號採礦員", job: "小行星採礦工程師 · 2087", tag: "未來職業",
    color: "from-zinc-600 to-slate-800",
    intro: "在木星軌道採稀土礦",
    script: [
      "（訊號延遲 3 秒）這裡是 K-7，木星軌道。你說地球？",
      "我們一趟任務 18 個月，重力是零，骨密度每個月掉 1%。",
      "AI 操控鑽探，我們負責『判斷』——哪塊岩石值得拖回地球。",
      "薪水是地球工程師 50 倍，但回去後三個月才能走路。",
      "想入行？先考太空生理學跟稀土地質學，雙學位。Over。",
    ],
  },
  {
    id: "meta-shrink", gender: "female", name: "Dr. Vex", job: "元宇宙心理醫生 · 2045", tag: "未來職業",
    color: "from-purple-500 to-fuchsia-600",
    intro: "治療虛擬人格分裂與沉浸症候群",
    script: [
      "歡迎進入諮詢空間。我的化身只是介面，請放鬆。",
      "新世代有 40% 的人有『分身焦慮』——不知道哪個自己才是真的。",
      "我們用 VR 重建你最早的記憶，然後一層一層整理你的虛擬身份。",
      "最難治的是『元宇宙婚姻破裂』——對方關閉了共享空間，等於人間蒸發。",
      "如果你想入行，先讀臨床心理 + 沉浸式介面設計，缺一不可。",
    ],
  },
];

const hybridPersonas: Persona[] = [
  {
    id: "ai-detective", gender: "neutral", name: "林探員", job: "AI 倫理偵探", tag: "跨界混合",
    color: "from-emerald-500 to-teal-700",
    intro: "調查 AI 偏見與演算法歧視案件",
    script: [
      "我是林探員。最近的案子——銀行 AI 拒絕了一整區的房貸申請。",
      "我們不抓人，我們『拆解模型』。看訓練資料藏了什麼歷史偏見。",
      "這行需要的是『法律 + 統計 + 心理學』的三角能力，缺一不可。",
      "最棘手的是黑箱模型——連工程師都解釋不了它為什麼做這個決定。",
      "想入行？先讀 ML 公平性論文，再考一張資料保護認證。",
    ],
  },
  {
    id: "legacy-restorer", gender: "female", name: "Maya", job: "數位遺產修復師", tag: "跨界混合",
    color: "from-rose-500 to-purple-600",
    intro: "重建逝者的社群帳號與數位記憶",
    script: [
      "Hi，我是 Maya。我幫家屬『找回』過世親人的數位生命。",
      "從加密硬碟、雲端相簿、聊天紀錄，整理成一本『數位回憶錄』。",
      "最感人的案子是替一位母親重建女兒 15 歲的 IG，讓她能再看一次。",
      "倫理界線很重要——哪些該還原、哪些該銷毀，我們有一套協議。",
      "這行結合資安 + 心理諮商 + 檔案學，現在全台不到 30 人。",
    ],
  },
];

const PERSONA_INSIGHTS: Record<string, CareerInsight> = {
  av: {
    skills: ["表演與鏡頭感", "界線感與溝通", "隱私與自我保護"],
    future: ["內容創作與品牌經營", "轉向經紀或製作", "跨足主持與顧問"],
  },
  mortician: {
    skills: ["情緒穩定與同理", "流程控管與細節", "家屬溝通能力"],
    future: ["生命教育講師", "禮儀服務管理", "悲傷支持與顧問"],
  },
  esports: {
    skills: ["反應速度與操作", "團隊溝通與紀律", "抗壓與賽事分析"],
    future: ["教練或戰術分析師", "直播與內容創作", "青訓與賽事營運"],
  },
  deepsea: {
    skills: ["體能與耐力", "海上安全與維修", "高壓環境適應"],
    future: ["升任船員或輪機員", "漁業管理與帶隊", "返鄉技術教學"],
  },
  perfumer: {
    skills: ["嗅覺敏銳", "配方試驗與記憶", "美感與市場洞察"],
    future: ["品牌研發", "香氛顧問或講師", "跨界美妝產品開發"],
  },
  jobs: {
    skills: ["產品洞察", "敘事與簡報", "跨部門整合"],
    future: ["產品經理或創業", "設計思維顧問", "平台型產品領導"],
  },
  davinci: {
    skills: ["觀察力與研究", "跨領域創作", "實驗與草圖整理"],
    future: ["藝術創作與研究", "科技設計跨域", "策展與概念顧問"],
  },
  asteroid: {
    skills: ["太空工程知識", "遠端操作與維修", "風險判斷與協作"],
    future: ["月球/火星採礦", "太空物流與基地管理", "自動化監控"],
  },
  "meta-shrink": {
    skills: ["心理諮商與倫理", "虛擬溝通能力", "資料判讀與保密"],
    future: ["VR 諮商平台", "數位療癒產品設計", "心理科技顧問"],
  },
  "ai-detective": {
    skills: ["法律素養", "資料分析與偏誤判讀", "跨部門溝通"],
    future: ["AI 風險稽核", "合規顧問", "公共政策或研究"],
  },
  "legacy-restorer": {
    skills: ["數位資料修復", "家屬溝通與敏感度", "平台工具與權限管理"],
    future: ["數位遺產顧問", "AI 記憶整理服務", "線上紀念檔案管理"],
  },
};

function CallPage() {
  useTrackVisit("call");
  const [mode, setMode] = useState<Mode>("real");
  const [active, setActive] = useState<Persona | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const sub = useSubscription();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const tryStartCall = useCallback((p: Persona, i: number) => {
    if (!sub.canMakeAiCall) {
      setPaywallOpen(true);
      return;
    }
    sub.consumeAiCall();
    setActive(p); setActiveIdx(i); setLineIdx(0); setSeconds(0);
  }, [sub]);
  const [lineIdx, setLineIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);

  // Voice mode: off | browser (Web Speech) | kokoro (local AI)
  type VoiceMode = "off" | "browser" | "kokoro";
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("browser");
  const [kokoroState, setKokoroState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [kokoroProgress, setKokoroProgress] = useState<number>(0);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioCleanupRef = useRef<(() => void) | null>(null);
  const synthSeqRef = useRef(0); // 用來作廢過時的合成請求

  // Drama state
  const [drama, setDrama] = useState<DramaScene | null>(null);
  const [dramaIdx, setDramaIdx] = useState(0);
  const [dramaListIdx, setDramaListIdx] = useState(0);

  // 即時 Q&A（角色用 LLM 回應）
  type ChatMsg = { role: "user" | "assistant"; content: string };
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const askPersonaFn = useServerFn(askPersona);
  const saveCallFn = useServerFn(saveCallSession);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Web Speech API（瀏覽器內建）
  const speech = useSpeech();
  useEffect(() => {
    speech.setMuted(muted || voiceMode !== "browser");
  }, [muted, voiceMode, speech]);

  // Kokoro 進度訂閱
  useEffect(() => {
    const off = onKokoroProgress((p: KokoroProgress) => {
      if (typeof p.progress === "number") setKokoroProgress(Math.round(p.progress));
    });
    return off;
  }, []);

  // 停止目前正在播的本地語音
  const stopLocalAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try { a.pause(); a.removeAttribute("src"); a.load(); } catch { /* noop */ }
    }
    if (currentAudioCleanupRef.current) {
      currentAudioCleanupRef.current();
      currentAudioCleanupRef.current = null;
    }
    setIsVoicePlaying(false);
  }, []);

  // 統一發聲入口
  const speakNow = useCallback(
    async (text: string, gender: SpeechGender) => {
      if (!text || muted || voiceMode === "off") return;

      if (voiceMode === "browser") {
        speech.speak(text, gender);
        return;
      }

      // kokoro
      const seq = ++synthSeqRef.current;
      stopLocalAudio();

      // 太長就只合成第一段（避免久等）
      const chunks = splitTextForTts(text);
      const target = chunks[0] ?? text.slice(0, 160);

      try {
        setIsVoiceLoading(true);
        const voice = gender === "female" ? "zf_001" : gender === "male" ? "zm_001" : undefined;
        const { audioUrl, cleanup } = await synthesizeLocalSpeech(target, { voice });
        if (seq !== synthSeqRef.current) { cleanup(); return; } // 已被作廢
        currentAudioCleanupRef.current = cleanup;
        const a = audioRef.current;
        if (!a) { cleanup(); return; }
        a.src = audioUrl;
        a.onplay = () => setIsVoicePlaying(true);
        a.onended = () => { setIsVoicePlaying(false); cleanup(); currentAudioCleanupRef.current = null; };
        a.onerror = () => { setIsVoicePlaying(false); cleanup(); currentAudioCleanupRef.current = null; };
        await a.play().catch(() => { /* autoplay 被擋，使用者再點一次即可 */ });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`本地 AI 語音失敗：${msg}，自動切回瀏覽器語音`);
        setKokoroState("error");
        setVoiceMode("browser");
      } finally {
        setIsVoiceLoading(false);
      }
    },
    [voiceMode, muted, speech, stopLocalAudio],
  );

  // 角色腳本：每換一句就朗讀
  useEffect(() => {
    if (active) void speakNow(active.script[lineIdx], active.gender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lineIdx, voiceMode]);

  // LLM 回覆：每收到新 assistant 訊息就朗讀
  useEffect(() => {
    if (!active || chat.length === 0) return;
    const last = chat[chat.length - 1];
    if (last.role === "assistant") void speakNow(last.content, active.gender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  // 廣播劇：每換一個節點就朗讀（中性聲音）
  useEffect(() => {
    if (drama) void speakNow(drama.nodes[dramaIdx]?.line ?? "", "neutral");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drama, dramaIdx, voiceMode]);

  useEffect(() => {
    if (active || drama) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [active, drama]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, asking]);

  // 切換到 kokoro：首次載入模型
  const enableKokoro = useCallback(async () => {
    if (kokoroState === "loading") return;
    const ok = window.confirm(
      "本地 AI 語音 (Kokoro) 會在你裝置上免費執行。\n首次使用需下載約 100 MB 模型，可能要等 1–3 分鐘並佔用較多記憶體。\n要繼續嗎？",
    );
    if (!ok) return;
    setKokoroState("loading");
    setKokoroProgress(0);
    try {
      await initKokoroTts();
      setKokoroState("ready");
      setVoiceMode("kokoro");
      toast.success("本地 AI 語音已就緒");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setKokoroState("error");
      toast.error(`本地語音不支援此裝置：${msg}`);
    }
  }, [kokoroState]);

  // 卸載元件時清掉音訊與 worker
  useEffect(() => {
    return () => {
      stopLocalAudio();
      synthSeqRef.current++;
      disposeKokoroTts();
    };
  }, [stopLocalAudio]);


  const cycleVoiceMode = () => {
    if (voiceMode === "off") setVoiceMode("browser");
    else if (voiceMode === "browser") {
      if (kokoroState === "ready") setVoiceMode("kokoro");
      else void enableKokoro();
    } else {
      setVoiceMode("off");
      stopLocalAudio();
    }
  };

  const hangup = () => {
    speech.cancel();
    stopLocalAudio();
    synthSeqRef.current++;
    // 留存通話紀錄（至少聽完一句才記）；未登入或失敗都靜默
    if (active && (lineIdx > 0 || chat.length > 0)) {
      logActivity({
        station: "call",
        type: "call_completed",
        detail: `與 ${active.name}・${active.job} 通話 ${seconds} 秒（${chat.length} 訊息）`,
      });
      void saveCallFn({
        data: {
          persona_id: active.id,
          persona_name: active.name,
          persona_job: active.job,
          script_lines_played: lineIdx + 1,
          message_count: chat.length,
          duration_seconds: seconds,
        },
      }).catch(() => { /* 訪客或斷線都不打擾 */ });
    }
    setActive(null); setLineIdx(0);
    setSeconds(0); setMuted(false);
    setChat([]); setQuestion(""); setAsking(false);
  };
  const exitDrama = () => {
    speech.cancel();
    stopLocalAudio();
    synthSeqRef.current++;
    setDrama(null); setDramaIdx(0); setSeconds(0);
  };


  const next = () => active && lineIdx < active.script.length - 1 && setLineIdx((i) => i + 1);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const sendQuestion = async () => {
    if (!active || asking) return;
    const q = question.trim();
    if (!q) return;
    setQuestion("");
    const prevChat = chat;
    setChat([...prevChat, { role: "user", content: q }]);
    setAsking(true);
    try {
      const { reply } = await askPersonaFn({
        data: {
          personaName: active.name,
          personaJob: active.job,
          personaIntro: active.intro,
          scriptLines: active.script,
          history: prevChat,
          userMessage: q,
        },
      });
      setChat((c) => [...c, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI 回覆失敗";
      toast.error(msg);
    } finally {
      setAsking(false);
    }
  };


  // ===== Drama immersive view =====
  if (drama) {
    const node = drama.nodes[dramaIdx];
    return (
      <div className="fixed inset-0 z-[60] mx-auto flex max-w-md flex-col px-6 py-10"
        style={{ ...morandiBg(dramaListIdx), color: morandiInk }}>
        <div className="text-center">
          <p className="text-xs opacity-70">廣播劇 · {fmt(seconds)}</p>
          <h2 className="mt-2 text-2xl font-bold">{drama.title}</h2>
          <p className="mt-1 text-[11px] opacity-70">{drama.tag}</p>
        </div>
        <div className="mt-8 flex-1 space-y-4 overflow-y-auto">
          <div className="rounded-2xl bg-white/45 p-4 backdrop-blur-sm">
            <p className="text-xs opacity-70">{node.speaker}</p>
            <p className="mt-2 text-base leading-relaxed">{node.line}</p>
          </div>
          {node.choices && (
            <div className="space-y-2">
              {node.choices.map((c, i) => (
                <button key={i} onClick={() => setDramaIdx(c.next)}
                  className="w-full rounded-2xl bg-white/55 p-4 text-left text-sm font-semibold backdrop-blur-sm active:scale-95">
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {node.ending && (
            <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm">
              <p className="font-bold leading-relaxed">{node.ending}</p>
            </div>
          )}
          {!node.choices && !node.ending && dramaIdx < drama.nodes.length - 1 && (
            <button onClick={() => setDramaIdx(dramaIdx + 1)} className="w-full rounded-2xl bg-white/55 p-3 text-sm font-semibold">繼續 →</button>
          )}
        </div>
        <button onClick={exitDrama} className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl active:scale-95">
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    );
  }

  // ===== Persona call active view =====
  if (active) {
    const scriptEnded = lineIdx >= active.script.length - 1;
    return (
      <div className="fixed inset-0 z-[60] mx-auto flex max-w-md flex-col px-6 py-8"
        style={{ ...morandiBg(activeIdx), color: morandiInk }}>
        {/* 隱藏播放器（Kokoro 本地語音） */}
        <audio ref={audioRef} className="hidden" />

        <div className="text-center shrink-0">
          <p className="text-xs opacity-70">
            通話中 · {fmt(seconds)}
            {muted && " · 靜音"}
            {voiceMode === "off" && " · 無聲"}
            {voiceMode === "kokoro" && " · 本地 AI 語音"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{active.name}</h2>
          <p className="mt-0.5 text-xs opacity-80">{active.job}</p>
        </div>

        {/* 語音模式切換 */}
        <div className="mt-3 flex shrink-0 items-center justify-center gap-1.5">
          {(["off", "browser", "kokoro"] as const).map((m) => {
            const isActive = voiceMode === m;
            const label = m === "off" ? "靜" : m === "browser" ? "瀏覽器" : "本地 AI";
            const onClick = () => {
              if (m === "kokoro" && kokoroState !== "ready") { void enableKokoro(); return; }
              setVoiceMode(m);
              if (m === "off") stopLocalAudio();
            };
            return (
              <button key={m} onClick={onClick}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                  isActive ? "bg-black/80 text-white" : "bg-white/50 text-foreground/70"
                }`}>
                {m === "kokoro" && <Cpu className="h-3 w-3" />}
                {label}
                {m === "kokoro" && kokoroState === "loading" && (
                  <span className="ml-1 inline-flex items-center gap-0.5">
                    <Download className="h-3 w-3 animate-pulse" />{kokoroProgress || 0}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!scriptEnded && (
          <div className="my-4 flex shrink-0 justify-center">
            <div className="relative">
              {(isVoicePlaying || (voiceMode === "browser" && !muted)) && (
                <div className="absolute inset-0 animate-ping rounded-full bg-white/45" />
              )}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/40 backdrop-blur-sm">
                {isVoiceLoading
                  ? <Loader2 className="h-10 w-10 animate-spin" />
                  : <Volume2 className={`h-11 w-11 ${voiceMode === "off" ? "opacity-40" : ""}`} />}
              </div>
            </div>
            {voiceMode === "kokoro" && isVoiceLoading && (
              <p className="absolute mt-28 text-[11px] opacity-70">本地 AI 合成中…</p>
            )}
          </div>
        )}


        {/* 對話內容（可捲動） */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 py-2">
          <button onClick={next} disabled={scriptEnded}
            className="w-full rounded-2xl bg-white/55 p-4 text-left text-[14px] leading-relaxed backdrop-blur-sm transition-all active:bg-white/70 disabled:opacity-100">
            <p className="text-[10px] opacity-70 mb-1">{active.name}</p>
            {active.script[lineIdx]}
          </button>
          {!scriptEnded && (
            <p className="text-center text-[11px] opacity-65">點擊繼續聆聽 →</p>
          )}

          {scriptEnded && (
            <>
              <div className="rounded-2xl border border-black/10 bg-white/40 px-4 py-3 text-[12px] backdrop-blur-sm">
                你還有什麼想問的？直接打字，{active.name}會親自回你。
              </div>
              {chat.map((m, i) => (
                <div key={i}
                  className={`rounded-2xl p-3 text-[14px] leading-relaxed backdrop-blur-sm ${
                    m.role === "user"
                      ? "ml-8 bg-white/80 text-foreground"
                      : "mr-4 bg-white/55"
                  }`}>
                  <p className="text-[10px] opacity-70 mb-1">
                    {m.role === "user" ? "你" : active.name}
                  </p>
                  {m.content}
                </div>
              ))}
              {asking && (
                <div className="mr-4 flex items-center gap-2 rounded-2xl bg-white/55 p-3 text-[13px] backdrop-blur-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="opacity-80">{active.name}正在回覆…</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </>
          )}
        </div>

        {/* 輸入區（僅在腳本結束後出現） */}
        {scriptEnded && (
          <form
            onSubmit={(e) => { e.preventDefault(); void sendQuestion(); }}
            className="mt-3 flex shrink-0 items-center gap-2 rounded-full bg-white/70 px-2 py-1.5 backdrop-blur-sm"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`問問${active.name}…`}
              maxLength={500}
              disabled={asking}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-foreground/40"
            />
            <button type="submit" disabled={asking || !question.trim()}
              aria-label="送出問題"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40 active:scale-95">
              {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        )}

        <div className="mt-4 flex shrink-0 items-center justify-around">
          <button onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label={muted ? "取消靜音" : "靜音"}
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-colors active:scale-95 ${muted ? "bg-white" : "bg-white/40"}`}>
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button onClick={hangup} aria-label="掛斷" className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl active:scale-95">
            <PhoneOff className="h-6 w-6" />
          </button>
          <button onClick={cycleVoiceMode} aria-label="切換語音模式"
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-colors active:scale-95 ${voiceMode === "off" ? "bg-white" : "bg-white/40"}`}>
            {voiceMode === "off"
              ? <VolumeX className="h-5 w-5" />
              : voiceMode === "kokoro"
                ? <Cpu className="h-5 w-5" />
                : <Volume2 className="h-5 w-5" />}
          </button>

        </div>
      </div>

    );
  }

  // ===== List view =====
  const tabs: { id: Mode; label: string; icon: typeof Phone }[] = [
    { id: "real", label: "真實職人", icon: Phone },
    { id: "timewarp", label: "跨時空", icon: Sparkles },
    { id: "drama", label: "職場廣播劇", icon: Radio },
    { id: "hybrid", label: "跨界混合", icon: Atom },

  ];

  const personaList: Persona[] =
    mode === "real" ? realPersonas :
    mode === "timewarp" ? timewarpPersonas :
    mode === "hybrid" ? hybridPersonas : [];


  return (
    <div className="px-5 pt-10 pb-24 animate-page">
      <header className="mb-6 animate-rise">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">您撥的號碼是未來</p>
        <p className="mt-3 text-body text-muted-foreground">
          撥一通電話聽真實的職人，或走進五分鐘廣播劇，先把未來走一遍。
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${sub.isSubscribed ? "bg-[image:var(--gradient-hero)] text-primary-foreground" : "bg-primary-soft text-primary-deep"}`}>
              <Crown className="h-3.5 w-3.5" />
            </div>
            <div className="text-[12px] leading-tight">
              {sub.isSubscribed ? (
                <p className="font-semibold text-foreground">PRO 訂閱・AI 語音無限</p>
              ) : (
                <>
                  <p className="font-semibold text-foreground">免費方案</p>
                  <p className="text-[11px] text-muted-foreground">
                    本月剩餘 <b className="text-primary-deep tabular-nums">{sub.aiCallsRemaining}</b> / {sub.aiCallsLimit} 通
                  </p>
                </>
              )}
            </div>
          </div>
          {!sub.isSubscribed && (
            <button
              onClick={() => setPaywallOpen(true)}
              className="press rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"
            >
              升級
            </button>
          )}
        </div>
      </header>

      <SubscribeDialog open={paywallOpen} onClose={() => setPaywallOpen(false)} reason="ai" />

      {/* Mode tabs */}
      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = mode === t.id;
          return (
            <button key={t.id} onClick={() => setMode(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Persona list (real / timewarp / hybrid) */}
      {(mode === "real" || mode === "timewarp" || mode === "hybrid") && (
        <div className="space-y-3">
          {personaList.map((p, i) => (
            <div key={p.id} className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
              <div className="px-5 py-4" style={{ ...morandiBg(i), color: morandiInk }}>
                <span className="rounded-full bg-white/55 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">{p.tag}</span>
                <h3 className="mt-2 text-lg font-bold">{p.name}</h3>
                <p className="text-xs opacity-80">{p.job}</p>
              </div>
              <div className="space-y-3 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{p.intro}</p>
                  <button
                    onClick={() => tryStartCall(p, i)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)] active:scale-95"
                  >
                    <Phone className="h-3.5 w-3.5" /> 撥打
                  </button>
                </div>
                <CareerInsights
                  skills={PERSONA_INSIGHTS[p.id].skills}
                  future={PERSONA_INSIGHTS[p.id].future}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drama list — 同莫蘭迪色票 */}
      {mode === "drama" && (
        <>
          <p className="mb-3 text-caption">
            五分鐘高張力職場片段，在關鍵點做選擇，導向不同結局。
          </p>
          <div className="space-y-3">
            {dramaScenes.map((d, i) => (
              <div key={d.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
                <div className="px-5 py-4" style={{ ...morandiBg(i), color: morandiInk }}>
                  <span className="rounded-full bg-white/55 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">{d.tag}</span>
                  <h3 className="mt-2 text-lg font-bold">{d.title}</h3>
                  <p className="text-xs opacity-80">{d.intro}</p>
                </div>
                <div className="flex items-center justify-end px-5 py-4">
                  <button onClick={() => { setDrama(d); setDramaListIdx(i); setDramaIdx(0); setSeconds(0); }}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground active:scale-95">
                    <Radio className="h-3.5 w-3.5" /> 進入劇情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-caption">
        所有對話為模擬訪談或情境劇本，內容經當事人同意改編，或為創作虛構。
      </p>
    </div>
  );
}
