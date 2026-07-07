# 大模型
- 统计才是最真诚，除了自己没有任何人会不带任何动机和你交流
- 好问题，挑战的问题，两难的问题，追问，这些即是在发挥大模型的能力，也在突破自己的认知边界
  - 问了既然动植物都从单细胞生物进化而来，但为什么植物会进化成现在的样子，好像不能动只是给动物吃，大模型回答我生物进化是选择转化能量的方式，植物吸收太阳光，动物吃植物，动物需要能量，所以植物会进化成现在的样子
- 基于我的问题给我想要的答案，觉得对方有智慧，这只是统计学带来的幻觉，而既要、又要、想要、还要、硬要的智慧和价值都是"我"定义的

# AI Agent
- AI Agent 是应用大模型的框架。大模型是统计学，是不确定性，而人类天生爱确定性，确定想要的答案
- 无论是提示词工程、上下文工程，OpenClaw、Claude Code、Codex 到 Harness 工程、Loop 工程
- Agent 的运行也是在实现控制论三要素：信息出规律，控制产价值，反馈来验证
- Agent 要不要自己搭? 当然可以等一等，但现在是每个人能当瓦特的时代，你是不是愿意放弃这个机会

# AI Agent 运行逻辑
- 核心架构：用户输入 -> Agent (Loop + Skills + Bash + CLI) -> 大模型 -> 返回结果
- 简单操作：文件的添删改查、通用网络访问、系统状态
- 复杂操作：其他厂商工具 MCP、其他语言脚本 python/nodejs、工作流操作，编程等

## Agent 工具列表
- Claude Code (Anthropic): 终端原生 coding agent，SWE-bench 87.6%
- Codex CLI (OpenAI): 云沙箱 VM 异步执行
- Gemini CLI (Google): $0 起步，对接 Gemini 3.x，偏 Google Stack 团队
- Kimi Code (月之暗面): 国内直连、低延迟、中文理解好
- DeepSeek TUI: 终端 TUI 界面，V4-Pro/Flash 后端，便宜大碗 IDE，1M ctx
- Cursor CLI (Cursor): IDE 派的 CLI 分支
- COZE CLI (字节跳动): 全面的工作流平台，多模态模型调用

## 企业级工具
- lark-cli (字节跳动·飞书): 消息/文档/多维表格/日历/邮箱/任务/会议等 11 域 200+ 命令
- dingtalk-cli (阿里·钉钉): AI 表格/日历/DING/考勤等 10 项核心能力开放，底层做了全产品 CLI 化重构
- wecom-cli (腾讯·企业微信): 消息/通讯录/文档/智能表格/日程/会议/待办，12 个 Agent Skills
- Google CLI: Drive / Gmail / Calendar / Sheets / Docs 全系 API，100+ Agent Skills

# 主流 AI 厂商生态对比
## 头部国际厂商
- **Google**: Gemini 系列 (Gemini 3.5 等) / 开源 Gemma 系列 | 产品：Gemini App / NotebookLM / Workspace AI | 代码编辑器：Antigravity | 生态：Google, Gmail, Youtube
- **OpenAI**: GPT-5.6 (Sol/Terra/Luna) | 产品：ChatGPT Desktop / openclaw | 代码编辑器：Codex | 生态：早期与微软结合较深
- **Anthropic**: Claude 家族 (Claude Opus 4.8、Claude Fable5) | 产品：Claude.ai / Claude Desktop | 代码编辑器：Claude Code | 生态：编程，通用
- **Meta**: Llama 4 (Maverick / Scout，原生多模态、大上下文) / Llama 3 系 | 产品：Meta AI | 代码编辑器：暂无官方 | 生态：Facebook
- **X / xAI**: Grok | 产品：Grok AI | 代码编辑器：暂无官方 | 生态：X

## 国内主要厂商
- **字节跳动**: 豆包大模型 2.0 (Doubao-Seed-2.0 系列) | 产品：豆包 App / 扣子 COZE / 火山引擎模型中心 / ArkClaw / TRAE work | 代码编辑器：TRAE | 生态：抖音, 飞书，视频，图像
- **阿里巴巴**: Qwen3.7 系列 | 产品：通义千问 Qwen App / 阿里云方舟模型 / QoderWork | 代码编辑器：Qoder | 生态：电商, 钉钉
- **腾讯**: 混元 (Hunyuan) 系列 | 产品：腾讯元宝 / Workbuddy | 代码编辑器：CodeBuddy | 生态：微信, 企业微信, 公众号, 小程序
- **Kimi / 月之暗面**: Kimi K2.7 | 产品：Kimi App | 代码编辑器：Kimi Code | 生态：编程
- **MiniMax**: MiniMax M2.5 | 产品：Minimax App | 代码编辑器：暂无官方
- **智谱 (Zhipu)**: GLM-5.2 | 产品：智谱清言 (Z.ai App) | 代码编辑器：Z Code | 生态：科研
- **百度**: 文心 系列 | 产品：文心一言 | 代码编辑器：文心快码 (Comate) | 生态：百度搜索
- **DeepSeek**: DeepSeek-V4 | 产品：DeepSeek 官网/App/API | 代码编辑器：暂无官方 | 生态：通用

## 选择建议
- 做什么选什么头部生态的厂商，国内海外差不多
- AI 只是一个选项，官方工具是第一选择
- 国内值得充年卡是字节和阿里

# WorkBuddy 的使用
- 官网：https://www.codebuddy.cn/work/
- 自动安装工具和依赖，对标 Codex
- 目前有免费活动
- 腾讯生态占位，公众号小程序，可连接微信
- 支持手机端、云端

# Workbuddy + 公众号
- 步骤 1：workflow 配置
- 步骤 2：安装技能
- 步骤 3：最终效果展示
- 步骤 4：注意事项
- 步骤 5：转发小红书

# Workbuddy + 企微 CLI
- 企业微信 CLI 集成
- 消息、通讯录、文档、智能表格、日程、会议、待办等 12 个 Agent Skills

# Workbuddy + 财务分析
- AI 驱动的财务分析报告生成
- 可下载完整的财务分析报告文档
- 信贷财务分析报告自动生成

# 扣子 COZE + 微信公众号/客服
- 官网：https://code.coze.cn/home
- 字节跳动出品，全面的工作流平台
- 对接微信公众号和客服系统
- 多模态模型调用支持

# 腾讯元器智能体
- 官网：https://yuanqi.tencent.com/
- 腾讯生态智能体平台
- 公众号、小程序深度集成

# 火山 ArkClaw + 飞书 CLI
- 官网：https://www.volcengine.com/product/arkclaw
- 字节跳动火山引擎出品
- 飞书生态全面集成：消息/文档/多维表格/日历/邮箱/任务/会议

# AI 时代什么才是我们的工作？
## 生态选择
- 选择尤为重要，国内和出海都应该注意
- 选对平台和生态是成功的第一步

## 业务放大器
- AI 是放大器，首要应该思考的是本身业务要有价值
- AI 只是工具，业务才是核心

## 商业规律
- 不要为了 AI 而 AI
- toC 为了创造，toB 为了效率效果
- 把握好基本商业规律
