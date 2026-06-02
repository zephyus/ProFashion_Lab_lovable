import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight, Sparkles, Coffee, MapPin, Phone, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab — 四種方式探索職涯" },
      { name: "description", content: "發現小秘me、職業咖啡館、職圖、您撥的號碼是未來——四種方式，把模糊的未來變成具體的下一步。" },
    ],
  }),
  component: HomePage,
});

const stations = [
  {
    key: "explore",
    icon: Sparkles,
    title: "發現小秘 me",
    desc: "認識你自己。",
    to: "/explore",
  },
  {
    key: "cafe",
    icon: Coffee,
    title: "職業咖啡館",
    desc: "聽前輩怎麼說。",
    to: "/cafe",
  },
  {
    key: "map",
    icon: MapPin,
    title: "職圖",
    desc: "看見你的路徑。",
    to: "/map",
  },
  {
    key: "call",
    icon: Phone,
    title: "您撥的號碼是未來",
    desc: "預演關鍵時刻。",
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
    <div className="px-5 animate-page">
      {/* Top bar */}
      <header className="flex h-12 items-center justify-between pt-3">
        <span className="text-footnote font-semibold tracking-wide text-foreground/80">
          ProFashion <span className="text-muted-foreground">Lab</span>
        </span>
        {loading ? (
          <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover" />
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
              <LogOut className="h-4 w-4" strokeWidth={1.85} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-subhead font-semibold text-primary-deep transition-opacity hover:opacity-70">
            登入
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="pt-8 pb-6 animate-rise">
        <p className="text-footnote font-semibold uppercase tracking-widest text-primary-deep">
          ProFashion · Lab
        </p>
        <h1 className="mt-2 text-large-title text-foreground">
          四種方式，
          <br />
          探索你的職涯。
        </h1>
        <p className="mt-4 text-body text-muted-foreground">
          把模糊的「未來」變成具體的下一步。
        </p>
      </section>

      {/* XP card */}
      <Link
        to="/explore"
        className="press flex items-stretch justify-between gap-4 rounded-3xl bg-[image:var(--gradient-hero)] p-5 text-primary-foreground shadow-[var(--shadow-card)] animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest opacity-90">
            <Trophy className="h-3 w-3" strokeWidth={2} />
            職涯帳號
          </div>
          <div>
            <p className="text-title-2 font-semibold">{tierName}</p>
            <p className="mt-0.5 text-footnote text-primary-foreground/80">
              {completed > 0 ? `已完成 ${completed} 關` : "尚未開始"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between text-right">
          <p className="text-[10px] uppercase tracking-widest opacity-80">總經驗值</p>
          <div>
            <p className="text-large-title font-bold leading-none tabular-nums">{xp}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest opacity-80">XP</p>
          </div>
        </div>
      </Link>

      {/* 四大區域 — 2×2 grid */}
      <h2 className="mt-9 mb-3 text-title-3 text-foreground animate-rise" style={{ animationDelay: "120ms" }}>
        四大區域
      </h2>
      <div className="grid grid-cols-2 gap-3 animate-rise" style={{ animationDelay: "160ms" }}>
        {stations.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="press flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-muted/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-subhead font-semibold text-foreground">{s.title}</p>
                <p className="mt-1 text-footnote leading-snug">{s.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Guest CTA */}
      {!user && !loading && (
        <Link
          to="/login"
          className="press mt-6 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-[var(--shadow-card)] animate-rise"
          style={{ animationDelay: "220ms" }}
        >
          <div>
            <p className="text-subhead font-semibold">登入以保留你的軌跡</p>
            <p className="mt-0.5 text-[11px] opacity-85">同步 XP、實習進度與收藏</p>
          </div>
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Link>
      )}

      <footer className="mt-12 pb-8">
        <p className="text-caption">ProFashion Lab · 不給你標準答案，給你試錯的空間。</p>
      </footer>
    </div>
  );
}
