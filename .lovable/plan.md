
# 職圖頁面：Pathly 風格職涯探索

只動「職圖」相關檔案，不碰首頁、底部導航、配色、其他四個頁面。

## 範圍

修改/新增：
- `src/routes/_app.map.tsx`（重做，移除 Coming Soon）
- `src/routes/_app.map.$mentorId.tsx`（新增，職人詳情 + 報名流程）
- `src/lib/mentors.ts`（新增，mock data + TypeScript 型別）

不動：`_app.tsx`（導航）、`_app.index.tsx`、`_app.cafe.tsx`、`_app.match.tsx`、`_app.call.tsx`、`styles.css`、route tree（plugin 自動生成）。

## 資料結構（mentors.ts，方便日後接 Supabase）

```ts
type Category = "life" | "culture" | "craft" | "education" | "media";

type Mentor = {
  id: string;
  name: string;
  job: string;
  years: number;
  region: string;
  bio: string;          // 簡介
  category: Category;
  available: boolean;
  // 地圖座標（百分比，相對於地圖容器）
  mapX: number;
  mapY: number;
  // 詳情頁欄位
  dayInLife: string[];      // 一天工作長什麼樣
  realTalk: string;         // 最真實的一面
  fitTraits: string[];      // 適合的人格特質
  experience: string;       // 體驗活動內容
  // 可預約時段
  slots: { id: string; date: string; time: string }[];
};
```

提供約 8–10 位職人，分佈於 5 個分類。欄位命名（snake_case 友善）方便日後直接對應 Supabase table。

## 職圖主頁（`_app.map.tsx`）

由上而下：

1. **頁首**：標題「職圖」+ 一行說明「探索職人地圖，預約一場真實的職涯體驗」。
2. **分類篩選 chips**：全部 / 生活產業 / 文化創意 / 技術職人 / 教育陪伴 / 影像媒體，水平捲動，選中用 primary 色。
3. **地圖區**：
   - 用 CSS 漸層 + 柔和等高線（SVG）模擬 Pathly 的抽象地圖底，符合溫暖未來感。
   - 職人點以絕對定位 pin（`mapX`/`mapY` 百分比）顯示，圖示按分類用不同 lucide icon。
   - 點選 pin → 設定 `selectedId`，pin 放大發光，下方 carousel 同步捲到該卡片。
   - 篩選改變時，地圖只顯示符合分類的 pin。
4. **橫向卡片 carousel**（用既有 `components/ui/carousel`）：
   - 卡片內容：姓名、職業、年資、地區、簡介一行、可預約 badge。
   - Carousel 的 `setApi` 監聽 `select` 事件 → 反向更新 `selectedId`（地圖 pin 同步亮起）。
   - 點卡片 → `Link to="/map/$mentorId"`。

底部留 `pb-28`，確保不被底部導航擋住。

## 詳情頁（`_app.map.$mentorId.tsx`）

路徑 `/map/:mentorId`。用 `Route.useParams()` 取 id，從 mock 找對應 mentor。找不到顯示 notFound。

區塊：
- 返回鍵 + 大頭區（姓名、職業、年資、地區、可預約 badge）
- 職人介紹（bio）
- 一天工作長什麼樣（dayInLife 時間軸）
- 這份工作最真實的一面（realTalk，引言樣式）
- 適合的人格特質（fitTraits chips）
- 體驗活動內容（experience）
- 浮動「報名體驗」CTA → 開啟報名流程（同頁三步驟 state machine，不另開 route）

### 報名流程（in-page state：`idle → slot → form → done`）

1. **選擇時段**：列出 mentor.slots，單選。
2. **填寫資料**：姓名、聯絡方式（email 或手機），用 `components/ui/input` + `react-hook-form` 簡單驗證（必填）。
3. **報名成功**：顯示成功圖示 + 摘要（職人、時段、姓名）+ 「回到職圖」按鈕。完全前端 demo，不串 API。

## 驗收

- 不動 `_app.tsx` → 底部導航與其他頁面零影響。
- `_app.call.tsx` 完全不碰。
- 完成後檢查 console / network / build，確認無錯誤。

## 技術細節

- 詳情頁 route 檔名 `_app.map.$mentorId.tsx`，對應 `createFileRoute("/_app/map/$mentorId")`。
- Carousel ↔ 地圖同步：用 `useEffect` 雙向綁定，避免無限迴圈（用 ref 標記 source）。
- 全部使用 `bg-primary` / `text-foreground` 等 design tokens，不寫死顏色。
- 地圖底圖用純 SVG + CSS gradient，不引入第三方地圖庫。
