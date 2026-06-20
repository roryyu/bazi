"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Clock, Mail, MessageSquare } from "lucide-react";

interface Idea {
  id: string;
  email: string;
  description: string;
  createdAt: string;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/ideas");
      const data = await res.json();
      setIdeas(data);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "提交失败" });
      } else {
        setMessage({ type: "success", text: "已收录，感谢分享！" });
        setEmail("");
        setDescription("");
        setIdeas((prev) => [data, ...prev]);
      }
    } catch {
      setMessage({ type: "error", text: "网络错误，请重试" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-blue-600/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-500/30 to-transparent rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-sm text-zinc-400">无用之用</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent">
              没有商业价值<br />但有用的 AI 应用
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              这里收集那些不会被 VC 看上、不会有千万用户、<br />
              但或许能让一个人的生活变得更美好的小工具。
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Submit Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="sticky top-8">
              <div className="bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Send size={20} className="text-violet-400" />
                  提交你的想法
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                      <Mail size={14} />
                      邮箱（用于通知，不会公开）
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                      <MessageSquare size={14} />
                      需求描述
                      <span className="text-zinc-600 ml-auto">{description.length}/200</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                      placeholder="描述一个你想要的、但目前市面上没有的 AI 小工具..."
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="animate-pulse">提交中...</span>
                    ) : (
                      <>
                        <Send size={18} />
                        提交想法
                      </>
                    )}
                  </button>
                </form>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-4 p-4 rounded-xl text-sm ${
                        message.type === "success"
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Ideas List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles size={20} className="text-violet-400" />
                已收录的想法
                <span className="text-sm text-zinc-500 font-normal ml-2">({ideas.length})</span>
              </h2>
            </div>

            {ideas.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                <p>还没有想法，成为第一个分享的人吧</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {ideas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-xl p-5 hover:border-violet-500/30 transition-all"
                    >
                      <p className="text-zinc-200 leading-relaxed mb-4">
                        {idea.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 truncate max-w-[160px]">{idea.email}</span>
                        <span className="text-zinc-600 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(idea.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-600 text-sm">
        <p>无用之用 · 收集那些不会改变世界但能温暖人心的想法</p>
      </footer>
    </div>
  );
}
