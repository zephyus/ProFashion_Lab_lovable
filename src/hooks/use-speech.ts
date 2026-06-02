import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechGender = "female" | "male" | "neutral";

function pickVoice(voices: SpeechSynthesisVoice[], gender: SpeechGender) {
  if (!voices.length) return null;
  const zh = voices.filter((v) => /^zh|cmn|yue/i.test(v.lang));
  const pool = zh.length ? zh : voices;

  const femaleHints = /(female|woman|girl|zhiyu|xiaoxiao|xiaoyi|yating|hsiaochen|mei|sin-ji|tingting|sara|amy|google.*female|^female)/i;
  const maleHints = /(male|man|boy|yunjian|yunxi|yunyang|kangkang|danny|hanhan|^male|google.*male)/i;

  if (gender === "female") {
    return pool.find((v) => femaleHints.test(v.name)) ?? pool[0];
  }
  if (gender === "male") {
    return pool.find((v) => maleHints.test(v.name)) ?? pool[0];
  }
  return pool[0];
}

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const mutedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
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
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-TW";
      u.rate = 1;
      u.pitch = gender === "female" ? 1.15 : gender === "male" ? 0.85 : 1;
      const v = pickVoice(voices, gender);
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

  return { supported, speak, cancel, setMuted };
}
