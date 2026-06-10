import { useEffect, useState } from "react";

const KEY = "pfl_activity_v3";
const MAX = 200;

export type Station = "explore" | "cafe" | "map" | "call" | "portfolio" | "lab";

export type ActivityEvent = {
  id: string;
  ts: number;
  station: Station;
  type: string;
  detail?: string;
  xp?: number;
};

export const STATION_LABEL: Record<Station, string> = {
  explore: "發現小秘 me",
  cafe: "職業咖啡館",
  map: "職圖",
  call: "您撥的號碼是未來",
  portfolio: "學習歷程",
  lab: "Lab",
};

function read(): ActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? (value as ActivityEvent[]) : [];
  } catch {
    return [];
  }
}

function write(items: ActivityEvent[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  window.dispatchEvent(new Event("activity:update"));
}

export function logActivity(e: Omit<ActivityEvent, "id" | "ts">) {
  if (typeof window === "undefined") return;

  const next: ActivityEvent = {
    ...e,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  };
  const items = read();

  const last = items[0];
  if (
    last &&
    last.station === next.station &&
    last.type === next.type &&
    last.detail === next.detail &&
    next.ts - last.ts < 5000
  ) {
    return;
  }

  write([next, ...items]);
}

export function useActivity() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setActivities(read());
    const on = () => setActivities(read());
    window.addEventListener("activity:update", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("activity:update", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const countsByStation = activities.reduce<Partial<Record<Station, number>>>((acc, a) => {
    acc[a.station] = (acc[a.station] || 0) + 1;
    return acc;
  }, {});

  return { countsByStation };
}

export function useTrackVisit(station: Station, title?: string) {
  useEffect(() => {
    logActivity({ station, type: "visit", detail: title ?? `進入${STATION_LABEL[station]}` });
  }, [station, title]);
}
