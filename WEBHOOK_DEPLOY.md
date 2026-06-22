# GitHub Webhook 部署配置说明

## 接口地址

```
POST https://your-domain.com/api/webhook
```

## 环境变量

在项目根目录创建 `.env.production`（或系统环境变量）：

```bash
# GitHub webhook 密钥（在 GitHub repo settings → Webhooks 中设置同一个值）
GITHUB_WEBHOOK_SECRET=your_secret_here

# 项目目录（绝对路径）
PROJECT_DIR=/workspace

# PM2 应用名（与 ecosystem.config.js 中的 name 一致）
PM2_APP_NAME=bazi
```

## GitHub 端配置

1. 打开仓库 → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://your-domain.com/api/webhook`
3. **Content type**: `application/json`
4. **Secret**: 与 `GITHUB_WEBHOOK_SECRET` 一致
5. **Which events**: 仅选择 "Just the push event."
6. 勾选 **Active**，保存

## 首次部署

```bash
# 1. 安装 pm2
npm install -g pm2

# 2. 构建
npm run build

# 3. 用 pm2 启动（后续 webhook 才能 reload）
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # 设置开机自启

# 4. 验证 webhook 接口
curl https://your-domain.com/api/webhook
# 返回 { "ok": true, "message": "GitHub webhook endpoint is live" }
```

## 接口行为

- 验证 `X-Hub-Signature-256` 签名（如果设置了 secret）
- 仅处理 `push` 事件
- 仅对 `main` 分支触发部署
- 依次执行：`git pull` → `npm install` → `pm2 reload`
- 任何一步失败立即返回 500 并附带错误信息
