"use client";

import { motion } from "framer-motion";
import { Briefcase, ChevronDown } from "lucide-react";
import { useState } from "react";

interface JobDetail {
  title: string;
  items: string[];
}

interface Job {
  company: string;
  role: string;
  period: string;
  reporting?: string;
  teamSize?: string;
  clients?: string;
  details: JobDetail[];
  color: string;
}

const jobs: Job[] = [
  {
    company: "锐捷网络",
    role: "应用研发部门经理",
    period: "2023.03 - 2026.03",
    reporting: "技术总监",
    teamSize: "35-50人",
    clients: "福建公安省厅、红云红河烟草集团、大连理工、工商银行、北农商银行、太平洋保险、人保、大家保险、中通快递、新东方等",
    color: "#2563eb",
    details: [
      {
        title: "研发提效",
        items: [
          "设计规划基于元模型+SSD+基于Dify定制的UI MCP+OpenCode/TRAE的AI编辑器+注释生成API自动化测试的完整研发流程，充分利用成熟AI技术应用于软件研发提效",
        ],
      },
      {
        title: "团队管理",
        items: [
          "负责应用研发部门整体管理，主导前端、网络认证、终端管理等专业线团队建设",
          "培养技术骨干，优化协作流程，提升研发质量",
          "获得2023年公司最佳面试官和招聘达人奖",
        ],
      },
      {
        title: "质量管理",
        items: [
          "实践IPD项目管理流程，结合SAFe敏捷方法，设计并落地自工序完结机制，规范项目立项、迭代、测试与交付全流程",
          "推动详细设计自工序落地，持续强化研发过程质量管控，获得BG质量之星奖",
        ],
      },
      {
        title: "架构设计",
        items: [
          "主导零信任架构、低代码平台、模型驱动架构等技术架构设计",
          "提供技术解决方案并优化系统架构，提升系统可扩展性与高可用性",
        ],
      },
      {
        title: "技术创新",
        items: [
          "推动ONNX AI模型Web应用等前沿技术落地，实现基于浏览器的边缘大模型应用场景实践，弥补网络管理平台在网络开局阶段无法联网但要应用AI智能化的业务痛点，实现快速网络开局智能辅助",
          "引领智能终端指纹分析项目产品化，针对金融行业终端管理安全问题，通过网络特征提取与机器学习分类识别，实现网络上行通道的终端指纹识别，方案得到客户认可，获得2024年事业部卓越创新奖",
        ],
      },
      {
        title: "项目执行",
        items: [
          "主导项目规划与需求分析，制定进度与资源分配计划",
          "协调大连理工5G业务中台项目多方合作，监督开发与交付，促进功能扩展",
        ],
      },
      {
        title: "客户支持",
        items: [
          "领导LMT团队处理客户定制需求与现场交付，与工商银行、红云红河烟草集团等重要客户建立长期稳定合作关系，提升客户满意度",
        ],
      },
    ],
  },
  {
    company: "阿里巴巴",
    role: "CRO线高级技术专家",
    period: "2018.12 - 2023.02",
    reporting: "研发主管",
    teamSize: "7-9人",
    clients: "河北省廊坊市公安局安次分局禁毒办公室、河北省沧州市公安局禁毒支队等1300+客户",
    color: "#f59e0b",
    details: [
      {
        title: "需求分析",
        items: [
          "协同产品团队进行调研与需求分析，设计公安业务SaaS产品前端技术架构",
          "制定技术路线图，推动产品功能迭代与升级",
        ],
      },
      {
        title: "架构设计",
        items: [
          "主导前端技术架构演进，规划并搭建前端工程化基建",
          "搭建埋点指标分析系统及运营工具产品，优化架构可扩展性与高性能",
        ],
      },
      {
        title: "团队管理",
        items: [
          "管理前端团队，制定开发任务与项目进度",
          "进行代码评审、技术指导与问题解决，推动团队按时交付高质量产品",
        ],
      },
      {
        title: "客户支持",
        items: [
          "为1300+客户提供技术支持与运营指导，参与各业务线技战法赋能",
          "协助廊坊市公安局安次分局等客户取得重大战果，获得公司最佳战果奖",
          "年度绩效3.75+",
        ],
      },
    ],
  },
  {
    company: "中欧国际工商学院",
    role: "IT经理",
    period: "2015.09 - 2018.12",
    reporting: "IT主任",
    color: "#10b981",
    details: [
      {
        title: "项目规划",
        items: [
          "主导教务系统与CRM移动端迁移，负责技术架构与方案设计",
          "统筹项目推进，搭建管控体系，完成用户培训与运营赋能",
        ],
      },
      {
        title: "供应商管理",
        items: [
          "负责云服务与外包供应商管理，建立评估体系",
          "主导供应商筛选、技术审核与商务洽谈，推动在线考试系统与基金会管理平台交付",
        ],
      },
      {
        title: "系统集成",
        items: [
          "牵头智能校园建设，主导安防系统智能化升级",
          "负责设备选型与系统集成，优化多系统接口对接",
        ],
      },
      {
        title: "技术支持",
        items: [
          "统筹IT部门技术服务，优化服务流程，推动IT技术与校园业务深度融合",
        ],
      },
    ],
  },
  {
    company: "百度",
    role: "移动云手机输入法高级研发工程师",
    period: "2014.05 - 2015.09",
    color: "#6366f1",
    details: [
      {
        title: "接口搭建",
        items: [
          "主导搭建REST接口总线，定义接口规范，提升调用效率30%",
          "增强系统扩展性与可维护性",
        ],
      },
      {
        title: "全栈开发",
        items: [
          "设计并开发PHP及H5页面架构，采用组件化开发",
          "优化渲染性能，增强多终端适配",
        ],
      },
      {
        title: "协作管理",
        items: [
          "协调产品、测试、运维等部门资源，推动接口联调与适配机制，保证项目交付",
        ],
      },
    ],
  },
  {
    company: "奥美广告 (Redworks)",
    role: "系统分析师",
    period: "2013.05 - 2014.05",
    color: "#ec4899",
    details: [
      {
        title: "提案支持",
        items: [
          "负责技术可行性评估，输出技术提案",
          "支撑雅诗兰黛、Johnnie Walker等客户比稿",
        ],
      },
      {
        title: "项目管控",
        items: [
          "搭建供应商筛选与评估体系，主导架构设计与产品原型",
          "优化交付流程",
        ],
      },
      {
        title: "协同执行",
        items: [
          "构建技术与创意部门协同机制，协调客户需求与内部执行团队",
        ],
      },
    ],
  },
  {
    company: "Splio",
    role: "系统集成工程师",
    period: "2012.02 - 2013.05",
    color: "#8b5cf6",
    details: [
      {
        title: "架构设计",
        items: [
          "主导电商网站前后端架构设计与开发，制定开发规范",
          "优化交互与性能",
        ],
      },
      {
        title: "系统集成",
        items: [
          "负责邮件营销系统集成与定制开发",
          "优化邮件发送链路，提升触达率和转化效果",
        ],
      },
      {
        title: "运维优化",
        items: [
          "负责系统上线后运维管理与故障排查，提供技术优化方案，保障业务持续运营",
        ],
      },
    ],
  },
];

function JobCard({ job, index }: { job: Job; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 pb-12 last:pb-0"
    >
      <div
        className="absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: job.color }}
      />
      {index < jobs.length - 1 && (
        <div className="absolute left-[5px] top-6 bottom-0 w-px bg-border" />
      )}

      <div
        className="p-6 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-muted bg-surface-alt px-2 py-0.5 rounded">
                {job.period}
              </span>
              {job.teamSize && (
                <span className="text-xs text-muted bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">
                  团队 {job.teamSize}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-foreground">{job.company}</h3>
            <p className="text-muted font-medium">{job.role}</p>
            {job.reporting && (
              <p className="text-sm text-muted mt-1">汇报对象: {job.reporting}</p>
            )}
            {job.clients && (
              <p className="text-sm text-muted mt-1 line-clamp-2">
                服务客户: {job.clients}
              </p>
            )}
          </div>
          <ChevronDown
            size={20}
            className={`text-muted transition-transform flex-shrink-0 mt-1 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-5"
          >
            {job.details.map((detail) => (
              <div key={detail.title}>
                <h4
                  className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: job.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: job.color }}
                  />
                  {detail.title}
                </h4>
                <ul className="space-y-1.5">
                  {detail.items.map((item, i) => (
                    <li key={i} className="text-sm text-muted leading-relaxed pl-4 relative">
                      <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-border" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-4">
            <Briefcase size={16} />
            职业经历
          </div>
          <h2 className="text-4xl font-bold text-foreground">工作经历</h2>
          <p className="text-muted mt-3 max-w-2xl mx-auto">
            从研发工程师到部门经理，横跨百度、阿里巴巴、锐捷网络等头部企业
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {jobs.map((job, i) => (
            <JobCard key={job.company} job={job} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
