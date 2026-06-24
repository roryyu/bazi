# 八字排盘 + AI 命理分析

基于 Next.js 15 的本地命理排盘 Web 应用，先在浏览器/服务端用纯 TS 算出四柱八字、十神与格局，再把结构化结果拼成提示词调用 DeepSeek 大模型生成深度命理解读，前端流式展示。同时集成了幻灯片展示、AI 应用需求收集和 GitHub Webhook 自动部署等功能。

## ✨ 功能

- **本地排盘**：输入阳历出生时间（年/月/日/时），自动推算四柱、藏干与十神。
  - 年柱以**立春**为界，月柱以**节气**为界（21 世纪寿星算法）。
  - 日柱按 1900-01-01 为甲戌日的差值法推算。
  - 时柱按**五鼠遁**起时；23:00 后归入次日子时。
- **十神可视化**：天干十神 + 地支藏干十神，按比劫/食伤/财/官杀/印能量分布。
- **格局识别**：识别常见组合格局（如杀印相生、伤官配印、财官印俱全等）。
- **AI 深入分析**：点「排盘」按钮自动触发，调用 DeepSeek 流式生成 Markdown 报告，包含基本信息、四柱、格局、十神能量分析、健康提示、当下建议等。
- **基本信息**：姓名 + 性别一并送入 prompt，男女断法差异由模型处理。
- **幻灯片展示** (`/slide`)：30 页 Claude Code 主题幻灯片，支持键盘方向键、箭头按钮和触摸滑动切换，使用 Framer Motion 实现平滑过渡动画。
- **AI 应用需求收集** (`/ideas`)：Claude 风格深色主题页面，收集"没有商业价值但有用的 AI 应用"创意，包含表单提交和需求卡片展示，数据存储到 JSON 文件。
- **GitHub Webhook 自动部署** (`/api/webhook`)：监听 main 分支 push 事件，自动执行 `git pull` → `npm install` → `pm2 reload` 完成部署，支持签名验证。

## 🛠️ 技术栈

| 框架 | Next.js 15（App Router）+ React 19 |
| 大模型 | DeepSeek（OpenAI 兼容 SDK，`stream: true`） |
| 流式协议 | NDJSON（`application/x-ndjson`） |
| Markdown | react-markdown + remark-gfm |
| 动画 | Framer Motion（幻灯片切换） |
| 图标 | Lucide React |
| 样式 | Tailwind CSS 4 |
| 算法 | 纯 TypeScript（无后端依赖） |
| 部署 | PM2 + GitHub Webhook 自动更新 |

## 🚀 快速开始

### 1. 安装依赖

```bash
cd chance
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填入：

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
# 可选：deepseek-reasoner / deepseek-v4-pro 自动启用 thinking
DEEPSEEK_THINKING=
```

> ⚠️ `.env*` 已在 `.gitignore`，**切勿提交**包含 API Key 的文件。

### 3. 启动

```bash
npm run dev
```

打开 <http://localhost:3000>。

## 📁 项目结构

```
bazi/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   # DeepSeek 流式代理（OpenAI SDK + NDJSON）
│   │   ├── ideas/route.ts     # AI 应用需求收集 API（GET/POST）
│   │   └── webhook/route.ts   # GitHub Webhook 自动部署接口
│   ├── ideas/page.tsx         # "无用之用" AI 应用需求收集页
│   ├── slide/page.tsx         # 幻灯片展示页（30 页）
│   ├── globals.css            # 全局样式 + Markdown 主题
│   ├── layout.tsx
│   └── page.tsx               # 表单 + 排盘视图 + AI 分析视图
├── components/
│   └── Navbar.tsx             # 导航栏组件
├── data/
│   └── ideas.json             # 需求收集数据存储
├── lib/
│   └── bazi.ts                # 算法核心：calcBazi / 十神 / 格局 / buildAnalysisPrompt
├── public/
│   └── slide.html             # 原始幻灯片 HTML
├── ecosystem.config.js        # PM2 部署配置
├── WEBHOOK_DEPLOY.md          # Webhook 部署说明
├── 命理.md                    # 排盘算法依据
├── 十神.md                    # 十神/格局规则
├── .env.example
└── package.json
```

## 🔌 API

### `POST /api/analyze`

**请求体**

```json
{ "promptText": "【基本信息】\n- 姓名：...\n- 性别：...\n..." }
```

**响应**：`Content-Type: application/x-ndjson`，逐行 JSON：

| type | 说明 |
|---|---|
| `meta` | `{ type, model }` 首行返回模型名 |
| `content` | `{ type, text }` 正文增量 |
| `reasoning` | `{ type, text }` 思考链增量（仅思考型模型） |
| `done` | 结束标记 |
| `error` | 出错信息 |

前端按 `\n` 切行解析，函数式累加 `setText(prev => prev + text)`。

### `POST /api/webhook`

GitHub Webhook 自动部署接口，监听 main 分支 push 事件，自动拉取代码、安装依赖并重启应用。

- **触发条件**：`X-GitHub-Event: push` + `ref: refs/heads/main`
- **签名验证**：`X-Hub-Signature-256`（HMAC-SHA256）
- **执行步骤**：`git pull` → `npm install` → `pm2 reload`
- **环境变量**：`GITHUB_WEBHOOK_SECRET`、`PROJECT_DIR`、`PM2_APP_NAME`

详细配置见 [`WEBHOOK_DEPLOY.md`](./WEBHOOK_DEPLOY.md)。

### `GET /api/ideas` / `POST /api/ideas`

AI 应用需求收集接口，支持提交和查询创意，数据存储在 `data/ideas.json`。

## 🎬 幻灯片

访问 `/slide` 查看 30 页 Claude Code 主题幻灯片。

- 键盘 `←` / `→` 或点击两侧箭头切换
- 移动端支持左右滑动
- Framer Motion 实现淡入淡出 + 位移动画

## 💡 无用之用

访问 `/ideas` 提交和浏览"没有商业价值但有用的 AI 应用"创意。

- Claude 风格深色主题
- 表单提交（邮箱 + 需求描述，200 字以内）
- 卡片式展示所有提交

## 📝 算法说明

详细规则见 [`命理.md`](./命理.md) 与 [`十神.md`](./十神.md)。
关键函数定义在 [`lib/bazi.ts`](./lib/bazi.ts)：

- `calcBazi(y, m, d, h)` → 返回 `{ year, month, day, hour, dayMaster, solarTerm, ... }`
- `analyzePatterns(result)` → 返回识别到的格局数组
- `summarizeTenGodEnergy(result)` → 返回十神五大类能量分布
- `buildAnalysisPrompt(input, result)` → 拼接送入大模型的纯文本 prompt

## ⚠️ 注意事项

- 本应用仅供命理学爱好者参考，**不构成任何决策建议**。
- DeepSeek `stream: true` 时单次会话最长 5 分钟（`maxDuration: 300`）。
- 若使用 `deepseek-reasoner` / `deepseek-v4-pro`，会自动开启 `thinking: { type: "enabled" }` + `reasoning_effort: "high"`，思考链单独返回。
- 如遇 npm `ERESOLVE`，请确认 `react@^19.0.0` 已升至稳定版（非 RC）。

## 📜 License

MIT
