import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlaskConical, LogIn, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "登入 — ProFashion Lab 職感實驗室" },
      { name: "description", content: "登入 ProFashion Lab 職感實驗室，保留你的測驗結果與收藏。" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/", replace: true });
    }
  }, [user, loading, navigate]);

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5 pt-6">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回主頁
      </Link>

      <div className="mt-10 rounded-3xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest opacity-90">
          <FlaskConical className="h-3.5 w-3.5" /> Welcome to the Lab
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          登入 ProFashion Lab
        </h1>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          登入後可以保存你的職涯測驗結果、收藏前輩故事，並在多個裝置之間同步。
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleGoogle}
          disabled={signingIn}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-float)] active:scale-[0.98] disabled:opacity-60"
        >
          <GoogleIcon className="h-5 w-5" />
          {signingIn ? "正在前往 Google…" : "使用 Google 帳號登入"}
        </button>

        <div className="rounded-2xl border border-dashed border-border p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <LogIn className="h-3.5 w-3.5" /> 為什麼要登入？
          </div>
          <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>· 保留「發現小秘 me」測驗的歷次結果</li>
            <li>· 收藏喜歡的職業咖啡館前輩</li>
            <li>· 跨裝置同步你的探索歷程</li>
          </ul>
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] leading-relaxed text-muted-foreground">
        登入即表示同意我們的服務條款與隱私權政策。
      </p>
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
