import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Send, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/cafe")({
  head: () => ({ meta: [{ title: "職業咖啡館" }] }),
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
    <div className="px-5 pt-12">
      <header className="mb-5">
        <h1 className="text-3xl font-bold tracking-tight">職業咖啡館</h1>
        <p className="mt-1 text-sm text-muted-foreground">真實前輩的職場心得，點開來聊聊。</p>
      </header>

      <div className="space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 px-5 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground font-bold">
                {p.author[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.author}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />{p.role} · {p.company}
                </p>
              </div>
            </div>
            <p className="px-5 py-4 text-[15px] leading-relaxed">{p.content}</p>
            <div className="flex items-center gap-4 border-t border-border px-5 py-3 text-sm">
              <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 transition-colors ${p.liked ? "text-destructive" : "text-muted-foreground"}`}>
                <Heart className={`h-4 w-4 ${p.liked ? "fill-current" : ""}`} /> {p.likes}
              </button>
              <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="flex items-center gap-1.5 text-muted-foreground">
                <MessageCircle className="h-4 w-4" /> {p.comments.length}
              </button>
            </div>

            {openId === p.id && (
              <div className="border-t border-border bg-primary-soft/40 px-5 py-4">
                <div className="space-y-2.5">
                  {p.comments.length === 0 && <p className="text-xs text-muted-foreground">還沒有提問，第一個來互動吧。</p>}
                  {p.comments.map((c, i) => (
                    <div key={i} className="rounded-2xl bg-card px-3 py-2 text-sm">
                      <span className="font-semibold text-primary-deep">{c.user}：</span>{c.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="想問前輩什麼？"
                    className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button onClick={() => addComment(p.id)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
