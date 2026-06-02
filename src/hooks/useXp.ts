import { useCallback, useEffect, useState } from "react";

const KEY = "profashion_xp_v1";
const LVL_KEY = "profashion_level_v1";

function read(k: string) {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(k);
  return v ? Number(v) || 0 : 0;
}

export function useXp() {
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setXp(read(KEY));
    setCompleted(read(LVL_KEY));
    const onStorage = () => {
      setXp(read(KEY));
      setCompleted(read(LVL_KEY));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("xp:update", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("xp:update", onStorage);
    };
  }, []);

  const addXp = useCallback((delta: number) => {
    const nextXp = Math.max(0, read(KEY) + delta);
    const nextLvl = read(LVL_KEY) + 1;
    window.localStorage.setItem(KEY, String(nextXp));
    window.localStorage.setItem(LVL_KEY, String(nextLvl));
    window.dispatchEvent(new Event("xp:update"));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.setItem(KEY, "0");
    window.localStorage.setItem(LVL_KEY, "0");
    window.dispatchEvent(new Event("xp:update"));
  }, []);

  // 每 200 XP 升一個職等
  const tier = Math.floor(xp / 200);
  const tierName =
    ["新鮮人", "實習生", "正職員工", "資深職員", "小主管", "經理", "總監", "副總", "執行長"][
      Math.min(tier, 8)
    ];

  return { xp, completed, addXp, reset, tier, tierName };
}
