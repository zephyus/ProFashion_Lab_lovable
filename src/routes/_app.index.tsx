import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight, Sparkles, Coffee, MapPin, Phone, LogOut, FileText, GraduationCap, Users, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { useRoles } from "@/hooks/useRoles";
import { useSubscription, SUB_PRICE } from "@/hooks/useSubscription";

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
  const { isTeacher } = useRoles();
  const { xp, completed, tierName } = useXp();
  const sub = useSubscription();
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
        <div className="flex flex-col">
          <span className="text-footnote font-semibold tracking-wide text-foreground/80">
            ProFashion <span className="text-muted-foreground">Lab</span>
          </span>
          <span className="text-[10px] tracking-widest text-muted-foreground">
            職感實驗室
          </span>
        </div>
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
      <section className="pt-10 pb-7 animate-rise">
        <h1 className="text-large-title text-foreground">
          今天，
          <br />
          想認識哪一個自己？
        </h1>
      </section>

      {/* XP card — slim */}
      <Link
        to="/explore"
        className="press flex items-center justify-between gap-4 rounded-2xl bg-[image:var(--gradient-hero)] px-5 py-4 text-primary-foreground shadow-[var(--shadow-card)] animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-center gap-2.5">
          <Trophy className="h-4 w-4" strokeWidth={2} />
          <div>
            <p className="text-subhead font-semibold leading-tight">{tierName}</p>
            <p className="text-[11px] opacity-80">
              {completed > 0 ? `已完成 ${completed} 關` : "尚未開始"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-title-2 font-bold leading-none tabular-nums">{xp}</p>
          <p className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">XP</p>
        </div>
      </Link>

      {/* 四大區域 — 2×2 grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 animate-rise" style={{ animationDelay: "120ms" }}>
        {stations.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="press flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
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

      {/* 已登入：學習歷程 + 教師入口 */}
      {user && (
        <div className="mt-4 space-y-2.5 animate-rise" style={{ animationDelay: "150ms" }}>
          <Link
            to="/portfolio"
            className="press flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-foreground">我的學習歷程</p>
                <p className="text-caption text-muted-foreground">匯出 108 課綱 PDF</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            to={isTeacher ? "/teacher" : "/teacher-signup"}
            className="press flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-foreground">
                  {isTeacher ? "教師後台" : "我是老師"}
                </p>
                <p className="text-caption text-muted-foreground">
                  {isTeacher ? "管理班級、查看學員進度" : "輸入註冊碼升級為教師"}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            to="/join"
            className="press flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Users className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-foreground">加入班級</p>
                <p className="text-caption text-muted-foreground">輸入老師給的邀請碼</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      )}

      {/* Guest CTA */}
      {!user && !loading && (
        <Link
          to="/login"
          className="press mt-6 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground animate-rise"
          style={{ animationDelay: "180ms" }}
        >
          <p className="text-subhead font-semibold">登入以保留你的軌跡</p>

          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Link>
      )}

      <div className="h-12" />
    </div>
  );
}
