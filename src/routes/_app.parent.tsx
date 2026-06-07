import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, ShieldX, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  listMyChildren,
  listPendingConsents,
  decideConsent,
  bindParentByCode,
} from "@/lib/parent.functions";

export const Route = createFileRoute("/_app/parent")({
  head: () => ({ meta: [{ title: "家長後台 — ProFashion Lab" }] }),
  component: ParentDashboard,
});

type Child = {
  link_id: string;
  student_id: string;
  profile: { display_name: string | null; email: string | null } | null;
};

type Req = {
  id: string;
  student_id: string;
  kind: string;
  status: string;
  payload: Record<string, unknown>;
  parent_note: string | null;
  created_at: string;
  decided_at: string | null;
  student_profile: { display_name: string | null; email: string | null } | null;
};

const KIND_LABEL: Record<string, string> = {
  teacher_booking: "職人預約 / 線下見面",
  intern_mission: "職圖實習報名",
};

function ParentDashboard() {
  const listChildren = useServerFn(listMyChildren);
  const listReqs = useServerFn(listPendingConsents);
  const decide = useServerFn(decideConsent);
  const bind = useServerFn(bindParentByCode);

  const [children, setChildren] = useState<Child[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [binding, setBinding] = useState(false);
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const reload = async () => {
    const [c, r] = await Promise.all([listChildren(), listReqs()]);
    setChildren(c.children as Child[]);
    setReqs(r.requests as Req[]);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBinding(true);
    try {
      await bind({ data: { code: code.trim() } });
      setCode("");
      await reload();
      toast.success("綁定成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "綁定失敗");
    } finally {
      setBinding(false);
    }
  };

  const handleDecide = async (id: string, decision: "approved" | "rejected") => {
    setDecidingId(id);
    try {
      await decide({ data: { id, decision, note: noteById[id] || undefined } });
      await reload();
      toast.success(decision === "approved" ? "已同意" : "已婉拒");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setDecidingId(null);
    }
  };

  const pending = reqs.filter((r) => r.status === "pending");
  const decided = reqs.filter((r) => r.status !== "pending");

  return (
    <div className="px-5 pt-8 pb-10 animate-page">
      <Link to="/" className="press mb-4 inline-flex items-center gap-1 text-subhead text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <header className="mb-6">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">家長後台</p>
        <h1 className="mt-1 text-title-1 text-foreground">陪伴與守護</h1>
        <p className="mt-2 text-footnote text-muted-foreground">
          孩子在 ProFashion Lab 探索職涯，遇到需要實際參與的活動（職人預約、線下見面）時，會送出請求請你核可。
        </p>
      </header>

      {/* 綁定區 */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-subhead font-semibold text-foreground">綁定新的孩子</p>
        <p className="mt-1 text-caption text-muted-foreground">請孩子在「我的家長」頁產生邀請碼</p>
        <form onSubmit={handleBind} className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="輸入邀請碼"
            maxLength={20}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-callout font-mono tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={binding || !code.trim()}
            className="press inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-callout font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> 綁定
          </button>
        </form>
      </section>

      {/* 我的孩子 */}
      <section className="mb-6">
        <h2 className="mb-3 text-subhead font-semibold text-foreground">我的孩子</h2>
        {loading ? (
          <p className="text-caption text-muted-foreground">載入中…</p>
        ) : children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center text-caption text-muted-foreground">
            尚未綁定任何孩子
          </div>
        ) : (
          <ul className="space-y-2">
            {children.map((c) => (
              <li
                key={c.link_id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-subhead font-semibold text-foreground">
                    {c.profile?.display_name ?? c.profile?.email ?? "學生"}
                  </p>
                  <p className="text-caption text-muted-foreground">{c.profile?.email ?? ""}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 待核可請求 */}
      <section className="mb-6">
        <h2 className="mb-3 text-subhead font-semibold text-foreground">
          待核可請求 {pending.length > 0 && <span className="ml-1 text-primary-deep">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center text-caption text-muted-foreground">
            目前沒有待核可的請求
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-caption text-muted-foreground">
                      {r.student_profile?.display_name ?? r.student_profile?.email ?? "孩子"} ・
                      {new Date(r.created_at).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="mt-1 text-subhead font-semibold text-foreground">
                      {KIND_LABEL[r.kind] ?? r.kind}
                    </p>
                    <PayloadView payload={r.payload} />
                  </div>
                </div>
                <textarea
                  value={noteById[r.id] ?? ""}
                  onChange={(e) => setNoteById((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder="想對孩子說的話（選填）"
                  rows={2}
                  className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-footnote text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleDecide(r.id, "rejected")}
                    disabled={decidingId === r.id}
                    className="press flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-callout font-medium text-muted-foreground disabled:opacity-60"
                  >
                    <ShieldX className="h-4 w-4" /> 婉拒
                  </button>
                  <button
                    onClick={() => handleDecide(r.id, "approved")}
                    disabled={decidingId === r.id}
                    className="press flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-callout font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" /> 同意
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 歷史紀錄 */}
      {decided.length > 0 && (
        <section>
          <h2 className="mb-3 text-subhead font-semibold text-foreground">歷史紀錄</h2>
          <ul className="space-y-2">
            {decided.slice(0, 10).map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-subhead font-semibold text-foreground">{KIND_LABEL[r.kind] ?? r.kind}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-caption font-semibold ${
                      r.status === "approved"
                        ? "bg-primary-soft text-primary-deep"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status === "approved" ? "已同意" : "已婉拒"}
                  </span>
                </div>
                <PayloadView payload={r.payload} />
                {r.parent_note && (
                  <p className="mt-2 text-caption italic text-muted-foreground">「{r.parent_note}」</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PayloadView({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return null;
  const label = (k: string) => ({ mentor_name: "職人", mentor_job: "工作", slot: "時段", mentor_id: "編號" }[k] ?? k);
  return (
    <div className="mt-2 space-y-1 rounded-xl bg-muted/40 p-3">
      {entries.map(([k, v]) => (
        <p key={k} className="text-caption text-foreground/80">
          <span className="text-muted-foreground">{label(k)}：</span>
          {String(v)}
        </p>
      ))}
    </div>
  );
}
