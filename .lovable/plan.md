# 家長同意機制 + 通知收件夾

## 核心流程

**綁定**：學生在「家長綁定」頁按「產生邀請碼」→ 顯示 6 碼。家長 demo 登入後在家長後台輸入該碼即綁定成功，雙方收到一則通知。

**同意控管範圍**：只控管兩件具實體風險的事
- **職圖報名**（`_app.explore` 內 mission 報名）
- **教師預約 / 線下見面**（`_app.map.$mentorId`）

其他功能（探索測驗、Café 留言、AI 通話、地圖瀏覽、學習歷程）學生可自由使用，不需家長同意。

**未同意時**：學生點報名/預約 → 改為送出「待家長核可」請求，UI 顯示橘色徽章「待家長核可」。家長未核可前不會實際建立報名/預約紀錄。

**家長核可**：家長後台看到待處理卡片 → 同意 / 婉拒 + 可加備註 → 學生收到通知；同意則自動完成原始動作。

## 資料表（新增 migration）

三張表，全部 RLS + GRANT；`app_role` enum 新增 `parent`。

- **parent_links**：`parent_id`、`student_id`、`invite_code`、`status`(pending/active/revoked)
  - 學生產生時 `parent_id` 為 null，家長輸入碼後填入。
- **consent_requests**：`student_id`、`parent_id`、`kind`(`intern_mission`/`teacher_booking`)、`payload` jsonb、`status`(pending/approved/rejected)、`parent_note`、`decided_at`
- **notifications**：`user_id`、`type`、`title`、`body`、`link`、`read_at`

跨身分查詢（家長看孩子、學生看家長備註）一律走 server function + `supabaseAdmin`，handler 內先驗證綁定 `status='active'`，避免 RLS 遞迴。

## Server functions（`src/lib/parent.functions.ts`）

全部用 `requireSupabaseAuth`：

- `generateParentInvite()`、`bindParentByCode({ code })`、`unlinkParent({ linkId })`
- `listMyParents()`（學生）、`listMyChildren()`（家長）
- `submitConsentRequest({ kind, payload })`（學生送出，自動寫一則 notification 給家長）
- `listPendingConsents()`（家長）、`decideConsent({ id, decision, note })`
- `listNotifications()`、`markNotificationRead({ id })`、`countUnread()`

## 新增/修改頁面

新增：
- `src/routes/_app.parent.tsx`：家長後台 — 我的孩子、待處理請求、歷史紀錄
- `src/routes/_app.parent-link.tsx`：學生端 — 產生邀請碼、目前家長、解除綁定
- `src/routes/_app.inbox.tsx`：通知收件夾（兩種身分共用）

修改：
- `_app.explore.tsx`：mission 報名按鈕依綁定狀態切換為「報名 / 送出請求給家長 / 邀請家長綁定」
- `_app.map.$mentorId.tsx`：預約送出走 consent 流程
- `_app.tsx` 底部導覽：加入「鈴鐺」icon（含未讀紅點），家長身分則中央分頁切成「家長後台」
- `_app.index.tsx`：學生首頁加入「我的家長」卡片；家長首頁顯示孩子摘要

## Demo 快速登入調整

`src/routes/login.tsx` 現有 4 顆 quick login 保留，行為調整：

- **Demo 學生**：登入時若資料庫沒有 demo 邀請碼則建立一個，並預先送出一筆「待核可」職圖報名請求，方便展示。
- **Demo 家長**：登入時自動指派 `parent` role，並自動以 `active` 綁定 Demo 學生；首頁直接看到 1 則待處理請求 + 1 則新通知。
- 老師 / 工作者 維持現狀。

實作上在 `signInAsDemoAccount` 後追加一支 `ensureDemoParentSetup` server fn（用 `supabaseAdmin` 冪等建立關聯、角色、demo 請求）。

## 通知收件夾

- `_app.inbox.tsx` 列出 `notifications`，點擊 → `markNotificationRead` → 跳轉到 `link`
- 底部導覽鈴鐺用 `useUnreadCount` hook（30 秒 polling）顯示紅點
- 家長端核可動作、學生端送出/被核可動作都會寫 notification

## 技術備註（開發者向）

- migration 順序：CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY；新增 `parent` 至 `app_role` enum 用 `ALTER TYPE ... ADD VALUE`。
- RLS：parent_links 雙方各自可讀自己那邊；consent_requests / notifications 各自只看自己的 `user_id`。
- 邀請碼 8 碼大寫英數，產生時用 `supabaseAdmin` 確保唯一。
- 所有 UI 沿用現有 design tokens 與 shadcn 元件，通知用 `sonner` toast + 收件夾頁雙軌。
