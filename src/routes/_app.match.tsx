import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/match")({
  head: () => ({ meta: [{ title: "媒你不行" }] }),
  component: MatchPage,
});

type Item = {
  id: number;
  type: "體驗" | "實習";
  title: string;
  company: string;
  location: string;
  date: string;
  spots: number;
  tags: string[];
};

const items: Item[] = [
  { id: 1, type: "體驗", title: "一日廣告創意總監", company: "奧美廣告", location: "台北信義", date: "6/15 (六)", spots: 8, tags: ["創意", "行銷"] },
  { id: 2, type: "實習", title: "暑期產品設計實習", company: "Pinkoi", location: "遠端", date: "7/1 - 8/31", spots: 3, tags: ["UI/UX", "新鮮人"] },
  { id: 3, type: "體驗", title: "走進烘焙房", company: "吳寶春麵包", location: "高雄", date: "6/22 (六)", spots: 12, tags: ["餐飲", "手作"] },
  { id: 4, type: "實習", title: "資料科學實習生", company: "iKala", location: "台北", date: "8月 - 12月", spots: 2, tags: ["AI", "Python"] },
  { id: 5, type: "體驗", title: "獸醫助理一日", company: "亞馬森動物醫院", location: "台中", date: "6/29 (六)", spots: 4, tags: ["醫療", "動物"] },
];

function MatchPage() {
  const [filter, setFilter] = useState<"全部" | "體驗" | "實習">("全部");
  const list = filter === "全部" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="px-5 pt-12">
      <header className="mb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-deep">
          <Sparkles className="h-3 w-3" /> 找到對的職涯第一步
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">媒你不行</h1>
        <p className="mt-1 text-sm text-muted-foreground">職場體驗 × 實習招募，一鍵報名。</p>
      </header>

      <div className="mb-4 flex gap-2">
        {(["全部", "體驗", "實習"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]" : "bg-card text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((it) => (
          <article key={it.id} className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${it.type === "實習" ? "bg-primary-deep text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                  {it.type}
                </span>
                <h3 className="mt-2 text-base font-bold leading-snug">{it.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{it.company}</p>
              </div>
              <button className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)] active:scale-95">
                報名
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{it.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{it.date}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />剩 {it.spots} 位</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {it.tags.map((t) => (
                <span key={t} className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-deep">#{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
