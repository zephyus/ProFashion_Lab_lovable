
# 真實語音通話 — 深度構思

目前「撥打」只是逐句點擊文字劇本，加上腳本結束後的文字 LLM Q&A。要讓它「真的像在講電話」，有三條技術路線，差別在沉浸感、延遲、與成本。先講清楚差別，再選一條落地。

---

## 三條路線比較

### A. TTS 朗讀（最快落地，建議起手）
- 角色每句台詞 → 用 ElevenLabs Text-to-Speech 串流播放
- 使用者「點擊繼續」改成「自動播完下一句 / 可手動跳過」
- 腳本結束後的 LLM 回覆，也用 TTS 念出來
- 麥克風？沒有。使用者仍用打字提問。
- **沉浸感**：★★★☆☆（有聲音、像語音留言/單向廣播）
- **延遲**：首字 ~500ms（turbo v2.5 串流）
- **成本**：很低，每次通話幾分錢

### B. TTS + STT（雙向，使用者可開口問）
- A 的所有功能
- ＋ 使用者按住麥克風講話 → ElevenLabs Scribe 即時轉文字 → 丟給 LLM → TTS 念回來
- **沉浸感**：★★★★☆（真的能對話）
- **延遲**：使用者講完後 ~1.5–2.5 秒回應
- **成本**：中等
- **要求**：使用者需授權麥克風

### C. ElevenLabs Conversational Agent（端到端語音對話）
- 用 ElevenLabs Agents Platform，建立每個角色的 agent（system prompt = 該角色的人設與腳本）
- WebRTC 直連，使用者一按「撥打」就進入連續語音對話，可隨時打斷
- 不再有「逐句點擊腳本」這件事，腳本變成 agent 的知識
- **沉浸感**：★★★★★（最接近真的講電話、可被打斷）
- **延遲**：~300–500ms
- **成本**：較高，且需在 ElevenLabs 後台預先建好每個 agent（或用 overrides 動態注入 prompt）
- **要求**：ELEVENLABS_API_KEY、麥克風授權

---

## 我的建議：分兩階段

**階段一（這次做）：路線 A — TTS 朗讀**
理由：
1. 改動最小、風險最低，先把「聲音」這層體驗補上
2. 不需要使用者授權麥克風，門檻最低
3. 現有的「逐句點擊腳本」與「文字 Q&A」結構幾乎不用動，只在每句出現時觸發 TTS
4. 為每個角色指派不同 ElevenLabs voiceId（綾瀨小姐→女聲、阿明師傅→沉穩男聲、Ray→年輕男聲、老陳→粗獷男聲、Élise→法式女聲、賈伯斯→中年男聲…）→ 角色立刻立體
5. 之後要升級到 B 或 C，這層 TTS 仍能沿用

**階段二（之後再說）：升級成路線 C**
等階段一上線、確定使用者喜歡聲音版本後，再為「真實職人」分頁的角色升級到 Conversational Agent，做出「真的能打斷、能對話」的旗艦體驗。

---

## 階段一 實作步驟（這次的範圍）

### 1. 後端：兩個 server function
- `src/lib/tts.functions.ts`
  - `synthesizePersonaLine({ voiceId, text })` → 呼叫 ElevenLabs `/v1/text-to-speech/{voiceId}/stream`，模型 `eleven_turbo_v2_5`，回傳 base64 MP3
  - 用 `requireSupabaseAuth` 中介，避免被當免費 TTS 接口濫用
  - 讀 `process.env.ELEVENLABS_API_KEY`

### 2. 角色 → voiceId 對應
在 `realPersonas` / `timewarpPersonas` / `hybridPersonas` 每個物件加 `voiceId` 欄位，挑選預設 voice：
- 女聲：Sarah、Alice、Matilda、Lily
- 男聲：George、Brian、Liam、Bill、Daniel
- 例：綾瀨小姐 → Sarah、阿明師傅 → Brian、Ray → Liam、老陳 → Bill、Élise → Matilda、賈伯斯 → Daniel、達文西 → George…

### 3. 前端：`src/routes/_app.call.tsx` 通話畫面
- 加入一個 `<audio ref>` 元素
- 進入通話、或 `lineIdx` 變動時：
  - 呼叫 server fn 拿 MP3 base64
  - 透過 `data:audio/mpeg;base64,...` 設給 audio 並 play
  - 播放中：把目前的「外圈 ping 動畫」與 `Volume2` 圖示亮起，呼應 `isPlaying`
- 控制：
  - 「點擊繼續聆聽 →」改成：播完自動可進下一句，或使用者點擊跳到下一句
  - 麥克風按鈕（目前的 Mic）保留為「靜音 = 暫停語音」
  - 喇叭按鈕切換音量（speakerOn=1.0、off=0.0）
- 腳本結束後的 LLM Q&A：
  - 收到 assistant 文字回覆後，自動再叫一次 TTS 播出
- 載入中狀態：在台詞區塊顯示小 loading spinner

### 4. 錯誤處理
- 沒設 API key：toast 提示「語音功能未啟用」，仍可用文字模式（fallback 到目前體驗）
- TTS 失敗（429 / 402 / 網路錯）：toast 提示，且保留文字顯示
- 自動播放被瀏覽器擋：首次點「撥打」時是 user gesture，沒問題；之後切換句子也都在 user gesture 鏈內

### 5. 廣播劇模式（drama）
同樣對 `node.line` 套用 TTS，不同 speaker 可用不同 voiceId（在 drama-scenes.ts 為 speaker 加對應表）。本次先做 persona 通話，廣播劇下一輪再加。

---

## 需要你確認的兩件事

1. **同意走階段一（TTS 朗讀）嗎？** 還是你想直接上路線 C（端到端可打斷的真實對話，較複雜、成本較高）？
2. **ELEVENLABS_API_KEY**：階段一與 C 都需要。確認方向後我會請你貼上金鑰（去 elevenlabs.io → Profile → API Keys 取得）。

---

## 技術備註（給工程脈絡）

- ElevenLabs TTS 必須走 server function，金鑰不可進前端 bundle
- 回傳格式採 base64 + JSON，前端用 `data:audio/mpeg;base64,...` 直接餵 `<audio>`，避免 Worker runtime 處理 binary stream 的麻煩
- Server runtime（Cloudflare Worker + nodejs_compat）支援 `fetch` / `Buffer`，TTS 整段 base64 編碼用 `Buffer.from(buf).toString('base64')`，**不可**用 `btoa(String.fromCharCode(...))`（會 stack overflow）
- `eleven_turbo_v2_5` 是延遲與品質的甜蜜點，且支援多語言（綾瀨小姐、Élise 的中文台詞也念得自然）
