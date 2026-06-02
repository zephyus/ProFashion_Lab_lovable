// Convert Float32 PCM (mono) to a 16-bit PCM WAV Blob
export function float32ToWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

// Split long text into TTS-friendly chunks (Chinese-aware)
export function splitTextForTts(text: string, target = 120, max = 160): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];

  const out: string[] = [];
  let buf = "";
  // Split keeping delimiters
  const parts = clean.split(/([。！？；，、!?;,.\n])/);
  for (let i = 0; i < parts.length; i += 2) {
    const seg = (parts[i] ?? "") + (parts[i + 1] ?? "");
    if (!seg) continue;
    if ((buf + seg).length > max && buf.length > 0) {
      out.push(buf);
      buf = seg;
    } else {
      buf += seg;
      if (buf.length >= target) {
        out.push(buf);
        buf = "";
      }
    }
  }
  if (buf) out.push(buf);
  return out;
}
