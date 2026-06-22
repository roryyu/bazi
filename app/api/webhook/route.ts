import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import crypto from "crypto";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";
const PROJECT_DIR = process.env.PROJECT_DIR || "/workspace";
const PM2_APP_NAME = process.env.PM2_APP_NAME || "bazi";

function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) return true;
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

function runCommand(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, PATH: process.env.PATH } },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  if (event !== "push") {
    return NextResponse.json({ ok: true, message: `Ignored event: ${event}` });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const ref = payload.ref;
  const branch = ref?.replace("refs/heads/", "");
  if (branch !== "main") {
    return NextResponse.json({ ok: true, message: `Ignored branch: ${branch}` });
  }

  const steps: { step: string; ok: boolean; output?: string; error?: string }[] = [];

  try {
    const pull = await runCommand("git pull origin main --ff-only", PROJECT_DIR);
    steps.push({ step: "git pull", ok: true, output: pull.stdout });
  } catch (e: any) {
    steps.push({ step: "git pull", ok: false, error: e.message });
    return NextResponse.json({ ok: false, steps }, { status: 500 });
  }

  try {
    const install = await runCommand("npm install --no-audit --no-fund", PROJECT_DIR);
    steps.push({ step: "npm install", ok: true, output: install.stdout });
  } catch (e: any) {
    steps.push({ step: "npm install", ok: false, error: e.message });
    return NextResponse.json({ ok: false, steps }, { status: 500 });
  }

  try {
    const reload = await runCommand(`pm2 reload ${PM2_APP_NAME} || pm2 start npm --name ${PM2_APP_NAME} -- start`, PROJECT_DIR);
    steps.push({ step: "pm2 reload", ok: true, output: reload.stdout });
  } catch (e: any) {
    steps.push({ step: "pm2 reload", ok: false, error: e.message });
    return NextResponse.json({ ok: false, steps }, { status: 500 });
  }

  return NextResponse.json({ ok: true, steps });
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "GitHub webhook endpoint is live" });
}
