"use client";

import { motion } from "framer-motion";
import {
  Brain,
  ExternalLink,
  Rss,
  Search,
  BarChart3,
  Cpu,
  FileText,
  Palette,
  Database,
  Mic,
  Radio,
  Sparkles,
  Music,
} from "lucide-react";

const projects = [
  {
    title: "Soulmates - 数字疗愈音乐生产平台",
    role: "2026.06 - 至今",
    link: "https://www.soulmates.org.cn/",
    description:
      "通过Minimax音乐模型应用生成音乐素材，同时构建自然语言音乐编辑能力，实现工业化精准音乐生产。企业版本研发完成已上线，目前正在试用中。",
    tags: ["Minimax", "AI音乐生成", "自然语言编辑", "B端产品"],
  },
  {
    title: "EduDream - AI教育产品",
    role: "2026.04 - 至今",
    link: "https://www.edudream.cn",
    description:
      "RAG知识库产品，基于DeepSeek V3和doubao-embedding-text模型，实现中小学教师课程论文Agent。3周完成初版开发，上线2周获300+位付费用户。目前toB版本已研发完成，进入市场推广阶段。",
    tags: ["DeepSeek", "RAG", "AI Agent", "Prompt Engineering", "用户增长"],
  },
];

const skills = [
  { name: "china-rss-feed", desc: "中文RSS订阅聚合", url: "https://clawhub.ai/roryyu/china-rss-feed", icon: Rss },
  { name: "websearch-free-skill", desc: "免费Web搜索能力", url: "https://clawhub.ai/roryyu/websearch-free-skill", icon: Search },
  { name: "sre-log-analytics", desc: "SRE日志智能分析", url: "https://clawhub.ai/roryyu/sre-log-analytics", icon: BarChart3 },
  { name: "self-distill", desc: "自蒸馏能力", url: "https://skillhub.cn/skills/self-distill", icon: Cpu },
  { name: "create-index", desc: "wiki llm索引自动生成", url: "https://skillhub.cn/skills/create-index", icon: FileText },
  { name: "text-art", desc: "文本艺术生成", url: "https://skillhub.cn/skills/text-art", icon: Palette },
  { name: "forget-something", desc: "记忆管理插件", url: "https://clawhub.ai/roryyu/forget-something", icon: Database },
];

const community = [
  {
    text: "参与多个AI线下社群技术分享，作为米柚club等自媒体技术讲师参与线下OpenClaw活动",
    icon: Sparkles,
  },
  {
    text: "录制AI Agent主题播客（2期）",
    links: [
      { label: "第1期", url: "https://www.xiaoyuzhoufm.com/episode/69bb9bea3c625cc5ae183509" },
      { label: "第2期", url: "https://www.xiaoyuzhoufm.com/episode/69f379685390b7cc92853585" },
    ],
    icon: Mic,
  },
  {
    text: "AI主题技术直播回放",
    link: "https://weixin.qq.com/sph/AZCqIJrdtZ",
    icon: Radio,
  },
];

export default function AIProjects() {
  return (
    <section id="ai-projects" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 text-accent text-sm font-medium mb-4">
            <Brain size={16} />
            AI & 开源
          </div>
          <h2 className="text-4xl font-bold text-foreground">AI项目与开源贡献</h2>
          <p className="text-muted mt-3 max-w-2xl mx-auto">
            专注于AI Agent应用开发，独立开发AI教育及音乐产品，并积极贡献开源社区
          </p>
        </motion.div>

        <div className="space-y-16">
          {projects.map((project) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-foreground">{project.title}</h3>
                      <span className="px-3 py-0.5 rounded-full bg-primary/5 text-primary text-xs font-medium border border-primary/10">
                        {project.role}
                      </span>
                    </div>
                    <p className="text-muted leading-relaxed max-w-3xl">{project.description}</p>
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-shadow"
                  >
                    访问产品
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-surface-alt text-muted text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-accent" />
              Skills 开发
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, i) => {
                const Icon = skill.icon;
                return (
                  <motion.a
                    key={skill.name}
                    href={skill.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group p-5 rounded-2xl bg-white border border-border hover:border-primary/20 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {skill.name}
                        </div>
                        <div className="text-sm text-muted mt-0.5">{skill.desc}</div>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Radio size={20} className="text-accent" />
              AI技术社区影响力
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {community.map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <div className="p-5 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow h-full">
                    <div className="p-2 rounded-lg bg-accent/5 text-accent w-fit mb-3">
                      <Icon size={18} />
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{item.text}</p>
                    {item.links && (
                      <div className="flex gap-2 mt-2">
                        {item.links.map((l) => (
                          <a
                            key={l.url}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
                return item.link ? (
                  <motion.a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="block hover:border-primary/20"
                  >
                    {content}
                  </motion.a>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    {content}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
