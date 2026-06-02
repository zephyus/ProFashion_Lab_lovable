export type DramaChoice = { label: string; next: number };
export type DramaNode = { speaker: string; line: string; choices?: DramaChoice[]; ending?: string };
export type DramaScene = {
  id: string;
  title: string;
  tag: string;
  color: string;
  intro: string;
  nodes: DramaNode[];
};

export const dramaScenes: DramaScene[] = [
  {
    id: "er", title: "急診室 03:47", tag: "醫療現場", color: "from-red-500 to-rose-700",
    intro: "心臟外科住院醫師值班的最後一小時",
    nodes: [
      { speaker: "護理師", line: "醫師！32 床血壓掉到 70，他剛從車禍送進來。" },
      { speaker: "主治（電話）", line: "我十分鐘後到。你先做決定。" },
      { speaker: "你", line: "（選擇）",
        choices: [{ label: "立刻開胸探查", next: 3 }, { label: "先做 CT 確認出血點", next: 4 }] },
      { speaker: "結果", line: "你劃下第一刀。心包填塞解除，血壓回穩。主治趕到時握了你的手。", ending: "🏆 結局：你救了他。三年後他寄來婚禮喜帖。" },
      { speaker: "結果", line: "CT 顯示主動脈剝離，但你錯失黃金 4 分鐘。患者在手術台上離開。", ending: "💔 結局：規範正確，結果遺憾。你學到——有時 SOP 救不了人。" },
    ],
  },
  {
    id: "ma", title: "東京 · 併購談判", tag: "跨國商戰", color: "from-indigo-500 to-blue-700",
    intro: "你是 28 歲投行 VP，桌上 12 億美元",
    nodes: [
      { speaker: "對方 CEO", line: "我們要求估值再提 15%，否則今晚簽不下去。" },
      { speaker: "你方 MD（耳機）", line: "底線是 8%。看你怎麼接。" },
      { speaker: "你", line: "（選擇）",
        choices: [{ label: "接受 15%，搶下交易", next: 3 }, { label: "強硬走人，逼對方讓步", next: 4 }] },
      { speaker: "結果", line: "案子成交，但兩年後標的減值 40%。你升 MD，也背了內部處分。", ending: "🏆 結局：贏了短期，輸了長期。交易圈會記住你的名字——好壞參半。" },
      { speaker: "結果", line: "你起身要走，對方追到電梯口接受 7%。簽約那晚你喝到斷片。", ending: "🏆 結局：你成為今年最年輕的 MD。但對方再也不接你電話。" },
    ],
  },
];
