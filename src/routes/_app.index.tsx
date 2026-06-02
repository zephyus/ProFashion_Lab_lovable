import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gamepad2,
  Coffee,
  Map as MapIcon,
  Phone,
  ChevronRight,
  Zap,
  FlaskConical,
  Sparkles,
  LogIn,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab 職感實驗室 — 主頁" },
      {
        name: "description",
        content:
          "ProFashion Lab 職感實驗室：四大探索站 × 一個主實驗室，重新定義你對職涯的想像。",
      },
    ],
  }),
  component: HomePage,
});

const sections = [
  {
    key: "explore",
    title: "發現小秘 me",
    tagline: "MBTI × UCAN 雙引擎測驗",
    desc: "8 題互動測驗，融合人格特質與職能傾向，幫你找出最契合的職涯切面。",
    highlights: ["8 題情境式測驗", "MBTI × UCAN 雙引擎", "個人化職業建議"],
    icon: Gamepad2,
    color: "bg-[image:var(--gradient-hero)] text-primary-foreground",
    to: "/explore",
  },
  {
    key: "cafe",
    title: "職業咖啡館",
    tagline: "真實前輩的心裡話",
    desc: "像在咖啡館聽故事一樣，閱讀各行各業前輩的職場觀察、留言互動、按讚收藏。",
    highlights: ["多領域前輩專欄", "留言 × 按讚互動", "收藏你喜歡的故事"],
    icon: Coffee,
    color: "bg-accent text-accent-foreground",
    to: "/cafe",
  },
  {
    key: "map",
    title: "職圖",
    tagline: "從學科到職位一目了然",
    desc: "用視覺化地圖串接「學科 → 能力 → 職位」，點選即可深入每位職涯導師的世界。",
    highlights: ["視覺化職涯地圖", "分類快速篩選", "導師深度檔案"],
    icon: MapIcon,
    color: "bg-secondary text-secondary-foreground",
    to: "/map",
  },
  {
    key: "call",
    title: "您撥的號碼是未來",
    tagline: "跨時空 × 沉浸式語音",
    desc: "與賈伯斯、達文西、AI 倫理偵探對話；體驗職場廣播劇、虛擬實習生 RPG 挑戰。",
    highlights: ["跨時空名人對談", "5 分鐘職場廣播劇", "虛擬實習生 RPG"],
    icon: Phone,
    color: "bg-destructive text-destructive-foreground",
    to: "/call",
  },
] as const;

function HomePage() {
  return (
    <div className="px-5 pt-8">
      {/* Lab brand banner — clearly the main hub */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest opacity-90">
          <FlaskConical className="h-3.5 w-3.5" /> Main Lab · 主實驗室
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">ProFashion Lab</h1>
        <h2 className="mt-1 text-lg font-semibold tracking-wide opacity-95">
          職感實驗室
        </h2>
        <p className="mt-3 text-sm leading-relaxed opacity-90">
          這裡是你的職涯總部。從這個主頁出發，走進四個截然不同的探索站——測驗、傾聽、地圖、通話，
          讓職涯不再只是科系與職缺，而是一場可以親身實驗的旅程。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            <Sparkles className="mr-1 inline h-3 w-3" /> 遊戲化探索
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            真實前輩故事
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            跨時空語音
          </span>
        </div>
      </div>

      {/* Stations intro */}
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-base font-bold">四大探索站</h3>
        <span className="text-[11px] text-muted-foreground">點擊進入體驗</span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        每一站都有獨特的玩法。Lab 主頁是你的起點，隨時點下方
        <FlaskConical className="mx-1 inline h-3 w-3" />
        回到這裡。
      </p>

      <div className="space-y-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.key} to={s.to} className="block w-full">
              <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)] active:scale-[0.98]">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate text-sm font-bold">{s.title}</h4>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-primary-deep">
                      {s.tagline}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 pl-[60px]">
                  {s.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* What makes Lab special */}
      <div className="mt-6 rounded-3xl border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-primary-deep">
          <Zap className="h-3.5 w-3.5" /> 為什麼是「實驗室」？
        </div>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <li>· 不給你標準答案，而是給你試錯的安全空間</li>
          <li>· 結合測驗、敘事、地圖、語音四種探索語言</li>
          <li>· 看見傳統職涯規劃看不見的少數職業與未來工種</li>
        </ul>
      </div>

      <div className="mt-6 pb-6 text-center">
        <p className="text-[11px] text-muted-foreground">
          ProFashion Lab 職感實驗室 · 讓每一次探索都充滿可能
        </p>
      </div>
    </div>
  );
}
