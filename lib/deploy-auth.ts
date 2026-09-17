/**
 * 静态页面部署接口的鉴权与安全工具
 *
 * 安全模型（挑战-响应，基于预共享密钥）：
 *   1. Agent 调用 GET /api/deploy/challenge 拿到一次性 nonce（challenge）。
 *   2. Agent 用预共享密钥 DEPLOY_SECRET 对 challenge 做 HMAC-SHA256 得到 signature。
 *   3. Agent 调用 POST /api/deploy，携带 X-Deploy-Challenge 和 X-Deploy-Signature。
 *   4. 服务端校验 signature，并确保 challenge 未过期、未被重放使用。
 *
 * 这本质上是对共享密钥的“持有性证明”（proof of possession），
 * 密钥本身从不经过网络传输，从而完成安全的“密钥交换/认证”过程。
 */
import crypto from "crypto";
import path from "path";

/** 预共享密钥，Agent 与服务端各持一份，不经过网络传输 */
export const DEPLOY_SECRET = process.env.DEPLOY_SECRET || "";

/** challenge 有效期（毫秒） */
const CHALLENGE_TTL_MS = 60_000;

/** 部署根目录：public/agent，与现有 public 内容隔离，避免误覆盖 */
export const DEPLOY_ROOT = path.join(
  process.cwd(),
  "public",
  process.env.DEPLOY_SUBDIR || "agent",
);

/** 允许部署的扩展名白名单（静态页面相关） */
const ALLOWED_EXT = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".txt",
  ".xml",
  ".woff",
  ".woff2",
  ".ttf",
  ".map",
]);

type ChallengeEntry = { expiresAt: number; used: boolean };

/** 内存中的 challenge 存储（单实例 PM2 足够；多实例需换 Redis/文件） */
const challengeStore = new Map<string, ChallengeEntry>();

/** 定期清理过期 challenge，避免内存膨胀 */
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of challengeStore) {
    if (v.expiresAt < now) challengeStore.delete(k);
  }
}, 10_000).unref?.();

/** 生成一个一次性 challenge 并登记，返回 hex 字符串 */
export function generateChallenge(): string {
  const nonce = crypto.randomBytes(32).toString("hex");
  challengeStore.set(nonce, { expiresAt: Date.now() + CHALLENGE_TTL_MS, used: false });
  return nonce;
}

/**
 * 校验 challenge + signature：
 *  - challenge 必须存在、未过期、未被使用过（防重放）
 *  - signature 必须等于 HMAC-SHA256(DEPLOY_SECRET, challenge)
 * 校验通过后立即把 challenge 标记为已使用
 */
export function verifyChallengeAndSignature(
  challenge: string | null,
  signature: string | null,
): { ok: true } | { ok: false; error: string; status: number } {
  if (!DEPLOY_SECRET) {
    return { ok: false, error: "服务端未配置 DEPLOY_SECRET", status: 500 };
  }
  if (!challenge || !signature) {
    return { ok: false, error: "缺少 X-Deploy-Challenge 或 X-Deploy-Signature", status: 401 };
  }

  const entry = challengeStore.get(challenge);
  if (!entry) {
    return { ok: false, error: "challenge 不存在或已失效", status: 401 };
  }
  if (entry.used) {
    return { ok: false, error: "challenge 已被使用，禁止重放", status: 401 };
  }
  if (entry.expiresAt < Date.now()) {
    challengeStore.delete(challenge);
    return { ok: false, error: "challenge 已过期", status: 401 };
  }

  const expected = crypto
    .createHmac("sha256", DEPLOY_SECRET)
    .update(challenge)
    .digest("hex");

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    valid = false;
  }

  if (!valid) {
    return { ok: false, error: "签名校验失败", status: 401 };
  }

  entry.used = true;
  return { ok: true };
}

/**
 * 将请求中的相对路径安全解析到 DEPLOY_ROOT 下。
 * 拒绝：绝对路径、空字节、.. 穿越、不在白名单内的扩展名。
 */
export function safeResolve(targetPath: string): string {
  if (!targetPath || typeof targetPath !== "string") {
    throw new Error("path 不能为空");
  }
  if (targetPath.includes("\0")) {
    throw new Error("path 包含非法字符");
  }

  // 去除前导的 / 或 ./
  let normalized = targetPath.replace(/^[/\\.]+/, "");
  // 规范化分隔符
  normalized = path.normalize(normalized);

  // 再次拦截任何穿越成分
  if (normalized.startsWith("..") || normalized.includes("..")) {
    throw new Error("path 不允许包含 ..");
  }

  const resolved = path.resolve(DEPLOY_ROOT, normalized);
  const root = path.resolve(DEPLOY_ROOT);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("path 越界");
  }

  const ext = path.extname(resolved).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error(`不允许的文件类型: ${ext || "(无扩展名)"}`);
  }

  return resolved;
}

/** 把绝对路径还原为可访问的 URL 路径（相对于 public） */
export function toUrlPath(absPath: string): string {
  const rel = path.relative(path.join(process.cwd(), "public"), absPath);
  return "/" + rel.split(path.sep).join("/");
}
