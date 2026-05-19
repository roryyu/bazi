# 八字排盘 + AI 命理分析

基于 Next.js 15 的本地命理排盘 Web 应用，先在浏览器/服务端用纯 TS 算出四柱八字、十神与格局，再把结构化结果拼成提示词调用 DeepSeek 大模型生成深度命理解读，前端流式展示。

## ✨ 功能

- **本地排盘**：输入阳历出生时间（年/月/日/时），自动推算四柱、藏干与十神。
  - 年柱以**立春**为界，月柱以**节气**为界（21 世纪寿星算法）。
  - 日柱按 1900-01-01 为甲戌日的差值法推算。
  - 时柱按**五鼠遁**起时；23:00 后归入次日子时。
- **十神可视化**：天干十神 + 地支藏干十神，按比劫/食伤/财/官杀/印能量分布。
- **格局识别**：识别常见组合格局（如杀印相生、伤官配印、财官印俱全等）。
- **AI 深入分析**：点「排盘」按钮自动触发，调用 DeepSeek 流式生成 Markdown 报告，包含基本信息、四柱、格局、十神能量分析、健康提示、当下建议等。
- **基本信息**：姓名 + 性别一并送入 prompt，男女断法差异由模型处理。

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15（App Router）+ React 19 |
| 大模型 | DeepSeek（OpenAI 兼容 SDK，`stream: true`） |
| 流式协议 | NDJSON（`application/x-ndjson`） |
| Markdown | react-markdown + remark-gfm |
| 算法 | 纯 TypeScript（无后端依赖） |

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
chance/
├── app/
│   ├── api/analyze/route.ts   # DeepSeek 流式代理（OpenAI SDK + NDJSON）
│   ├── globals.css            # 全局样式 + Markdown 主题
│   ├── layout.tsx
│   └── page.tsx               # 表单 + 排盘视图 + AI 分析视图
├── lib/
│   └── bazi.ts                # 算法核心：calcBazi / 十神 / 格局 / buildAnalysisPrompt
├── 命理.md                    # 排盘算法依据
├── 十神.md                    # 十神/格局规则
├── .env.example
└── package.json
```

## 🔌 API：`POST /api/analyze`

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
