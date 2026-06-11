import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  ArrowRight,
  Sparkles,
  Coffee,
  MapPin,
  Phone,
  LogOut,
  FileText,
  GraduationCap,
  Users,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { useRoles } from "@/hooks/useRoles";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab — 四種方式探索職涯" },
      {
        name: "description",
        content:
          "四個入口，讓你慢慢搞懂自己以後想做什麼：發現小秘me、職業咖啡館、職圖、您撥的號碼是未來。",
      },
    ],
  }),
  component: HomePage,
});

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

  const stations = [
    {
      key: "explore",
      icon: Sparkles,
      title: "發現小秘 me",
      to: "/explore",
      description: "幾題小測驗，看看自己是哪種人。",
      hint: "先從這開始",
      accent: "from-teal-500/25 via-teal-500/10 to-transparent",
      iconClass: "bg-teal-500/10 text-teal-700",
    },
    {
      key: "cafe",
      icon: Coffee,
      title: "職業咖啡館",
      to: "/cafe",
      description: "聽不同職業的人聊他們的日常。",
      hint: "進去逛逛",
      accent: "from-sky-500/25 via-sky-500/10 to-transparent",
      iconClass: "bg-sky-500/10 text-sky-700",
    },
    {
      key: "map",
      icon: MapPin,
      title: "職圖",
      to: "/map",
      description: "看學群跟職業怎麼接，下一步可以走哪。",
      hint: "排排看",
      accent: "from-neutral-900/15 via-neutral-900/5 to-transparent",
      iconClass: "bg-neutral-900/5 text-neutral-700",
    },
    {
      key: "call",
      icon: Phone,
      title: "您撥的號碼是未來",
      to: "/call",
      description: "撥個電話，跟不同行業的人聊一下。",
      hint: "聽聽看",
      accent: "from-emerald-500/25 via-emerald-500/10 to-transparent",
      iconClass: "bg-emerald-500/10 text-emerald-700",
    },
  ] as const;

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f2f2f7] px-5 pb-8 text-neutral-900 animate-page"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
        backgroundImage:
          "radial-gradient(circle at top, rgba(255, 255, 255, 0.98), rgba(242, 242, 247, 1) 42%, rgba(233, 241, 239, 1) 100%)",
      }}
    >
      <div className="pointer-events-none absolute -top-24 right-[-72px] h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-56 left-[-96px] h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 right-[-56px] h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Top bar */}
      <header className="relative flex items-center justify-between pt-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            ProFashion Lab
          </span>
          <span className="text-[11px] font-medium text-neutral-500">職感實驗室</span>
        </div>
        {loading ? (
          <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-9 w-9 rounded-full border border-black/5 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white text-[12px] font-semibold text-neutral-900">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={handleLogout}
              aria-label="登出"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.85} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-black/5 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            登入
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-8 pb-5 animate-rise">
        <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/35 to-transparent" />
          <div className="absolute -right-8 top-0 h-28 w-28 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-500">
            Career Compass
          </p>
          <h1 className="mt-3 text-[34px] font-semibold leading-[1.08] tracking-tight text-neutral-900">
            今天，
            <br />
            想認識哪一個自己？
          </h1>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-neutral-600">
            四個入口，挑一個有興趣的進去逛逛就好。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/explore"
              className="press inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-black/10 transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              來玩玩看
            </Link>
            <span className="inline-flex items-center rounded-full border border-black/5 bg-white px-4 py-2.5 text-[13px] font-medium text-neutral-600 shadow-sm">
              不用全部做完
            </span>
          </div>
        </div>
      </section>

      {/* Level Card */}
      <Link
        to="/explore"
        className="press mb-6 block rounded-[28px] border border-white/80 bg-white/75 p-5 text-neutral-900 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <Trophy className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">目前等級</p>
              <p className="mt-1 text-[20px] font-semibold leading-tight text-neutral-900">
                {tierName}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
                {completed > 0 ? `已經開了 ${completed} 站` : "隨便挑一站開始，會自動幫你記。"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">XP</p>
            <p className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-neutral-900 tabular-nums">
              {xp}
            </p>
          </div>
        </div>
      </Link>

      {/* Station Guide */}
      <section
        className="relative mb-6 rounded-[32px] border border-white/80 bg-white/75 p-4 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.3)] backdrop-blur-xl animate-rise"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Station Guide
            </p>
            <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-neutral-900">
              四個入口
            </h3>
          </div>
          <p className="max-w-[11rem] text-right text-[12px] leading-relaxed text-neutral-500">
            分開玩可以，連著玩也行。
          </p>
        </div>

        <div className="space-y-3">
          {stations.map((s, index) => (
            <Link
              key={s.key}
              to={s.to}
              style={{ animationDelay: `${120 + index * 40}ms` }}
              className="press group relative block overflow-hidden rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-0.5 animate-rise"
            >
              <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${s.accent}`} />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-neutral-900/5 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${s.iconClass}`}
                >
                  <s.icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold leading-tight tracking-tight text-neutral-900">
                    {s.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
                    {s.description}
                  </p>
                </div>
              </div>
              <div className="relative mt-4 flex items-center justify-between">
                <span className="text-[12px] font-medium text-neutral-500">{s.hint}</span>
                <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 訂閱狀態（已登入且已訂閱） */}
      {user && sub.isSubscribed && (
        <div className="mb-4 animate-rise" style={{ animationDelay: "220ms" }}>
          <div className="rounded-[22px] border border-teal-600/20 bg-teal-50 p-4 text-neutral-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-teal-600" />
                <p className="text-[14px] font-semibold">PRO 訂閱中</p>
              </div>
              <button
                onClick={() => {
                  sub.unsubscribe();
                  toast.success("已取消訂閱（demo）");
                }}
                className="rounded-full border border-black/5 bg-white px-3 py-1 text-[11px] font-bold text-neutral-700"
              >
                取消
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-600">
              AI 無限 ・ 職圖剩 {sub.bookingsRemaining}/{sub.bookingsLimit}
            </p>
          </div>
        </div>
      )}

      {/* 已登入：學習歷程 + 教師入口 + 加入班級 */}
      {user && (
        <div className="space-y-2.5 animate-rise" style={{ animationDelay: "240ms" }}>
          <Link
            to="/portfolio"
            className="press flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-neutral-900">學習歷程</p>
                <p className="text-[11px] text-neutral-500">可以匯出成 PDF</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>

          <Link
            to={isTeacher ? "/teacher" : "/teacher-signup"}
            className="press flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-neutral-900">
                  {isTeacher ? "教師後台" : "我是老師"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {isTeacher ? "管理班級" : "輸入註冊碼"}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>

          <Link
            to="/join"
            className="press flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Users className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-neutral-900">加入班級</p>
                <p className="text-[11px] text-neutral-500">輸入邀請碼</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
        </div>
      )}

      {!user && !loading && (
        <div className="mt-6 animate-rise" style={{ animationDelay: "260ms" }}>
          <Link
            to="/login"
            className="press flex items-center justify-between rounded-2xl bg-teal-600 px-5 py-4 text-white shadow-lg shadow-teal-600/20"
          >
            <p className="text-[14px] font-bold">登入把紀錄存起來</p>
            <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
}
