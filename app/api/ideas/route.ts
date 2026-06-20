import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "ideas.json");

export interface Idea {
  id: string;
  email: string;
  description: string;
  createdAt: string;
}

async function readIdeas(): Promise<Idea[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeIdeas(ideas: Idea[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(ideas, null, 2), "utf-8");
}

export async function GET() {
  const ideas = await readIdeas();
  return NextResponse.json(ideas);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, description } = body;

    if (!email || !description) {
      return NextResponse.json({ error: "邮箱和需求描述不能为空" }, { status: 400 });
    }

    if (description.length > 200) {
      return NextResponse.json({ error: "需求描述不能超过200字" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const ideas = await readIdeas();
    const newIdea: Idea = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      email,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    ideas.unshift(newIdea);
    await writeIdeas(ideas);

    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
