import { useState } from "react";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Quote,
  Heart,
  CheckCircle2,
  Calendar,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_META, MentorSlot, getMentor } from "@/lib/mentors";
import { cn } from "@/lib/utils";

type BookingType = "individual" | "class";

export const Route = createFileRoute("/_app/map/$mentorId")({
  head: ({ params }) => {
    const m = getMentor(params.mentorId);
    return { meta: [{ title: m ? `${m.name}・${m.job} — 職圖` : "職人 — 職圖" }] };
  },
  loader: ({ params }) => {
    const mentor = getMentor(params.mentorId);
    if (!mentor) throw notFound();
    return { mentor };
  },
  notFoundComponent: () => (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center">
      <h1 className="text-xl font-bold">找不到這位職人</h1>
      <Link to="/map" className="mt-4 text-sm font-semibold text-primary-deep">
        ← 回到職圖
      </Link>
    </div>
  ),
  component: MentorDetailPage,
});

type Step = "idle" | "type" | "slot" | "form" | "done";

function MentorDetailPage() {
  const { mentorId } = Route.useParams();
  const mentor = getMentor(mentorId)!;
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("idle");
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [slot, setSlot] = useState<MentorSlot | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    contact?: string;
    school?: string;
    className?: string;
    studentCount?: string;
  }>({});

  const tone = CATEGORY_META[mentor.category].tone;

  const resetAll = () => {
    setStep("idle");
    setBookingType(null);
    setSlot(null);
    setName("");
    setContact("");
    setSchool("");
    setClassName("");
    setStudentCount("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = bookingType === "class" ? "請輸入老師姓名" : "請輸入姓名";
    if (!contact.trim()) errs.contact = "請輸入聯絡方式";
    if (bookingType === "class") {
      if (!school.trim()) errs.school = "請輸入學校名稱";
      if (!className.trim()) errs.className = "請輸入班級";
      const n = Number(studentCount);
      if (!studentCount.trim() || !Number.isFinite(n) || n < 1) {
        errs.studentCount = "請輸入有效人數";
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep("done");
  };

  return (
    <div className="relative pb-44">
      {/* Header band */}
      <div
        className="relative px-5 pb-8 pt-8"
        style={{
          background: `linear-gradient(160deg, ${tone} 0%, var(--primary-soft) 100%)`,
        }}
      >
        <button
          onClick={() => navigate({ to: "/map" })}
          className="inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-[var(--shadow-card)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 返回職圖
        </button>
        <div className="mt-5">
          <Badge variant="secondary" className="text-[10px]">
            {CATEGORY_META[mentor.category].label}
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {mentor.name}
          </h1>
          <p className="mt-1 text-base font-semibold text-foreground/80">
            {mentor.job} · {mentor.years} 年
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/70">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {mentor.region}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                mentor.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {mentor.available ? "可預約" : "排隊中"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 pt-6">
        {/* Bio */}
        <Section icon={<Sparkles className="h-4 w-4" />} title="職人介紹">
          <p className="text-sm leading-relaxed text-foreground/90">{mentor.bio}</p>
        </Section>

        {/* Day in life */}
        <Section icon={<Clock className="h-4 w-4" />} title="一天工作長什麼樣">
          <ol className="space-y-3">
            {mentor.dayInLife.map((step, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Real talk */}
        <div className="rounded-2xl border border-border bg-primary-soft p-5">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-deep">
            <Quote className="h-3.5 w-3.5" /> 這份工作最真實的一面
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">"{mentor.realTalk}"</p>
        </div>

        {/* Fit traits */}
        <Section icon={<Heart className="h-4 w-4" />} title="適合的人格特質">
          <div className="flex flex-wrap gap-2">
            {mentor.fitTraits.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>

        {/* Experience */}
        <Section icon={<Sparkles className="h-4 w-4" />} title="體驗活動內容">
          <p className="text-sm leading-relaxed text-foreground/90">{mentor.experience}</p>
        </Section>
      </div>

      {/* Floating CTA */}
      {step === "idle" && (
        <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-5">
          <Button
            className="w-full bg-[image:var(--gradient-hero)] text-base shadow-[var(--shadow-float)]"
            size="lg"
            onClick={() => setStep("type")}
            disabled={!mentor.available}
          >
            {mentor.available ? "報名體驗" : "目前無可預約時段"}
          </Button>
        </div>
      )}

      {/* Booking sheet */}
      {step !== "idle" && (
        <div
          className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
          onClick={() => step !== "done" && resetAll()}
        >
          <div
            className="absolute bottom-0 left-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-3xl bg-card p-6 shadow-[var(--shadow-float)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

            {step === "type" && (
              <div>
                <h2 className="text-lg font-bold">選擇預約方式</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  你是個人想體驗，還是老師幫班級報名？
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      setBookingType("individual");
                      setStep("slot");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary-soft"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                      <User className="h-5 w-5 text-primary-deep" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">個人預約</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        以個人身分參加一場職涯體驗
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setBookingType("class");
                      setStep("slot");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary-soft"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                      <Users className="h-5 w-5 text-primary-deep" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">老師幫班級預約</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        為班級安排一場團體職涯體驗
                      </div>
                    </div>
                  </button>
                </div>
                <Button variant="ghost" className="mt-4 w-full" onClick={resetAll}>
                  取消
                </Button>
              </div>
            )}

            {step === "slot" && (
              <div>
                <h2 className="text-lg font-bold">選擇體驗時段</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {bookingType === "class" ? "為班級安排與" : "與"} {mentor.name} 的時間
                </p>
                <div className="mt-4 space-y-2">
                  {mentor.slots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSlot(s);
                        setStep("form");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary-soft"
                    >
                      <div>
                        <div className="text-sm font-semibold">{s.date}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{s.time}</div>
                      </div>
                      <Calendar className="h-4 w-4 text-primary-deep" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 w-full" onClick={() => setStep("type")}>
                  上一步
                </Button>
              </div>
            )}

            {step === "form" && slot && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-lg font-bold">
                  {bookingType === "class" ? "填寫班級報名資料" : "填寫報名資料"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {slot.date} · {slot.time}
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="name">
                      {bookingType === "class" ? "帶隊老師姓名" : "姓名"}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={bookingType === "class" ? "老師姓名" : "您的姓名"}
                      className="mt-1"
                    />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="contact">聯絡方式</Label>
                    <Input
                      id="contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Email 或手機"
                      className="mt-1"
                    />
                    {errors.contact && (
                      <p className="mt-1 text-xs text-destructive">{errors.contact}</p>
                    )}
                  </div>

                  {bookingType === "class" && (
                    <>
                      <div>
                        <Label htmlFor="school">學校</Label>
                        <Input
                          id="school"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="例：明德高中"
                          className="mt-1"
                        />
                        {errors.school && (
                          <p className="mt-1 text-xs text-destructive">{errors.school}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="className">班級</Label>
                          <Input
                            id="className"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="例：二年三班"
                            className="mt-1"
                          />
                          {errors.className && (
                            <p className="mt-1 text-xs text-destructive">{errors.className}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="studentCount">學生人數</Label>
                          <Input
                            id="studentCount"
                            type="number"
                            min={1}
                            value={studentCount}
                            onChange={(e) => setStudentCount(e.target.value)}
                            placeholder="例：30"
                            className="mt-1"
                          />
                          {errors.studentCount && (
                            <p className="mt-1 text-xs text-destructive">{errors.studentCount}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-5 flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("slot")}>
                    上一步
                  </Button>
                  <Button type="submit" className="flex-1 bg-[image:var(--gradient-hero)]">
                    確認報名
                  </Button>
                </div>
              </form>
            )}

            {step === "done" && slot && (
              <div className="py-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
                  <CheckCircle2 className="h-8 w-8 text-primary-deep" />
                </div>
                <h2 className="mt-4 text-lg font-bold">報名成功！</h2>
                <p className="mt-1 text-xs text-muted-foreground">我們會盡快與你聯繫確認細節</p>
                <div className="mt-5 rounded-xl bg-primary-soft p-4 text-left text-sm">
                  <Row
                    label="預約類型"
                    value={bookingType === "class" ? "老師・班級預約" : "個人預約"}
                  />
                  <Row label="職人" value={`${mentor.name}・${mentor.job}`} />
                  <Row label="時段" value={`${slot.date} ${slot.time}`} />
                  <Row
                    label={bookingType === "class" ? "帶隊老師" : "姓名"}
                    value={name}
                  />
                  <Row label="聯絡" value={contact} />
                  {bookingType === "class" && (
                    <>
                      <Row label="學校" value={school} />
                      <Row label="班級" value={`${className}・${studentCount} 人`} />
                    </>
                  )}
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetAll}>
                    關閉
                  </Button>
                  <Button
                    className="flex-1 bg-[image:var(--gradient-hero)]"
                    onClick={() => navigate({ to: "/map" })}
                  >
                    回到職圖
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary-deep">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
