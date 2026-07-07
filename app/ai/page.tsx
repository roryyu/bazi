"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalOutlined, ThunderboltOutlined, BulbOutlined } from '@ant-design/icons';

const COLOR = "#1A1A2E";

function project(x: number, y: number, z: number, rotY: number) {
  const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
  const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
  const fov = 300;
  const scale = fov / (fov + z1);
  return { x: x1 * scale, y: y * scale, z: z1, scale };
}

function drawSphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  scale = 1,
) {
  const r = radius * scale;
  const gradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  gradient.addColorStop(0, "#3A3A5E");
  gradient.addColorStop(0.5, COLOR);
  gradient.addColorStop(1, "#0A0A1E");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getAnimationProgress(time: number, animDuration: number, pauseDuration: number) {
  const cycle = animDuration + pauseDuration;
  const t = (time % cycle) / cycle;
  const fullCycles = Math.floor(time / cycle);
  if (t < animDuration / cycle) {
    const localT = t / (animDuration / cycle);
    const deltaRot = easeInOutQuad(localT) * Math.PI * 2;
    return fullCycles * Math.PI * 2 + deltaRot;
  }
  return (fullCycles + 1) * Math.PI * 2;
}

function Slide1({ active }: { active: boolean }) {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    let rafId = 0;
    let running = true;
    let time1 = 0;
    let time2 = 0;
    let time3 = 0;

    const c1 = canvasRef1.current;
    const c2 = canvasRef2.current;
    const c3 = canvasRef3.current;

    const spacing1 = 40;
    const nodeRadius1 = 12;
    const thickness1 = 6;
    type Node3 = { x: number; y: number; z: number };
    const latticeNodes: Node3[] = [];
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        latticeNodes.push({ x: col * spacing1, y: row * spacing1 - 10, z: 0 });
      }
    }
    const latticeEdges = [
      [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],
      [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8],
    ];

    const nodeRadius2 = 14;
    const thickness2 = 7;
    const lineNodes = [
      { x: -45, y: -20, z: 0 },
      { x: 45, y: 20, z: 0 },
    ];

    const nodeRadius3 = 12;
    const size3 = 45;
    const thickness3 = 6;
    const squareNodes = [
      { x: -size3, y: -size3, z: 0 },
      { x: size3, y: -size3, z: 0 },
      { x: size3, y: size3, z: 0 },
      { x: -size3, y: size3, z: 0 },
    ];
    const squareEdges = [[0, 1], [1, 2], [2, 3], [3, 0]];

    function render() {
      if (!running) return;

      if (c1) {
        const ctx = c1.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c1.width, c1.height);
          const rotY = getAnimationProgress(time1, 2, 3);
          const projected = latticeNodes.map((n) => project(n.x, n.y, n.z, rotY));
          const sorted = projected.map((p, i) => ({ p, i })).sort((a, b) => a.p.z - b.p.z);
          const w = c1.width / 2;
          const h = c1.height / 2;
          for (const [i, j] of latticeEdges) {
            const p1 = projected[i];
            const p2 = projected[j];
            ctx.beginPath();
            ctx.moveTo(w + p1.x, h + p1.y);
            ctx.lineTo(w + p2.x, h + p2.y);
            ctx.strokeStyle = COLOR;
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = thickness1 * ((p1.scale + p2.scale) / 2);
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          for (const { p } of sorted) {
            drawSphere(ctx, w + p.x, h + p.y, nodeRadius1, p.scale);
          }
        }
      }

      if (c2) {
        const ctx = c2.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c2.width, c2.height);
          const rotY = getAnimationProgress(time2, 2, 0.5);
          const rotatedNodes = lineNodes.map((n) => project(n.x, n.y, n.z, rotY));
          const sorted = rotatedNodes.map((p, i) => ({ p, i })).sort((a, b) => a.p.z - b.p.z);
          const w = c2.width / 2;
          const h = c2.height / 2;
          const p1 = rotatedNodes[0];
          const p2 = rotatedNodes[1];
          ctx.beginPath();
          ctx.moveTo(w + p1.x, h + p1.y);
          ctx.lineTo(w + p2.x, h + p2.y);
          ctx.strokeStyle = COLOR;
          ctx.globalAlpha = 0.8;
          ctx.lineWidth = thickness2 * ((p1.scale + p2.scale) / 2);
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.globalAlpha = 1;
          for (const { p } of sorted) {
            drawSphere(ctx, w + p.x, h + p.y, nodeRadius2, p.scale);
          }
        }
      }

      if (c3) {
        const ctx = c3.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c3.width, c3.height);
          const rotY = getAnimationProgress(time3, 2, 2);
          const projected = squareNodes.map((n) => project(n.x, n.y, n.z, rotY));
          const sorted = projected.map((p, i) => ({ p, i })).sort((a, b) => a.p.z - b.p.z);
          const w = c3.width / 2;
          const h = c3.height / 2;
          for (const [i, j] of squareEdges) {
            const p1 = projected[i];
            const p2 = projected[j];
            ctx.beginPath();
            ctx.moveTo(w + p1.x, h + p1.y);
            ctx.lineTo(w + p2.x, h + p2.y);
            ctx.strokeStyle = COLOR;
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = thickness3 * ((p1.scale + p2.scale) / 2);
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          for (const { p } of sorted) {
            drawSphere(ctx, w + p.x, h + p.y, nodeRadius3, p.scale);
          }
        }
      }

      time1 += 0.016;
      time2 += 0.016;
      time3 += 0.016;
      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }, [active]);

  return (
    <div className="w-full h-full flex items-center justify-center p-12 md:p-20">
      <div className="flex flex-1 flex-col justify-center pr-10 max-w-2xl">
        <div className="text-[#1A1A2E]/70 text-2xl mb-16 leading-tight">
          AI 实战营<br />
          AI Practice Camp
        </div>
        <h1 className="text-[#1A1A2E] text-5xl md:text-6xl font-semibold leading-[1.15] mb-10">
          解锁企业新潜力
        </h1>
        <div className="text-[#1A1A2E]/80 text-xl md:text-2xl font-medium leading-relaxed mb-20">
          用AI撬动企业增长新势能
        </div>
        <div className="text-[#1A1A2E]/70">
          <div className="text-2xl font-medium text-[#1A1A2E] mb-3">郁辰磊</div>
          <div className="text-lg">2026年7月8日</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-12 w-56">
        <canvas ref={canvasRef1} width={200} height={180} className="block" />
        <canvas ref={canvasRef2} width={200} height={120} className="block" />
        <canvas ref={canvasRef3} width={200} height={180} className="block" />
      </div>
    </div>
  );
}

function Slide2({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-8 tracking-tight">
        大模型到智慧涌现
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 mt-4">
        <motion.div
          initial={active ? { opacity: 0, y: -20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-2 gap-6">
            <motion.div
              initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
              animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10"
            >
              <img
                src="/slide/1.jpg"
                alt="LLM: 文字接龙游戏"
                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.('/slide/1.jpg')}
              />
            </motion.div>
            <motion.div
              initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
              animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10"
            >
              <img
                src="/slide/2.jpg"
                alt="Token: 翻译官"
                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.('/slide/2.jpg')}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-3xl"
        >
          <div className="relative bg-gradient-to-br from-white to-[#F8F6EC] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-[#1A1A2E]/10 p-10 md:p-12">
            <div className="absolute -top-6 left-10 text-8xl font-serif text-[#D47A5C]/20 select-none">
              "
            </div>
            <div className="relative z-10">
              <div className="text-[#1A1A2E] text-xl md:text-2xl lg:text-3xl font-serif leading-relaxed">
                基于我的问题给我
                <span className="text-[#D47A5C] font-semibold">想要的答案</span>，
                觉得对方
                <span className="text-[#5C7A9E] font-semibold">有智慧</span>，
                这只是统计学带来的
                <span className="text-[#C7C4D6] font-semibold">幻觉</span>，而既要、又要、想要、还要、硬要的智慧和价值都是
                <span className="text-[#D47A5C] font-semibold">"我"</span>
                <span className="text-[#1A1A2E] font-semibold">定义的</span>
              </div>
            </div>
            <div className="absolute -bottom-6 right-10 text-8xl font-serif text-[#D47A5C]/20 select-none rotate-180">
              "
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide3({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-8 tracking-tight">
        AI Agent的作用
      </h1>

      <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mt-4">
        <motion.div
          initial={active ? { opacity: 0, x: -20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
          style={{paddingLeft:"100px"}}
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10" style={{ width: '400px', background: '#F5F2EC' }}>
            <svg viewBox="0 0 400 400" className="w-full h-auto">
              {/* 标题 */}
              <text x="200" y="40" textAnchor="middle" className="font-bold" style={{ fontSize: '18px', fill: '#1A1A2E', fontFamily: 'serif' }}>
                控制论三大核心支柱
              </text>
              <text x="200" y="60" textAnchor="middle" style={{ fontSize: '12px', fill: '#666', fontFamily: 'sans-serif' }}>
                THE THREE PILLARS OF CYBERNETICS
              </text>

              {/* 中心圆 */}
              <circle cx="200" cy="220" r="55" fill="#1A1A2E" />
              <text x="200" y="215" textAnchor="middle" style={{ fontSize: '14px', fill: 'white', fontFamily: 'serif' }}>
                控制论核心
              </text>
              <text x="200" y="235" textAnchor="middle" style={{ fontSize: '10px', fill: '#aaa', fontFamily: 'sans-serif' }}>
                CYBERNETICS CORE
              </text>

              {/* 箭头圆环 */}
              <path d="M200 120 A100 100 0 0 1 300 220" stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              <path d="M300 220 A100 100 0 0 1 200 320" stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              <path d="M200 320 A100 100 0 0 1 100 220" stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              <path d="M100 220 A100 100 0 0 1 200 120" stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />

              {/* 箭头定义 */}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#666" />
                </marker>
              </defs>

              {/* 信息节点 - 顶部 */}
              <g>
                <rect x="150" y="85" width="100" height="40" rx="8" fill="#2EC4B6" />
                <text x="200" y="110" textAnchor="middle" style={{ fontSize: '16px', fill: 'white', fontFamily: 'serif', fontWeight: 'bold' }}>
                  信息
                </text>
                <text x="200" y="135" textAnchor="middle" style={{ fontSize: '10px', fill: '#333', fontFamily: 'sans-serif' }}>
                  INFORMATION
                </text>
                <text x="200" y="148" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  基础与前提
                </text>
                <text x="200" y="158" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  没有信息就无法实现有效控制
                </text>
              </g>

              {/* 反馈节点 - 左下 */}
              <g>
                <rect x="30" y="280" width="110" height="50" rx="8" fill="#FF9F9F" />
                <text x="85" y="305" textAnchor="middle" style={{ fontSize: '16px', fill: 'white', fontFamily: 'serif', fontWeight: 'bold' }}>
                  反馈
                </text>
                <text x="85" y="320" textAnchor="middle" style={{ fontSize: '10px', fill: '#333', fontFamily: 'sans-serif' }}>
                  FEEDBACK
                </text>
                <text x="85" y="333" textAnchor="middle" style={{ fontSize: '8px', fill: '#666', fontFamily: 'sans-serif' }}>
                  关键机制
                </text>
                <text x="85" y="344" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  通过反馈校正偏差
                </text>
                <text x="85" y="355" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  缩小目标差
                </text>
                <text x="85" y="366" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  累积放大控制能力
                </text>
              </g>

              {/* 控制节点 - 右下 */}
              <g>
                <rect x="260" y="280" width="110" height="50" rx="8" fill="#FFD93D" />
                <text x="315" y="305" textAnchor="middle" style={{ fontSize: '16px', fill: '#333', fontFamily: 'serif', fontWeight: 'bold' }}>
                  控制
                </text>
                <text x="315" y="320" textAnchor="middle" style={{ fontSize: '10px', fill: '#333', fontFamily: 'sans-serif' }}>
                  CONTROL
                </text>
                <text x="315" y="333" textAnchor="middle" style={{ fontSize: '8px', fill: '#666', fontFamily: 'sans-serif' }}>
                  目的与体现
                </text>
                <text x="315" y="344" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  获取信息和反馈的
                </text>
                <text x="315" y="355" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  最终目的是实现对
                </text>
                <text x="315" y="366" textAnchor="middle" style={{ fontSize: '8px', fill: '#999', fontFamily: 'sans-serif' }}>
                  系统的有效控制
                </text>
              </g>

              {/* 连接线标签 */}
              

              {/* 十字坐标线 */}
              <line x1="200" y1="165" x2="200" y2="275" stroke="#999" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="135" y1="220" x2="265" y2="220" stroke="#999" strokeWidth="1" strokeDasharray="3,3" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={active ? { opacity: 0, x: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 max-w-xl"
        >
          <div className="space-y-6">
            <motion.div
              initial={active ? { opacity: 0, y: 10 } : { opacity: 0 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#1A1A2E]/10 p-6"
            >
              <div className="text-[#1A1A2E] text-lg md:text-xl font-serif leading-relaxed">
                <span className="text-[#D47A5C] font-semibold text-2xl">AI Agent</span> 是应用大模型的框架。大模型是统计学，是不确定性，而人类天生爱确定性，确定想要的答案
              </div>
            </motion.div>

            <motion.div
              initial={active ? { opacity: 0, y: 10 } : { opacity: 0 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#1A1A2E]/10 p-6"
            >
              <div className="text-[#1A1A2E] text-lg md:text-xl font-serif leading-relaxed">
                无论是提示词工程、上下文工程，<span className="text-[#5C7A9E] font-semibold">OpenClaw</span>、
                <span className="text-[#5C7A9E] font-semibold">Claude Code</span>、
                <span className="text-[#5C7A9E] font-semibold">Codex</span> 到
                <span className="text-[#D47A5C] font-semibold">Harness工程</span>、
                <span className="text-[#D47A5C] font-semibold">Loop工程</span><br/>
                Agent的运行也是在实现控制论三要素<br/>
                <span className="text-[#2EC4B6] font-semibold">信息出规律</span>，
                <span className="text-[#E71D36] font-semibold">控制产价值</span>，
                <span className="text-[#FF9F1C] font-semibold">反馈来验证</span>。
              </div>
            </motion.div>

            <motion.div
              initial={active ? { opacity: 0, y: 10 } : { opacity: 0 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-gradient-to-r from-[#D47A5C]/10 to-[#1A1A2E]/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#1A1A2E]/10 p-6"
            >
              <div className="text-[#1A1A2E] text-lg md:text-xl font-serif leading-relaxed">
                Agent要不要自己搭?当然
                <span className="text-[#5C7A9E] font-bold">可以等一等</span>，
                但现在是每个人能当
                <span className="text-[#D47A5C] font-bold">瓦特</span>的时代，
                你是不是愿意
                <span className="text-[#1A1A2E] font-bold">放弃这个机会</span>。
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide4({ active, onSvgClick }: { active: boolean; onSvgClick?: () => void }) {
  const tools = [
    { name: "Claude Code", provider: "Anthropic", feature: "终端原生 coding agent，SWE-bench 87.6%" },
    { name: "Codex CLI", provider: "OpenAI", feature: "云沙箱 VM 异步执行" },
    { name: "Gemini CLI", provider: "Google", feature: "$0 起步，对接 Gemini 3.x，偏 Google Stack 团队" },
    { name: "Kimi Code", provider: "月之暗面", feature: "国内直连、低延迟、中文理解好" },
    { name: "DeepSeek TUI", provider: "第三方", feature: "终端 TUI 界面，V4-Pro/Flash 后端，便宜大碗 IDE，1M ctx" },
    { name: "Cursor CLI", provider: "Cursor", feature: "IDE 派的 CLI 分支" },
    { name: "COZE CLI", provider: "字节跳动", feature: "全面的工作流平台，多模态模型调用" },
  ];

  const enterpriseTools = [
    { name: "lark-cli", provider: "字节跳动·飞书", feature: "消息/文档/多维表格/日历/邮箱/任务/会议等 11 域 200+ 命令" },
    { name: "dingtalk-cli", provider: "阿里·钉钉", feature: "AI 表格/日历/DING/考勤等 10 项核心能力开放，底层做了全产品 CLI 化重构" },
    { name: "wecom-cli", provider: "腾讯·企业微信", feature: "消息/通讯录/文档/智能表格/日程/会议/待办，12 个 Agent Skills" },
    { name: "Google CLI", provider: "Google", feature: "Drive / Gmail / Calendar / Sheets / Docs 全系 API，100+ Agent Skills" },
  ];

  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 lg:px-24 pt-12 pb-12" style={{ background: '#F5F2EC' }}>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight">
        AI Agent 的运行逻辑
      </h1>
      

      <div className="flex-1 flex flex-col lg:flex-row items-start gap-8">
        {/* 左侧：架构图 */}
        <motion.div
          initial={active ? { opacity: 0, x: -20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          <svg viewBox="0 0 500 320" className="w-full cursor-pointer hover:opacity-80 transition-opacity" onClick={onSvgClick}>
            {/* 用户输入 */}
            <g>
              <rect x="10" y="140" width="80" height="40" rx="4" fill="white" stroke="#1A1A2E" strokeWidth="1" />
              <text x="50" y="165" textAnchor="middle" style={{ fontSize: '12px', fill: '#1A1A2E', fontFamily: 'sans-serif', fontWeight: '500' }}>
                用户
              </text>
              <text x="120" y="150" textAnchor="middle" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
                输入
              </text>
            </g>

            {/* 箭头 用户到 Agent */}
            <path d="M90 160 L140 160" stroke="#1A1A2E" strokeWidth="1.5" markerEnd="url(#arrow1)" fill="none" />
            
            {/* Agent 主框 */}
            <g>
              <rect x="140" y="80" width="200" height="160" rx="8" fill="white" stroke="#1A1A2E" strokeWidth="1" />
              <text x="240" y="105" textAnchor="middle" style={{ fontSize: '14px', fill: '#1A1A2E', fontFamily: 'serif', fontWeight: 'bold' }}>
                Agent
              </text>
              
              {/* Loop */}
              <rect x="180" y="115" width="120" height="30" rx="4" fill="#E8E6E0" stroke="#1A1A2E" strokeWidth="1" />
              <text x="240" y="135" textAnchor="middle" style={{ fontSize: '12px', fill: '#5C7A9E', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
                Loop
              </text>
              
              {/* Skills */}
              <rect x="190" y="155" width="100" height="25" rx="4" fill="#F5F2EC" stroke="#1A1A2E" strokeWidth="1" strokeDasharray="4,2" />
              <text x="240" y="172" textAnchor="middle" style={{ fontSize: '11px', fill: '#B48EAD', fontFamily: 'sans-serif' }}>
                Skills
              </text>
              
              {/* Bash */}
              <rect x="150" y="190" width="80" height="35" rx="4" fill="#E8E6E0" stroke="#1A1A2E" strokeWidth="1" />
              <text x="190" y="212" textAnchor="middle" style={{ fontSize: '13px', fill: '#A3BE8C', fontFamily: 'monospace', fontWeight: 'bold' }}>
                Bash
              </text>
              
              {/* CLI */}
              <rect x="250" y="190" width="80" height="35" rx="4" fill="#E8E6E0" stroke="#1A1A2E" strokeWidth="1" />
              <text x="290" y="212" textAnchor="middle" style={{ fontSize: '13px', fill: '#A3BE8C', fontFamily: 'monospace', fontWeight: 'bold' }}>
                CLI
              </text>
              
              {/* 连接 Lines */}
              <line x1="240" y1="145" x2="240" y2="155" stroke="#999" strokeWidth="1" />
              
              <line x1="190" y1="167" x2="190" y2="190" stroke="#999" strokeWidth="1" />
              <line x1="290" y1="167" x2="290" y2="190" stroke="#999" strokeWidth="1" />
            </g>

            {/* 大模型 */}
            <g>
              <rect x="380" y="135" width="100" height="50" rx="4" fill="white" stroke="#D47A5C" strokeWidth="2" />
              <text x="430" y="165" textAnchor="middle" style={{ fontSize: '14px', fill: '#D47A5C', fontFamily: 'serif', fontWeight: 'bold' }}>
                大模型
              </text>
            </g>

            {/* 箭头 Agent 到 大模型 */}
            <path d="M340 160 L380 160" stroke="#1A1A2E" strokeWidth="1.5" markerEnd="url(#arrow1)" fill="none" />
            
            {/* 返回结果 箭头 */}
            <path d="M240 80 C240 60, 50 40, 50 140" stroke="#1A1A2E" strokeWidth="1.5" markerEnd="url(#arrow1)" fill="none" />
            <text x="80" y="75" textAnchor="middle" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              返回结果
            </text>

            {/* 左侧说明 */}
            <text x="60" y="250" textAnchor="start" style={{ fontSize: '11px', fill: '#5C7A9E', fontFamily: 'sans-serif', fontWeight: '500' }}>
              简单操作:
            </text>
            <text x="60" y="270" textAnchor="start" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              文件的添删改查
            </text>
            <text x="60" y="285" textAnchor="start" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              通用网络访问
            </text>
            <text x="60" y="300" textAnchor="start" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              系统状态
            </text>

            {/* 右侧说明 */}
            <text x="340" y="250" textAnchor="start" style={{ fontSize: '11px', fill: '#B48EAD', fontFamily: 'sans-serif', fontWeight: '500' }}>
              复杂操作:
            </text>
            <text x="340" y="270" textAnchor="start" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              其他厂商工具MCP
            </text>
            <text x="340" y="285" textAnchor="start" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              其他语言脚本python/nodejs
            </text>
            <text x="340" y="300" textAnchor="start" style={{ fontSize: '10px', fill: '#666', fontFamily: 'sans-serif' }}>
              工作流操作，编程等
            </text>

            {/* 箭头定义 */}
            <defs>
              <marker id="arrow1" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#1A1A2E" />
              </marker>
            </defs>
          </svg>
        </motion.div>

        {/* 右侧：表格 */}
        <motion.div
          initial={active ? { opacity: 0, x: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 space-y-4"
        >
          {/* 工具列表 */}
          <div className="bg-white rounded-xl overflow-hidden border border-[#E8E6E0] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E6E0]">
                  <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]" style={{ background: '#F5F2EC' }}>工具</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]" style={{ background: '#F5F2EC' }}>出品方</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]" style={{ background: '#F5F2EC' }}>特点</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, i) => (
                  <motion.tr
                    key={i}
                    initial={active ? { opacity: 0, y: 5 } : { opacity: 0 }}
                    animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                    className="border-b border-[#F0EEE8]"
                  >
                    <td className="py-2 px-4 text-[#5C7A9E] font-mono text-xs" style={{width:"130px"}}>{tool.name}</td>
                    <td className="py-2 px-4 text-[#1A1A2E] text-xs" style={{width:"110px"}}>{tool.provider}</td>
                    <td className="py-2 px-4 text-[#666] text-xs">{tool.feature}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 企业级工具列表 */}
          <div className="bg-white rounded-xl overflow-hidden border border-[#E8E6E0] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E6E0]">
                  <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]" style={{ background: '#F5F2EC' }}>工具</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]" style={{ background: '#F5F2EC' }}>出品方</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]" style={{ background: '#F5F2EC' }}>覆盖能力</th>
                </tr>
              </thead>
              <tbody>
                {enterpriseTools.map((tool, i) => (
                  <motion.tr
                    key={i}
                    initial={active ? { opacity: 0, y: 5 } : { opacity: 0 }}
                    animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                    className="border-b border-[#F0EEE8]"
                  >
                    <td className="py-2 px-4 text-[#5C7A9E] font-mono text-xs" style={{width:"130px"}}>{tool.name}</td>
                    <td className="py-2 px-4 text-[#1A1A2E] text-xs" style={{width:"110px"}}>{tool.provider}</td>
                    <td className="py-2 px-4 text-[#666] text-xs">{tool.feature}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide5({ active }: { active: boolean }) {
  const vendors = [
    { vendor: "Google", model: "Gemini 系列: Gemini 3.5 等;\n开源 Gemma 系列", product: "Gemini App / NotebookLM / Workspace AI", codeEditor: "Antigravity", ecosystem: "Google, Gmail, Youtube" },
    { vendor: "OpenAI", model: "GPT-5.6(Sol/Terra/Luna)", product: "ChatGPT Desktop / openclaw", codeEditor: "Codex", ecosystem: "不清晰，早期与微软结合较深" },
    { vendor: "Anthropic", model: "Claude 家族: Claude Opus 4.8、\nClaude Fable5", product: "Claude.ai / Claude Desktop", codeEditor: "Claude Code", ecosystem: "编程，通用" },
    { vendor: "Meta", model: "Llama 4 (Maverick / Scout，原生多模态、大上下文) / Llama 3 系\n(3.3 / 3.2 / 3.1)", product: "Meta AI", codeEditor: "暂无官方", ecosystem: "Facebook" },
    { vendor: "X / xAI", model: "Grok", product: "Grok AI", codeEditor: "暂无官方", ecosystem: "X" },
    { vendor: "字节跳动", model: "豆包大模型 2.0: Doubao-Seed-2.0\n系列", product: "豆包 App;\n扣子 COZE、\n火山引擎模型中心, ArkClaw,\nTRAE work", codeEditor: "TRAE", ecosystem: "抖音, 飞书，视频，图像" },
    { vendor: "阿里巴巴", model: "Qwen3.7 系列", product: "通义千问 Qwen App\n阿里云方舟模型\nQoderWork", codeEditor: "Qoder", ecosystem: "电商, 钉钉" },
    { vendor: "腾讯", model: "混元 (Hunyuan) 系列", product: "腾讯元宝\nWorkbuddy", codeEditor: "CodeBuddy", ecosystem: "微信, 企业微信, 公众号, 小程序" },
    { vendor: "Kimi / 月之暗面", model: "Kimi K2.7", product: "Kimi App", codeEditor: "Kimi Code", ecosystem: "编程" },
    { vendor: "MiniMax", model: "MiniMax M2.5", product: "Minimax App", codeEditor: "暂无官方", ecosystem: "不清晰" },
    { vendor: "智谱(Zhipu)", model: "GLM-5.2", product: "智谱清言 (Z.ai App)", codeEditor: "Z Code", ecosystem: "科研" },
    { vendor: "百度", model: "文心 系列", product: "文心一言", codeEditor: "文心快码 (Comate)", ecosystem: "百度搜索" },
    { vendor: "DeepSeek", model: "DeepSeek-V4", product: "DeepSeek 官网/App/API", codeEditor: "暂无官方", ecosystem: "通用" },
  ];

  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 lg:px-24 pt-12 pb-12" style={{ background: '#F5F2EC' }}>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight">
        主流 AI 厂商生态对比
      </h1>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* 表格区域 */}
        <motion.div
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 overflow-auto rounded-xl border border-[#E8E6E0] shadow-sm bg-white"
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#1A1A2E' }}>
                <th className="text-left py-3 px-4 font-semibold text-white text-xs">厂商</th>
                <th className="text-left py-3 px-4 font-semibold text-white text-xs">模型（代表/系列）</th>
                <th className="text-left py-3 px-4 font-semibold text-white text-xs">AI 产品（面向用户）</th>
                <th className="text-left py-3 px-4 font-semibold text-white text-xs">AI 代码编辑器 / 编程工具</th>
                <th className="text-left py-3 px-4 font-semibold text-white text-xs">生态位</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <motion.tr
                  key={i}
                  initial={active ? { opacity: 0, y: 5 } : { opacity: 0 }}
                  animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
                  className="border-b border-[#F0EEE8]"
                  style={{ background: i % 2 === 0 ? 'white' : '#FAF8F4' }}
                >
                  <td className="py-2 px-4 text-[#1A1A2E] font-semibold text-xs whitespace-nowrap">{v.vendor}</td>
                  <td className="py-2 px-4 text-[#5C7A9E] text-xs whitespace-pre-line font-mono" style={{width:"300px"}}>{v.model}</td>
                  <td className="py-2 px-4 text-[#1A1A2E] text-xs whitespace-pre-line">{v.product}</td>
                  <td className="py-2 px-4 text-[#D47A5C] text-xs whitespace-pre-line font-mono">{v.codeEditor}</td>
                  <td className="py-2 px-4 text-[#666] text-xs">{v.ecosystem}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* 评论区域 */}
        <motion.div
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="space-y-3">
              <div className="text-[#1A1A2E] text-base md:text-lg font-serif leading-relaxed">
                <span className="text-[#D47A5C] font-semibold">做什么选什么头部生态的厂商</span>，国内海外差不多
              </div>
              <div className="text-[#1A1A2E] text-base md:text-lg font-serif leading-relaxed">
                <span className="text-[#5C7A9E] font-semibold">AI 只是一个选项</span>，官方工具是第一选择
              </div>
              <div className="text-[#1A1A2E] text-base md:text-lg font-serif leading-relaxed">
                <span className="text-[#D47A5C] font-semibold">国内值得充年卡是字节和阿里</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide6({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight">
        WorkBuddy的使用
      </h1>

      <div className="flex-1 flex flex-col lg:flex-row items-start gap-8 mt-4">
        <motion.div
          initial={active ? { opacity: 0, x: -20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-shrink-0"
        >
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#1A1A2E]/10 p-6 space-y-4">
            <div className="text-[#1A1A2E] text-lg font-serif">
              <a href="https://www.codebuddy.cn/work/" target="_blank" rel="noopener noreferrer" className="text-[#5C7A9E] hover:underline font-semibold">
                https://www.codebuddy.cn/work/
              </a>
            </div>
            <div className="h-px bg-[#1A1A2E]/10" />
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#D47A5C] text-xl">✓</span>
                <span className="text-[#1A1A2E] text-base font-serif">自动安装工具和依赖，对标Codex</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D47A5C] text-xl">✓</span>
                <span className="text-[#1A1A2E] text-base font-serif">目前有免费活动</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D47A5C] text-xl">✓</span>
                <span className="text-[#1A1A2E] text-base font-serif">腾讯生态占位，公众号小程序，可连接微信</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D47A5C] text-xl">✓</span>
                <span className="text-[#1A1A2E] text-base font-serif">支持手机端、云端</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={active ? { opacity: 0, x: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10">
            <img
              src="/slide/5.png"
              alt="WorkBuddy 界面"
              className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
              onClick={() => onImageClick?.('/slide/5.png')}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide7({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  const [step, setStep] = useState(1);

  const steps = [
    { num: 1, title: "workflow", img: "/slide/6.png", desc: "" },
    { num: 2, title: "安装技能", img: "/slide/7.png", desc: "" },
    { num: 3, title: "最终效果", img: "/slide/8.png", desc: "" },
    { num: 4, title: "注意事项", img: "/slide/9.png", desc: "" },
    { num: 5, title: "转发小红书", img: "/slide/10.png", desc: "" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight">
        Workbuddy+公众号
      </h1>

      {/* 步骤按钮 */}
      <div className="flex justify-center gap-4 mb-6">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`px-6 py-3 rounded-full font-serif text-lg transition-all ${
              step === s.num
                ? 'bg-[#1A1A2E] text-white shadow-lg scale-105'
                : 'bg-white text-[#1A1A2E] border border-[#1A1A2E]/20 hover:border-[#1A1A2E]/40'
            }`}
          >
            {s.num}. {s.title}
          </button>
        ))}
      </div>

      {/* 图片展示区 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
            animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <div className="rounded-2xl shadow-lg border border-[#1A1A2E]/10 overflow-hidden">
              <div className="p-6">
                <div className="text-[#1A1A2E] text-xl font-serif mb-4 text-center font-semibold">
                  第 {step} 步：{steps[step - 1].title}
                </div>
                <div className="flex justify-center">
                  <img
                    src={steps[step - 1].img}
                    alt={steps[step - 1].title}
                    className="max-w-full object-contain"
                    style={{ maxHeight: 'calc(100vh - 380px)' }}
                  />
                </div>
                <div className="text-[#1A1A2E]/70 text-base font-serif mt-4 text-center">
                  {steps[step - 1].desc}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 左右切换箭头 */}
      </div>
    </div>
  );
}

function Slide8({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-8 tracking-tight">
        Workbuddy+企微CLI
      </h1>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10"
        >
          <img
            src="/slide/21.png"
            alt="Workbuddy+企微CLI"
            className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: 'calc(100vh - 250px)' }}
            onClick={() => onImageClick?.('/slide/21.png')}
          />
        </motion.div>
      </div>
    </div>
  );
}

function Slide9({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-8 tracking-tight">
        Workbuddy+财务分析
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10"
        >
          <img
            src="/slide/22.png"
            alt="财务分析报告"
            className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: 'calc(100vh - 350px)' }}
            onClick={() => onImageClick?.('/slide/22.png')}
          />
        </motion.div>

        <motion.a
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          href="/slide/信贷财务分析报告_2025年度.md"
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A2E] text-white rounded-xl hover:bg-[#2A2A4E] transition-colors shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载财务分析报告
        </motion.a>
      </div>
    </div>
  );
}

function Slide10({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <div className="flex flex-col flex-1">
        <motion.h1
          initial={active ? { opacity: 0, y: -30 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight text-left"
        >
          扣子+微信公众号/客服
        </motion.h1>

        <motion.div
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <a
            href="https://code.coze.cn/home"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5C7A9E] text-xl md:text-2xl font-serif hover:underline transition-all hover:text-[#D47A5C]"
          >
            https://code.coze.cn/home
          </a>
        </motion.div>

        <motion.div
          initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10">
            <img
              src="/slide/23.png"
              alt="扣子+微信公众号/客服"
              className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
              onClick={() => onImageClick?.('/slide/23.png')}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide11({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <div className="flex flex-col flex-1">
        <motion.h1
          initial={active ? { opacity: 0, y: -30 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight text-left"
        >
          腾讯元器智能体
        </motion.h1>

        <motion.div
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <a
            href="https://yuanqi.tencent.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5C7A9E] text-xl md:text-2xl font-serif hover:underline transition-all hover:text-[#D47A5C]"
          >
            https://yuanqi.tencent.com/
          </a>
        </motion.div>

        <motion.div
          initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10">
            <img
              src="/slide/24.png"
              alt="腾讯元器智能体"
              className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
              onClick={() => onImageClick?.('/slide/24.png')}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide12({ active, onImageClick }: { active: boolean; onImageClick?: (src: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#F5F2EC] px-8 md:px-16 lg:px-24 pt-12 pb-12">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <div className="flex flex-col flex-1">
        <motion.h1
          initial={active ? { opacity: 0, y: -30 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight text-left"
        >
          火山ArkClaw+飞书CLI
        </motion.h1>

        <motion.div
          initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <a
            href="https://www.volcengine.com/product/arkclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5C7A9E] text-xl md:text-2xl font-serif hover:underline transition-all hover:text-[#D47A5C]"
          >
            https://www.volcengine.com/product/arkclaw
          </a>
        </motion.div>

        <motion.div
          initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10">
            <img
              src="/slide/25.png"
              alt="火山ArkClaw+飞书CLI"
              className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
              onClick={() => onImageClick?.('/slide/25.png')}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Slide13({ active }: { active: boolean }) {
  const cards = [
    {
      icon: <GlobalOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "生态选择",
      desc: "选择尤为重要，国内和出海都应该注意。选对平台和生态是成功的第一步。",
    },
    {
      icon: <ThunderboltOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "业务放大器",
      desc: "AI是放大器，首要应该思考的是本身业务要有价值。AI只是工具，业务才是核心。",
    },
    {
      icon: <BulbOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "商业规律",
      desc: "不要为了AI而AI，toC为了创造，toB为了效率效果，把握好基本商业规律。",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#F5F2EC]">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>

      <motion.div
        initial={active ? { opacity: 0, y: -20 } : { opacity: 0 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-4 tracking-tight">
          AI时代什么才是我们的工作？
        </h1>
        <p className="text-[#D47A5C] text-2xl md:text-3xl lg:text-4xl font-serif tracking-tight">
          What is your Job Now?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mt-16">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm"
          >
            <div className="mb-6 text-[#1A1A2E]" style={{ fontSize: '24px' }}>{card.icon}</div>
            <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-4">
              {card.title}
            </div>
            <div className="text-[#1A1A2E]/65 text-base leading-relaxed">
              {card.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide14({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5F2EC] px-8">
      <motion.div
        initial={active ? { opacity: 0, y: -30 } : { opacity: 0 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center"
      >
        <h1 className="text-[#1A1A2E] text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight mb-12">
          感谢观看
        </h1>
      </motion.div>

      <motion.div
        initial={active ? { opacity: 0, scale: 0.8 } : { opacity: 0 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-[#1A1A2E]/10">
          <img
            src="/slide/26.png"
            alt="本资料地址"
            className="w-48 h-48 md:w-56 md:h-56 object-contain"
          />
        </div>
        <p className="mt-4 text-[#1A1A2E]/65 text-base md:text-lg font-serif">
          本资料地址
        </p>
      </motion.div>
    </div>
  );
}

export default function Ai0708Page() {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const total = 14;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  const handleImageClick = useCallback((src: string) => {
    setPreviewImage(src);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  const handleSvgClick = useCallback(() => {
    setShowVideo(true);
  }, []);

  const closeVideo = useCallback(() => {
    setShowVideo(false);
  }, []);

  // fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Close preview or video on Escape
      if (e.key === "Escape") {
        closePreview();
        closeVideo();
        return;
      }
      
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen, closePreview]);

  // touch / swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    touchStart.current = null;
  };

  const slides = [
    <Slide1 key={0} active={index === 0} />,
    <Slide2 key={1} active={index === 1} onImageClick={handleImageClick} />,
    <Slide3 key={2} active={index === 2} />,
    <Slide4 key={3} active={index === 3} onSvgClick={handleSvgClick} />,
    <Slide5 key={4} active={index === 4} />,
    <Slide6 key={5} active={index === 5} onImageClick={handleImageClick} />,
    <Slide7 key={6} active={index === 6} />,
    <Slide8 key={7} active={index === 7} onImageClick={handleImageClick} />,
    <Slide9 key={8} active={index === 8} onImageClick={handleImageClick} />,
    <Slide10 key={9} active={index === 9} onImageClick={handleImageClick} />,
    <Slide11 key={10} active={index === 10} onImageClick={handleImageClick} />,
    <Slide12 key={11} active={index === 11} onImageClick={handleImageClick} />,
    <Slide13 key={12} active={index === 12} />,
    <Slide14 key={13} active={index === 13} />,
  ];

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#F5F2EC' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full"
        >
          {slides[index]}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        disabled={index === 0}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[#1A1A2E] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-30"
      >
        ←
      </button>
      <button
        onClick={next}
        disabled={index === total - 1}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[#1A1A2E] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-30"
      >
        →
      </button>

      {/* fullscreen button */}
      <button
        onClick={toggleFullscreen}
        aria-label="Toggle fullscreen"
        className={`absolute top-6 right-8 w-9 h-9 rounded-full bg-white/0 hover:bg-white/10 transition-colors flex items-center justify-center z-30 ${index === 3 ? 'text-white/60 hover:text-white' : 'text-[#1A1A2E]/50 hover:text-[#1A1A2E]'}`}
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 4 20 10 20" />
            <polyline points="20 10 20 4 14 4" />
            <line x1="14" y1="10" x2="20" y2="4" />
            <line x1="4" y1="20" x2="10" y2="14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        )}
      </button>

      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-mono z-30 ${index === 3 ? 'text-white/60' : 'text-[#1A1A2E]/60'}`}>
        {index + 1} / {total}
      </div>

      {/* keyboard hint */}
      <div className={`absolute bottom-6 right-8 text-xs hidden md:block z-30 ${index === 3 ? 'text-white/40' : 'text-[#1A1A2E]/40'}`}>
        ← → 切换 / 空格 / F 全屏
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
            onClick={closePreview}
          >
            <button
              onClick={closePreview}
              className="absolute top-6 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-2xl"
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={previewImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={closeVideo}
          >
            <button
              onClick={closeVideo}
              className="absolute top-6 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-2xl"
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
              style={{ height: '80vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src="/slide/agent.mov"
                controls
                autoPlay
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}