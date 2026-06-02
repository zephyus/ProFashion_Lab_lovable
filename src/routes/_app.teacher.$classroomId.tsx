import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Copy, Download, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getClassroomStudents } from "@/lib/classroom.functions";

export const Route = createFileRoute("/_app/teacher/$classroomId")({
  head: () => ({ meta: [{ title: "班級詳情 — ProFashion Lab" }] }),
  component: ClassroomDetail,
});

type Data = Awaited<ReturnType<typeof getClassroomStudents>>;

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ClassroomDetail() {
  const { classroomId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const fetchData = useServerFn(getClassroomStudents);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData({ data: { classroomId } })
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "載入失敗"))
      .finally(() => setLoading(false));
  }, [user, authLoading, classroomId, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="px-5 py-10 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!user || !data) {
    return <div className="px-5 py-8 text-foreground">無資料。</div>;
  }

  const { classroom, students } = data;
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${classroom.invite_code}` : "";

  const copyCode = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("已複製邀請連結");
  };

  const exportCsv = () => {
    const headers = ["顯示名稱", "Email", "加入日期", "最後活動", "XP", "事件數", "通話數", "測驗數", "職感類型"];
    const rows = students.map((s) => [
      s.profile?.display_name ?? "",
      s.profile?.email ?? "",
      s.joined_at,
      s.stats.lastActive ?? "",
      String(s.stats.xp),
      String(s.stats.events),
      String(s.stats.calls),
      String(s.stats.quizzes),
      s.stats.archetype ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${classroom.name}_學員探索紀錄.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-5 animate-page">
      <Link to="/teacher" className="press mt-3 flex items-center gap-1.5 text-footnote text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 教師後台
      </Link>

      <header className="mt-5">
        <p className="text-caption uppercase tracking-widest text-primary-deep">班級</p>
        <h1 className="mt-1 text-large-title text-foreground">{classroom.name}</h1>
        {classroom.school_name ? (
          <p className="mt-1 text-footnote text-muted-foreground">{classroom.school_name}</p>
        ) : null}
      </header>

      {/* 邀請碼卡 */}
      <section className="mt-5 rounded-2xl bg-[image:var(--gradient-hero)] p-4 text-primary-foreground">
        <p className="text-caption opacity-80">邀請碼</p>
        <p className="mt-1 font-mono text-title-1 tracking-[0.3em]">{classroom.invite_code}</p>
        <button
          onClick={copyCode}
          className="press mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-footnote font-medium backdrop-blur"
        >
          <Copy className="h-3.5 w-3.5" /> 複製加入連結
        </button>
      </section>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-callout font-semibold text-foreground">
          學員 <span className="tabular-nums">{students.length}</span>
        </p>
        {students.length > 0 && (
          <button
            onClick={exportCsv}
            className="press flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-footnote font-semibold text-primary-foreground"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        )}
      </div>

      <div className="mt-3">
        {students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-3 text-callout text-foreground">還沒有學生加入</p>
            <p className="mt-1 text-footnote text-muted-foreground">把上面的邀請連結傳給學生即可</p>
          </div>
        ) : (
          <div className="list-group">
            {students.map((s) => (
              <div key={s.student_id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-callout font-medium text-foreground">
                      {s.profile?.display_name ?? s.profile?.email ?? "學員"}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {s.stats.archetype ?? "尚未測驗"} · 最後活動 {fmtDate(s.stats.lastActive)}
                    </p>
                  </div>
                  <p className="shrink-0 text-callout font-semibold tabular-nums text-primary-deep">
                    {s.stats.xp} XP
                  </p>
                </div>
                <div className="mt-2 flex gap-4 text-caption text-muted-foreground">
                  <span>事件 {s.stats.events}</span>
                  <span>通話 {s.stats.calls}</span>
                  <span>測驗 {s.stats.quizzes}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-caption text-muted-foreground">
        為保護學生隱私，老師無法查看 AI 對話原文。
      </p>

      <div className="h-10" />
    </div>
  );
}
