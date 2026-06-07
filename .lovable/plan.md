# 修復登出 + 角色分流介面

## 為什麼登出不見了
新加的通知鈴鐺 `absolute right-3 top-3` 蓋住了首頁右上角的頭像 + LogOut icon。要把登出移到一個不會被遮蔽的地方，並順便重整三種角色的入口。

## 角色定義
- **學生（student）**：所有登入者預設角色。
- **家長（parent）**：在 `parent_links` 至少有一筆 `parent_id = me` 且 `status = active`。
- **老師（teacher）**：`user_roles` 含 `teacher`。

一個帳號可能同時是家長＋老師（例如老師本人有小孩）。在頭像選單裡提供「切換身分」。預設活躍身分優先序：teacher → parent → student（取使用者實際擁有的最高優先），存在 `localStorage.activeRole`。

## 共用 Shell（`src/routes/_app.tsx`）
右上角從「孤獨的鈴鐺」改為一條固定在 shell 內側的小工具列：

```
[ 🔔 通知 ] [ 👤 頭像 ▾ ]
```

- 鈴鐺：保留現有 `useUnreadCount` 紅點，連到 `/inbox`。
- 頭像下拉（新元件 `AppUserMenu`）：
  - 顯示名稱 + email
  - 目前身分標籤（學生／家長／老師）
  - 若使用者擁有多重身分：列出可切換的選項，點選後寫入 `localStorage.activeRole` 並 `router.invalidate()`
  - 「登出」按鈕：依 `tanstack-auth-guards` 的標準流程
    `queryClient.cancelQueries → clear → supabase.auth.signOut → navigate({to:"/login", replace:true})`
- 移除 `_app.index.tsx` header 裡那顆獨立的 LogOut icon（登出統一在頭像選單）。

底部 Tab 依活躍身分換內容：

| 身分 | 五格 Tab（左→右） |
| --- | --- |
| 學生 | 發現 / 咖啡 / Lab(首頁) / 職圖 / 通話 |
| 家長 | 咖啡 / 職圖 / Lab(家長首頁) / 收件夾 / 我的孩子 |
| 老師 | 咖啡 / 職圖 / Lab(教師首頁) / 收件夾 / 我的班級 |

## 首頁分流（`/` = `_app.index.tsx`）
依活躍身分渲染三個元件之一：

### StudentHome（現狀微調）
- 維持現有 4 大關卡 + XP + 學習歷程 + 「我的家長」（產生邀請碼）+ 加入班級。
- 移除原本內嵌的 LogOut。

### ParentHome（新）
- 標題：「孩子今天怎麼樣？」
- 卡片：
  1. 孩子列表（每個孩子顯示名字、近 7 天活動筆數、`待核可數`，點進 `/parent`）
  2. 待核可請求摘要（連 `/parent`）
  3. 最近通知（連 `/inbox`）
  4. **可瀏覽的學生內容**：職業咖啡館、職圖（樣式較小、副標寫「了解孩子在看什麼」），點進 `/cafe`、`/map`

### TeacherHome（新）
- 標題：「今天班上要做什麼？」
- 卡片：
  1. 我的班級列表（連 `/teacher`）
  2. 邀請碼快速複製（取第一個班級）
  3. 最近通知（連 `/inbox`）
  4. **可瀏覽的學生內容**：發現小秘 me、職業咖啡館、職圖（用「以學生視角預覽」副標），點進對應路徑

## 功能限制（家長不能用 測驗 + 通話）
在 `_app.explore.tsx` 與 `_app.call.tsx` 加角色守門：
- 若活躍身分 = parent：渲染一張說明卡（`ShieldAlert` icon + 「此功能僅供學生使用，建議用孩子帳號操作」+ 一顆「切回學生身分（若擁有）」或「回到家長首頁」），不渲染原內容。
- 老師可瀏覽（老師需要了解學生工具）。
- `/cafe`、`/map`、`/inbox`：所有身分都能進。

## 新檔案
- `src/hooks/useActiveRole.ts`：回傳 `{ roles, active, setActive, isStudent, isParent, isTeacher }`。內部組合 `useAuth` + `useRoles` + `useIsParent`，並讀寫 `localStorage.activeRole`。當儲存的 active 已不在 `roles` 內，自動降級。
- `src/components/AppUserMenu.tsx`：用既有 shadcn `DropdownMenu`。
- `src/components/home/StudentHome.tsx`、`ParentHome.tsx`、`TeacherHome.tsx`：拆分後的三個首頁；`_app.index.tsx` 只負責挑哪一個渲染。

## 需要改的既有檔
- `src/routes/_app.tsx`：右上工具列、Tab bar 改成依角色組裝、`AppUserMenu` 套入。
- `src/routes/_app.index.tsx`：移除 LogOut、依 `useActiveRole` 切換子元件。
- `src/routes/_app.explore.tsx`、`src/routes/_app.call.tsx`：家長角色守門。

## 不改動
- 資料庫 schema、`parent.functions.ts`、`/parent`、`/teacher`、`/inbox`、`/map/$mentorId` 既有商業邏輯。

## 驗收
1. 登入學生 demo → 右上看到 🔔 + 頭像；點頭像看到「登出」。
2. 切到家長身分 → 首頁變家長版；底部 Tab 沒有「發現」「通話」；點開 `/explore` 直接顯示限制卡。
3. 老師身分 → 首頁變教師版；可進 `/explore` 但有「以學生視角預覽」提示橫條。
4. 登出 → 立刻導去 `/login`，按上一頁不會回到受保護頁面。
