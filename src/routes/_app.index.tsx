import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  ArrowRight,
  Coffee,
  MapPin,
  Phone,
  Sparkles,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "職感 Zhígǎn — 在還沒選擇之前，先認識自己" },
      {
        name: "description",
        content: "四個方向，把模糊的『未來』變成具體的下一步。",
      },
    ],
  }),
  component: HomePage,
});

// 三張個人化「下一步」卡——刻意與 Tab 不同：Tab 是導航，這裡是建議
const nextMoves = [
  {
    key: "intern",
    icon: Sparkles,
    title: "再挑戰一關",
    desc: "30 秒一題，把職場決策當成肌肉訓練。",
    to: "/explore",
  },
  {
    key: "story",
    icon: Coffee,
    title: "聽一則新故事",
    desc: "前輩在訪談裡不會說的那一段。",
    to: "/cafe",
  },
  {
    key: "mentor",
    icon: MapPin,
    title: "找一位職人",
    desc: "把職業從名詞，變成一個你認識的人。",
    to: "/map",
  },
  {
    key: "call",
    icon: Phone,
    title: "預演一場對話",
    desc: "五分鐘廣播劇，先把未來走一遍。",
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
      {/* Top nav bar — brand on left, account on right */}
      <header className="flex h-12 items-center justify-between pt-3">
        <span className="text-footnote font-semibold tracking-wide text-foreground/80">
          職感<span className="ml-1 text-muted-foreground">Zhígǎn</span>
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
              <LogOut className="h-4 w-4" strokeWidth={1.85} />
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

      {user ? (
        // —————————— 登入後：狀態儀表板 ——————————
        <LoggedInDashboard
          displayName={displayName}
          xp={xp}
          completed={completed}
          tierName={tierName}
        />
      ) : (
        // —————————— 未登入：品牌敘事 ——————————
        <SignedOutHero xp={xp} completed={completed} tierName={tierName} />
      )}

      {/* Quiet footer */}
      <footer className="mt-12 pb-8">
        <p className="text-caption">
          職感 Zhígǎn · 不給標準答案，給你試錯的空間。
        </p>
      </footer>
    </div>
  );
}

function LoggedInDashboard({
  displayName,
  xp,
  completed,
  tierName,
}: {
  displayName: string;
  xp: number;
  completed: number;
  tierName: string;
}) {
  const hasProgress = completed > 0;

  return (
    <>
      {/* 招呼 — 像 Apple Health：先說現況，不喊口號 */}
      <section className="pt-8 pb-2 animate-rise">
        <p className="text-footnote text-muted-foreground">
          {greetingByHour()}
        </p>
        <h1 className="mt-1 text-large-title text-foreground">
          嗨，{displayName}。
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          {hasProgress
            ? `你已經走了 ${completed} 關，目前是${tierName}。`
            : "還沒開始也沒關係，今天可以從一道題開始。"}
        </p>
      </section>

      {/* XP 主卡 */}
      <Link
        to="/explore"
        className="press mt-5 flex items-stretch justify-between gap-4 rounded-3xl bg-[image:var(--gradient-hero)] p-5 text-primary-foreground shadow-[var(--shadow-card)] animate-rise"
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
              {hasProgress ? `已完成 ${completed} 關` : "尚未開始"}
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

      {/* 段落標題 */}
      <h2 className="mt-9 mb-3 text-title-3 text-foreground animate-rise"
        style={{ animationDelay: "120ms" }}>
        今天可以做點什麼
      </h2>

      {/* 個人化下一步 — 1 主 + 3 次 */}
      <ul className="list-group animate-rise" style={{ animationDelay: "160ms" }}>
        {nextMoves.map((m) => {
          const Icon = m.icon;
          return (
            <li key={m.key}>
              <Link
                to={m.to}
                className="press flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-subhead font-semibold text-foreground">{m.title}</p>
                  <p className="text-footnote leading-snug">{m.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.85} />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SignedOutHero({
  xp,
  completed,
  tierName,
}: {
  xp: number;
  completed: number;
  tierName: string;
}) {
  return (
    <>
      <section className="pt-10 pb-8 animate-rise">
        <p className="text-footnote font-semibold uppercase tracking-widest text-primary-deep">
          職感 · Zhígǎn
        </p>
        <h1 className="mt-2 text-large-title text-foreground">
          在還沒選擇之前，
          <br />
          先認識自己。
        </h1>
        <p className="mt-4 text-body text-muted-foreground">
          四個方向，把模糊的「未來」變成具體的下一步。
        </p>
      </section>

      {/* 主 CTA */}
      <Link
        to="/explore"
        className="press mt-2 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-[var(--shadow-card)] animate-rise"
        style={{ animationDelay: "80ms" }}
      >
        <div>
          <p className="text-subhead font-semibold">從一道題開始</p>
          <p className="mt-0.5 text-[11px] opacity-85">約 3 分鐘 · 不需要先想答案</p>
        </div>
        <ArrowRight className="h-5 w-5" strokeWidth={2} />
      </Link>

      {/* 訪客狀態小提示 */}
      {(xp > 0 || completed > 0) && (
        <p className="mt-3 text-caption animate-rise" style={{ animationDelay: "140ms" }}>
          目前以訪客身份累積 {xp} XP（{tierName}）·{" "}
          <Link to="/login" className="font-semibold text-primary-deep underline-offset-2 hover:underline">
            登入後同步保留
          </Link>
        </p>
      )}

      {/* Manifesto — 為什麼需要這個 */}
      <section className="mt-12 space-y-3 animate-rise" style={{ animationDelay: "200ms" }}>
        <h2 className="text-title-3 text-foreground">為什麼需要這個</h2>
        <div className="list-group">
          <Row n="01" t="把感覺變成資料" d="不再靠『我覺得』選工作，而是靠你自己留下的軌跡。" />
          <Row n="02" t="把職業變成一個人" d="不是讀職業描述，而是聽真正在做的人說。" />
          <Row n="03" t="把焦慮變成準備" d="關鍵時刻先在故事裡走一遍，到了現場才不慌。" />
        </div>
      </section>
    </>
  );
}

function Row({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3.5">
      <span className="mt-0.5 w-7 shrink-0 text-[11px] font-semibold tabular-nums text-primary-deep">
        {n}
      </span>
      <div className="min-w-0">
        <p className="text-subhead font-semibold text-foreground">{t}</p>
        <p className="mt-0.5 text-footnote leading-snug">{d}</p>
      </div>
    </div>
  );
}

function greetingByHour() {
  if (typeof window === "undefined") return "今天";
  const h = new Date().getHours();
  if (h < 5) return "深夜了";
  if (h < 11) return "早安";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  if (h < 22) return "晚上好";
  return "夜深了";
}
