"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";

const education = [
  {
    school: "上海大学计算机学院",
    major: "软件工程",
    degree: "硕士",
    period: "2009.10 - 2012.06",
  },
  {
    school: "上海大学理学院",
    major: "电子信息科学与技术",
    degree: "本科",
    period: "2003.09 - 2007.06",
  },
];

export default function Education() {
  return (
    <section id="education" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 text-accent text-sm font-medium mb-4">
            <GraduationCap size={16} />
            教育背景
          </div>
          <h2 className="text-4xl font-bold text-foreground">教育与资质</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {education.map((edu, i) => (
            <motion.div
              key={edu.school}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-surface border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/5 text-accent">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{edu.school}</h3>
                  <p className="text-muted font-medium">{edu.major} - {edu.degree}</p>
                  <p className="text-sm text-muted mt-2 font-mono">{edu.period}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white text-primary shadow-sm">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">项目管理专业人士 (PMP) 认证</h3>
              <p className="text-sm text-muted mt-0.5">
                国际权威项目管理认证，系统掌握项目管理知识体系
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
