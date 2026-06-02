import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Coffee,
  Map as MapIcon,
  Phone,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab — 你的職涯，從這裡開始" },
      {
        name: "description",
        content:
          "四種方式，認識還沒被你看見的自己——測驗、傾聽、地圖、通話。",
      },
    ],
  }),
  component: HomePage,
});

const stations = [
  {
    key: "explore",
    title: "發現小秘 me",
    desc: "不知道自己適合什麼？從測驗到虛擬實習，用關卡累積真實經驗，逐步看見你的職涯輪廓。",
    icon: Compass,
    to: "/explore",
  },
  {
    key: "cafe",
    title: "職業咖啡館",
    desc: "選擇前，先看見真相。聽職場人親口說的日常，了解那些履歷表寫不出來的真實工作樣貌。",
    icon: Coffee,
    to: "/cafe",
  },
  {
    key: "map",
    title: "職圖",
    desc: "串連各職業與你之間的關聯，進行了解、媒合與實習。讓學科、能力與職位彼此對話，找到你的路徑。",
    icon: MapIcon,
    to: "/map",
  },
  {
    key: "call",
    title: "您撥的號碼是未來",
    desc: "與其想像職場，不如進入職場。透過廣播劇與角色通話，在故事裡預演決策，練習未來的每個關鍵時刻。",
    icon: Phone,
    to: "/call",
  },
] as const;

function HomePage() {
  const { user, loading } = useAuth();
  const { xp, completed, tierName } = useXp();
  const displayName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    "";
  const avatarUrl = (user?.user_metadata as { avatar_url?: string } | undefined)?.avatar_url;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("登出失敗，請再試一次");
      return;
    }
    toast.success("已登出");
  };

  return (
    <div className="px-5">
      {/* Top nav bar — Apple-style: brand on left, account on right */}
      <header className="flex h-12 items-center justify-between pt-3">
        <span className="text-footnote font-semibold tracking-wide text-muted-foreground">
          ProFashion Lab
        </span>
        {loading ? (
          <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary-deep sm:flex">
              <span className="opacity-70">{tierName}</span>
              <span className="tabular-nums">{xp} XP</span>
              {completed > 0 && <span className="opacity-60">· {completed} 關</span>}
            </div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={handleLogout}
              aria-label="登出"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-subhead font-semibold text-primary-deep transition-opacity hover:opacity-70"
          >
            登入
          </Link>
        )}
      </header>

      {/* 登入後的經驗值卡片（手機可見） */}
      {user && (
        <Link
          to="/explore"
          className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/30 sm:hidden"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              你的職涯帳號
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {tierName} · {xp} XP
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {completed > 0 ? `已完成 ${completed} 關` : "前往虛擬實習 →"}
          </p>
        </Link>
      )}

      {/* Hero — Large Title */}
      <section className="pt-8 pb-10 animate-rise">
        <h1 className="text-large-title text-foreground">
          今天，
          <br />
          想認識哪一個自己？
        </h1>
        <p className="mt-4 text-body text-muted-foreground">
          四種方式探索職涯。挑一個開始。
        </p>
      </section>

      {/* 2×2 stations */}
      <section className="grid grid-cols-2 gap-3">
        {stations.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="press group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 animate-rise"
              style={{ minHeight: 148, animationDelay: `${80 + i * 50}ms` }}
            >
              <Icon
                className="h-6 w-6 text-primary-deep"
                strokeWidth={1.6}
                aria-hidden
              />
              <div>
                <h3 className="text-title-3 text-foreground">{s.title}</h3>
                <p className="mt-1 text-footnote leading-snug">{s.desc}</p>
              </div>
            </Link>
          );
        })}
      </section>


      {/* Quiet footer */}
      <footer className="mt-10 pb-8">
        <p className="text-caption">
          ProFashion Lab · 不給你標準答案，給你試錯的空間。
        </p>
      </footer>
    </div>
  );
}
