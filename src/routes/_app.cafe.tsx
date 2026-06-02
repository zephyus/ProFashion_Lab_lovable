import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Send, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/cafe")({
  head: () => ({ meta: [{ title: "故事 — 職感 Zhígǎn" }] }),
  component: CafePage,
});

type Post = {
  id: number;
  author: string;
  role: string;
  company: string;
  content: string;
  likes: number;
  comments: { user: string; text: string }[];
  liked: boolean;
};

const initial: Post[] = [
  {
    id: 1, author: "Amy", role: "UX 設計師", company: "新創公司 3 年",
    content: "最累的不是改稿，是改完之後客戶說『還是回到第一版好了』。但看到使用者真的因為設計而完成事情，那種滿足感真的無可取代。",
    likes: 124, liked: false,
    comments: [{ user: "學生A", text: "想請問非本科怎麼入行？" }],
  },
  {
    id: 2, author: "Kevin", role: "後端工程師", company: "外商 5 年",
    content: "工程師不是宅男專利。我每天最多時間在開會、寫文件、跟產品經理吵架。寫 code 反而是放鬆。",
    likes: 89, liked: false, comments: [],
  },
  {
    id: 3, author: "小柔", role: "護理師", company: "醫學中心 2 年",
    content: "夜班真的會把人榨乾，但每次病人康復出院跟你說謝謝，就會覺得這份工作有意義。",
    likes: 201, liked: true, comments: [{ user: "學生B", text: "請問值班制度怎麼安排？" }],
  },
];

function CafePage() {
  const [posts, setPosts] = useState(initial);
  const [openId, setOpenId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const toggleLike = (id: number) => setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x));
  const addComment = (id: number) => {
    if (!draft.trim()) return;
    setPosts((p) => p.map((x) => x.id === id ? { ...x, comments: [...x.comments, { user: "你", text: draft }] } : x));
    setDraft("");
  };

  return (
    <div className="px-5 pt-10 animate-page">
      <header className="mb-7 animate-rise">
        <p className="text-subhead uppercase tracking-widest text-primary-deep">職業咖啡館</p>
        <p className="mt-3 text-body text-muted-foreground">
          那些職涯講座不會告訴你的事，由真正在做的人親口說。
        </p>
      </header>

      <div className="space-y-3">
        {posts.map((p, i) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-border bg-card animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3 px-4 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--gradient-hero)] text-callout font-semibold text-primary-foreground">
                {p.author[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-subhead font-semibold">{p.author}</p>
                <p className="flex items-center gap-1 text-caption">
                  <Briefcase className="h-3 w-3" strokeWidth={1.7} />{p.role} · {p.company}
                </p>
              </div>
            </div>
            <p className="px-4 py-3 text-body leading-relaxed">{p.content}</p>
            <div className="flex items-center gap-5 border-t border-border px-4 py-2.5 text-footnote">
              <button
                onClick={() => toggleLike(p.id)}
                className={`press flex items-center gap-1.5 ${p.liked ? "text-destructive" : "text-muted-foreground"}`}
                aria-pressed={p.liked}
              >
                <Heart className={`h-[18px] w-[18px] ${p.liked ? "fill-current" : ""}`} strokeWidth={1.7} /> {p.likes}
              </button>
              <button
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
                className="press flex items-center gap-1.5 text-muted-foreground"
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.7} /> {p.comments.length}
              </button>
            </div>

            {openId === p.id && (
              <div className="border-t border-border bg-muted/50 px-4 py-3 animate-rise">
                <div className="space-y-2">
                  {p.comments.length === 0 && <p className="text-caption">還沒有人提問。第一個來開頭吧。</p>}
                  {p.comments.map((c, idx) => (
                    <div key={idx} className="rounded-xl bg-card px-3 py-2 text-footnote">
                      <span className="font-semibold text-primary-deep">{c.user}：</span>{c.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="想問前輩什麼？"
                    className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-footnote outline-none transition-colors focus:border-primary"
                  />
                  <button
                    onClick={() => addComment(p.id)}
                    aria-label="送出"
                    className="press flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Send className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <p className="my-8 text-center text-caption">已經是目前的全部 · 更多前輩持續加入中</p>
    </div>
  );
}
