import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, RefreshCw, Unlink2, Users } from "lucide-react";
import { toast } from "sonner";
import { generateParentInvite, listMyParents, unlinkParent } from "@/lib/parent.functions";

export const Route = createFileRoute("/_app/parent-link")({
  head: () => ({ meta: [{ title: "我的家長 — ProFashion Lab" }] }),
  component: ParentLinkPage,
});

type Link = {
  id: string;
  invite_code: string;
  status: string;
  parent_id: string | null;
  parent_profile: { display_name: string | null; email: string | null } | null;
};

function ParentLinkPage() {
  const list = useServerFn(listMyParents);
  const gen = useServerFn(generateParentInvite);
  const unlink = useServerFn(unlinkParent);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const reload = () =>
    list().then((r) => setLinks(r.links as Link[])).finally(() => setLoading(false));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = links.find((l) => l.status === "active");
  const pending = links.find((l) => l.status === "pending");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await gen();
      await reload();
      toast.success("已產生邀請碼");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "產生失敗");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success("已複製"));
  };

  const handleUnlink = async (linkId: string) => {
    if (!confirm("確定要解除綁定？解除後家長無法再核可你的請求。")) return;
    try {
      await unlink({ data: { linkId } });
      await reload();
      toast.success("已解除綁定");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "解除失敗");
    }
  };

  return (
    <div className="px-5 pt-8 pb-10 animate-page">
      <Link to="/" className="press mb-4 inline-flex items-center gap-1 text-subhead text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <header className="mb-6">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">家長綁定</p>
        <h1 className="mt-1 text-title-1 text-foreground">我的家長</h1>
        <p className="mt-2 text-footnote text-muted-foreground">
          綁定家長後，預約職人體驗等具體活動會送出請求請家長核可。
        </p>
      </header>

      {loading ? (
        <p className="text-caption text-muted-foreground">載入中…</p>
      ) : active ? (
        <div className="rounded-3xl bg-[image:var(--gradient-hero)] p-5 text-primary-foreground shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-90">
            <Users className="h-3.5 w-3.5" /> 已綁定
          </div>
          <p className="mt-2 text-title-2 font-bold">
            {active.parent_profile?.display_name ?? active.parent_profile?.email ?? "家長"}
          </p>
          <p className="mt-1 text-footnote opacity-85">{active.parent_profile?.email ?? ""}</p>
          <button
            onClick={() => handleUnlink(active.id)}
            className="press mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-caption font-semibold backdrop-blur-sm"
          >
            <Unlink2 className="h-3.5 w-3.5" /> 解除綁定
          </button>
        </div>
      ) : pending ? (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-caption font-semibold text-primary-deep">邀請碼（等待家長輸入）</p>
          <p className="mt-3 text-large-title font-bold tracking-[0.3em] text-foreground">
            {pending.invite_code}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleCopy(pending.invite_code)}
              className="press flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-callout font-medium"
            >
              <Copy className="h-4 w-4" /> 複製
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="press flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-callout font-medium disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" /> 重新產生
            </button>
          </div>
          <p className="mt-4 text-caption text-muted-foreground">
            把這組邀請碼給你的家長，請他在「家長後台」輸入即可完成綁定。
          </p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="press w-full rounded-2xl bg-primary px-4 py-4 text-callout font-semibold text-primary-foreground disabled:opacity-60"
        >
          {generating ? "產生中…" : "產生邀請碼"}
        </button>
      )}

      <p className="mt-8 text-center text-caption text-muted-foreground">
        Demo 學生帳號的固定邀請碼是 <span className="font-mono font-semibold">DEMO01</span>
      </p>
    </div>
  );
}
