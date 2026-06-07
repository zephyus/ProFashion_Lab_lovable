import { Link } from "@tanstack/react-router";
import {
  Trophy,
  ArrowRight,
  Sparkles,
  Coffee,
  MapPin,
  Phone,
  FileText,
  GraduationCap,
  Users,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { useXp } from "@/hooks/useXp";

const stations = [
  { key: "explore", icon: Sparkles, title: "發現小秘 me", desc: "認識你自己。", to: "/explore" as const },
  { key: "cafe", icon: Coffee, title: "職業咖啡館", desc: "聽前輩怎麼說。", to: "/cafe" as const },
  { key: "map", icon: MapPin, title: "職圖", desc: "看見你的路徑。", to: "/map" as const },
  { key: "call", icon: Phone, title: "您撥的號碼是未來", desc: "預演關鍵時刻。", to: "/call" as const },
];

export function StudentHome({ displayName }: { displayName: string }) {
  const { xp, completed, tierName } = useXp();

  return (
    <div className="space-y-6">
      <section className="animate-rise">
        <h1 className="text-large-title text-foreground">
          {displayName ? `${displayName}，` : "今天，"}
          <br />
          想認識哪一個自己？
        </h1>
      </section>

      <Link
        to="/explore"
        className="press flex items-center justify-between gap-4 rounded-2xl bg-[image:var(--gradient-hero)] px-5 py-4 text-primary-foreground shadow-[var(--shadow-card)] animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-center gap-2.5">
          <Trophy className="h-4 w-4" strokeWidth={2} />
          <div>
            <p className="text-subhead font-semibold leading-tight">{tierName}</p>
            <p className="text-[11px] opacity-80">
              {completed > 0 ? `已完成 ${completed} 關` : "尚未開始"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-title-2 font-bold leading-none tabular-nums">{xp}</p>
          <p className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">XP</p>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3 animate-rise" style={{ animationDelay: "120ms" }}>
        {stations.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="press flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-subhead font-semibold text-foreground">{s.title}</p>
                <p className="mt-1 text-footnote leading-snug">{s.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2.5 animate-rise" style={{ animationDelay: "150ms" }}>
        <RowLink to="/portfolio" icon={FileText} title="我的學習歷程" desc="匯出 108 課綱 PDF" />
        <RowLink to="/parent-link" icon={HeartHandshake} title="我的家長" desc="產生邀請碼讓家長綁定" />
        <RowLink to="/join" icon={Users} title="加入班級" desc="輸入老師給的邀請碼" />
      </div>
    </div>
  );
}

export function ParentHome({ displayName }: { displayName: string }) {
  return (
    <div className="space-y-6">
      <section className="animate-rise">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">家長後台</p>
        <h1 className="mt-2 text-large-title text-foreground">
          {displayName ? `${displayName}，` : ""}孩子今天
          <br />
          怎麼樣？
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          這裡是給你的——確認孩子在用什麼、需要你同意什麼。
        </p>
      </section>

      <div className="space-y-2.5 animate-rise" style={{ animationDelay: "60ms" }}>
        <RowLink
          to="/parent"
          icon={ShieldCheck}
          title="管理我的孩子"
          desc="查看孩子、核可活動請求"
          accent
        />
        <RowLink to="/inbox" icon={FileText} title="通知收件夾" desc="孩子的活動與核可結果" />
      </div>

      <section className="animate-rise" style={{ animationDelay: "120ms" }}>
        <p className="text-caption font-bold uppercase tracking-widest text-muted-foreground">
          了解孩子在看什麼
        </p>
        <p className="mt-1 text-footnote text-muted-foreground">
          以下是孩子可使用的內容，你可以瀏覽，但測驗與通話只開放學生本人操作。
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <BrowseCard to="/cafe" icon={Coffee} title="職業咖啡館" desc="前輩的真實心聲" />
          <BrowseCard to="/map" icon={MapPin} title="職圖" desc="孩子可能預約的職人" />
        </div>
      </section>
    </div>
  );
}

export function TeacherHome({ displayName }: { displayName: string }) {
  return (
    <div className="space-y-6">
      <section className="animate-rise">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">教師後台</p>
        <h1 className="mt-2 text-large-title text-foreground">
          {displayName ? `${displayName}老師，` : ""}今天
          <br />
          班上要做什麼？
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          管理班級、發送邀請碼、追蹤學員的探索與報名進度。
        </p>
      </section>

      <div className="space-y-2.5 animate-rise" style={{ animationDelay: "60ms" }}>
        <RowLink to="/teacher" icon={GraduationCap} title="我的班級" desc="管理班級、查看學員進度" accent />
        <RowLink to="/inbox" icon={FileText} title="通知收件夾" desc="班級與報名相關通知" />
      </div>

      <section className="animate-rise" style={{ animationDelay: "120ms" }}>
        <p className="text-caption font-bold uppercase tracking-widest text-muted-foreground">
          以學生視角預覽
        </p>
        <p className="mt-1 text-footnote text-muted-foreground">
          熟悉學生看到的內容，方便在課堂引導討論。
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <BrowseCard to="/explore" icon={Sparkles} title="發現小秘 me" desc="測驗與虛擬實習" />
          <BrowseCard to="/cafe" icon={Coffee} title="職業咖啡館" desc="前輩故事 feed" />
          <BrowseCard to="/map" icon={MapPin} title="職圖" desc="職人預約地圖" />
          <BrowseCard to="/call" icon={Phone} title="您撥的號碼是未來" desc="情境通話演練" />
        </div>
      </section>
    </div>
  );
}

function RowLink({
  to,
  icon: Icon,
  title,
  desc,
  accent,
}: {
  to: string;
  icon: typeof FileText;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`press flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
        accent
          ? "border-primary/40 bg-primary-soft hover:bg-primary-soft/80"
          : "border-border bg-card hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </div>
        <div>
          <p className="text-subhead font-semibold text-foreground">{title}</p>
          <p className="text-caption text-muted-foreground">{desc}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function BrowseCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof FileText;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="press flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-footnote font-semibold text-foreground">{title}</p>
        <p className="text-[10px] leading-snug text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}
