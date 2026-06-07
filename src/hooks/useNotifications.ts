import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { countUnread, listMyChildren } from "@/lib/parent.functions";
import { useAuth } from "./useAuth";

export function useUnreadCount() {
  const { user } = useAuth();
  const fn = useServerFn(countUnread);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    let cancelled = false;
    const tick = () =>
      fn().then((r) => {
        if (!cancelled) setCount(r.count);
      }).catch(() => {});
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user, fn]);
  return count;
}

export function useIsParent() {
  const { user, loading: authLoading } = useAuth();
  const fn = useServerFn(listMyChildren);
  const [isParent, setIsParent] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsParent(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fn()
      .then((r) => {
        if (!cancelled) setIsParent((r.children?.length ?? 0) > 0);
      })
      .catch(() => {
        if (!cancelled) setIsParent(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, fn]);
  return { isParent, loading };
}
