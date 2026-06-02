// Client-side wrapper around the Kokoro TTS web worker.
// Keeps a single worker + pipeline instance alive for the session.

import { float32ToWavBlob } from "./wav";

export type KokoroProgress = {
  status?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
};

type WorkerResponse =
  | { type: "ready" }
  | { type: "progress"; payload: KokoroProgress }
  | { type: "audio"; requestId: string; audio: Float32Array; samplingRate: number }
  | { type: "error"; requestId?: string; message: string };

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
const pending = new Map<
  string,
  { resolve: (v: { audio: Float32Array; samplingRate: number }) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }
>();
let progressListeners: Array<(p: KokoroProgress) => void> = [];

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./kokoroWorker.ts", import.meta.url), { type: "module" });
  worker.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
    const data = e.data;
    if (data.type === "progress") {
      progressListeners.forEach((cb) => cb(data.payload));
      return;
    }
    if (data.type === "audio") {
      const entry = pending.get(data.requestId);
      if (!entry) return;
      clearTimeout(entry.timer);
      pending.delete(data.requestId);
      entry.resolve({ audio: data.audio, samplingRate: data.samplingRate });
      return;
    }
    if (data.type === "error") {
      if (data.requestId) {
        const entry = pending.get(data.requestId);
        if (entry) {
          clearTimeout(entry.timer);
          pending.delete(data.requestId);
          entry.reject(new Error(data.message));
        }
      } else {
        pending.forEach((entry) => {
          clearTimeout(entry.timer);
          entry.reject(new Error(data.message));
        });
        pending.clear();
      }
    }
  });
  worker.addEventListener("error", (e) => {
    const err = new Error(e.message || "Kokoro worker crashed");
    pending.forEach((entry) => {
      clearTimeout(entry.timer);
      entry.reject(err);
    });
    pending.clear();
  });
  return worker;
}

export function onKokoroProgress(cb: (p: KokoroProgress) => void) {
  progressListeners.push(cb);
  return () => {
    progressListeners = progressListeners.filter((x) => x !== cb);
  };
}

export function initKokoroTts(): Promise<void> {
  if (readyPromise) return readyPromise;
  const w = ensureWorker();
  readyPromise = new Promise<void>((resolve, reject) => {
    const onMsg = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === "ready") {
        w.removeEventListener("message", onMsg);
        resolve();
      } else if (e.data.type === "error" && !e.data.requestId) {
        w.removeEventListener("message", onMsg);
        reject(new Error(e.data.message));
      }
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ type: "init" });
  }).catch((err) => {
    readyPromise = null;
    throw err;
  });
  return readyPromise;
}

export async function synthesizeLocalSpeech(
  text: string,
  options: { voice?: string; speed?: number; timeoutMs?: number } = {},
): Promise<{ audioUrl: string; cleanup: () => void }> {
  await initKokoroTts();
  const w = ensureWorker();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const timeoutMs = options.timeoutMs ?? 30000;

  const { audio, samplingRate } = await new Promise<{ audio: Float32Array; samplingRate: number }>(
    (resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error("Kokoro 合成逾時"));
      }, timeoutMs);
      pending.set(requestId, { resolve, reject, timer });
      w.postMessage({
        type: "synthesize",
        requestId,
        text,
        voice: options.voice,
        speed: options.speed,
      });
    },
  );

  const blob = float32ToWavBlob(audio, samplingRate);
  const audioUrl = URL.createObjectURL(blob);
  return {
    audioUrl,
    cleanup: () => URL.revokeObjectURL(audioUrl),
  };
}

export function disposeKokoroTts() {
  pending.forEach((entry) => {
    clearTimeout(entry.timer);
    entry.reject(new Error("Kokoro 已停止"));
  });
  pending.clear();
  worker?.terminate();
  worker = null;
  readyPromise = null;
  progressListeners = [];
}
