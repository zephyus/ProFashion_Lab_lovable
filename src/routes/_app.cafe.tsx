import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  Heart,
  MessageCircle,
  MessagesSquare,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { logActivity, useTrackVisit } from "@/hooks/useActivity";

export const Route = createFileRoute("/_app/cafe")({
  head: () => ({ meta: [{ title: "職業咖啡館 — 職感 Zhigan" }] }),
  component: CafePage,
});

type LoungeId = "career" | "parent";

type Comment = {
  id: string;
  user: string;
  text: string;
};

type Post = {
  id: number;
  lounge: LoungeId;
  author: string;
  role: string;
  company: string;
  years: string;
  headline: string;
  content: string;
  note: string;
  topic: string;
  tags: string[];
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
};

const STORAGE_KEY = "pfl_cafe_feed_v3";

const LOUNGES = {
  career: {
    label: "職人前線",
    icon: BriefcaseBusiness,
    eyebrow: "真實工作現場",
    description: "直接看正在做事的人怎麼拆解日常、選題與壓力。",
    stats: ["真實工作節奏", "作品集判準", "跨域轉職經驗"],
  },
  parent: {
    label: "家長交流區",
    icon: UsersRound,
    eyebrow: "家庭支持現場",
    description: "把升學焦慮、探索節奏與家庭支持方式攤開來談。",
    stats: ["家庭對話方法", "升學節奏判斷", "資源與界線"],
  },
} as const;

const TOPICS: Record<LoungeId, { id: string; label: string }[]> = {
  career: [
    { id: "workday", label: "工作節奏" },
    { id: "portfolio", label: "作品集" },
    { id: "transition", label: "實習與轉職" },
  ],
  parent: [
    { id: "motivation", label: "學習動機" },
    { id: "path", label: "升學路徑" },
    { id: "support", label: "家庭支持" },
  ],
};

const DEFAULT_TOPIC: Record<LoungeId, string> = {
  career: "workday",
  parent: "motivation",
};

const SEED_POSTS: Post[] = [
  {
    id: 1,
    lounge: "career",
    author: "Amy",
    role: "UX 設計師",
    company: "新創公司",
    years: "3 年",
    headline: "改稿最累的不是次數，而是沒抓到問題核心",
    content:
      "我每天都在把抽象的需求翻成可以交付的畫面。真正難的不是畫得漂亮，而是知道哪一段流程會讓使用者猶豫，然後跟 PM 與工程一起把它拆乾淨。",
    note: "如果你在做作品集，請把決策過程寫出來，不要只放最後一張漂亮截圖。",
    topic: "portfolio",
    tags: ["介面設計", "協作", "作品集"],
    likes: 124,
    liked: false,
    saved: true,
    comments: [{ id: "c-1", user: "高二學生", text: "作品集一定要放完整專案嗎？還是片段也可以？" }],
  },
  {
    id: 2,
    lounge: "career",
    author: "Kevin",
    role: "後端工程師",
    company: "外商團隊",
    years: "5 年",
    headline: "工程師不是整天寫 code，對齊問題反而更花時間",
    content:
      "我真正花最多腦力的時候，是在開會把需求講清楚，或在 incident 發生時先判斷該停什麼、補什麼。寫 code 是手段，拆問題才是主體。",
    note: "想走工程，不要只練題。把你怎麼定位錯誤、怎麼講清楚方案，也一起練起來。",
    topic: "workday",
    tags: ["工程", "溝通", "問題拆解"],
    likes: 89,
    liked: false,
    saved: false,
    comments: [],
  },
  {
    id: 3,
    lounge: "career",
    author: "小柔",
    role: "品牌企劃",
    company: "零售品牌",
    years: "2 年",
    headline: "企劃不是一直發想，而是把想法磨到可以落地",
    content:
      "我的工作大半時間都在追時程、對細節、確認門市和社群能不能真的執行。創意重要，但能不能順利上線、讓各部門跟得上，才決定提案值不值得做。",
    note: "如果你對企劃有興趣，先學會把一個點子寫成可執行的清單。",
    topic: "transition",
    tags: ["企劃", "協調", "提案"],
    likes: 76,
    liked: true,
    saved: false,
    comments: [{ id: "c-2", user: "大一新生", text: "如果我現在還不會簡報，先練什麼最有幫助？" }],
  },
  {
    id: 4,
    lounge: "parent",
    author: "陳媽媽",
    role: "高一家長",
    company: "關心探索節奏",
    years: "本學期",
    headline: "孩子說什麼都可以，但其實什麼都沒開始",
    content:
      "我不是要他現在就決定未來，而是怕他一直停在『我再看看』。想問其他家長，你們怎麼區分這是需要時間，還是其實缺少外部推動？",
    note: "這類問題通常不是催促能解決，先把節奏拆成一週能完成的小任務比較有效。",
    topic: "motivation",
    tags: ["高一", "動機", "節奏感"],
    likes: 58,
    liked: false,
    saved: false,
    comments: [
      { id: "c-3", user: "林爸爸", text: "我們家先約定每週只做一件探索任務，壓力會小很多。" },
    ],
  },
  {
    id: 5,
    lounge: "parent",
    author: "林爸爸",
    role: "國三家長",
    company: "準備升學選擇",
    years: "倒數 1 年",
    headline: "升學不是只有成績，孩子對學群的想像也要一起補",
    content:
      "最近發現孩子把很多科系想成課名的延伸，對未來工作方式幾乎沒有畫面。我開始要求自己少用『這個比較穩』去說服，而是一起看真實工作內容。",
    note: "如果要陪孩子選科系，先補工作世界的理解，再談志願排序，效果會更實際。",
    topic: "path",
    tags: ["國三", "學群", "志願"],
    likes: 73,
    liked: true,
    saved: true,
    comments: [{ id: "c-4", user: "陳媽媽", text: "這句很有感，我也開始少講穩定、多講適合。" }],
  },
  {
    id: 6,
    lounge: "parent",
    author: "白小姐",
    role: "雙語家庭家長",
    company: "陪伴型支持",
    years: "持續中",
    headline: "支持不等於代辦，界線沒畫好很容易變成互相消耗",
    content:
      "我以前會幫孩子整理所有資料，後來發現他越來越像在等我開下一個任務。現在改成我只幫他確認節點，執行內容由他自己處理，家庭氣氛反而穩下來。",
    note: "家長最重要的是節點支持與情緒容器，不是接手整個探索流程。",
    topic: "support",
    tags: ["界線", "自主", "陪伴"],
    likes: 91,
    liked: false,
    saved: false,
    comments: [],
  },
];

function cloneSeedPosts() {
  return JSON.parse(JSON.stringify(SEED_POSTS)) as Post[];
}

function readPosts() {
  if (typeof window === "undefined") return cloneSeedPosts();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeedPosts();
    const parsed = JSON.parse(raw) as Post[];
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneSeedPosts();
    return parsed;
  } catch {
    return cloneSeedPosts();
  }
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

function CafePage() {
  useTrackVisit("cafe");

  const [posts, setPosts] = useState<Post[]>(() => readPosts());
  const [activeLounge, setActiveLounge] = useState<LoungeId>("career");
  const [activeTopic, setActiveTopic] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [composerDraft, setComposerDraft] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const loungeMeta = LOUNGES[activeLounge];
  const topicOptions = TOPICS[activeLounge];

  const loungePosts = posts.filter((post) => post.lounge === activeLounge);
  const visiblePosts = loungePosts.filter((post) => {
    const matchesTopic = activeTopic === "all" || post.topic === activeTopic;
    const matchesSaved = !savedOnly || post.saved;
    return matchesTopic && matchesSaved;
  });

  const totalReplies = loungePosts.reduce((sum, post) => sum + post.comments.length, 0);
  const savedCount = loungePosts.filter((post) => post.saved).length;

  function setLounge(next: LoungeId) {
    if (next === activeLounge) return;
    setActiveLounge(next);
    setActiveTopic("all");
    setSavedOnly(false);
    setOpenId(null);
    setComposerDraft("");
    logActivity({ station: "cafe", type: "switch_lounge", detail: LOUNGES[next].label });
  }

  function setTopic(next: string) {
    setActiveTopic(next);
    logActivity({
      station: "cafe",
      type: "filter_topic",
      detail: `${loungeMeta.label}・${next === "all" ? "全部主題" : (topicOptions.find((topic) => topic.id === next)?.label ?? next)}`,
    });
  }

  function toggleSavedOnly() {
    setSavedOnly((current) => {
      const next = !current;
      logActivity({
        station: "cafe",
        type: "toggle_saved_filter",
        detail: next ? `${loungeMeta.label}・只看收藏` : `${loungeMeta.label}・顯示全部`,
      });
      return next;
    });
  }

  function toggleLike(id: number) {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== id) return post;
        const liked = !post.liked;
        if (liked) {
          logActivity({
            station: "cafe",
            type: "like_post",
            detail: `按讚 ${post.author}・${post.headline}`,
          });
        }
        return { ...post, liked, likes: post.likes + (liked ? 1 : -1) };
      }),
    );
  }

  function toggleSave(id: number) {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== id) return post;
        const saved = !post.saved;
        logActivity({
          station: "cafe",
          type: saved ? "save_post" : "unsave_post",
          detail: `${post.author}・${post.headline}`,
        });
        return { ...post, saved };
      }),
    );
  }

  function toggleComments(id: number) {
    setOpenId((current) => {
      const next = current === id ? null : id;
      if (next === id) {
        const post = posts.find((item) => item.id === id);
        if (post) {
          logActivity({
            station: "cafe",
            type: "open_thread",
            detail: `${post.author}・${post.headline}`,
          });
        }
      }
      return next;
    });
  }

  function updateCommentDraft(id: number, value: string) {
    setCommentDrafts((current) => ({ ...current, [id]: value }));
  }

  function submitComment(id: number) {
    const text = commentDrafts[id]?.trim();
    if (!text) return;

    const post = posts.find((item) => item.id === id);
    if (!post) return;

    setPosts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `${Date.now()}-${id}`,
                  user: activeLounge === "parent" ? "匿名家長" : "你",
                  text,
                },
              ],
            }
          : item,
      ),
    );

    setCommentDrafts((current) => ({ ...current, [id]: "" }));
    logActivity({
      station: "cafe",
      type: "comment",
      detail: `對 ${post.author}：${text.slice(0, 30)}`,
    });
  }

  function submitPost() {
    const text = composerDraft.trim();
    if (!text) return;

    const topicId = activeTopic === "all" ? DEFAULT_TOPIC[activeLounge] : activeTopic;
    const topicLabel = topicOptions.find((topic) => topic.id === topicId)?.label ?? "新話題";
    const headline = text.length > 28 ? `${text.slice(0, 28)}…` : text;

    const newPost: Post = {
      id: Date.now(),
      lounge: activeLounge,
      author: activeLounge === "parent" ? "匿名家長" : "你",
      role: activeLounge === "parent" ? "家庭提問" : "探索中的學生",
      company: activeLounge === "parent" ? "剛開一桌" : "剛發起討論",
      years: "剛剛",
      headline,
      content: text,
      note:
        activeLounge === "parent"
          ? "先把問題說具體，會比直接問該不該更容易收到有用回覆。"
          : "把你已經做過的嘗試寫進來，職人通常更能給出可執行建議。",
      topic: topicId,
      tags: [topicLabel, activeLounge === "parent" ? "家長新帖" : "新提問"],
      likes: 0,
      liked: false,
      saved: false,
      comments: [],
    };

    setPosts((current) => [newPost, ...current]);
    setComposerDraft("");
    setOpenId(newPost.id);
    logActivity({
      station: "cafe",
      type: "publish_post",
      detail: `${loungeMeta.label}：${headline}`,
    });
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)] px-5 pb-28 pt-10 text-foreground animate-page">
      <header className="animate-rise">
        <p className="text-caption font-bold uppercase tracking-widest text-primary-deep">
          職業咖啡館
        </p>

        <div className="mt-4 rounded-[26px] bg-[image:var(--gradient-hero)] px-5 py-5 text-primary-foreground shadow-[var(--shadow-float)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {loungeMeta.eyebrow}
              </p>
              <h1 className="mt-2 text-title-2">{loungeMeta.label}</h1>
              <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-white/82">
                {loungeMeta.description}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 p-3">
              <loungeMeta.icon className="h-6 w-6" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-2.5">
              <p className="text-[10px] text-white/68">正在開聊</p>
              <p className="mt-1 text-[22px] font-bold tabular-nums">{loungePosts.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5">
              <p className="text-[10px] text-white/68">累計回覆</p>
              <p className="mt-1 text-[22px] font-bold tabular-nums">{totalReplies}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5">
              <p className="text-[10px] text-white/68">收藏中</p>
              <p className="mt-1 text-[22px] font-bold tabular-nums">{savedCount}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-5 animate-rise" style={{ animationDelay: "70ms" }}>
        <div className="rounded-[22px] border border-border bg-card p-2 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(LOUNGES) as [LoungeId, (typeof LOUNGES)[LoungeId]][]).map(
              ([id, meta]) => {
                const active = id === activeLounge;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLounge(id)}
                    className={`press flex items-start gap-3 rounded-[18px] px-4 py-3 text-left transition-colors ${
                      active
                        ? "bg-primary-soft text-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <meta.icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-foreground">
                        {meta.label}
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
                        {meta.stats.join("・")}
                      </span>
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 animate-rise" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-deep">
              主題篩選
            </p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              先收窄問題，再看你現在最需要的角度。
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSavedOnly}
            className={`press inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[12px] font-semibold transition-colors ${
              savedOnly
                ? "border-primary bg-primary-soft text-primary-deep"
                : "border-border bg-card text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${savedOnly ? "fill-current" : ""}`}
              strokeWidth={1.9}
            />
            {savedOnly ? "只看收藏中" : "查看收藏"}
          </button>
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setTopic("all")}
            className={`press shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
              activeTopic === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground shadow-[var(--shadow-card)]"
            }`}
          >
            全部主題
          </button>
          {topicOptions.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setTopic(topic.id)}
              className={`press shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                activeTopic === topic.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-[var(--shadow-card)]"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 animate-rise" style={{ animationDelay: "180ms" }}>
        <div className="rounded-[24px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
              <MessagesSquare className="h-4.5 w-4.5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-foreground">
                {activeLounge === "parent" ? "開一桌家長問題" : "開一桌職涯提問"}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {activeLounge === "parent"
                  ? "把你目前卡住的家庭情境寫清楚，其他家長和職人比較能回到具體處境回覆。"
                  : "把你已經看過、做過、卡住的點一次寫出來，回覆品質會明顯更高。"}
              </p>
            </div>
          </div>

          <textarea
            value={composerDraft}
            onChange={(event) => setComposerDraft(event.target.value)}
            placeholder={
              activeLounge === "parent"
                ? "例如：孩子說對設計有興趣，但一提到做作品集就拖延，我應該先推進還是先讓他看更多職涯內容？"
                : "例如：我對 UX 有興趣，但不知道作品集該先做完整專案還是先拆小題目，想聽真實工作端的判準。"
            }
            className="mt-3 min-h-[112px] w-full rounded-[20px] border border-border bg-muted/45 px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors focus:border-primary"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary-deep" strokeWidth={2} />
              {activeLounge === "parent" ? "建議聚焦一個家庭情境" : "建議先寫你已做過的嘗試"}
            </div>
            <button
              type="button"
              onClick={submitPost}
              disabled={!composerDraft.trim()}
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground disabled:opacity-45"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
              發布話題
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {visiblePosts.length === 0 ? (
          <div className="animate-rise rounded-[24px] border border-dashed border-border bg-card/80 px-5 py-10 text-center shadow-[var(--shadow-card)]">
            <Sparkles className="mx-auto h-8 w-8 text-primary-deep" strokeWidth={1.8} />
            <p className="mt-3 text-[16px] font-semibold text-foreground">目前沒有符合篩選的討論</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              先清掉收藏或主題條件，或直接發布一則新問題。
            </p>
            <button
              type="button"
              onClick={() => {
                setSavedOnly(false);
                setActiveTopic("all");
              }}
              className="press mt-4 rounded-full bg-primary-soft px-4 py-2 text-[12px] font-semibold text-primary-deep"
            >
              重置篩選
            </button>
          </div>
        ) : (
          visiblePosts.map((post, index) => (
            <article
              key={post.id}
              className="animate-rise overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]"
              style={{ animationDelay: `${220 + index * 45}ms` }}
            >
              <div className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-hero)] text-[15px] font-semibold text-primary-foreground">
                    {initials(post.author)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold text-foreground">
                          {post.author}
                        </p>
                        <p className="truncate text-[12px] text-muted-foreground">
                          {post.role}・{post.company}・{post.years}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSave(post.id)}
                        aria-label={post.saved ? "取消收藏" : "收藏這則討論"}
                        className={`press flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                          post.saved
                            ? "border-primary bg-primary-soft text-primary-deep"
                            : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`}
                          strokeWidth={1.9}
                        />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary-deep"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <h2 className="mt-4 text-[19px] font-semibold leading-snug text-foreground">
                  {post.headline}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/88">
                  {post.content}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {post.note}
                </p>
              </div>

              <div className="border-t border-border bg-muted/35 px-4 py-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    aria-pressed={post.liked}
                    className={`press flex h-11 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors ${
                      post.liked
                        ? "bg-rose-50 text-rose-600"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`}
                      strokeWidth={1.85}
                    />
                    {post.likes}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="press flex h-11 items-center justify-center gap-2 rounded-full bg-card text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={1.85} />
                    {post.comments.length}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setComposerDraft(`回到這桌追問：${post.headline}\n\n我目前的情況是：`)
                    }
                    className="press flex h-11 items-center justify-center gap-2 rounded-full bg-card text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <MessagesSquare className="h-4 w-4" strokeWidth={1.85} />
                    延伸提問
                  </button>
                </div>

                {openId === post.id && (
                  <div className="mt-3 rounded-[20px] bg-card px-3 py-3 shadow-[var(--shadow-card)]">
                    <div className="space-y-2">
                      {post.comments.length === 0 ? (
                        <p className="text-[12px] leading-relaxed text-muted-foreground">
                          這桌還沒有回覆。你可以先補充自己的情境，通常更容易換到具體答案。
                        </p>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="rounded-2xl bg-muted/55 px-3 py-2.5">
                            <p className="text-[12px] font-semibold text-primary-deep">
                              {comment.user}
                            </p>
                            <p className="mt-1 text-[13px] leading-relaxed text-foreground">
                              {comment.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={commentDrafts[post.id] ?? ""}
                        onChange={(event) => updateCommentDraft(post.id, event.target.value)}
                        placeholder={
                          activeLounge === "parent" ? "補充你的家庭情境" : "補充你的問題或回應"
                        }
                        className="h-10 flex-1 rounded-full border border-border bg-muted/35 px-4 text-[13px] outline-none transition-colors focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => submitComment(post.id)}
                        aria-label="送出留言"
                        className="press flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Send className="h-4 w-4" strokeWidth={1.9} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
