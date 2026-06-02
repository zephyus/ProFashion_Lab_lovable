import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { claimTeacherRole } from "@/lib/classroom.functions";

export const Route = createFileRoute("/_app/teacher-signup")({
  head: () => ({ meta: [{ title: "成為老師 — ProFashion Lab" }] }),
  component: TeacherSignupPage,
});

function TeacherSignupPage() {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: rolesLoading } = useRoles();
  const claim = useServerFn(claimTeacherRole);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || rolesLoading) {
    return <div className="px-5 py-8 text-muted-foreground">載入中…</div>;
  }
  if (!user) {
    return (
      <div className="px-5 py-8">
        <p className="text-foreground">請先登入後再來這頁。</p>
        <Link to="/login" className="mt-3 inline-block text-primary-deep underline">前往登入</Link>
      </div>
    );
  }
  if (isTeacher) {
    return (
      <div className="px-5 py-8 animate-page">
        <h1 className="text-large-title text-foreground">你已是老師</h1>
        <p className="mt-2 text-muted-foreground">前往教師後台管理班級。</p>
        <Link to="/teacher" className="press mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-callout font-semibold text-primary-foreground">
          前往教師後台
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      await claim({ data: { code: code.trim() } });
      toast.success("已升級為教師身分");
      navigate({ to: "/teacher" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "升級失敗");
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
          <GraduationCap className="h-6 w-6" strokeWidth={1.9} />
        </div>
        <h1 className="mt-4 text-large-title text-foreground">我是老師</h1>
        <p className="mt-2 text-body text-muted-foreground">
          輸入學校／推廣專員提供的教師註冊碼，升級為教師身分，即可建立班級、邀請學生加入、查看學習歷程。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="教師註冊碼"
          autoCapitalize="characters"
          className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-callout text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-callout font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "驗證中…" : "確認升級"}
        </button>
      </form>

      <p className="mt-6 text-caption text-muted-foreground">
        還沒有註冊碼？請聯絡 ProFashion Lab 推廣專員。MVP 階段預設碼為 <span className="font-mono">TEACHER2026</span>。
      </p>
    </div>
  );
}
