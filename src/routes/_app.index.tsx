import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight, Sparkles, Coffee, MapPin, Phone, LogOut, FileText, GraduationCap, Users, Crown } from "lucide-react";
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

  // —— 綜合分析：12 年國教 18 學群配對 ——
  const groupScores: Record<string, number> = {
    "社會與心理學群": explorePct * 0.55 + callPct * 0.25,
    "教育學群": explorePct * 0.5 + cafePct * 0.25,
    "文史哲學群": explorePct * 0.45 + cafePct * 0.25,
    "大眾傳播學群": cafePct * 0.55 + callPct * 0.3,
    "管理學群": cafePct * 0.5 + mapPct * 0.3,
    "財經學群": cafePct * 0.45 + mapPct * 0.35,
    "資訊學群": mapPct * 0.55 + explorePct * 0.2,
    "工程學群": mapPct * 0.5 + explorePct * 0.25,
    "建築與設計學群": mapPct * 0.45 + explorePct * 0.3,
    "外語學群": callPct * 0.6 + cafePct * 0.2,
    "法政學群": callPct * 0.55 + cafePct * 0.25,
    "藝術學群": callPct * 0.45 + explorePct * 0.3,
    "醫藥衛生學群": explorePct * 0.4 + mapPct * 0.35,
    "生命科學學群": explorePct * 0.35 + mapPct * 0.35,
    "生物資源學群": mapPct * 0.4 + cafePct * 0.25,
    "地球與環境學群": mapPct * 0.4 + explorePct * 0.25,
    "數理化學群": mapPct * 0.45 + explorePct * 0.3,
    "遊憩與運動學群": callPct * 0.4 + cafePct * 0.3,
  };
  const topGroups = Object.entries(groupScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);



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

      {/* ============ 子視窗 1：職感進行室（儀表板 + 雷達 + 學群分析） ============ */}
      <ChamberCard title="職感進行室" icon={Beaker} delay={120}>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <RadarChart
            values={[explorePct, cafePct, mapPct, callPct]}
            labels={["自我覺察", "職業視野", "路徑規劃", "對話應對"]}
          />
          <div className="flex flex-col gap-1.5 text-[11px]">
            {stations.map((s) => (
              <Link
                key={s.key}
                to={s.to}
                className="press flex items-center justify-between gap-2 rounded-lg bg-white/55 px-2 py-1.5 backdrop-blur-sm transition hover:bg-white"
              >
                <span className="font-semibold text-foreground">{s.title}</span>
                <span className="tabular-nums font-bold text-primary-deep">{s.pct}%</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 綜合分析：適合的學群 */}
        <div className="mt-3 rounded-xl bg-white/55 p-3 backdrop-blur-sm">
          <p className="text-[11px] font-bold text-primary-deep">綜合分析 · 適合學群</p>
          {overall === 0 ? (
            <p className="mt-1 text-[12px] text-muted-foreground">
              開始體驗任一站點後，這裡會分析你適合 18 學群中的哪幾個方向。
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {topGroups.map(([name, score], i) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-deep text-[10px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12px] font-semibold text-foreground">{name}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-hero)] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round(score))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ChamberCard>

      {/* ============ 子視窗 2：職感未來室 ============ */}
      <ChamberCard title="職感未來室" icon={TestTube} delay={180}>
        <div className="space-y-2">
          <div className="rounded-xl bg-white/55 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-primary-deep">現在</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{nowTip}</p>
          </div>
          <div className="rounded-xl bg-white/55 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-primary-deep">下一步</p>
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
  title, icon: Icon, delay, children,
}: {
  title: string;
  icon: typeof FlaskConical;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative mt-5 overflow-hidden rounded-3xl border border-primary/30 bg-primary-soft p-4 shadow-[var(--shadow-card)] animate-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="relative mb-3 flex items-center gap-2.5 border-b border-dashed border-primary/20 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-sm">
          <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
        </div>
        <p className="text-[14px] font-bold leading-tight text-foreground">{title}</p>
      </header>

      <div className="relative">{children}</div>
    </section>
  );
}

// —— 雷達圖（純 SVG，4 軸） ——
function RadarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const n = values.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number) => {
    const a = angle(i);
    const rr = (Math.max(0, Math.min(100, v)) / 100) * r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as const;
  };
  const ringPoints = (p: number) =>
    Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(i, p);
      return `${x},${y}`;
    }).join(" ");
  const dataPoints = values.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[180px]">
      {[25, 50, 75, 100].map((p) => (
        <polygon
          key={p}
          fill="none"
          stroke="var(--color-primary-deep)"
          strokeOpacity="0.18"
          points={ringPoints(p)}
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--color-primary-deep)"
            strokeOpacity="0.15"
          />
        );
      })}
      <polygon
        points={dataPoints}
        fill="var(--color-primary)"
        fillOpacity="0.45"
        stroke="var(--color-primary-deep)"
        strokeWidth="1.5"
      />
      {values.map((_, i) => {
        const [x, y] = pt(i, 100);
        const lx = cx + (x - cx) * 1.22;
        const ly = cy + (y - cy) * 1.22;
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-foreground)"
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}


