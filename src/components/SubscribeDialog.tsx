import { Crown, Sparkles, X } from "lucide-react";
import {
  BOOKING_PRICE,
  FREE_AI_CALL_LIMIT,
  SUB_BOOKING_LIMIT,
  SUB_PRICE,
  useSubscription,
} from "@/hooks/useSubscription";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  /** "ai" = AI 通話額度用完； "booking" = 職圖體驗付費 */
  reason: "ai" | "booking";
  /** 單次付費完成後的 callback（僅 booking 模式有效）*/
  onPaid?: () => void;
};

export function SubscribeDialog({ open, onClose, reason, onPaid }: Props) {
  const { subscribe } = useSubscription();
  if (!open) return null;

  const isAi = reason === "ai";

  const handleSubscribe = () => {
    subscribe();
    toast.success(`已升級訂閱（demo）— NT$${SUB_PRICE}/月`);
    onClose();
  };

  const handlePayOnce = () => {
    toast.success(`已完成單次付費 NT$${BOOKING_PRICE}（demo）`);
    onPaid?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold">
                {isAi ? "AI 語音額度已用完" : "解鎖職圖體驗"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isAi
                  ? `免費方案每月 ${FREE_AI_CALL_LIMIT} 次`
                  : `訂閱會員每月 ${SUB_BOOKING_LIMIT} 次免費`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="-mr-2 -mt-2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="關閉"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 訂閱方案卡 */}
        <div className="mt-5 rounded-2xl border border-primary/30 bg-[image:var(--gradient-hero)] p-4 text-primary-foreground shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest opacity-90">
            <Sparkles className="h-3.5 w-3.5" /> 推薦・職感 PRO
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">NT${SUB_PRICE}</span>
            <span className="text-xs opacity-80">/ 月</span>
          </div>
          <ul className="mt-3 space-y-1 text-[13px] leading-snug">
            <li>· AI 語音想聊多久都行</li>
            <li>· 職圖每月送你 <b>{SUB_BOOKING_LIMIT} 次</b> 免費</li>
            <li>· 不想用了隨時可以取消</li>
          </ul>
          <button
            onClick={handleSubscribe}
            className="press mt-4 w-full rounded-full bg-white px-4 py-2.5 text-sm font-bold text-primary-deep"
          >
            升級訂閱
          </button>
        </div>

        {/* 單次付費（僅 booking）*/}
        {!isAi && (
          <button
            onClick={handlePayOnce}
            className="press mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/40"
          >
            單次付費體驗 <span className="text-primary-deep">NT${BOOKING_PRICE}</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-2xl px-4 py-2 text-xs text-muted-foreground hover:bg-muted/40"
        >
          {isAi ? "下個月再來" : "暫時不要"}
        </button>
      </div>
    </div>
  );
}
