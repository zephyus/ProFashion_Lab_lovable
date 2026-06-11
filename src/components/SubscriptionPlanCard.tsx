import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  BOOKING_PRICE,
  SUB_BOOKING_LIMIT,
  SUB_PRICE,
  useSubscription,
} from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

type SubscriptionPlanCardProps = {
  className?: string;
};

const benefits = [
  "AI 語音想聊多久都行",
  `職圖每月送你 ${SUB_BOOKING_LIMIT} 次免費`,
  "紀錄自動雲端保存",
];

export function SubscriptionPlanCard({ className }: SubscriptionPlanCardProps) {
  const sub = useSubscription();

  const handleSubscribe = () => {
    sub.subscribe();
    toast.success(`已選擇 PRO 方案（demo）— NT$${SUB_PRICE}/月`);
  };

  const handleUnsubscribe = () => {
    sub.unsubscribe();
    toast.success("已取消訂閱（demo）");
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/15 bg-card p-4 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-subhead font-semibold text-foreground">
            {sub.isSubscribed ? "PRO 訂閱中" : "訂閱方案"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {sub.isSubscribed ? "Demo 方案已啟用" : `也可職圖單次體驗 NT$${BOOKING_PRICE}`}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary-deep">
          <Crown className="h-3.5 w-3.5" strokeWidth={2} />
          PRO
        </div>
      </div>

      {sub.isSubscribed ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-primary-soft px-3 py-2">
              <p className="text-[11px] text-muted-foreground">AI 語音</p>
              <p className="mt-0.5 text-callout font-bold text-primary-deep">無限次</p>
            </div>
            <div className="rounded-xl bg-primary-soft px-3 py-2">
              <p className="text-[11px] text-muted-foreground">職圖體驗</p>
              <p className="mt-0.5 text-callout font-bold text-primary-deep">
                {sub.bookingsRemaining}/{sub.bookingsLimit}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-callout font-medium text-muted-foreground transition-colors hover:bg-muted/40 active:scale-[0.99]"
          >
            取消訂閱（demo）
          </button>
        </>
      ) : (
        <>
          <div className="mt-3 rounded-xl border border-primary/20 bg-primary-soft p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-deep" strokeWidth={2} />
                <p className="text-callout font-bold text-primary-deep">職感 PRO</p>
              </div>
              <p className="text-title-2 font-bold text-primary-deep">
                NT${SUB_PRICE}
                <span className="text-[12px] font-medium text-muted-foreground">/月</span>
              </p>
            </div>
            <ul className="mt-2 space-y-1 text-[12px] text-foreground">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-primary-deep"
                    strokeWidth={2}
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={handleSubscribe}
            className="press mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-hero)] px-4 py-3 text-callout font-semibold text-primary-foreground shadow-sm"
          >
            <Crown className="h-4 w-4" strokeWidth={2} />
            選擇 PRO 方案
          </button>
        </>
      )}
    </div>
  );
}
