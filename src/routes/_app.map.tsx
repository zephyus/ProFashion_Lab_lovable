import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CATEGORY_META, MENTORS, MentorCategory } from "@/lib/mentors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/map")({
  head: () => ({ meta: [{ title: "地圖 — 職感 Zhígǎn" }] }),
  component: MapPage,
});

type Filter = "all" | MentorCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "life", label: CATEGORY_META.life.label },
  { key: "culture", label: CATEGORY_META.culture.label },
  { key: "craft", label: CATEGORY_META.craft.label },
  { key: "education", label: CATEGORY_META.education.label },
  { key: "media", label: CATEGORY_META.media.label },
];

function MapPage() {
  const { pathname } = useLocation();
  const [filter, setFilter] = useState<Filter>("all");
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const syncSource = useRef<"map" | "carousel" | null>(null);

  const mentors = useMemo(
    () => (filter === "all" ? MENTORS : MENTORS.filter((m) => m.category === filter)),
    [filter],
  );

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIdx(0);
    syncSource.current = "map";
    api?.scrollTo(0, true);
  }, [filter, api]);

  // Carousel → state
  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      if (syncSource.current === "map") {
        syncSource.current = null;
        return;
      }
      syncSource.current = "carousel";
      setSelectedIdx(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // State → carousel (when triggered by map pin)
  useEffect(() => {
    if (!api) return;
    if (syncSource.current === "carousel") {
      syncSource.current = null;
      return;
    }
    api.scrollTo(selectedIdx);
  }, [selectedIdx, api]);

  const selected = mentors[selectedIdx];

  if (pathname !== "/map") {
    return <Outlet />;
  }

  return (
    <div className="px-5 pt-10 animate-page">
      <header className="mb-5 animate-rise">
        <p className="text-subhead uppercase tracking-widest text-primary-deep">職圖</p>
        <p className="mt-3 text-body text-muted-foreground">
          把職業、地點、人都連起來。挑一位，看見一條真實走過的路。
        </p>
      </header>

      {/* Category filter chips — iOS segmented look */}
      <div className="-mx-5 mb-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "press shrink-0 rounded-full px-3.5 py-1.5 text-footnote font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>


      {/* Map area */}
      <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-border bg-[image:var(--gradient-soft)] shadow-[var(--shadow-card)]">
        {/* Decorative contour lines */}
        <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary-soft)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="120" cy="100" r="90" fill="url(#glow)" />
          <circle cx="300" cy="220" r="110" fill="url(#glow)" />
          <g fill="none" stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="1">
            <path d="M0,80 Q100,40 200,90 T400,70" />
            <path d="M0,140 Q120,100 220,150 T400,130" />
            <path d="M0,200 Q140,160 240,210 T400,190" />
            <path d="M0,260 Q120,220 220,260 T400,250" />
          </g>
        </svg>

        {/* Pins */}
        {mentors.map((m, idx) => {
          const active = idx === selectedIdx;
          const tone = CATEGORY_META[m.category].tone;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                syncSource.current = "map";
                setSelectedIdx(idx);
              }}
              className="absolute -translate-x-1/2 -translate-y-full transition-transform"
              style={{ left: `${m.mapX}%`, top: `${m.mapY}%` }}
              aria-label={m.name}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  active ? "h-10 w-10 ring-4 ring-primary/30" : "h-7 w-7",
                )}
                style={{ background: tone }}
              >
                <MapPin
                  className={cn("text-white drop-shadow", active ? "h-5 w-5" : "h-4 w-4")}
                  strokeWidth={2.5}
                />
              </div>
              {active && (
                <div className="mt-1 whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-[var(--shadow-card)]">
                  {m.name}
                </div>
              )}
            </button>
          );
        })}

        {mentors.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-subhead font-semibold text-foreground">這個分類還在路上</p>
            <p className="text-caption">先看看其他分類，新職人會持續加入。</p>
          </div>
        )}
      </div>

      {/* Horizontal carousel */}
      {mentors.length > 0 && (
        <div className="mt-5 -mx-5">
          <Carousel
            setApi={setApi}
            opts={{ align: "center", containScroll: "trimSnaps" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 px-5">
              {mentors.map((m, idx) => (
                <CarouselItem
                  key={m.id}
                  className="basis-[82%] pl-3"
                >
                  <Link
                    to="/map/$mentorId"
                    params={{ mentorId: m.id }}
                    className={cn(
                      "block rounded-2xl border bg-card p-4 transition-all",
                      idx === selectedIdx
                        ? "border-primary shadow-[var(--shadow-float)]"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-bold">{m.name}</h3>
                          <span className="text-xs text-muted-foreground">· {m.years} 年</span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-primary-deep font-medium">{m.job}</p>
                      </div>
                      <Badge
                        variant={m.available ? "default" : "secondary"}
                        className="shrink-0 text-[10px]"
                      >
                        {m.available ? "可預約" : "排隊中"}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {m.bio}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {m.region}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary-deep">
                        看詳情 <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      {selected && (
        <p className="mt-4 text-center text-caption">
          {selectedIdx + 1} / {mentors.length} · 滑動或點地圖切換
        </p>
      )}
    </div>
  );
}
