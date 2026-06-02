import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Coffee,
  Map as MapIcon,
  Phone,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
    desc: "8 個問題，看見你還沒看見的自己。",
    icon: Compass,
    to: "/explore",
  },
  {
    key: "cafe",
    title: "職業咖啡館",
    desc: "那些他們在訪談裡不會說的事。",
    icon: Coffee,
    to: "/cafe",
  },
  {
    key: "map",
    title: "職圖",
    desc: "把學科、能力與職位連起來看。",
    icon: MapIcon,
    to: "/map",
  },
  {
    key: "call",
    title: "未來來電",
    desc: "打給未來，也打給過去。",
    icon: Phone,
    to: "/call",
  },
] as const;

function HomePage() {
  const { user, loading } = useAuth();
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

      {/* Hero — Large Title */}
      <section className="pt-8 pb-10">
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
        {stations.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.98]"
              style={{ minHeight: 148 }}
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

      {/* Single emphasis row — what's new / continue */}
      <Link
        to="/explore"
        className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
      >
        <div className="min-w-0 pr-3">
          <p className="text-caption uppercase tracking-wider text-primary-deep">
            新手建議
          </p>
          <p className="mt-1 text-subhead font-medium text-foreground">
            從一個 3 分鐘的小測驗開始
          </p>
        </div>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-muted-foreground"
          strokeWidth={1.6}
        />
      </Link>

      {/* Quiet footer */}
      <footer className="mt-10 pb-8">
        <p className="text-caption">
          ProFashion Lab · 不給你標準答案，給你試錯的空間。
        </p>
      </footer>
    </div>
  );
}
