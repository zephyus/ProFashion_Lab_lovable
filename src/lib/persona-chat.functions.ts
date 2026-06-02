import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(1000),
});

const InputSchema = z.object({
  personaName: z.string().min(1).max(80),
  personaJob: z.string().min(1).max(120),
  personaIntro: z.string().min(1).max(400),
  // 已朗讀過的腳本，用來給模型維持人設一致性
  scriptLines: z.array(z.string().min(1).max(600)).max(20),
  history: z.array(MessageSchema).max(20),
  userMessage: z.string().min(1).max(500),
});

export const askPersona = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const system = [
      `你正在扮演「${data.personaName}」，職業：${data.personaJob}。`,
      `角色介紹：${data.personaIntro}`,
      `以下是你方才在電話中已經說過的話，請保持同樣的語氣、口吻、人生觀與專業立場：`,
      ...data.scriptLines.map((l, i) => `(${i + 1}) ${l}`),
      `規則：`,
      `- 以第一人稱回答，繁體中文。`,
      `- 真實、不官腔，可以坦白談辛苦面與不為人知的細節。`,
      `- 一次回覆控制在 60～120 字，像在講電話。`,
      `- 不要說「我是 AI」「我是語言模型」，你就是這位職人本人。`,
      `- 若使用者問到完全超出職業範圍的問題，禮貌帶回自己的專業。`,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          ...data.history,
          { role: "user", content: data.userMessage },
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error("太多人同時在問了，稍後再試一次。");
    }
    if (response.status === 402) {
      throw new Error("AI 額度已用盡，請聯絡管理員加值。");
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI 回應失敗：${response.status} ${text.slice(0, 120)}`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("AI 沒有回覆內容");
    return { reply };
  });
