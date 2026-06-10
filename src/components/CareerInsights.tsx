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
  const skillsTitle = String.fromCodePoint(0x9700, 0x8981, 0x4ec0, 0x9ebc, 0x80fd, 0x529b);
  const futureTitle = String.fromCodePoint(0x672a, 0x4f86, 0x6709, 0x54ea, 0x4e9b, 0x767c, 0x5c55);

  return (
    <div className={cn("rounded-2xl border border-teal-600/10 bg-teal-50/60 p-3.5", className)}>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <InsightGroup title={skillsTitle} items={skills} />
        <InsightGroup title={futureTitle} items={future} />
      </div>
    </div>
  );
}
