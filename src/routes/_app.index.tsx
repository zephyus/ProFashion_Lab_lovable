import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveRole } from "@/hooks/useActiveRole";
import { ParentHome, StudentHome, TeacherHome } from "@/components/home/RoleHomes";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "ProFashion Lab — 四種方式探索職涯" },
      {
        name: "description",
        content:
          "發現小秘me、職業咖啡館、職圖、您撥的號碼是未來——四種方式，把模糊的未來變成具體的下一步。",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, loading } = useAuth();
  const { active } = useActiveRole();

  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
  const displayName = meta.full_name ?? meta.name ?? user?.email?.split("@")[0] ?? "";

  return (
    <div className="px-5 pt-16 pb-12 animate-page">
      <header className="mb-2">
        <span className="text-footnote font-semibold tracking-wide text-foreground/80">
          ProFashion <span className="text-muted-foreground">Lab</span>
        </span>
        <span className="ml-2 text-[10px] tracking-widest text-muted-foreground">
          職感實驗室
        </span>
      </header>

      {loading ? (
        <div className="mt-8 h-24 animate-pulse rounded-2xl bg-muted" />
      ) : user ? (
        active === "parent" ? (
          <ParentHome displayName={displayName} />
        ) : active === "teacher" ? (
          <TeacherHome displayName={displayName} />
        ) : (
          <StudentHome displayName={displayName} />
        )
      ) : (
        <GuestHome />
      )}

      <div className="h-12" />
    </div>
  );
}

function GuestHome() {
  return (
    <div className="space-y-6">
      <section className="animate-rise">
        <h1 className="text-large-title text-foreground">
          今天，
          <br />
          想認識哪一個自己？
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          登入後，紀錄會跟著你，不會因為換裝置消失。
        </p>
      </section>
      <Link
        to="/login"
        className="press flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <p className="text-subhead font-semibold">登入以保留你的軌跡</p>
        <ArrowRight className="h-5 w-5" strokeWidth={2} />
      </Link>
    </div>
  );
}
