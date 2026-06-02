import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/classroom.functions";
import { useAuth } from "./useAuth";

export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const fetchRoles = useServerFn(getMyRoles);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchRoles()
      .then((r) => {
        if (!cancelled) setRoles(r.roles);
      })
      .catch(() => {
        if (!cancelled) setRoles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, fetchRoles]);

  return {
    roles,
    loading: loading || authLoading,
    isTeacher: roles.includes("teacher"),
    isAdmin: roles.includes("admin"),
  };
}
