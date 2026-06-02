import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Users, Loader2, ChevronRight, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { createClassroom, getMyClassrooms } from "@/lib/classroom.functions";

export const Route = createFileRoute("/_app/teacher")({
  head: () => ({ meta: [{ title: "教師後台 — ProFashion Lab" }] }),
  component: TeacherDashboard,
});

type Classroom = {
  id: string;
  name: string;
  school_name: string | null;
  invite_code: string;
  created_at: string;
};

function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: rolesLoading } = useRoles();
  const fetchList = useServerFn(getMyClassrooms);
  const create = useServerFn(createClassroom);

  const [list, setList] = useState<Classroom[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = () => {
    setListLoading(true);
    fetchList()
      .then((d) => setList(d.owned as Classroom[]))
      .catch((e) => toast.error(e instanceof Error ? e.message : "載入失敗"))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    if (authLoading || rolesLoading) return;
    if (!user || !isTeacher) {
      setListLoading(false);
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isTeacher, rolesLoading]);

  if (authLoading || rolesLoading) return <div className="px-5 py-8 text-muted-foreground">載入中…</div>;
  if (!user) {
    return (
      <div className="px-5 py-8">
        <p className="text-foreground">請先登入。</p>
        <Link to="/login" className="mt-3 inline-block text-primary-deep underline">前往登入</Link>
      </div>
    );
  }
  if (!isTeacher) {
    return (
      <div className="px-5 animate-page">
        <Link to="/" className="press mt-3 flex items-center gap-1.5 text-footnote text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <header className="mt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-large-title text-foreground">教師後台</h1>
          <p className="mt-2 text-body text-muted-foreground">這個區域只開放給已升級為教師的帳號使用。</p>
        </header>
        <Link to="/teacher-signup" className="press mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-callout font-semibold text-primary-foreground">
          升級為教師
        </Link>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await create({ data: { name: name.trim(), school_name: school.trim() || undefined } });
      toast.success("班級已建立");
      setName(""); setSchool(""); setShowForm(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "建立失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 animate-page">
      <Link to="/" className="press mt-3 flex items-center gap-1.5 text-footnote text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>
      <header className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-caption uppercase tracking-widest text-primary-deep">教師後台</p>
          <h1 className="mt-1 text-large-title text-foreground">我的班級</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="press flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-footnote font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> 新班級
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 space-y-2.5 rounded-2xl border border-border bg-card p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="班級名稱，例如 三年甲班"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-callout focus:border-primary focus:outline-none"
          />
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="學校（可空）"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-callout focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-callout font-semibold text-primary-foreground disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            建立
          </button>
        </form>
      )}

      <div className="mt-5">
        {listLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-3 text-callout text-foreground">還沒有班級</p>
            <p className="mt-1 text-footnote text-muted-foreground">點右上「新班級」開始</p>
          </div>
        ) : (
          <div className="list-group">
            {list.map((c) => (
              <Link
                key={c.id}
                to="/teacher/$classroomId"
                params={{ classroomId: c.id }}
                className="press flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-callout font-medium text-foreground">{c.name}</p>
                  <p className="text-caption text-muted-foreground">
                    {c.school_name ? `${c.school_name} · ` : ""}邀請碼 <span className="font-mono tracking-wider">{c.invite_code}</span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="h-10" />
    </div>
  );
}
