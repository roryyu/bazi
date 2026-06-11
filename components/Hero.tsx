"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, GitFork, ExternalLink } from "lucide-react";

const roles = [
  "技术经理",
  "AI应用架构师",
  "AI Agent技术专家",
  "技术总监",
];

function useTypewriter(words: string[], speed = 150, pause = 2000) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === current) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      timer = setTimeout(
        () => {
          setText(
            isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)
          );
        },
        isDeleting ? speed / 2 : speed
      );
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, speed, pause]);

  return text;
}

const stats = [
  { value: "19+", label: "年工作经验" },
  { value: "8", label: "年团队管理" },
  { value: "50+", label: "人团队规模" },
  { value: "1300+", label: "服务客户" },
];

export default function Hero() {
  const typedText = useTypewriter(roles);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                开放求职机会
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                郁辰磊
              </h1>

              <div className="mt-4 text-2xl lg:text-3xl font-semibold h-10">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {typedText}
                </span>
                <span className="inline-block w-0.5 h-8 bg-primary ml-1 animate-pulse align-middle" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted text-lg leading-relaxed max-w-2xl"
            >
              15年前后端研发经验，8年技术团队管理经验，深耕企业数字化建设，覆盖电商、广告、教育、互联网、公安、5G等多个行业领域。擅长从用户场景、技术架构、业务流程与商业模式等多维度设计解决方案，并推动项目高效交付。
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-muted text-lg leading-relaxed max-w-2xl"
            >
              当前专注<span className="text-primary font-medium">AI Agent应用开发</span>与<span className="text-accent font-medium">AI Native工具链建设</span>，熟练掌握Langchain、ONNX模型Web应用、Transformers应用及AI Agent定制与二次开发。独立开发AI教育产品toC版本已上线，正在推动toB版本落地。活跃于AI开发者社区，参与线下技术分享、播客录制与直播。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: MapPin, text: "上海市" },
                { icon: Phone, text: "15000057727" },
                { icon: Mail, text: "568341288@qq.com" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-muted"
                >
                  <Icon size={15} className="text-primary" />
                  {text}
                </div>
              ))}
              <a
                href="https://github.com/roryyu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <GitFork size={15} />
                GitHub
                <ExternalLink size={12} />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10"
            >
              <div className="text-xs text-muted mb-2 uppercase tracking-wider">求职意向</div>
              <div className="flex flex-wrap gap-2">
                {["技术经理", "AI应用架构师", "技术总监", "AI Agent技术专家"].map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-full bg-white border border-primary/15 text-sm text-primary font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
