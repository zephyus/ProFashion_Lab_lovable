## 從 Apple 角度的整體診斷

從目前畫面（/）與各子頁實際走過一遍，我把它當作一個產品做評審。先講結論：**內容很豐富，但視覺語言太「網頁感」，不夠「產品感」。** 它在「能做什麼」上塞了很多東西，但沒有回答「為什麼這個高中生／大學生今晚要打開它」。

### 目前最不 Apple 的五件事

1. **色彩過載又無層次。** 主色 Tiff 綠 + 每個卡片漸層（rose、indigo、amber、teal…），結果沒有任何一個東西「真的重要」。Apple 的做法：90% 中性灰白 + 10% 單一強調色。
2. **字體只有一種粗細在打天下。** `font-bold tracking-tight` 到處用，沒有 display／title／body／caption 的階層。SF Pro 之所以高級，是因為粗細與字距是被精算的。
3. **圓角與陰影通膨。** `rounded-3xl`、`shadow-float`、`backdrop-blur` 疊起來像膠囊糖罐。Apple 的圓角是「有理由的」——卡片 12–16px，按鈕 8–10px，全屏卡片才 20+。
4. **資訊密度沒有節奏。** 每張卡都塞 icon + tag + 標題 + 副標 + 描述 + 三個 highlight chip。視線無處休息。
5. **文案還在「介紹功能」。** 例如「MBTI × UCAN 雙引擎測驗」——這是工程師語言。Apple 文案會寫：**「8 個問題，看見你還沒看見的自己。」** （而且使用者上次已要求不要露出量表名稱，目前首頁仍寫 MBTI × UCAN，是個漏掉的回歸 bug。）

---

## 重新審視的設計原則（Apple HIG × 你的產品）

| 原則 | 翻譯到這個 app |
|---|---|
| **Clarity（清晰）** | 一個畫面只有一個主角。砍掉裝飾色塊與重複 chip。 |
| **Deference（讓位）** | UI 退到背景，內容（前輩故事、職業、結果）站到前景。 |
| **Depth（層次）** | 用字體大小 + 留白做層次，不用顏色與陰影硬撐。 |
| **以使用者為中心** | 每頁第一屏必須回答「我為什麼在這？」與「下一步做什麼？」 |

---

## 提議的新設計語言（共用 tokens）

**色彩 — 大幅收斂**
- 中性：純白底 + 4 階灰（label / secondary / tertiary / quaternary，仿 iOS Label 系統）
- 強調色：**只留 1 個** Tiff 綠（保留你的品牌），其他 rose/indigo/amber 全部退役為純灰底 + 一個小色點
- 深色模式：同步準備（Apple 標配）

**字體 — 引入階層**
- 顯示：`SF Pro Display` / Web fallback：`Inter Display` 或 `Noto Sans TC`（中文）+ `Inter` 數字
- 階層：Large Title 34/40、Title 1 28/34、Title 2 22/28、Body 17/22、Footnote 13/18、Caption 11/16
- 字重只用 **Regular / Medium / Semibold**，禁用 Bold-everywhere

**間距與圓角**
- 8pt grid（4 / 8 / 12 / 16 / 24 / 32 / 48）
- 圓角：按鈕 10、卡片 14、Sheet 20、全屏 28
- 陰影：幾乎不用；改用 `1px hairline border` + 微微 elevation

**動效**
- 全站統一 spring：`stiffness 380, damping 30`
- Push transition、Sheet 上滑、Haptic-style scale 0.97 active
- 禁用裝飾性 `animate-ping`、漸層流光

---

## 逐頁重構（按優先順序）

### 1. Lab 主頁 `/`（最重要的第一印象）
**現況：** 漸層大 banner + 4 張花花卡片 + chip 牆。
**改成：**
- 開場：**一行 Large Title「今天，想認識哪一個自己？」** + 一行 secondary 副標
- 4 個探索站改為 **2×2 純白卡片 + hairline border**，每張只有：icon（單色）/ 標題 / 一句話。Hover 出微 elevation。
- 移除「為什麼是實驗室」chip 區，改寫成頁尾一段 caption 文字
- 登入 pill 移到頂部右側的 nav bar 風格，不浮在卡片上

### 2. 發現小秘 me `/explore`
- 選單頁：兩款遊戲改為 **左右並列大卡 + 大字標題**（像 Apple Arcade 首頁）
- 測驗答題：題目字級拉到 Title 1，選項改為 **iOS-style segmented buttons**，移除 chevron 裝飾
- 結果頁：**仿 Activity Rings / Screen Time 報告**——大數據視覺先行，文字解釋在下方。把現在的 4 個卡片合併為一頁式 narrative
- **修掉首頁的 MBTI × UCAN 字樣**（之前要求過卻漏改）

### 3. 職業咖啡館 `/cafe`
- 改為 **News-app 排版**：大標 + 摘要 + 作者署名（職稱），無多餘色塊
- 收藏 / 按讚 icon 用 SF Symbols 風格線條版本

### 4. 職圖 `/map`
- 視覺地圖卡片化太重；改為 **iOS Health 的分類 grid + 詳細頁推入式 sheet**
- mentor 詳細頁加上 large hero photo + 引言（quote-first）

### 5. 未來來電 `/call`
- 撥打中畫面其實已經很像 iOS CallKit，**留下這個方向但收掉漸層**：改為深色 OLED 黑底 + 單色頭像 + 大字
- 列表頁也改為大標 + 副標、移除每張卡的漸層 header

### 6. 登入 `/login`
- 仿 Apple ID 風格：置中、極簡、只有 logo + 一行 tagline + Google 按鈕。背景純白。

### 7. 底部 Tab Bar
- 高度收薄、icon 改線條版、active 只用顏色變化（不要膠囊背景）、Lab 主頁那顆 ring 也拿掉——Apple Tab Bar 不會單獨「特別標示」一顆，靠的是排序與圖示

---

## 文案重寫（範例）

| 現在 | 改成 |
|---|---|
| ProFashion Lab 職感實驗室 — 主頁 | 你的職涯，從這裡開始 |
| MBTI × UCAN 雙引擎測驗 | 8 個問題，看見你還沒看見的自己 |
| 跨時空 × 沉浸式語音 | 打給未來，也打給過去 |
| 真實前輩的心裡話 | 那些他們在訪談裡不會說的事 |

---

## 實作分階段（建議分批做、每批可獨立驗收）

1. **Stage A — 設計系統地基**：更新 `src/styles.css`（色票收斂、字體階層、間距 token、移除多餘陰影），引入 Inter + SF fallback。
2. **Stage B — 主頁 + Tab Bar + 登入** 三個高曝光面。
3. **Stage C — 發現小秘 me**（含修掉 MBTI/UCAN 文案漏網）。
4. **Stage D — 咖啡館 + 職圖 + 未來來電**。
5. **Stage E — 動效統一 + 深色模式**。

---

## 我需要你確認兩件事再動工

1. **品牌色保留 Tiff 綠，還是想徹底中性化（黑白＋系統藍）？**
2. **要全套一次到位（Stage A→E）還是先做 Stage A+B 看感覺再決定？**

回答後我就照計畫進入 build。