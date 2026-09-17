import { NextResponse } from "next/server";
import { DEPLOY_SECRET, generateChallenge } from "@/lib/deploy-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/deploy/challenge
 * 颁发一个一次性 challenge（nonce），供 Agent 用预共享密钥签名后调用部署接口。
 */
export async function GET() {
  if (!DEPLOY_SECRET) {
    return NextResponse.json(
      { ok: false, error: "服务端未配置 DEPLOY_SECRET，无法进行鉴权" },
      { status: 500 },
    );
  }

  const challenge = generateChallenge();
  return NextResponse.json({
    ok: true,
    challenge,
    algorithm: "HMAC-SHA256",
    expiresIn: 60,
    hint: "使用 DEPLOY_SECRET 对 challenge 做 HMAC-SHA256，将十六进制结果作为 X-Deploy-Signature",
  });
}
