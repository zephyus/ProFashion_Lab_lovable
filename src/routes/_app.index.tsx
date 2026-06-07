import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowRight, Sparkles, Coffee, MapPin, Phone, LogOut, FileText, GraduationCap, Users, Crown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { useRoles } from "@/hooks/useRoles";
import { useSubscription, FREE_AI_CALL_LIMIT, SUB_BOOKING_LIMIT } from "@/hooks/useSubscription";
import { useActivity, STATION_LABEL, type Station } from "@/hooks/useActivity";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab — 四種方式探索職涯" },
      { name: "description", content: "發現小秘me、職業咖啡館、職圖、您撥的號碼是未來——四種方式，把模糊的未來變成具體的下一步。" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, loading } = useAuth();
  const { isTeacher } = useRoles();
  const { xp, completed, tierName } = useXp();
  const sub = useSubscription();
  const { activities, clear, countsByStation, total } = useActivity();

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

  // —— 各站進度（綜合活動次數 + 訂閱配額） ——
  const explorePct = Math.min(100, completed * 12 + (countsByStation.explore ?? 0) * 4);
  const cafePct = Math.min(100, (countsByStation.cafe ?? 0) * 10);
  const mapPct = sub.isSubscribed
    ? Math.min(100, Math.round((sub.bookingsUsed / SUB_BOOKING_LIMIT) * 100) + (countsByStation.map ?? 0) * 6)
    : Math.min(100, (countsByStation.map ?? 0) * 12);
  const callPct = sub.isSubscribed
    ? Math.min(100, (countsByStation.call ?? 0) * 10)
    : Math.min(100, Math.round((sub.aiCallsUsed / FREE_AI_CALL_LIMIT) * 100) + (countsByStation.call ?? 0) * 5);
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
      ? "尚未開始，挑一個站點試試。"
      : overall < 40
        ? `已啟動「${highest.title}」。`
        : overall < 80
          ? `「${highest.title}」進展良好。`
          : "四站均衡，可整理成果。";
  const nextTip =
    overall === 0
      ? "從「發現小秘 me」開始。"
      : lowest.pct < 40
        ? `補強「${lowest.title}」。`
        : sub.bookingsUsed === 0
          ? "到「職圖」預約職人。"
          : "匯出學習歷程。";

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
      className="min-h-screen bg-[#f2f2f7] px-5 pb-8 text-neutral-900 animate-page"
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
          <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-9 w-9 rounded-full border border-black/5 object-cover" />
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
      <section className="pt-8 pb-6 animate-rise">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-neutral-900">
          今天，
          <br />
          想認識哪一個自己？
        </h1>
      </section>

      {/* Level Card */}
      <Link
        to="/explore"
        className="press mb-6 flex items-center justify-between gap-4 rounded-[22px] bg-[#008080] px-5 py-4 text-white shadow-lg shadow-teal-900/15 animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2.5">
            <Trophy className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[17px] font-bold leading-tight">{tierName}</p>
            <p className="text-[11px] text-white/75">
              {completed > 0 ? `${completed} 關` : "未開始"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[26px] font-black leading-none tabular-nums">{xp}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/70">XP</p>
        </div>
      </Link>

      {/* Stations + Analysis */}
      <section
        className="mb-6 rounded-[28px] border border-black/5 bg-white p-4 shadow-sm animate-rise"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-5 grid grid-cols-2 gap-3">
          {stations.map((s) => (
            <Link
              key={s.key}
              to={s.to}
              className="press flex flex-col items-center justify-center rounded-2xl bg-[#f2f2f7] px-3 py-4 text-center transition-colors hover:bg-neutral-200"
            >
              <span className="mb-1 text-[13px] font-medium text-neutral-900">{s.title}</span>
              <span className="text-[11px] font-bold text-teal-600 tabular-nums">{s.pct}%</span>
            </Link>
          ))}
        </div>

        <div className="px-1">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-teal-600">
            適合學群
          </h3>
          {overall === 0 ? (
            <p className="text-[13px] leading-relaxed text-neutral-500">
              體驗任一站點後顯示。
            </p>
          ) : (
            <ul className="space-y-1.5">
              {topGroups.map(([name], i) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[13px] font-semibold text-neutral-900">{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Now / Next */}
      <section
        className="mb-6 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm animate-rise"
        style={{ animationDelay: "180ms" }}
      >
        <div className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-teal-600">現在</h3>
          <p className="text-[14px] leading-relaxed text-neutral-800">{nowTip}</p>
        </div>
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            下一步
          </h3>
          <p className="text-[14px] leading-relaxed text-neutral-700">{nextTip}</p>
        </div>
      </section>

      {/* 活動紀錄 */}
      <section
        className="mb-6 rounded-[28px] border border-black/5 bg-white p-5 shadow-sm animate-rise"
        style={{ animationDelay: "200ms" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-semibold tracking-wide text-teal-600">活動紀錄</h3>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              {total === 0 ? "尚無紀錄" : `共 ${total} 筆，登入與否皆儲存於此裝置`}
            </p>
          </div>
          {total > 0 && (
            <button
              onClick={() => { clear(); toast.success("已清空紀錄"); }}
              className="press inline-flex items-center gap-1 rounded-full border border-black/5 bg-[#f2f2f7] px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-200"
            >
              <Trash2 className="h-3 w-3" /> 清空
            </button>
          )}
        </div>

        {total === 0 ? (
          <p className="rounded-2xl bg-[#f2f2f7] px-4 py-6 text-center text-[13px] text-neutral-500">
            點開任一站點，就會自動記錄你的探索軌跡。
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {(["explore", "cafe", "map", "call"] as Station[]).map((s) => (
                <div key={s} className="rounded-xl bg-[#f2f2f7] px-2 py-2.5 text-center">
                  <p className="truncate text-[10px] text-neutral-500">{STATION_LABEL[s]}</p>
                  <p className="mt-0.5 text-[15px] font-bold tabular-nums text-neutral-900">
                    {countsByStation[s] ?? 0}
                  </p>
                </div>
              ))}
            </div>

            <ul className="max-h-[420px] divide-y divide-black/5 overflow-y-auto">
              {activities.slice(0, 30).map((a) => (
                <li key={a.id} className="flex gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    {a.station === "explore" ? <Sparkles className="h-4 w-4" /> :
                      a.station === "cafe" ? <Coffee className="h-4 w-4" /> :
                      a.station === "map" ? <MapPin className="h-4 w-4" /> :
                      a.station === "call" ? <Phone className="h-4 w-4" /> :
                      <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">
                        {STATION_LABEL[a.station]}
                      </p>
                      <time className="shrink-0 text-[10px] tabular-nums text-neutral-500">
                        {formatTs(a.ts)}
                      </time>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-neutral-600">
                      {a.detail ?? a.type}
                      {typeof a.xp === "number" && a.xp > 0 && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-teal-600/10 px-1.5 py-px text-[10px] font-bold text-teal-700">
                          +{a.xp} XP
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {activities.length > 30 && (
              <p className="mt-2 text-center text-[11px] text-neutral-400">
                顯示最近 30 筆 / 共 {activities.length} 筆
              </p>
            )}
          </>
        )}
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
                onClick={() => { sub.unsubscribe(); toast.success("已取消訂閱（demo）"); }}
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
                <p className="text-[11px] text-neutral-500">匯出 PDF</p>
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
                <p className="text-[14px] font-semibold text-neutral-900">{isTeacher ? "教師後台" : "我是老師"}</p>
                <p className="text-[11px] text-neutral-500">{isTeacher ? "管理班級" : "輸入註冊碼"}</p>
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
            <p className="text-[14px] font-bold">登入保留紀錄</p>
            <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
}

function formatTs(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const pad = (n: number) => String(n).padStart(2, "0");
  if (sameDay) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}





