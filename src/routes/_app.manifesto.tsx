import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/manifesto")({
  head: () => ({
    meta: [
      { title: "Manifesto — 從想像，到現場" },
      { name: "description", content: "把未來，從想像帶到現場。真實，才是重點。" },
      { property: "og:title", content: "ProFashion Lab — Manifesto" },
      { property: "og:description", content: "想像 → 過程 → 現場。我們相信真實。" },
    ],
  }),
  component: ManifestoPage,
});

function ManifestoPage() {
  return (
    <div
      className="min-h-screen bp-grid animate-page"
      style={{ background: "var(--blueprint-deep)" }}
    >
      <div className="px-6 pt-4 pb-24 text-white/90">
        <header className="flex h-12 items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-subhead text-white/70 transition-opacity hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.85} /> 返回
          </Link>
        </header>

        {/* Coordinate label */}
        <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-white/40">
          N°001 — MANIFESTO / 2026
        </p>

        <h1 className="mt-3 text-large-title font-bold leading-tight text-white">
          把未來，
          <br />
          從想像
          <br />
          帶到現場。
        </h1>

        <p className="mt-4 text-callout text-white/60">
          真實，才是重點。
        </p>

        {/* Three movements */}
        <section className="mt-12 space-y-10">
          <Movement
            tag="01 / IMAGINATION"
            title="想像"
            body="一條藍圖，從一個敢想的人開始。職涯不該只是落點分析、是非選擇。它應該先是一張紙上的線——你能往哪走、想成為誰。"
          />
          <Movement
            tag="02 / PROCESS"
            title="過程"
            body="圖紙不會自己變成建築。中間要有人放樣、開挖、灌漿、驗收。我們把每一步都做出來——咖啡館、職圖、預演——讓想像有路可走。"
          />
          <Movement
            tag="03 / SITE"
            title="現場"
            body="當你站在那裡的時候——你會知道。不是模擬，不是預測，是真的腳踩在地上。Profashion Lab 把那一刻，提前帶到你眼前。"
            stamp
          />
        </section>

        <div className="mt-16 border-t border-white/15 pt-6">
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/40">
            PROFASHION LAB · 職感實驗室
          </p>
          <p className="mt-2 text-footnote text-white/50">
            把想像中的時尚未來，化為可被測量、可被踏入的現場。
          </p>
        </div>
      </div>
    </div>
  );
}

function Movement({
  tag,
  title,
  body,
  stamp = false,
}: {
  tag: string;
  title: string;
  body: string;
  stamp?: boolean;
}) {
  return (
    <div className="border-l-2 border-white/25 pl-5">
      <p className="font-mono text-[10px] tracking-[0.25em] text-white/45">{tag}</p>
      <h2
        className={`mt-2 text-title-1 font-bold ${
          stamp ? "stamp-realized" : "text-white"
        }`}
        style={stamp ? undefined : undefined}
      >
        {title}
      </h2>
      <p className="mt-3 text-body leading-relaxed text-white/75">{body}</p>
    </div>
  );
}
