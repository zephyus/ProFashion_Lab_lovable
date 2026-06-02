/// <reference lib="webworker" />
// Web Worker: loads Kokoro TTS pipeline once and synthesizes on demand.
// Runs locally in the browser via @huggingface/transformers (ONNX Runtime Web).

import { pipeline, env } from "@huggingface/transformers";

// Allow remote model download from HF Hub; cache in browser (IndexedDB).
env.allowRemoteModels = true;
env.allowLocalModels = false;

const MODEL_ID = "onnx-community/Kokoro-82M-v1.1-zh-ONNX";

type InitMsg = { type: "init" };
type SynthMsg = {
  type: "synthesize";
  requestId: string;
  text: string;
  voice?: string;
  speed?: number;
};
type InMsg = InitMsg | SynthMsg;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ttsPipe: any = null;
let loading: Promise<unknown> | null = null;

async function ensurePipe() {
  if (ttsPipe) return ttsPipe;
  if (!loading) {
    loading = pipeline("text-to-speech", MODEL_ID, {
      // Prefer WebGPU when available, else WASM. Transformers.js auto-picks.
      // dtype: "q8", // smaller; comment out if quality suffers
      progress_callback: (p: unknown) => {
        (self as unknown as Worker).postMessage({ type: "progress", payload: p });
      },
    }).then((p) => {
      ttsPipe = p;
      return p;
    });
  }
  await loading;
  return ttsPipe;
}

self.addEventListener("message", async (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  try {
    if (msg.type === "init") {
      await ensurePipe();
      (self as unknown as Worker).postMessage({ type: "ready" });
      return;
    }
    if (msg.type === "synthesize") {
      const pipe = await ensurePipe();
      // Kokoro pipeline signature: pipe(text, { voice, speed })
      // Output: { audio: Float32Array, sampling_rate: number }
      const opts: Record<string, unknown> = {};
      if (msg.voice) opts.voice = msg.voice;
      if (msg.speed) opts.speed = msg.speed;
      const out = await pipe(msg.text, opts);

      // Normalize various possible output shapes
      let audio: Float32Array | null = null;
      let samplingRate = 24000;
      if (out?.audio instanceof Float32Array) {
        audio = out.audio;
        samplingRate = out.sampling_rate ?? samplingRate;
      } else if (out?.audio && Array.isArray(out.audio)) {
        audio = new Float32Array(out.audio);
        samplingRate = out.sampling_rate ?? samplingRate;
      } else if (out instanceof Float32Array) {
        audio = out;
      }

      if (!audio) throw new Error("Kokoro returned no audio data");

      (self as unknown as Worker).postMessage(
        {
          type: "audio",
          requestId: msg.requestId,
          audio,
          samplingRate,
        },
        // Transfer the underlying buffer to avoid copy
        [audio.buffer],
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    (self as unknown as Worker).postMessage({
      type: "error",
      requestId: (msg as SynthMsg).requestId,
      message,
    });
  }
});

export {};
