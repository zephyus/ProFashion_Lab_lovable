import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight, Sparkles, Coffee, MapPin, Phone, LogOut, FileText, GraduationCap, Users, Crown, FlaskConical, Beaker, Atom, TestTube, Compass, BookOpen, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { useRoles } from "@/hooks/useRoles";
import { useSubscription, SUB_PRICE, FREE_AI_CALL_LIMIT, SUB_BOOKING_LIMIT } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab — 四種方式探索職涯" },
      { name: "description", content: "發現小秘me、職業咖啡館、職圖、您撥的號碼是未來——四種方式，把模糊的未來變成具體的下一步。" },
    ],
  }),
  component: HomePage,
});

// —— 訪問次數追蹤（demo） ——
function readVisits(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("pfl_visits_v1") || "{}"); } catch { return {}; }
}

function HomePage() {
  const { user, loading } = useAuth();
  const { isTeacher } = useRoles();
  const { xp, completed, tierName } = useXp();
  const sub = useSubscription();
  const [visits, setVisits] = useState<Record<string, number>>({});

  useEffect(() => {
    setVisits(readVisits());
    const on = () => setVisits(readVisits());
    window.addEventListener("storage", on);
    window.addEventListener("visits:update", on);
    return () => {
      window.removeEventListener("storage", on);
      window.removeEventListener("visits:update", on);
    };
  }, []);

  const displayName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    "";
  const avatarUrl = (user?.user_metadata as { avatar_url?: string } | undefined)?.avatar_url;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("登出失敗，請再試一次"); return; }
    toast.success("已登出");
  };

  // —— 各站進度（demo 推算） ——
  const explorePct = Math.min(100, completed * 12);
  const cafePct = Math.min(100, (visits.cafe ?? 0) * 25);
  const mapPct = Math.min(100, Math.round((sub.bookingsUsed / SUB_BOOKING_LIMIT) * 100));
  const callPct = sub.isSubscribed
    ? Math.min(100, ((visits.call ?? 0) * 20))
    : Math.min(100, Math.round((sub.aiCallsUsed / FREE_AI_CALL_LIMIT) * 100));
  const overall = Math.round((explorePct + cafePct + mapPct + callPct) / 4);

  const stations = [
    { key: "explore", icon: Sparkles, title: "發現小秘 me", to: "/explore", pct: explorePct },
    { key: "cafe", icon: Coffee, title: "職業咖啡館", to: "/cafe", pct: cafePct },
    { key: "map", icon: MapPin, title: "職圖", to: "/map", pct: mapPct },
    { key: "call", icon: Phone, title: "您撥的號碼是未來", to: "/call", pct: callPct },
  ] as const;

  // —— 未來室：根據進度動態給出「現在 / 下一步」 ——
  const lowest = [...stations].sort((a, b) => a.pct - b.pct)[0];
  const highest = [...stations].sort((a, b) => b.pct - a.pct)[0];
  const nowTip =
    overall === 0
      ? "還沒開始調配——挑一個有興趣的站點，先放第一滴試劑。"
      : overall < 40
        ? `已經啟動「${highest.title}」，再多累積幾次會看出方向。`
        : overall < 80
          ? `「${highest.title}」走得不錯，輪廓正在浮現。`
          : "四個站點都調得很均勻，可以開始整理你的成果。";
  const nextTip =
    overall === 0
      ? "建議從「發現小秘 me」開始：3 分鐘的小測驗。"
      : lowest.pct < 40
        ? `下一步：補強「${lowest.title}」，讓配方更平衡。`
        : sub.bookingsUsed === 0
          ? "下一步：到「職圖」預約一場真人職人體驗。"
          : "下一步：匯出學習歷程，把調配結果留下來。";


  return (
    <div className="px-5 animate-page">
      {/* Top bar */}
      <header className="flex h-12 items-center justify-between pt-3">
        <div className="flex flex-col">
          <span className="text-footnote font-semibold tracking-wide text-foreground/80">
            ProFashion <span className="text-muted-foreground">Lab</span>
          </span>
          <span className="text-[10px] tracking-widest text-muted-foreground">職感實驗室</span>
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
            <button onClick={handleLogout} aria-label="登出"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <LogOut className="h-4 w-4" strokeWidth={1.85} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-subhead font-semibold text-primary-deep transition-opacity hover:opacity-70">登入</Link>
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

      {/* XP card */}
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

      {/* ============ 子視窗 1：職感進行室 ============ */}
      <ChamberCard
        index="01"
        title="職感進行室"
        subtitle="Reaction Chamber"
        icon={Beaker}
        delay={120}
      >
        <ul className="space-y-2">
          {stations.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.key}>
                <Link
                  to={s.to}
                  className="press group relative flex items-center gap-3 overflow-hidden rounded-xl border border-primary/15 bg-card/70 px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
                    <Icon className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-foreground truncate">{s.title}</p>
                      <span className="font-mono text-[10px] font-bold tabular-nums text-primary-deep">{s.pct}%</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[image:var(--gradient-hero)] transition-all duration-500"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </ChamberCard>

      {/* ============ 子視窗 2：職感未來室 ============ */}
      <ChamberCard
        index="02"
        title="職感未來室"
        subtitle="Future Chamber"
        icon={TestTube}
        delay={180}
      >
        <div className="space-y-2">
          <div className="rounded-xl border border-primary/15 bg-card/70 p-3 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Now · 現在</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{nowTip}</p>
          </div>
          <div className="rounded-xl border border-primary/15 bg-card/70 p-3 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Next · 下一步</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{nextTip}</p>
          </div>
        </div>
      </ChamberCard>


      {/* 訂閱方案 */}
      <div className="mt-4 animate-rise" style={{ animationDelay: "220ms" }}>
        {sub.isSubscribed ? (
          <div className="rounded-2xl bg-[image:var(--gradient-hero)] p-4 text-primary-foreground shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <p className="text-subhead font-semibold">職感 PRO 訂閱中</p>
              </div>
              <button
                onClick={() => { sub.unsubscribe(); toast.success("已取消訂閱（demo）"); }}
                className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur">
                取消
              </button>
            </div>
            <p className="mt-1 text-[11px] opacity-85">
              AI 語音無限 ・ 職圖本月剩 {sub.bookingsRemaining} / {sub.bookingsLimit} 次免費
            </p>
          </div>
        ) : (
          <button
            onClick={() => { sub.subscribe(); toast.success(`已升級訂閱（demo）— NT$${SUB_PRICE}/月`); }}
            className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3.5 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Crown className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-foreground">升級 職感 PRO</p>
                <p className="text-caption text-muted-foreground">
                  AI 語音無限・職圖每月 5 次　NT${SUB_PRICE}/月
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-primary-deep" />
          </button>
        )}
      </div>

      {/* 已登入：學習歷程 + 教師入口 */}
      {user && (
        <div className="mt-4 space-y-2.5 animate-rise" style={{ animationDelay: "240ms" }}>
          <Link to="/portfolio" className="press flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30">
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

          <Link to={isTeacher ? "/teacher" : "/teacher-signup"}
            className="press flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-subhead font-semibold text-foreground">{isTeacher ? "教師後台" : "我是老師"}</p>
                <p className="text-caption text-muted-foreground">{isTeacher ? "管理班級、查看學員進度" : "輸入註冊碼升級為教師"}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link to="/join" className="press flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30">
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

      {!user && !loading && (
        <Link to="/login"
          className="press mt-6 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground animate-rise"
          style={{ animationDelay: "260ms" }}>
          <p className="text-subhead font-semibold">登入以保留你的軌跡</p>
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Link>
      )}

      <div className="h-12" />
    </div>
  );
}

// —— 化學實驗室風格子視窗外殼 ——
function ChamberCard({
  index, title, subtitle, icon: Icon, delay, children,
}: {
  index: string;
  title: string;
  subtitle: string;
  icon: typeof FlaskConical;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative mt-5 overflow-hidden rounded-3xl border border-primary/20 bg-card/70 p-4 shadow-[var(--shadow-card)] backdrop-blur-xl animate-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 玻璃反光光柱 */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-primary-deep/10 blur-3xl" aria-hidden />
      {/* 網格刻度 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden
      />

      <header className="relative mb-3 flex items-center justify-between border-b border-dashed border-primary/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-sm">
            <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight text-foreground">{title}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-primary-deep">No.{index}</span>
      </header>

      <div className="relative">{children}</div>
    </section>
  );
}
