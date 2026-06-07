import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useRoles } from "./useRoles";
import { useIsParent } from "./useNotifications";

export type AppRole = "student" | "parent" | "teacher";

const STORAGE_KEY = "activeRole";

// teacher > parent > student
function pickDefault(roles: AppRole[]): AppRole {
  if (roles.includes("teacher")) return "teacher";
  if (roles.includes("parent")) return "parent";
  return "student";
}

export function useActiveRole() {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: rolesLoading } = useRoles();
  const { isParent, loading: parentLoading } = useIsParent();

  const loading = authLoading || rolesLoading || parentLoading;

  const roles: AppRole[] = [];
  if (user) {
    // Every signed-in user can act as student (default learner role)
    roles.push("student");
    if (isParent) roles.push("parent");
    if (isTeacher) roles.push("teacher");
  }

  const [active, setActiveState] = useState<AppRole>("student");

  // Sync from localStorage / available roles
  useEffect(() => {
    if (loading || !user) return;
    let stored: AppRole | null = null;
    if (typeof window !== "undefined") {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v === "student" || v === "parent" || v === "teacher") stored = v;
    }
    const next = stored && roles.includes(stored) ? stored : pickDefault(roles);
    setActiveState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isTeacher, isParent]);

  const setActive = useCallback(
    (r: AppRole) => {
      if (!roles.includes(r)) return;
      setActiveState(r);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, r);
      }
    },
    [roles],
  );

  return {
    roles,
    active,
    setActive,
    loading,
    isStudent: active === "student",
    isParentRole: active === "parent",
    isTeacherRole: active === "teacher",
    hasParent: isParent,
    hasTeacher: isTeacher,
  };
}
