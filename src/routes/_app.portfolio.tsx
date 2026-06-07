import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, FileText, Phone as PhoneIcon, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getMyPortfolio } from "@/lib/portfolio.functions";
import { useTrackVisit } from "@/hooks/useActivity";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({ meta: [{ title: "我的學習歷程 — ProFashion Lab" }] }),
  component: PortfolioPage,
});

type PortfolioData = Awaited<ReturnType<typeof getMyPortfolio>>;

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    quiz_completed: "完成職感測驗",
    call_completed: "完成職人通話",
    mission_completed: "完成虛擬實習關卡",
    cafe_question_posted: "在咖啡館發問",
    mentor_visited: "瀏覽職人地圖",
  };
  return map[type] ?? type;
}

function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const fetchPortfolio = useServerFn(getMyPortfolio);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPortfolio()
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "載入失敗"))
      .finally(() => setLoading(false));
  }, [user, authLoading, fetchPortfolio]);

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <div className="px-5 py-10 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        <p className="mt-3 text-footnote">整理你的學習歷程中…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-5 py-8">
        <p className="text-foreground">請先登入才能查看學習歷程。</p>
        <Link to="/login" className="mt-3 inline-block text-primary-deep underline">前往登入</Link>
      </div>
    );
  }

  if (!data) return null;

  const displayName = data.profile?.display_name ?? user.email?.split("@")[0] ?? "ProFashion Lab 學員";

  return (
    <div className="px-5 animate-page print:px-0">
      {/* 螢幕用工具列（列印時隱藏） */}
      <div className="print:hidden">
        <Link to="/" className="press mt-3 flex items-center gap-1.5 text-footnote text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <header className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">學習歷程</p>
            <h1 className="mt-1 text-large-title text-foreground">我的職涯探索檔案</h1>
          </div>
          <button
            onClick={handlePrint}
            className="press flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-footnote font-semibold text-primary-foreground"
            aria-label="下載 PDF"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
        </header>
        <p className="mt-2 text-footnote text-muted-foreground">
          點 PDF 後選擇「儲存為 PDF」即可匯出，可附入 108 課綱學習歷程多元表現。
        </p>
      </div>

      {/* 可列印區 */}
      <div ref={printRef} className="mt-6 space-y-5 print:mt-0">
        {/* 個人資訊 */}
        <section className="rounded-2xl border border-border bg-card p-5 print:border-2">
          <h2 className="text-title-3 text-foreground">{displayName} 的學習歷程檔案</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-footnote">
            <dt className="text-muted-foreground">建立日期</dt>
            <dd className="text-foreground">{fmtDate(data.profile?.created_at ?? null)}</dd>
            <dt className="text-muted-foreground">首次活動</dt>
            <dd className="text-foreground">{fmtDate(data.stats.firstActivityAt)}</dd>
            <dt className="text-muted-foreground">最近活動</dt>
            <dd className="text-foreground">{fmtDate(data.stats.lastActivityAt)}</dd>
            <dt className="text-muted-foreground">產出日期</dt>
            <dd className="text-foreground">{fmtDate(new Date().toISOString())}</dd>
          </dl>
        </section>

        {/* 統計 */}
        <section className="grid grid-cols-2 gap-3">
          <StatCard icon={Trophy} label="累積 XP" value={data.stats.totalXp} />
          <StatCard icon={Sparkles} label="完成測驗" value={data.stats.totalQuizzes} />
          <StatCard icon={PhoneIcon} label="職人通話" value={data.stats.totalCalls} />
          <StatCard icon={FileText} label="探索事件" value={data.stats.totalEvents} />
        </section>

        {/* 最新測驗 */}
        {data.latestQuiz ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">最新職感測驗</p>
            <h3 className="mt-1 text-title-3 text-foreground">{data.latestQuiz.archetype}</h3>
            {data.latestQuiz.summary ? (
              <p className="mt-2 text-body text-muted-foreground">{data.latestQuiz.summary}</p>
            ) : null}
            <p className="mt-3 text-caption text-muted-foreground">完成於 {fmtDate(data.latestQuiz.created_at)}</p>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-muted-foreground">
            <p>還沒完成職感測驗。前往「發現小秘 me」開始。</p>
          </section>
        )}

        {/* 通話紀錄 */}
        {data.calls.length > 0 ? (
          <section>
            <p className="mb-2 px-1 text-caption uppercase tracking-wider text-muted-foreground">職人通話紀錄</p>
            <div className="list-group">
              {data.calls.map((c) => (
                <div key={c.id} className="flex items-start justify-between px-4 py-3">
                  <div>
                    <p className="text-callout font-medium text-foreground">{c.persona_name}</p>
                    <p className="text-caption text-muted-foreground">
                      {c.persona_job ?? ""} · 聽完 {c.script_lines_played} 句 · 對話 {c.message_count} 則
                    </p>
                    {c.reflection ? (
                      <p className="mt-1 text-footnote text-foreground">「{c.reflection}」</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-caption tabular-nums text-muted-foreground">{fmtDate(c.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* 探索時間軸（取最近 20 筆） */}
        {data.events.length > 0 ? (
          <section>
            <p className="mb-2 px-1 text-caption uppercase tracking-wider text-muted-foreground">探索時間軸</p>
            <div className="list-group">
              {data.events.slice(0, 20).map((e, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-footnote text-foreground">{eventLabel(e.event_type)}</span>
                  <span className="text-caption tabular-nums text-muted-foreground">{fmtDate(e.created_at)}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <p className="px-1 text-center text-caption text-muted-foreground print:mt-8">
          由 ProFashion Lab 職感實驗室 自動產出 · 僅供職涯探索參考
        </p>
      </div>

      <div className="h-10" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <p className="mt-2 text-caption text-muted-foreground">{label}</p>
      <p className="text-title-2 font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
