"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, GitFork, ExternalLink, Heart } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-4">
            <Mail size={16} />
            联系方式
          </div>
          <h2 className="text-4xl font-bold text-foreground">期待与您合作</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            无论是技术管理、架构设计还是AI应用开发，都欢迎随时联系
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              { icon: Phone, label: "电话", value: "15000057727", href: "tel:15000057727" },
              { icon: Mail, label: "邮箱", value: "568341288@qq.com", href: "mailto:568341288@qq.com" },
              { icon: MapPin, label: "所在地", value: "上海市", href: null },
              { icon: GitFork, label: "GitHub", value: "github.com/roryyu", href: "https://github.com/roryyu" },
            ].map((item, i) => {
              const Icon = item.icon;
              const content = (
                <div className="p-5 rounded-2xl bg-white border border-border hover:shadow-md hover:border-primary/20 transition-all flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider">{item.label}</div>
                    <div className="text-foreground font-medium text-sm mt-0.5">{item.value}</div>
                  </div>
                  {item.href && <ExternalLink size={14} className="ml-auto text-muted" />}
                </div>
              );

              return item.href ? (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="block"
                >
                  {content}
                </motion.a>
              ) : (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  {content}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-border pt-8 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <span>© 2026 郁辰磊</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                Built with <Heart size={12} className="text-red-400" /> Next.js
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/roryyu" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                GitHub
              </a>
              <a href="https://www.edudream.cn" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                EduDream
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
