import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Coffee,
  Map as MapIcon,
  Phone,
  FlaskConical,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const leftTabs = [
  { to: "/explore", label: "發現小秘me", icon: Compass },
  { to: "/cafe", label: "職業咖啡館", icon: Coffee },
] as const;

const rightTabs = [
  { to: "/map", label: "職圖", icon: MapIcon },
  { to: "/call", label: "您撥的號碼是未來", icon: Phone },
] as const;

function AppLayout() {
  const { pathname } = useLocation();
  const homeActive = pathname === "/" || pathname === "/_app" || pathname === "/_app/";

  const renderTab = ({
    to,
    label,
    icon: Icon,
  }: {
    to: string;
    label: string;
    icon: typeof Compass;
  }) => {
    const active =
      pathname === to || (to === "/map" && pathname.startsWith("/map"));
    return (
      <li key={to}>
        <Link
          to={to}
          className={`press flex flex-col items-center gap-1 px-1 py-2.5 transition-colors ${
            active ? "text-primary-deep" : "text-muted-foreground"
          }`}
        >
          <Icon
            className="h-[22px] w-[22px]"
            strokeWidth={active ? 2.2 : 1.85}
            aria-hidden
          />
          <span
            className="text-[10px] leading-tight text-center whitespace-nowrap"
            style={{ fontWeight: active ? 600 : 500 }}
          >
            {label}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-[72px]">
      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/85 backdrop-blur-xl">
        {/* Center floating Lab home button */}
        <div className="absolute left-1/2 -top-5 z-10 -translate-x-1/2">
          <Link
            to="/"
            className={`press flex h-[52px] w-[52px] items-center justify-center rounded-full border-[2.5px] border-card shadow-[0_4px_16px_-4px_oklch(0.2_0.02_220/0.18)] transition-all ${
              homeActive
                ? "bg-primary-deep text-primary-foreground scale-105"
                : "bg-gradient-to-br from-primary to-primary-deep text-primary-foreground"
            }`}
            aria-label="ProFashion Lab 主頁"
          >
            <FlaskConical className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        <ul className="grid grid-cols-4 px-1">
          {leftTabs.map(renderTab)}
          {/* Spacer for center button */}
          <li className="pointer-events-none" aria-hidden />
          {rightTabs.map(renderTab)}
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
