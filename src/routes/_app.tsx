import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Coffee,
  Map as MapIcon,
  Phone,
  FlaskConical,
  Bell,
} from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";

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
  const unread = useUnreadCount();
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
    <div className="app-shell relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background pb-[72px]">
      {/* Inbox bell — anchored inside the app shell so it never overflows */}
      <Link
        to="/inbox"
        aria-label="通知收件夾"
        className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-[var(--shadow-card)] backdrop-blur-md transition-transform hover:scale-105"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.85} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>

      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="app-shell-nav fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/85 backdrop-blur-xl print:hidden">
        <ul className="grid grid-cols-5 px-1">
          {leftTabs.map(renderTab)}
          <li key="lab-home">
            <Link
              to="/"
              className="press flex flex-col items-center gap-1 px-1 py-2.5"
              aria-label="ProFashion Lab 主頁"
            >
              <span
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all ${
                  homeActive
                    ? "bg-primary-deep text-primary-foreground"
                    : "bg-gradient-to-br from-primary to-primary-deep text-primary-foreground"
                }`}
              >
                <FlaskConical className="h-[20px] w-[20px]" strokeWidth={2.2} aria-hidden />
              </span>
              <span
                className={`text-[10px] leading-tight text-center whitespace-nowrap ${
                  homeActive ? "text-primary-deep" : "text-muted-foreground"
                }`}
                style={{ fontWeight: homeActive ? 600 : 500 }}
              >
                Lab
              </span>
            </Link>
          </li>
          {rightTabs.map(renderTab)}
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
