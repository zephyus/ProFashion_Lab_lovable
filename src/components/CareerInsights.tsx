import { cn } from "@/lib/utils";

type CareerInsightsProps = {
  skills: string[];
  future: string[];
  className?: string;
};

function InsightGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl bg-white/80 p-3 shadow-sm">
      <p className="text-[11px] font-semibold tracking-wide text-teal-600">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-teal-600/10 px-2.5 py-1 text-[11px] font-medium leading-tight text-teal-700"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export function CareerInsights({ skills, future, className }: CareerInsightsProps) {
  return (
    <div className={cn("rounded-2xl border border-teal-600/10 bg-teal-50/60 p-3.5", className)}>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <InsightGroup title="\u9700\u8981\u4ec0\u9ebc\u80fd\u529b" items={skills} />
        <InsightGroup title="\u672a\u4f86\u6709\u54ea\u4e9b\u767c\u5c55" items={future} />
      </div>
    </div>
  );
}
