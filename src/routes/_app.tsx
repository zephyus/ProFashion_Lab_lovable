import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Coffee,
  Map as MapIcon,
  Phone,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const tabs = [
  { to: "/explore", label: "發現小秘me", icon: Compass },
  { to: "/cafe", label: "職業咖啡館", icon: Coffee },
  { to: "/map", label: "職圖", icon: MapIcon },
  { to: "/call", label: "您撥的號碼是未來", icon: Phone },
] as const;

function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-[72px]">
      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/85 backdrop-blur-xl">
        <ul className="grid grid-cols-5 px-1">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/"
                ? pathname === "/"
                : pathname === to || (to === "/map" && pathname.startsWith("/map"));
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`press flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                    active ? "text-primary-deep" : "text-muted-foreground"
                  }`}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={active ? 2.2 : 1.85}
                    aria-hidden
                  />
                  <span
                    className="text-[10px] leading-tight"
                    style={{ fontWeight: active ? 600 : 500 }}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
