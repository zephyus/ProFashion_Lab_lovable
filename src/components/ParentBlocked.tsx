import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useActiveRole } from "@/hooks/useActiveRole";

export function ParentBlocked({ featureName }: { featureName: string }) {
  const { roles, setActive } = useActiveRole();
  const canSwitchToStudent = roles.includes("student");

  return (
    <div className="px-5 pt-16 pb-12 animate-page">
      <div className="rounded-3xl border border-amber-400/40 bg-amber-50 p-6 dark:bg-amber-950/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-200/60 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-amber-950 dark:text-amber-100">
          「{featureName}」僅供學生使用
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
          這個功能設計給學生本人操作，目的是讓你的孩子自己練習、累積屬於他的學習紀錄。
          建議讓孩子用自己的學生帳號登入使用。
        </p>
        <div className="mt-5 space-y-2">
          {canSwitchToStudent && (
            <button
              onClick={() => setActive("student")}
              className="press w-full rounded-full bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
            >
              切回學生身分使用
            </button>
          )}
          <Link
            to="/"
            className="press flex w-full items-center justify-center gap-2 rounded-full border border-amber-400/60 bg-card px-4 py-3 text-sm font-semibold text-amber-900 dark:text-amber-200"
          >
            <ArrowLeft className="h-4 w-4" /> 回到家長首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
