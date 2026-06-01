import { createFileRoute } from "@tanstack/react-router";
import { Map, Construction } from "lucide-react";

export const Route = createFileRoute("/_app/map")({
  head: () => ({ meta: [{ title: "職圖" }] }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary-soft blur-3xl opacity-60" />
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[image:var(--gradient-hero)] shadow-[var(--shadow-float)]">
          <Map className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-bold tracking-tight">職圖</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        正在繪製中 — 即將為你呈現完整的職涯地圖，從學科到職位、從技能到產業，一覽無遺。
      </p>
      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">
        <Construction className="h-3.5 w-3.5" /> Coming Soon
      </div>
    </div>
  );
}
