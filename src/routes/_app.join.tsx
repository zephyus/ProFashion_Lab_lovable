import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { joinClassroom } from "@/lib/classroom.functions";

export const Route = createFileRoute("/_app/join")({
  head: () => ({ meta: [{ title: "加入班級 — ProFashion Lab" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ code: typeof s.code === "string" ? s.code : "" }),
  component: JoinPage,
});

function JoinPage() {
  const { user, loading } = useAuth();
  const search = Route.useSearch();
  const join = useServerFn(joinClassroom);
  const navigate = useNavigate();
  const [code, setCode] = useState(search.code ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (search.code) setCode(search.code.toUpperCase());
  }, [search.code]);

  if (loading) return <div className="px-5 py-8 text-muted-foreground">載入中…</div>;
  if (!user) {
    return (
      <div className="px-5 py-8">
        <p className="text-foreground">請先登入後再加入班級。</p>
        <Link to="/login" className="mt-3 inline-block text-primary-deep underline">前往登入</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const { classroom } = await join({ data: { code: code.trim() } });
      toast.success(`已加入「${classroom.name}」`);
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加入失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 animate-page">
      <Link to="/" className="press mt-3 flex items-center gap-1.5 text-footnote text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>
      <header className="mt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
          <Users className="h-6 w-6" strokeWidth={1.9} />
        </div>
        <h1 className="mt-4 text-large-title text-foreground">加入班級</h1>
        <p className="mt-2 text-body text-muted-foreground">輸入老師給的 8 碼邀請碼，加入後老師就能看到你的探索進度。</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="邀請碼，例如 ABC12345"
          maxLength={20}
          className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-center font-mono text-title-3 tracking-[0.3em] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-callout font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "加入中…" : "加入班級"}
        </button>
      </form>
    </div>
  );
}
