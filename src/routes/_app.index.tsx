import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight, Sparkles, Coffee, MapPin, Phone, LogOut, FileText, GraduationCap, Users, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { useRoles } from "@/hooks/useRoles";
import { useSubscription, FREE_AI_CALL_LIMIT, SUB_BOOKING_LIMIT } from "@/hooks/useSubscription";
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
    <div
      className="-mx-0 min-h-screen bg-black px-5 pb-8 text-white animate-page"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif" }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between pt-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            ProFashion Lab
          </span>
          <span className="text-[11px] font-medium text-neutral-500">職感實驗室</span>
        </div>
        {loading ? (
          <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-800" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-9 w-9 rounded-full border border-white/10 object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-[12px] font-semibold text-white">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={handleLogout}
              aria-label="登出"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-neutral-400 transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.85} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-white/15 bg-neutral-900 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            登入
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="pt-8 pb-6 animate-rise">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
          今天，
          <br />
          想認識哪一個自己？
        </h1>
      </section>

      {/* Level Card */}
      <Link
        to="/explore"
        className="press mb-6 flex items-center justify-between gap-4 rounded-[22px] bg-[#008080] px-5 py-4 text-white shadow-lg shadow-teal-900/30 animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5">
            <Trophy className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[17px] font-bold leading-tight">{tierName}</p>
            <p className="text-[11px] text-white/70">
              {completed > 0 ? `已完成 ${completed} 關` : "尚未開始"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[26px] font-black leading-none tabular-nums">{xp}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/60">XP</p>
        </div>
      </Link>

      {/* Stations + Analysis */}
      <section
        className="mb-6 rounded-[28px] border border-white/10 bg-neutral-900/50 p-4 backdrop-blur-md animate-rise"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-5 grid grid-cols-2 gap-3">
          {stations.map((s) => (
            <Link
              key={s.key}
              to={s.to}
              className="press flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#1c1c1e] px-3 py-4 text-center transition-colors hover:bg-[#242426]"
            >
              <span className="mb-1 text-[13px] font-medium text-white">{s.title}</span>
              <span className="text-[11px] font-bold text-teal-500 tabular-nums">{s.pct}%</span>
            </Link>
          ))}
        </div>

        <div className="px-1">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-teal-500">
            綜合分析 · 適合學群
          </h3>
          {overall === 0 ? (
            <p className="text-[13px] leading-relaxed text-neutral-400">
              開始體驗任一站點後，這裡會分析你適合 18 學群中的哪幾個方向。
            </p>
          ) : (
            <ul className="space-y-1.5">
              {topGroups.map(([name], i) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-black">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[13px] font-semibold text-white">{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Now / Next */}
      <section
        className="mb-6 rounded-[28px] border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-md animate-rise"
        style={{ animationDelay: "180ms" }}
      >
        <div className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-teal-500">現在</h3>
          <p className="text-[13px] leading-relaxed text-neutral-200">{nowTip}</p>
        </div>
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            下一步
          </h3>
          <p className="text-[13px] leading-relaxed text-neutral-300">{nextTip}</p>
        </div>
      </section>

      {/* 訂閱狀態（已登入且已訂閱） */}
      {user && sub.isSubscribed && (
        <div className="mb-4 animate-rise" style={{ animationDelay: "220ms" }}>
          <div className="rounded-[22px] border border-teal-500/30 bg-teal-500/10 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-teal-400" />
                <p className="text-[14px] font-semibold">職感 PRO 訂閱中</p>
              </div>
              <button
                onClick={() => { sub.unsubscribe(); toast.success("已取消訂閱（demo）"); }}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur"
              >
                取消
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-300">
              AI 語音無限 ・ 職圖本月剩 {sub.bookingsRemaining} / {sub.bookingsLimit} 次免費
            </p>
          </div>
        </div>
      )}

      {/* 已登入：學習歷程 + 教師入口 + 加入班級 */}
      {user && (
        <div className="space-y-2.5 animate-rise" style={{ animationDelay: "240ms" }}>
          <Link
            to="/portfolio"
            className="press flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3.5 transition-colors hover:bg-neutral-800/70"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">我的學習歷程</p>
                <p className="text-[11px] text-neutral-500">匯出 108 課綱 PDF</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-500" />
          </Link>

          <Link
            to={isTeacher ? "/teacher" : "/teacher-signup"}
            className="press flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3.5 transition-colors hover:bg-neutral-800/70"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">{isTeacher ? "教師後台" : "我是老師"}</p>
                <p className="text-[11px] text-neutral-500">{isTeacher ? "管理班級、查看學員進度" : "輸入註冊碼升級為教師"}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-500" />
          </Link>

          <Link
            to="/join"
            className="press flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3.5 transition-colors hover:bg-neutral-800/70"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                <Users className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">加入班級</p>
                <p className="text-[11px] text-neutral-500">輸入老師給的邀請碼</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-500" />
          </Link>
        </div>
      )}

      {!user && !loading && (
        <div className="mt-6 animate-rise" style={{ animationDelay: "260ms" }}>
          <Link
            to="/login"
            className="press flex items-center justify-between rounded-2xl bg-teal-500 px-5 py-4 text-black shadow-lg shadow-teal-500/30"
          >
            <p className="text-[14px] font-bold">登入以保留你的軌跡</p>
            <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
}




