# Claude Code Slides 概览

本文档汇总了 `/slide` 页面中 30 页幻灯片的功能、样式和布局描述。

---

## 第 1-7 页：Claude 模型能力与最佳实践

### Slide 1 - 封面
| 属性 | 内容 |
|------|------|
| **名称** | Build a proactive agent workflow with Claude Code |
| **功能** | 演讲封面页，展示演讲者信息和主题 |
| **样式** | 左侧深色文字内容（标题 + 副标题 + 演讲者信息），右侧三个 Canvas 动画（3D 旋转几何体：格子、线条、正方形），深蓝紫色 `#1A1A2E`，米色背景 `#F5F2EC` |
| **布局** | 左右分栏，右上角淡色 "AI" 水印 |

### Slide 2 - Give the model room to work
| 属性 | 内容 |
|------|------|
| **名称** | 给模型留出工作空间 |
| **功能** | 展示 Claude 自适应思考的三个关键能力 |
| **样式** | 深蓝紫色标题，三张等宽卡片横向排列，Ant Design 图标，卡片米色背景 `#F5F2EC`，圆角 3xl |
| **布局** | 网格布局，Framer Motion 淡入动画 |

### Slide 3 - Sonnet 4 to Opus 4.8
| 属性 | 内容 |
|------|------|
| **名称** | 模型演进：从 Sonnet 4 到 Opus 4.8 |
| **功能** | 强调 Claude 模型能力的巨大进步 |
| **样式** | 居中大标题，下划线动画（金棕色 `#D47A574`），Framer Motion 缩放动画 |
| **布局** | 居中布局，无卡片，纯文字展示 |

### Slide 4 - Shrink your scaffolding
| 属性 | 内容 |
|------|------|
| **名称** | 精简脚手架 |
| **功能** | 展示两个提示词工程最佳实践 |
| **样式** | 双卡片布局（2 列），深蓝紫色标题，卡片米色背景 |
| **布局** | 网格 2 列布局 |

### Slide 5 - Refresh your evals
| 属性 | 内容 |
|------|------|
| **名称** | 刷新你的评估体系 |
| **功能** | 展示三个构建高质量评估的方法 |
| **样式** | 三卡片布局，Ant Design 图标 |
| **布局** | 网格 3 列布局 |

### Slide 6 - These stack into autonomy
| 属性 | 内容 |
|------|------|
| **名称** | 自主性的堆叠 |
| **功能** | 展示四个递进的能力维度 |
| **样式** | 四个卡片横向排列带箭头 `→`，第四个高亮（灰紫色背景 `#C7C4D6`），编号 01-04 |
| **布局** | Flex 横向排列，响应式收缩 |

### Slide 7 - Planning before acting
| 属性 | 内容 |
|------|------|
| **名称** | 先规划再行动 |
| **功能** | 对比 Before/After，展示 Claude 的规划能力 |
| **样式** | 左右双栏对比布局（Before 米色，After 高亮紫），底部黄色灯泡提示卡片 |
| **布局** | 对比布局 + 底部提示条 |

---

## 第 8-11 页：演示与数据

### Slide 8 - Long-horizon agents
| 属性 | 内容 |
|------|------|
| **名称** | 长期运行的智能体 |
| **功能** | 展示 Plan → Execute → Verify → Adjust 循环工作流 |
| **样式** | 顶部三个 Checkpoint 标签，SVG 波浪线图表，多色柱状条（Plan 橙、Execute 深蓝、Verify 蓝、Adjust 绿） |
| **布局** | 居中大卡片，下方说明文字 |

### Slide 9 - Sonnet 4 Demo
| 属性 | 内容 |
|------|------|
| **名称** | Sonnet 4 演示 |
| **功能** | 展示 Sonnet 4 的代码生成能力和局限性（报错） |
| **样式** | 左侧深色终端模拟（黑色背景 + 彩色代码 + 红绿灯窗口头），右侧白色浏览器模拟，显示 "encountered an error"，底部三个统计数据（43 tools, 2,640 lines added, 57 deleted） |
| **布局** | 左右双栏，日期标签 "May 2025" |

### Slide 10 - The same task, 12 months apart
| 属性 | 内容 |
|------|------|
| **名称** | 同一任务，12 个月后 |
| **功能** | 橙色背景过渡页，引入 Opus 4.8 演示 |
| **样式** | 全屏橙棕色 `#D47A5C`，白色超大字体居中，Framer Motion 缩放动画 |
| **布局** | 居中文字，无其他元素 |

### Slide 11 - Where the gains are landing
| 属性 | 内容 |
|------|------|
| **名称** | 收益在哪里 |
| **功能** | 橙色背景大字标题过渡页 |
| **样式** | 全屏橙棕色，白色超大字体 `#D47A5C`，左对齐 "Where the gains are landing"，Framer Motion 左滑动画 |
| **布局** | 纯文字居中偏左 |

---

## 第 12-17 页：Routines 功能介绍

### Slide 12 - The context: what does it need to know?
| 属性 | 内容 |
|------|------|
| **名称** | 上下文：需要知道什么 |
| **功能** | 展示 Routines 需要的三类上下文信息 |
| **样式** | 白色背景，三张白色边框卡片（无背景色），Ant Design 图标 |
| **布局** | 网格 3 列 |

### Slide 13 - The trigger: when does it run?
| 属性 | 内容 |
|------|------|
| **名称** | 触发器：何时运行 |
| **功能** | 展示 Routines 的三种触发方式 |
| **样式** | 同 Slide 12 风格，白色背景，白色边框卡片 |
| **布局** | 网格 3 列 |

### Slide 14 - Three decisions for any routine
| 属性 | 内容 |
|------|------|
| **名称** | 任何 Routine 的三个决策 |
| **功能** | 总结 Trigger / Context / Steering 三个关键决策 |
| **样式** | 三栏带分隔线，大号金棕色数字 `1 / 2 / 3`，灰色副标题 |
| **布局** | 三栏分隔布局 |

### Slide 15 - Let's create a routine
| 属性 | 内容 |
|------|------|
| **名称** | 创建一个 Routine |
| **功能** | 展示 Claude Code 创建 Schedule Routine 的交互界面 |
| **样式** | 居中白色终端卡片，深色输入框显示 `/schedule` 命令，珊瑚橙色提示符 `#E49173`，蓝色高亮 `#7B9DE0`，底部显示 "auto mode on" |
| **布局** | 居中大卡片，最大宽度 1000px |

### Slide 16 - Weekly PRs for Claude Code up 200%
| 属性 | 内容 |
|------|------|
| **名称** | 每周 PR 增长 200% |
| **功能** | 展示 Claude Code 使用 Routines 后的效果数据 |
| **样式** | 大标题 + 副标题，白色圆角卡片内嵌 SVG 折线图（灰色线条 + 渐变填充），数据点圆圈 |
| **布局** | 上标题，下图表 |

### Slide 17 - Routines 三大特性
| 属性 | 内容 |
|------|------|
| **名称** | Routines 核心特性 |
| **功能** | 展示 Routines 的三个核心优势 |
| **样式** | 三个水平条目，卡片式列表，SVG 自定义图标（云、闪电、木偶），背景随条目变化 |
| **布局** | 垂直列表，卡片间分隔线 |

---

## 第 18-21 页：挑战与架构

### Slide 18 - Routines 配置界面
| 属性 | 内容 |
|------|------|
| **名称** | Routines 完整配置界面 |
| **功能** | 展示 Telegram Channel Improver Routine 的完整配置面板 |
| **样式** | 左右分栏（1:2），标题区 + 开关 + 状态标签 + 两栏配置（Repositories / Repeats / Connectors / Instructions / Session），"Run now" 黑色按钮 |
| **布局** | 左侧标题，右侧大配置卡片 |

### Slide 19 - Challenges with proactive agents
| 属性 | 内容 |
|------|------|
| **名称** | 主动智能体的挑战 |
| **功能** | 列出当前主动智能体的三个核心问题 |
| **样式** | 左右分栏，三张水平条目，自定义 SVG 图标，背景随条目变化 |
| **布局** | 左侧大标题，右侧三条目 |

### Slide 20 - Agenda
| 属性 | 内容 |
|------|------|
| **名称** | 议程 |
| **功能** | 展示本次分享的四个议程项 |
| **样式** | 左右分栏，四行议程项，编号 01-04，超大字体，灰色分隔线 |
| **布局** | 左侧大标题，右侧列表 |

### Slide 21 - What you saw
| 属性 | 内容 |
|------|------|
| **名称** | 你所看到的 |
| **功能** | 总结 SDLC 全流程 + Claude Code + Google Cloud 的关系 |
| **样式** | 顶部五色流程条（Prototype / Design / Build / Deploy / Support），底部三张卡片（Claude Code / Google Cloud / Combination + 几何图形） |
| **布局** | 上下结构 |

---

## 第 22-26 页：SDLC 角色场景

### Slide 22 - Support: Growth Marketer
| 属性 | 内容 |
|------|------|
| **名称** | 支持：增长营销 |
| **功能** | 展示 Growth Marketer 使用 BigQuery MCP 查询数据和查看仪表盘的场景 |
| **样式** | 左右双栏（终端 + 仪表盘），终端黑色背景显示 SQL 和查询结果，仪表盘白卡内嵌 SVG 折线图、柱状图、环形图 |
| **布局** | 左右分栏 |

### Slide 23 - Deploy: Security Engineer
| 属性 | 内容 |
|------|------|
| **名称** | 部署：安全工程师 |
| **功能** | 展示 Security Engineer 使用 `/security-review` 进行安全审查的流程 |
| **样式** | 垂直流程图：`/security-review` → 发现问题卡片（橙色背景 + 放大镜图标）→ Edit Code → Set Permissions → Build & Deploy → Laptop |
| **布局** | 垂直居中流程 |

### Slide 24 - Design: UI/UX Developer
| 属性 | 内容 |
|------|------|
| **名称** | 设计：UI/UX 开发者 |
| **功能** | 展示 UI/UX Developer 使用 Claude Code + Figma MCP 进行设计的流程 |
| **样式** | 水平流程：wireframe.html → Claude Code（上下箭头连接 MCP / Figma Board）→ 五个输出文件（landing.html / form.html / thanks.html / dashboard.html / styles.css），弧形箭头 |
| **布局** | 水平流程 |

### Slide 25 - Build: SWE
| 属性 | 内容 |
|------|------|
| **名称** | 构建：软件工程师 |
| **功能** | 展示 SWE 使用 Claude Code 设计云架构并并行构建三个服务的流程 |
| **样式** | 水平流程：Hand 图标 → Cloud Run Feedback API → Firestore Responses（数据库图标）→ BigQuery Analytics（数据库图标）→ Looker Dashboard |
| **布局** | 水平流程 |

### Slide 26 - Prototype: Product Manager
| 属性 | 内容 |
|------|------|
| **名称** | 原型：产品经理 |
| **功能** | 展示 PM 使用餐巾纸草图快速原型设计的场景 |
| **样式** | 左右分栏（1:2），超大标题，左侧引语，青绿色边框卡片内嵌 AI 生成的手绘线框图 |
| **布局** | 左右分栏 |

---

## 第 27-30 页：总结与设置

### Slide 27 - Why run Claude on Google Cloud
| 属性 | 内容 |
|------|------|
| **名称** | 为什么在 Google Cloud 上运行 Claude |
| **功能** | 列出在 Google Cloud 上运行 Claude 的六个优势 |
| **样式** | 左右分栏，六个水平条目卡片，底部高亮条目（青绿色背景 `#c6d5d3`），其他米色背景 `#f8f6ec`，底部引用来源 |
| **布局** | 左右分栏 |

### Slide 28 - Claude Code augments every role across the SDLC
| 属性 | 内容 |
|------|------|
| **名称** | Claude Code 增强 SDLC 每个角色 |
| **功能** | 展示五个角色卡片（PM / UI-UX / SWE / Security / Growth），带 Handoff 箭头连接 |
| **样式** | 五个彩色卡片（灰 / 浅灰 / 浅粉 / 青 / 紫），自定义 SVG 图标，顶部/底部标签框（Multimodal / Skills / Figma MCP / Plugins / BigQuery MCP），虚线连接 |
| **布局** | 横向排列卡片，Handoff 箭头 |

### Slide 29 - Setup: Claude Code on Google Cloud
| 属性 | 内容 |
|------|------|
| **名称** | 设置：Google Cloud 上的 Claude Code |
| **功能** | 展示 Claude Code 的登录设置界面 |
| **样式** | 左右分栏，左侧标题 + 三条要点，青绿色边框内嵌黑色终端窗口（Claude Code v2.1.100 登录菜单），选项 3 高亮（蓝色 `#a8b5e0`） |
| **布局** | 左右分栏 |

### Slide 30 - Every model moves the ceiling
| 属性 | 内容 |
|------|------|
| **名称** | 每个模型都在突破上限 |
| **功能** | 展示从 Sonnet 3.7 到 Opus 4.8 的 SWE-bench 性能提升折线图 |
| **样式** | 标题 + 副标题，SVG 折线图（8 个数据点，橙红色线 `#d4806b`，白色/橙色圆圈），Y 轴标签 100%/75%/50%/25%/0%，底部模型名称 + 日期，最后一个点（88.6%）高亮 |
| **布局** | 上标题，下图表 |

---

## 技术特性汇总

| 特性 | 说明 |
|------|------|
| **动画** | Framer Motion 实现淡入淡出、滑动、缩放、渐现动画 |
| **图标** | Ant Design Icons + 自定义 SVG |
| **响应式** | Tailwind CSS 响应式类（md: / lg:） |
| **交互** | 键盘方向键、点击箭头、触摸滑动切换 |
| **导航** | 底部页码显示（`1 / 30`） |
| **配色** | 深蓝紫 `#1A1A2E` / 米色 `#F5F2EC` / 橙棕 `#D47A5C` / 珊瑚 `#E49173` |
| **字体** | Serif 字体（标题）+ Sans-serif（正文）|
