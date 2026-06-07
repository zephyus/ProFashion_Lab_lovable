import { LogOut, User as UserIcon, Check, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveRole, type AppRole } from "@/hooks/useActiveRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABEL: Record<AppRole, string> = {
  student: "學生身分",
  parent: "家長身分",
  teacher: "教師身分",
};
const ROLE_ICON: Record<AppRole, typeof Sparkles> = {
  student: Sparkles,
  parent: ShieldCheck,
  teacher: GraduationCap,
};

export function AppUserMenu() {
  const { user, loading } = useAuth();
  const { roles, active, setActive } = useActiveRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (loading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }
  if (!user) {
    return (
      <button
        onClick={() => navigate({ to: "/login" })}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)]"
      >
        登入
      </button>
    );
  }

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
  const displayName =
    meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "使用者";
  const avatarUrl = meta.avatar_url;

  const handleLogout = async () => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("登出失敗，請再試一次");
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("activeRole");
      }
      toast.success("已登出");
      navigate({ to: "/login", replace: true });
    } catch {
      toast.error("登出失敗，請再試一次");
    }
  };

  const ActiveIcon = ROLE_ICON[active];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="使用者選單"
          className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-card/90 text-foreground shadow-[var(--shadow-card)] backdrop-blur-md transition-transform hover:scale-105"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[12px] font-semibold text-primary-deep">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ActiveIcon className="h-2.5 w-2.5" strokeWidth={2.4} />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5">
          <div className="flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate text-sm font-semibold">{displayName}</span>
          </div>
          {user.email && (
            <p className="truncate pl-5 text-[11px] font-normal text-muted-foreground">
              {user.email}
            </p>
          )}
          <p className="pl-5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-primary-deep">
            目前：{ROLE_LABEL[active]}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.length > 1 && (
          <>
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              切換身分
            </DropdownMenuLabel>
            {roles.map((r) => {
              const Icon = ROLE_ICON[r];
              return (
                <DropdownMenuItem
                  key={r}
                  onSelect={() => setActive(r)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4 text-primary-deep" />
                  <span className="flex-1">{ROLE_LABEL[r]}</span>
                  {active === r && <Check className="h-3.5 w-3.5 text-primary-deep" />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
