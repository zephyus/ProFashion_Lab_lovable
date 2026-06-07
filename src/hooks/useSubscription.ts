import { useEffect, useState } from "react";

// Demo 用：完全 localStorage，無串接金流
// 規則：
//   訂閱者：AI 語音無限、職圖每月 5 次免費體驗
//   未訂閱：AI 語音每月 5 次、職圖體驗單次付費 NT$300
//   訂閱方案：NT$199 / 月

export const SUB_PRICE = 199;
export const BOOKING_PRICE = 300;
export const FREE_AI_CALL_LIMIT = 5;
export const SUB_BOOKING_LIMIT = 5;

const KEY = "pfl_subscription_v1";
const LISTENERS = new Set<() => void>();

type State = {
  subscribed: boolean;
  // YYYY-MM
  month: string;
  aiCalls: number;
  bookings: number;
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function read(): State {
  if (typeof window === "undefined") {
    return { subscribed: false, month: currentMonth(), aiCalls: 0, bookings: 0 };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as State;
    const m = currentMonth();
    if (parsed.month !== m) {
      const reset = { ...parsed, month: m, aiCalls: 0, bookings: 0 };
      localStorage.setItem(KEY, JSON.stringify(reset));
      return reset;
    }
    return parsed;
  } catch {
    const fresh: State = { subscribed: false, month: currentMonth(), aiCalls: 0, bookings: 0 };
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function write(next: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  LISTENERS.forEach((l) => l());
}

export function useSubscription() {
  const [state, setState] = useState<State>(() => read());

  useEffect(() => {
    const update = () => setState(read());
    LISTENERS.add(update);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) update();
    };
    window.addEventListener("storage", onStorage);
    update();
    return () => {
      LISTENERS.delete(update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const isSubscribed = state.subscribed;
  const aiCallsRemaining = isSubscribed
    ? Infinity
    : Math.max(0, FREE_AI_CALL_LIMIT - state.aiCalls);
  const bookingsRemaining = isSubscribed
    ? Math.max(0, SUB_BOOKING_LIMIT - state.bookings)
    : 0;

  return {
    isSubscribed,
    aiCallsUsed: state.aiCalls,
    aiCallsLimit: FREE_AI_CALL_LIMIT,
    aiCallsRemaining,
    bookingsUsed: state.bookings,
    bookingsLimit: SUB_BOOKING_LIMIT,
    bookingsRemaining,
    canMakeAiCall: isSubscribed || aiCallsRemaining > 0,
    canBookFree: isSubscribed && bookingsRemaining > 0,
    subscribe: () => write({ ...read(), subscribed: true }),
    unsubscribe: () => write({ ...read(), subscribed: false }),
    consumeAiCall: () => {
      const cur = read();
      if (cur.subscribed) return;
      write({ ...cur, aiCalls: cur.aiCalls + 1 });
    },
    consumeBooking: () => {
      const cur = read();
      write({ ...cur, bookings: cur.bookings + 1 });
    },
  };
}
