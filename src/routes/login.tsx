import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/hooks/useXp";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, LogOut } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "登入 — ProFashion Lab" },
      { name: "description", content: "登入後，你的探索會一直跟著你。" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { xp, completed, tierName } = useXp();
  const [signingIn, setSigningIn] = useState(false);

  // 已登入：不自動跳轉，改成顯示個人帳號 + 經驗值面板
  useEffect(() => {
    /* 留空：登入後讓使用者主動返回 */
  }, [user, loading, navigate]);

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6">
      {/* Top bar */}
      <header className="flex h-12 items-center pt-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-subhead text-primary-deep transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.7} /> 返回
        </Link>
      </header>

      {/* Centered content */}
      <div className="flex flex-1 flex-col justify-center pb-20">
        {/* Mark */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-hero)] text-primary-foreground">
          <span className="text-title-2 font-semibold">P</span>
        </div>

        <h1 className="mt-7 text-center text-title-1 text-foreground">登入 ProFashion Lab</h1>
        <p className="mx-auto mt-2 max-w-[280px] text-center text-subhead text-muted-foreground">
          保留你的測驗結果與收藏，跨裝置同步你的探索。
        </p>

        <div className="mx-auto mt-10 w-full max-w-[320px]">
          <button
            onClick={handleGoogle}
            disabled={signingIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-callout font-medium text-foreground transition-colors hover:bg-muted/40 active:scale-[0.99] disabled:opacity-60"
          >
            <GoogleIcon className="h-[18px] w-[18px]" />
            {signingIn ? "正在前往 Google…" : "使用 Google 登入"}
          </button>
        </div>
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
