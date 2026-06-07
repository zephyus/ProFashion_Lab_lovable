import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/parent.functions";

export const Route = createFileRoute("/_app/inbox")({
  head: () => ({ meta: [{ title: "通知收件夾 — ProFashion Lab" }] }),
  component: InboxPage,
});

type Notif = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function InboxPage() {
  const list = useServerFn(listNotifications);
  const markRead = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () =>
    list().then((r) => setItems(r.notifications as Notif[])).finally(() => setLoading(false));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async (n: Notif) => {
    if (!n.read_at) {
      await markRead({ data: { id: n.id } });
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
    if (n.link) navigate({ to: n.link });
  };

  const handleMarkAll = async () => {
    await markAll();
    setItems((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
    toast.success("已全部標為已讀");
  };

  return (
    <div className="px-5 pt-8 pb-10 animate-page">
      <Link to="/" className="press mb-4 inline-flex items-center gap-1 text-subhead text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">收件夾</p>
          <h1 className="mt-1 text-title-1 text-foreground">通知</h1>
        </div>
        <button
          onClick={handleMarkAll}
          className="press inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-caption text-muted-foreground hover:bg-muted/40"
        >
          <CheckCheck className="h-3.5 w-3.5" /> 全部已讀
        </button>
      </header>

      {loading ? (
        <p className="text-caption text-muted-foreground">載入中…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Bell className="h-10 w-10 opacity-40" strokeWidth={1.5} />
          <p className="mt-3 text-subhead">目前沒有通知</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleClick(n)}
                className={`press flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30 ${
                  n.read_at ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.read_at ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-subhead font-semibold text-foreground">{n.title}</p>
                  {n.body && <p className="mt-1 text-footnote text-muted-foreground">{n.body}</p>}
                  <p className="mt-1.5 text-caption text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("zh-TW", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
