import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechGender = "female" | "male" | "neutral";

// Edge / Azure Natural 雲端真人聲（最自然，遠勝本機 SAPI 機器人）
// 名稱範例：
//   "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)"
//   "Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)"
//   "Microsoft YunJian Online (Natural) - Chinese (Mainland)"
const NATURAL_HINT = /(natural|online|neural)/i;

// 常見女性 / 男性中文 Azure 聲音關鍵字（依名稱判斷性別）
const FEMALE_NAMES = /(xiaoxiao|xiaoyi|xiaomeng|xiaohan|xiaomo|xiaoqiu|xiaoshuang|xiaorou|xiaozhen|xiaoxuan|yunfeng|hiumaan|hsiaochen|hsiaoyu|hiugaai|yating|mei|female|woman|girl|sara|amy|samantha|sin-ji|tingting)/i;
const MALE_NAMES = /(yunjian|yunxi|yunyang|yunhao|yunze|yunfeng|wangwang|kangkang|hanhan|wanlung|danny|male|man|boy|daniel|alex)/i;

const MANDARIN_LANG = /^(zh-CN|zh-TW|zh-SG|cmn)/i; // 普通話 / 國語
const CANTONESE_LANG = /^(yue|zh-HK|zh-MO)/i; // 廣東話
const ZH_LANG = /^zh|cmn|yue/i;
// 廣東話聲音的常見英文名（即使 lang 標成 zh-HK 也要過濾）
const CANTONESE_NAMES = /(hiumaan|hiugaai|wanlung|sin-?ji|cantonese|yue)/i;

function score(v: SpeechSynthesisVoice, gender: SpeechGender) {
  let s = 0;
  const nameLang = `${v.name} ${v.lang}`;
  const isCantonese = CANTONESE_LANG.test(v.lang) || CANTONESE_NAMES.test(v.name);
  if (isCantonese) {
    s -= 200; // 強烈排除廣東話
  } else if (MANDARIN_LANG.test(v.lang)) {
    s += 120; // 普通話最優先
  } else if (ZH_LANG.test(v.lang)) {
    s += 60; // 其他中文（未標明地區）次之
  }
  if (NATURAL_HINT.test(v.name)) s += 50; // Natural/Online 雲端聲大加分
  if (!v.localService) s += 20; // 雲端聲（非本機）再加分
  if (gender === "female" && FEMALE_NAMES.test(v.name)) s += 30;
  if (gender === "male" && MALE_NAMES.test(v.name)) s += 30;
  // 反向：性別不符要扣，避免女角配到男聲
  if (gender === "female" && MALE_NAMES.test(v.name)) s -= 25;
  if (gender === "male" && FEMALE_NAMES.test(v.name)) s -= 25;
  // 繁中（台灣）略優先於簡中
  if (/zh-TW|Taiwan|HsiaoChen|HsiaoYu|YunJhe/i.test(nameLang)) s += 8;
  return s;
}

function pickVoice(voices: SpeechSynthesisVoice[], gender: SpeechGender) {
  if (!voices.length) return null;
  const ranked = [...voices].sort((a, b) => score(b, gender) - score(a, gender));
  return ranked[0];
}

function detectIsEdge() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Chromium Edge 的 UA 一定包含 "Edg/"（避免誤判舊版 Edge "Edge/"）
  return /\bEdg\//.test(ua);
}

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [isEdge, setIsEdge] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const mutedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const edge = detectIsEdge();
    setIsEdge(edge);
    if (!edge) {
      // 非 Edge 一律關閉語音（其他瀏覽器只有機器人 SAPI 聲，品質太差）
      // eslint-disable-next-line no-console
      console.info("[TTS] 非 Edge 瀏覽器，已自動停用語音");
      return;
    }
    setSupported(true);
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length && typeof console !== "undefined") {
        // eslint-disable-next-line no-console
        console.info(
          "[TTS] 可用語音：",
          list.map((v) => `${v.name} | ${v.lang} | local=${v.localService}`),
        );
      }
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text: string, gender: SpeechGender = "neutral") => {
      if (!supported || mutedRef.current || !text) return;
      const v = pickVoice(voices, gender);
      const u = new SpeechSynthesisUtterance(text);
      // 若挑到 Natural / 雲端聲，pitch 維持 1（雲端聲自帶情緒，調 pitch 反而失真）
      const isNatural = v ? NATURAL_HINT.test(v.name) || !v.localService : false;
      u.lang = v?.lang && !CANTONESE_LANG.test(v.lang) ? v.lang : "zh-TW";
      u.rate = 1;
      u.pitch = isNatural ? 1 : gender === "female" ? 1.15 : gender === "male" ? 0.85 : 1;
      if (v) u.voice = v;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [supported, voices],
  );

  const setMuted = useCallback(
    (m: boolean) => {
      mutedRef.current = m;
      if (m) cancel();
    },
    [cancel],
  );

  // 暴露目前挑到的聲音（給 UI 顯示）
  const currentVoice = (gender: SpeechGender = "neutral") => pickVoice(voices, gender);

  return { supported, speak, cancel, setMuted, voices, currentVoice };
}
