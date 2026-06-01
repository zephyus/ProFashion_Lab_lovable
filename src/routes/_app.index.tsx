import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Coffee,
  Briefcase,
  Map,
  Phone,
  ChevronRight,
  Zap,
} from "lucide-react";
import ExploreQuiz from "../components/ExploreQuiz";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab 職感實驗室" },
      { name: "description", content: "探索職涯無限可能，ProFashion Lab 職感實驗室帶你發現最適合的職業方向。" },
    ],
  }),
  component: HomePage,
});

const sections = [
  {
    key: "explore",
    title: "發現小秘 me",
    desc: "結合 MBTI × UCAN，找到你的職涯方向",
    icon: Sparkles,
    color: "bg-[image:var(--gradient-hero)] text-primary-foreground",
    to: null as string | null,
  },
  {
    key: "cafe",
    title: "職業咖啡館",
    desc: "真實前輩的職場心得，點開來聊聊",
    icon: Coffee,
    color: "bg-accent text-accent-foreground",
    to: "/cafe",
  },
  {
    key: "match",
    title: "媒你不行",
    desc: "職場體驗 × 實習招募，一鍵報名",
    icon: Briefcase,
    color: "bg-primary-deep text-primary-foreground",
    to: "/match",
  },
  {
    key: "map",
    title: "職圖",
    desc: "從學科到職位，職涯地圖一覽無遺",
    icon: Map,
    color: "bg-secondary text-secondary-foreground",
    to: "/map",
  },
  {
    key: "call",
    title: "您撥的號碼是未來",
    desc: "撥通電話，聽見少數職業的真實聲音",
    icon: Phone,
    color: "bg-destructive text-destructive-foreground",
    to: "/call",
  },
];

function HomePage() {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return <ExploreQuiz onBack={() => setShowQuiz(false)} />;
  }

  return (
    <div className="px-5 pt-10">
      {/* Hero */}
      <div className="mb-8 rounded-3xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 text-xs font-medium opacity-80">
          <Zap className="h-3 w-3" /> 職涯探索平台
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">ProFashion Lab</h1>
        <h2 className="mt-1 text-xl font-semibold tracking-wide">職感實驗室</h2>
        <p className="mt-3 text-sm leading-relaxed opacity-90">
          在這裡，職涯不是單選題。透過遊戲化的探索、真實的前輩分享，以及少見職業的深度對話，我們陪你找到屬於自己的方向。
        </p>
      </div>

      {/* Section cards */}
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">五大探索站</h3>
      <div className="space-y-3">
        {sections.map((s) => {
          const Icon = s.icon;
          const isExplore = s.key === "explore";
          const CardWrapper = isExplore ? "button" : Link;
          const wrapperProps = isExplore
            ? { onClick: () => setShowQuiz(true), className: "block w-full text-left" }
            : { to: s.to!, className: "block w-full" };

          return (
            <CardWrapper key={s.key} {...wrapperProps}>
              <div className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)] active:scale-[0.98]">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold">{s.title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Footer branding */}
      <div className="mt-8 pb-6 text-center">
        <p className="text-[11px] text-muted-foreground">
          ProFashion Lab 職感實驗室 · 讓每一次探索都充滿可能
        </p>
      </div>
    </div>
  );
}
