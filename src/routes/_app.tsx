import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Gamepad2, Coffee, Map as MapIcon, Phone, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const tabs = [
  { to: "/explore", label: "發現小秘me", icon: Gamepad2 },
  { to: "/cafe", label: "職業咖啡館", icon: Coffee },
  { to: "/", label: "Lab 主頁", icon: FlaskConical },
  { to: "/map", label: "職圖", icon: MapIcon },
  { to: "/call", label: "未來來電", icon: Phone },
] as const;

function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-24">
      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-lg">
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/"
                ? pathname === "/"
                : pathname === to || (to === "/map" && pathname.startsWith("/map"));
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-3 text-[10px] transition-colors ${
                    active ? "text-primary-deep" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                      active ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-center leading-tight ${active ? "font-semibold" : ""}`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
