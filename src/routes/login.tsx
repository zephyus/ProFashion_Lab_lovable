import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Trophy, LogOut } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "登入 — 職感 Zhígǎn" },
      { name: "description", content: "登入後，紀錄會跟著你，不會因為換裝置消失。" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp, completed, tierName } = useXp();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("已登出");
  };

  const handleGoogle = async () => {
    setSigningIn(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google 登入失敗，請再試一次");
      setSigningIn(false);
      return;
    }
    if (result.redirected) return;
    toast.success("登入成功");
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6 animate-page">
      {/* Top bar */}
      <header className="flex h-12 items-center pt-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-subhead text-primary-deep transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.85} /> 返回
        </Link>
      </header>

      {/* Centered content */}
      <div className="flex flex-1 flex-col justify-center pb-20">
        {/* Mark */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-hero)] text-primary-foreground">
          <span className="text-title-2 font-semibold">職</span>
        </div>

        {user ? (
          <>
            <h1 className="mt-7 text-center text-title-1 text-foreground">
              嗨，{user.user_metadata?.full_name || user.email?.split("@")[0]}
            </h1>
            <p className="mx-auto mt-2 max-w-[280px] text-center text-subhead text-muted-foreground">
              你的職涯紀錄已同步。
            </p>

            <div className="mx-auto mt-8 w-full max-w-[320px] rounded-3xl bg-[image:var(--gradient-hero)] p-5 text-primary-foreground shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] opacity-90">
                    <Trophy className="h-3 w-3" /> 目前職等
                  </div>
                  <p className="mt-1 text-xl font-bold">{tierName}</p>
                  <p className="mt-1 text-[11px] opacity-80">已完成 {completed} 關</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-80">總經驗值</p>
                  <p className="text-3xl font-bold tabular-nums">{xp}</p>
                  <p className="text-[10px] opacity-80">XP</p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 flex w-full max-w-[320px] flex-col gap-2">
              <button
                onClick={() => navigate({ to: "/explore" })}
                className="press rounded-xl bg-primary px-4 py-3 text-callout font-semibold text-primary-foreground"
              >
                繼續挑戰 →
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-callout font-medium text-muted-foreground transition-colors hover:bg-muted/40 active:scale-[0.99]"
              >
                <LogOut className="h-4 w-4" /> 登出
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-7 text-center text-title-1 text-foreground">登入</h1>
            <p className="mx-auto mt-2 max-w-[280px] text-center text-subhead text-muted-foreground">
              紀錄會跟著你，不會因為換裝置消失。
            </p>

            <div className="mx-auto mt-10 w-full max-w-[320px]">
              <button
                onClick={handleGoogle}
                disabled={signingIn}
                className="press flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-callout font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
              >
                <GoogleIcon className="h-[18px] w-[18px]" />
                {signingIn ? "正在前往 Google…" : "使用 Google 繼續"}
              </button>
              {/* 訪客也可累積經驗值 */}
              <p className="mt-3 text-center text-caption">
                目前以訪客身份累積 {xp} XP（{tierName}）
                <br />
                登入後跨裝置保留紀錄。
              </p>
            </div>
          </>
        )}
      </div>


      <footer className="pb-8">
        <p className="text-center text-caption">
          登入即表示同意服務條款與隱私權政策
        </p>
      </footer>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}
