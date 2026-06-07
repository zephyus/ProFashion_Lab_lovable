
# MVP 變現功能開發計畫

## 為什麼挑這兩個

你的策略文件把 B2B 學校授權列為主力（NT$15K–150K/校/年），而學校會買單的真正理由只有兩個：**108 課綱學習歷程**和**教師管理工具**。其他功能（金流、AI 計量、Freemium）都可以等學校願意付錢之後再做。

所以 MVP 範圍鎖定：

1. **學習歷程 PDF 匯出**（學生端／賣點 #1）
2. **教師後台 Dashboard**（教師端／賣點 #2）

金流、Freemium 計量列為 Phase 2，不在這次範圍。

---

## Phase 1A：學習歷程匯出（學生端）

### 使用者故事
學生在 ProFashion Lab 玩了幾週後，可以一鍵下載一份 PDF：
- 個人測驗結果與職涯傾向
- 完成的虛擬實習關卡與反思
- 撥打過的職人通話記錄與重點
- 累積 XP 與職等
- 時間軸（首次登入 → 最後活動）

格式對齊教育部「學習歷程檔案 — 多元表現」欄位（標題／時間／內容描述／反思）。

### 後端
- 新表：
  - `exploration_events` — 統一記錄使用者每一個探索動作（type, payload, created_at, user_id）。目前 XP/關卡都存在 localStorage，要先搬到雲端否則匯出沒資料。
  - `quiz_results` — 測驗結果快照（answers, archetype, summary）。
  - `call_sessions` — 通話記錄（persona_id, persona_name, script_lines_played, llm_messages）。
- 一個 server function `exportLearningPortfolio()` 聚合上述資料、回傳結構化 JSON。
- PDF 由前端用 `@react-pdf/renderer` 在瀏覽器產生（Cloudflare Worker 環境不適合跑 PDF binary）。

### 前端
- 個人頁新增「我的學習歷程」分頁，預覽 + 下載 PDF。
- 既有 `useXp` 從 localStorage 改為 Supabase 來源（保留 localStorage 作為訪客回退）。
- 既有測驗／通話完成事件要寫入新表。

---

## Phase 1B：教師後台 Dashboard

### 使用者故事
教師建立一個「班級」、邀請學生加入，可以：
- 看到全班學生清單（姓名、最後活動、XP、完成關卡數）
- 點進單一學生看其探索摘要（職涯傾向、玩過的職人、通話次數）
- 匯出全班的 CSV / 個別學生的 PDF
- 不能看到學生的 AI 對話原文（隱私）

### 角色系統
- 新增 `app_role` enum：`student`、`teacher`、`admin`
- 新表 `user_roles`（依照系統規範分離存放）
- `has_role()` security-definer 函式
- 註冊流程預設 student；teacher 需邀請碼或管理員指派

### 班級 / 邀請
- 新表 `classrooms`（teacher_id, name, school_name, invite_code）
- 新表 `classroom_members`（classroom_id, student_id, joined_at）
- 學生輸入邀請碼加入

### 教師後台路由
- `/_authenticated/teacher`（用 has_role 守門，非教師導回首頁）
- 班級列表 / 新增班級 / 班級詳情 / 學生詳情
- 蒐集匯出：整班 CSV、單人 PDF

---

## 不做的事（明確排除）

- **金流／體驗預約付費**：等真正有第一間學校付錢再做 Stripe/綠界
- **AI 對話額度與 Freemium 鎖**：先讓功能完整、收集真實使用數據再決定上限
- **AI 加值服務**（模擬面試、自傳助手）：Phase 3
- **企業／縣市方案**：商業談判，不是產品問題

---

## 技術細節（給工程脈絡）

### 資料庫遷移
所有新表都要 RLS：
- `exploration_events` / `quiz_results` / `call_sessions`：學生只能讀寫自己；教師可讀同班學生的（透過 `classroom_members` join + `has_role('teacher')`）。
- `user_roles`：用戶可讀自己的角色；只有 service_role 可寫。
- `classrooms`：teacher 可 CRUD 自己的；學生可讀自己加入的（透過 `classroom_members`）。
- `classroom_members`：學生用邀請碼加入（INSERT 政策驗證 invite_code）；teacher 可看自己班級的。

每張表都要附 `GRANT` 給 authenticated 角色。

### 既有程式碼影響
- `src/hooks/useXp.ts` — 改成讀 Supabase；保留 localStorage 作為未登入者的暫存。
- `src/routes/_app.call.tsx` — 通話開始／結束時寫 `call_sessions`。
- `src/components/ExploreQuiz.tsx` — 測驗完成寫 `quiz_results` + `exploration_events`。
- 新增 `src/lib/portfolio.functions.ts`、`src/lib/classroom.functions.ts`（server functions）。

### PDF
- 安裝 `@react-pdf/renderer`
- 元件 `src/components/portfolio/PortfolioDocument.tsx`
- 套用既有 design tokens（中文字型用 Noto Sans TC，需另載入）

### 教師邀請碼
- 8 碼大寫英數隨機碼
- 教師後台顯示可複製連結 `/join?code=ABC12345`

---

## 建議實作順序

1. 角色系統 + user_roles 表（基礎建設）
2. exploration_events / quiz_results / call_sessions 表 + 把現有事件寫進去
3. 學習歷程 PDF 匯出（學生立刻有感）
4. classrooms / 邀請碼 / 教師後台 Dashboard
5. 教師端 CSV / PDF 匯出

每一步都可獨立 ship，不會卡住下一步。

---

## 需要你確認的兩件事

1. **教師身份認證**：MVP 階段允許「任何人輸入特殊註冊碼成為教師」，還是先寫死由管理員手動指派？前者快、後者安全。建議 MVP 用「教師註冊碼」（一個共用密碼，登入後自助升級），上線後再換成審核制。
2. **PDF 中文字型**：可接受用 Google Fonts 的 Noto Sans TC（檔案約 2MB，第一次下載稍慢）嗎？還是要用更精簡的本地字型？
