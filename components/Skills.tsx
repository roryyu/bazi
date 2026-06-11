"use client";

import { motion } from "framer-motion";
import {
  Users,
  Layers,
  Monitor,
  Server,
  Brain,
  Shield,
  Workflow,
  Code2,
  Zap,
  Settings,
} from "lucide-react";

const skillCategories = [
  {
    title: "技术管理",
    icon: Users,
    color: "#2563eb",
    skills: [
      "技术团队管理(35-50人规模)",
      "研发效能提升",
      "IPD项目管理",
      "SAFe敏捷方法",
      "跨部门协作",
      "供应商管理",
      "质量管理体系",
      "客户需求管理与交付",
    ],
  },
  {
    title: "架构设计",
    icon: Layers,
    color: "#6366f1",
    skills: [
      "零信任架构",
      "低代码平台",
      "元模型驱动架构",
      "微服务架构",
      "前后端分离架构",
      "RESTful API设计",
      "系统高可用与高扩展性设计",
    ],
  },
  {
    title: "前端开发",
    icon: Monitor,
    color: "#10b981",
    skills: [
      "React",
      "Vue",
      "Egg.js",
      "LoopBack",
      "Ant Design",
      "ElementUI",
      "Webpack",
      "Vite",
      "前端工程化",
      "组件化开发",
      "性能优化",
    ],
  },
  {
    title: "后端开发",
    icon: Server,
    color: "#f59e0b",
    skills: [
      "PHP HHVM",
      "Java Spring",
      "Node.js",
      "REST接口设计",
      "数据库设计与优化",
      "系统集成",
    ],
  },
  {
    title: "AI开发",
    icon: Brain,
    color: "#ec4899",
    skills: [
      "Langchain",
      "AI Agent开发",
      "ONNX模型部署与应用",
      "Transformers(JS/Python)",
      "Dify平台定制与二开",
      "Prompt Engineering",
      "RAG知识库",
      "MCP工具链",
    ],
  },
];

const managementHighlights = [
  { icon: Shield, label: "零信任架构", desc: "企业级安全架构设计与落地" },
  { icon: Workflow, label: "IPD + SAFe", desc: "IPD流程与SAFe敏捷方法结合" },
  { icon: Code2, label: "AI编程", desc: "推动AI编程与ONNX模型落地" },
  { icon: Settings, label: "自工序完结", desc: "研发过程质量管控机制" },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/5 border border-success/10 text-success text-sm font-medium mb-4">
            <Zap size={16} />
            核心能力
          </div>
          <h2 className="text-4xl font-bold text-foreground">核心技能</h2>
          <p className="text-muted mt-3 max-w-2xl mx-auto">
            覆盖技术管理、架构设计、全栈开发与AI应用的复合型能力体系
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {skillCategories.map((category, i) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2.5 rounded-xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-sm border transition-colors hover:border-current"
                      style={{
                        color: category.color,
                        backgroundColor: `${category.color}08`,
                        borderColor: `${category.color}15`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {managementHighlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-5 rounded-2xl bg-white border border-border text-center hover:shadow-md hover:border-primary/15 transition-all"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/5 text-primary mb-3">
                  <Icon size={22} />
                </div>
                <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                <p className="text-xs text-muted mt-1">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
