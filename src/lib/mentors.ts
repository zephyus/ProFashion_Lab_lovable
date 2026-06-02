export type MentorCategory = "life" | "culture" | "craft" | "education" | "media";

export const CATEGORY_META: Record<MentorCategory, { label: string; tone: string }> = {
  life: { label: "生活產業", tone: "oklch(0.85 0.09 60)" },
  culture: { label: "文化創意", tone: "oklch(0.78 0.11 320)" },
  craft: { label: "技術職人", tone: "oklch(0.72 0.085 190)" },
  education: { label: "教育陪伴", tone: "oklch(0.82 0.1 140)" },
  media: { label: "影像媒體", tone: "oklch(0.7 0.12 30)" },
};

export type MentorSlot = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm-HH:mm
};

export type Mentor = {
  id: string;
  name: string;
  job: string;
  years: number;
  region: string;
  bio: string;
  category: MentorCategory;
  available: boolean;
  // Position on the abstract map, 0-100 (%).
  mapX: number;
  mapY: number;
  dayInLife: string[];
  realTalk: string;
  fitTraits: string[];
  experience: string;
  slots: MentorSlot[];
};

export const MENTORS: Mentor[] = [
  {
    id: "amber-barista",
    name: "Amber",
    job: "獨立咖啡館主理人",
    years: 6,
    region: "台北・大稻埕",
    bio: "從金融業轉身做咖啡，相信一杯飲品也能說一個生活的提案。",
    category: "life",
    available: true,
    mapX: 22,
    mapY: 28,
    dayInLife: [
      "07:00 進店烘豆、整理吧台",
      "10:00 開門營業、與熟客聊天",
      "14:00 試新配方、紀錄風味曲線",
      "19:00 盤點原物料、寫隔日營運筆記",
    ],
    realTalk: "浪漫只佔三成，其餘是體力、現金流和持續被挑剔的味覺訓練。",
    fitTraits: ["細膩感官", "願意服務人", "能承受重複勞動"],
    experience: "一日吧台手體驗：跟著沖煮三款手沖、學一張風味輪、收銀實戰。",
    slots: [
      { id: "amber-1", date: "2026-06-14", time: "10:00-13:00" },
      { id: "amber-2", date: "2026-06-21", time: "14:00-17:00" },
      { id: "amber-3", date: "2026-06-28", time: "10:00-13:00" },
    ],
  },
  {
    id: "shun-florist",
    name: "舜哥",
    job: "花藝設計師",
    years: 9,
    region: "台中・西區",
    bio: "做過婚禮、空間、葬儀的花，相信花是替人說話的語言。",
    category: "life",
    available: false,
    mapX: 55,
    mapY: 18,
    dayInLife: [
      "05:30 花市挑貨",
      "09:00 整理、預水養",
      "13:00 進場佈置或工作室製作",
      "21:00 與客戶討論下週案件",
    ],
    realTalk: "凌晨採購、過敏、手指割傷是日常，但完成佈置那一刻無可取代。",
    fitTraits: ["美感敏銳", "體力佳", "細節控"],
    experience: "半日花藝工作坊：認識當季花材、製作一束自選風格花束。",
    slots: [
      { id: "shun-1", date: "2026-07-05", time: "13:00-16:00" },
    ],
  },
  {
    id: "lin-curator",
    name: "林策展",
    job: "獨立策展人",
    years: 7,
    region: "台南・中西區",
    bio: "把老屋、舊器物與當代敘事接起來，讓觀眾走進故事而不是看說明牌。",
    category: "culture",
    available: true,
    mapX: 35,
    mapY: 62,
    dayInLife: [
      "上午 撰寫展覽論述、聯繫藝術家",
      "下午 場勘、與木工/燈光溝通",
      "晚上 預算試算、寫補助計畫書",
    ],
    realTalk: "九成時間在做行政與募資，真正策展只在最後兩週爆發。",
    fitTraits: ["熱愛閱讀", "擅長協作", "對美與議題敏感"],
    experience: "策展助理一日：跟著場勘、看一份完整策展提案結構。",
    slots: [
      { id: "lin-1", date: "2026-06-18", time: "10:00-16:00" },
      { id: "lin-2", date: "2026-07-02", time: "10:00-16:00" },
    ],
  },
  {
    id: "yuki-illustrator",
    name: "Yuki",
    job: "繪本作者",
    years: 5,
    region: "新北・三峽",
    bio: "用水彩說一些大人看了會安靜下來的故事。",
    category: "culture",
    available: true,
    mapX: 70,
    mapY: 48,
    dayInLife: [
      "09:00 散步觀察、收集素材",
      "11:00 草圖與分鏡",
      "15:00 上色、修改",
      "20:00 回信、處理版權與授權",
    ],
    realTalk: "靈感不會準時來，但截稿會。要學會在沒有狀態時也能畫。",
    fitTraits: ["善於獨處", "願意長期練習", "敏感而不脆弱"],
    experience: "半日繪本工作坊：從一句話發想到完成一張對開插畫。",
    slots: [
      { id: "yuki-1", date: "2026-06-22", time: "13:00-17:00" },
      { id: "yuki-2", date: "2026-07-06", time: "13:00-17:00" },
    ],
  },
  {
    id: "wei-leather",
    name: "緯哥",
    job: "皮革職人",
    years: 12,
    region: "高雄・鹽埕",
    bio: "從學徒做到開店，用一把裁刀慢慢磨出自己的版型語言。",
    category: "craft",
    available: true,
    mapX: 18,
    mapY: 74,
    dayInLife: [
      "上午 裁切、打版",
      "下午 縫線、磨邊",
      "傍晚 接待客製諮詢",
    ],
    realTalk: "前三年幾乎沒賺到錢，手會痠、會受傷，要真的喜歡才撐得久。",
    fitTraits: ["有耐心", "喜歡實作", "願意長時間練同一件事"],
    experience: "一日皮件入門：縫製一只屬於自己的卡夾。",
    slots: [
      { id: "wei-1", date: "2026-06-15", time: "10:00-17:00" },
      { id: "wei-2", date: "2026-06-29", time: "10:00-17:00" },
    ],
  },
  {
    id: "ray-dev",
    name: "Ray",
    job: "全端工程師",
    years: 8,
    region: "台北・內湖",
    bio: "在新創與大公司來回過，最在意的是把抽象問題拆成可執行步驟。",
    category: "craft",
    available: true,
    mapX: 48,
    mapY: 38,
    dayInLife: [
      "10:00 站會、看 PR",
      "11:00 寫程式、修 bug",
      "15:00 設計新功能架構",
      "18:00 整理筆記、回 issue",
    ],
    realTalk: "技術只是入場券，能不能解釋與協作才決定走得遠不遠。",
    fitTraits: ["邏輯清楚", "願意自學", "能與人合作"],
    experience: "半日 Pair Programming：跟著做一個小功能從零到上線。",
    slots: [
      { id: "ray-1", date: "2026-06-17", time: "14:00-17:00" },
      { id: "ray-2", date: "2026-07-01", time: "14:00-17:00" },
    ],
  },
  {
    id: "ping-teacher",
    name: "萍姊",
    job: "實驗教育老師",
    years: 11,
    region: "宜蘭・冬山",
    bio: "陪一群不被體制定義的孩子，找到自己學習的節奏。",
    category: "education",
    available: true,
    mapX: 78,
    mapY: 22,
    dayInLife: [
      "08:30 晨會、檢視孩子昨日紀錄",
      "10:00 主題課",
      "14:00 一對一陪伴",
      "17:00 寫觀察筆記",
    ],
    realTalk: "情緒勞動非常重，要先照顧好自己，才照顧得了孩子。",
    fitTraits: ["願意傾聽", "彈性大", "對教育有信念"],
    experience: "一日跟班：跟著上一堂主題課、寫一份觀察紀錄。",
    slots: [
      { id: "ping-1", date: "2026-06-20", time: "08:30-16:00" },
    ],
  },
  {
    id: "kai-therapist",
    name: "凱諮商師",
    job: "青少年心理諮商師",
    years: 6,
    region: "桃園・中壢",
    bio: "陪青少年在自我與世界之間，找一條走得下去的路。",
    category: "education",
    available: false,
    mapX: 30,
    mapY: 45,
    dayInLife: [
      "上午 個案會談",
      "中午 紀錄與督導",
      "下午 團體諮商",
      "晚上 自我整理與閱讀",
    ],
    realTalk: "你無法救任何人，只能陪他長出自己的力量，這需要練習放手。",
    fitTraits: ["穩定", "好奇人", "願意持續自我覺察"],
    experience: "半日見習：旁聽團體活動、與諮商師對談一小時。",
    slots: [
      { id: "kai-1", date: "2026-07-10", time: "13:00-17:00" },
    ],
  },
  {
    id: "mia-director",
    name: "Mia",
    job: "紀錄片導演",
    years: 10,
    region: "台北・公館",
    bio: "用鏡頭蹲點被忽略的人，相信故事可以讓世界慢一拍。",
    category: "media",
    available: true,
    mapX: 60,
    mapY: 75,
    dayInLife: [
      "上午 田野訪談",
      "下午 拍攝或剪接",
      "晚上 寫提案、申請補助",
    ],
    realTalk: "一部片可能花三年，收入不穩，但你會交到一輩子的人。",
    fitTraits: ["長期主義", "善於傾聽", "不怕孤獨"],
    experience: "半日剪接工作坊：用一段素材剪出三分鐘短片。",
    slots: [
      { id: "mia-1", date: "2026-06-25", time: "14:00-18:00" },
      { id: "mia-2", date: "2026-07-09", time: "14:00-18:00" },
    ],
  },
  {
    id: "joe-podcaster",
    name: "Joe",
    job: "Podcast 製作人",
    years: 4,
    region: "台中・北區",
    bio: "幫品牌與創作者把聲音變成可以被認真聽完的內容。",
    category: "media",
    available: true,
    mapX: 42,
    mapY: 15,
    dayInLife: [
      "上午 訪綱與來賓功課",
      "下午 錄音",
      "晚上 後製與發稿",
    ],
    realTalk: "聲音比影像更不會說謊，前期準備決定一切。",
    fitTraits: ["好奇心強", "願意做功課", "聲音敏感"],
    experience: "半日錄音間體驗：訪綱發想、錄一段五分鐘節目。",
    slots: [
      { id: "joe-1", date: "2026-06-19", time: "14:00-17:00" },
      { id: "joe-2", date: "2026-07-03", time: "14:00-17:00" },
    ],
  },
];

export function getMentor(id: string): Mentor | undefined {
  return MENTORS.find((m) => m.id === id);
}
