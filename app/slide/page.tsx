"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThunderboltOutlined,
  OrderedListOutlined,
  SyncOutlined,
  CompressOutlined,
  AuditOutlined,
  BarChartOutlined,
  ReloadOutlined,
  NodeIndexOutlined,
  BulbOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  RocketOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';

// --- shared canvas animation logic (reused for slide 1) ---

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

// --- Slide 1 component with canvas animations ---

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

    // Canvas 1: lattice
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

    // Canvas 2: line
    const nodeRadius2 = 14;
    const thickness2 = 7;
    const lineNodes = [
      { x: -45, y: -20, z: 0 },
      { x: 45, y: 20, z: 0 },
    ];

    // Canvas 3: square
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

      // Canvas 1
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

      // Canvas 2
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

      // Canvas 3
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
          Code w/<br />Claude
        </div>
        <h1 className="text-[#1A1A2E] text-5xl md:text-6xl font-semibold leading-[1.15] mb-20">
          Build a proactive<br />agent workflow<br />with Claude Code
        </h1>
        <div className="text-[#1A1A2E]/70">
          <div className="text-2xl font-medium text-[#1A1A2E] mb-3">Maya Nielan</div>
          <div className="text-lg">Member of Technical Staff</div>
          <div className="text-lg">Anthropic</div>
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

// --- Slide 2 component (icon cards layout) ---

function Slide2({ active }: { active: boolean }) {
  const cards = [
    {
      icon: <ThunderboltOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Let Claude choose\nwhen to think",
      desc: "Use adaptive thinking and\ndial effort up or down to\ncontrol cost",
    },
    {
      icon: <OrderedListOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Allow your agents more\naccess in a controlled way",
      desc: "Auto mode in Claude Code:\nLet Claude run with more\ntools and permissions",
    },
    {
      icon: <SyncOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Close the agent loop",
      desc: "Design your system so Claude\ncan inspect its outputs and\niterate on them",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        Give the model room to work
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0, y: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm"
          >
            <div className="mb-6 text-[#1A1A2E]">
              {card.icon}
            </div>
            <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-4 whitespace-pre-line">
              {card.title}
            </div>
            <div className="text-[#1A1A2E]/65 text-base leading-relaxed whitespace-pre-line">
              {card.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Slide 3 component (centered heading with underline) ---

function Slide3({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 md:p-20">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <motion.div
        initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.3] tracking-tight mb-8">
          How far have Claude models come<br />
          <span className="relative inline-block">
            from Sonnet 4 to Opus 4.8?
            <motion.div
              initial={active ? { scaleX: 0, opacity: 0 } : { scaleX: 0 }}
              animate={active ? { scaleX: 1, opacity: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-2 left-[-10%] w-[120%] h-[4px] bg-[#D4A574] rounded-full"
              style={{ transformOrigin: "left" }}
            />
          </span>
        </h1>
      </motion.div>
    </div>
  );
}

// --- Slide 4 component (two cards layout) ---

function Slide4({ active }: { active: boolean }) {
  const cards = [
    {
      icon: <CompressOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Describe what you want, not how to\nwork around last model's weaknesses",
      desc: "Write prompts for intent, not model quirks",
    },
    {
      icon: <AuditOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Audit your prompts and systems",
      desc: "Modularize as much as you can and unit\ntest different parts of the system",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        Shrink your scaffolding
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0, y: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm"
          >
            <div className="mb-6 text-[#1A1A2E]">
              {card.icon}
            </div>
            <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-4 whitespace-pre-line">
              {card.title}
            </div>
            <div className="text-[#1A1A2E]/65 text-base leading-relaxed whitespace-pre-line">
              {card.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Slide 5 component (three cards layout) ---

function Slide5({ active }: { active: boolean }) {
  const cards = [
    {
      icon: <BarChartOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Build evals that match\nyour real traffic",
      desc: "Make sure you're testing\nfor the behaviors you want\nin production",
    },
    {
      icon: <ReloadOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Update saturated evals",
      desc: "If the new model aces it, it's not\nmeasuring anything anymore",
    },
    {
      icon: <NodeIndexOutlined className="w-16 h-16 text-[#1A1A2E]" />,
      title: "Benchmark against\nnew models",
      desc: "Once your evals are in the right\nshape, test against new models",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        Refresh your evals
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0, y: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm"
          >
            <div className="mb-6 text-[#1A1A2E]">
              {card.icon}
            </div>
            <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-4 whitespace-pre-line">
              {card.title}
            </div>
            <div className="text-[#1A1A2E]/65 text-base leading-relaxed whitespace-pre-line">
              {card.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Slide 6 component (four cards flow diagram) ---

function Slide6({ active }: { active: boolean }) {
  const cards = [
    { number: "01", title: "Better planning", highlighted: false },
    { number: "02", title: "Fewer failures", highlighted: false },
    { number: "03", title: "Agents run longer", highlighted: false },
    { number: "04", title: "End-to-end task\ncompletion", highlighted: true },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        These stack into autonomy
      </h1>
      <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4 md:gap-0 w-full">
        {cards.map((card, i) => (
          <div key={i} className="flex items-center w-full md:w-1/4">
            <motion.div
              initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
              className={`rounded-3xl p-8 shadow-sm w-full ${
                card.highlighted
                  ? "bg-[#C7C4D6] border border-[#1A1A2E]/10"
                  : "bg-[#F5F2EC] border border-[#1A1A2E]/10"
              }`}
            >
              <div className="text-[#1A1A2E]/40 text-sm font-mono mb-6">
                {card.number}
              </div>
              <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight whitespace-pre-line">
                {card.title}
              </div>
            </motion.div>
            {i < cards.length - 1 && (
              <div className="hidden md:flex w-8 justify-center text-[#1A1A2E]/40 text-2xl">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Slide 7 component (before/after comparison) ---

function Slide7({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        Planning before acting
      </h1>
      <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-8 w-full mb-8">
        <motion.div
          initial={active ? { opacity: 0, x: -20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm flex-1"
        >
          <div className="text-[#1A1A2E]/40 text-sm font-mono mb-4">
            Before
          </div>
          <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-4">
            Acts first, thinks later
          </div>
          <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight">
            Your scaffolding forces<br />the reasoning
          </div>
        </motion.div>
        <div className="hidden md:flex items-center justify-center text-[#1A1A2E]/40 text-3xl">
          →
        </div>
        <motion.div
          initial={active ? { opacity: 0, x: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#C7C4D6] border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm flex-1"
        >
          <div className="text-[#1A1A2E]/40 text-sm font-mono mb-4">
            Now
          </div>
          <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-4">
            Reads everything before<br />taking action
          </div>
          <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight">
            Catches its own mistakes<br />mid plan
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-6 shadow-sm flex items-center gap-6"
      >
        <BulbOutlined className="w-12 h-12 text-[#1A1A2E]" />
        <div className="flex-1">
          <div className="text-[#1A1A2E] text-xl md:text-2xl font-serif leading-tight mb-1">
            What this means for you
          </div>
          <div className="text-[#1A1A2E]/65 text-base">
            Allow Claude time to think
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Slide 8 component (long-horizon agents workflow) ---

function Slide8({ active }: { active: boolean }) {
  const checkpoints = [
    { title: "Checkpoint", desc: "Validate against the goal" },
    { title: "Checkpoint", desc: "Validate against the goal" },
    { title: "Checkpoint", desc: "Confirm and hand off" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-12 tracking-tight">
        Long-horizon agents
      </h1>
      <motion.div
        initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-[#F5F2EC] border border-[#1A1A2E]/10 rounded-3xl p-8 md:p-12 shadow-sm"
      >
        <div className="flex justify-around mb-8">
          {checkpoints.map((cp, i) => (
            <div key={i} className="text-center">
              <div className="text-[#1A1A2E] text-lg font-serif font-semibold mb-1">
                {cp.title}
              </div>
              <div className="text-[#1A1A2E]/50 text-sm">
                {cp.desc}
              </div>
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="flex justify-between px-8 mb-6 overflow-hidden">
            {[...Array(5)].map((_, cycle) => (
              <div key={cycle} className="flex gap-1">
                <div className="w-4 h-10 bg-[#C47A5C] rounded-t-sm" />
                <div className="w-6 h-10 bg-[#1A1A2E]" />
                <div className="w-5 h-10 bg-[#5C7A9E]" />
                <div className="w-4 h-10 bg-[#6A7A5C] rounded-t-sm" />
              </div>
            ))}
          </div>
          <svg className="absolute top-0 left-0 w-full h-12 pointer-events-none" viewBox="0 0 800 40" preserveAspectRatio="none">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${100 + i * 140} 40 Q${125 + i * 140} -10 ${150 + i * 140} 40`}
                stroke="#1A1A2E"
                strokeWidth="1"
                strokeDasharray={i === 4 ? "4 4" : "none"}
                fill="none"
                opacity="0.3"
              />
            ))}
          </svg>
          <div className="flex justify-between px-4 border-t border-[#1A1A2E]/20 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C47A5C]" />
              <span className="text-[#1A1A2E]/60 text-sm">Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1A1A2E]" />
              <span className="text-[#1A1A2E]/60 text-sm">Execute</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#5C7A9E]" />
              <span className="text-[#1A1A2E]/60 text-sm">Verify</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#6A7A5C]" />
              <span className="text-[#1A1A2E]/60 text-sm">Adjust</span>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.p
        initial={active ? { opacity: 0 } : { opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-8 text-[#1A1A2E]/80 text-lg md:text-xl font-serif max-w-4xl mx-auto"
      >
        The agent runs unsupervised, but never unchecked. Every cycle ends in self-verification.
      </motion.p>
    </div>
  );
}

// --- Slide 9 component (Sonnet 4 demo) ---

function Slide9({ active }: { active: boolean }) {
  const stats = [
    { value: "43", label: "Tool uses", icon: "🛠" },
    { value: "2,640", label: "Lines added", icon: "📝" },
    { value: "57", label: "Lines deleted", icon: "🗑" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="absolute top-8 right-10 text-4xl font-serif text-[#1A1A2E]/20 tracking-tight select-none">
        AI
      </div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <h1 className="text-[#1A1A2E] text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight">
            Sonnet 4
          </h1>
          <p className="text-[#1A1A2E]/50 text-lg mt-2">May 2025</p>
        </div>
        <div className="flex gap-8 mt-6 md:mt-0">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-[#1A1A2E] text-3xl md:text-4xl font-serif font-semibold">
                {stat.value}
              </div>
              <div className="text-[#1A1A2E]/50 text-sm mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
        <motion.div
          initial={active ? { opacity: 0, x: -20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1 bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-lg"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#2A2A3E]">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/60 text-xs ml-2 font-mono">terminal</span>
          </div>
          <div className="p-4 font-mono text-xs text-green-400/80 overflow-hidden max-h-64 md:max-h-80">
            <div>Wrote 8 lines to postcss.config.js</div>
            <div className="text-gray-500 mt-2">{`export default config`}</div>
            <div className="text-gray-500">{`  plugins: {}`}</div>
            <div className="text-gray-500">{`}`}</div>
            <div className="text-green-400 mt-2">Perfect! I've successfully built...</div>
            <div className="text-gray-500 mt-2">Features Completed:</div>
            <div className="text-gray-400 ml-2">1. Streaming Chat</div>
            <div className="text-gray-400 ml-2">2. Conversation Management</div>
            <div className="text-gray-400 ml-2">3. Model Selection</div>
            <div className="text-gray-400 ml-2">4. System Prompt Editor</div>
            <div className="text-gray-500 mt-2">Project Structure:</div>
            <div className="text-gray-400 ml-2">app/</div>
            <div className="text-gray-400 ml-4">layout.tsx</div>
            <div className="text-gray-400 ml-4">page.tsx</div>
            <div className="text-gray-400 ml-2">components/</div>
            <div className="text-gray-400 ml-4">Sidebar.tsx</div>
            <div className="text-gray-400 ml-4">ChatInterface.tsx</div>
          </div>
        </motion.div>
        <motion.div
          initial={active ? { opacity: 0, x: 20 } : { opacity: 0 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex-1 bg-white rounded-2xl overflow-hidden shadow-lg border border-[#1A1A2E]/10"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-500 text-xs ml-2 font-mono">localhost:3000</span>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm">+ New chat</span>
              <span className="text-gray-600 text-sm">Tell me about Claude and Anthropic</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs">C</span>
                </div>
                <span className="text-gray-500 text-sm">Sorry, I encountered an error. Please try again.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs mt-auto">
              <span>Regenerate response</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Slide 10 component (Demo section - same task) ---

function Slide10({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#D47A5C' }}>
      <div className="absolute top-8 right-10 text-white text-3xl font-serif tracking-tight select-none opacity-90">
        AI
      </div>
      <motion.div
        initial={active ? { opacity: 0, scale: 0.95 } : { opacity: 0, scale: 1 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="text-white/80 text-lg md:text-xl font-serif mb-6">
          Demo
        </div>
        <h1 className="text-white text-4xl md:text-6xl lg:text-8xl font-serif leading-tight tracking-tight">
          The same task,
          <br />
          12 months apart
        </h1>
      </motion.div>
    </div>
  );
}

// --- Slide 11 component (Where the gains are landing) ---

function Slide11({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#D47A5C' }}>
      <div className="absolute top-8 right-10 text-white text-3xl font-serif tracking-tight select-none opacity-90">
        AI
      </div>
      <motion.div
        initial={active ? { opacity: 0, x: -30 } : { opacity: 0, x: 0 }}
        animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full px-8 md:px-16 lg:px-24"
      >
        <h1 className="text-white text-5xl md:text-7xl lg:text-9xl font-serif leading-tight tracking-tight text-left">
          Where the gains
          <br />
          are landing
        </h1>
      </motion.div>
    </div>
  );
}

// --- Slide 12 component (The context: what does it need to know?) ---

function Slide12({ active }: { active: boolean }) {
  const cards = [
    {
      icon: <SearchOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "Codebase repositories",
      desc: "Dive into the source to understand flags, defaults, and usage instructions.",
    },
    {
      icon: <CheckCircleOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "Connectors",
      desc: "Attach to relevant tools and data sources.",
    },
    {
      icon: <BookOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "Marketing briefs",
      desc: "Understand how we talk about the feature so the docs sound like us.",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white">
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        The context: what does it need to know?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className="border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm"
          >
            <div className="mb-6 text-[#1A1A2E]">{card.icon}</div>
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

// --- Slide 13 component (The trigger: when does it run?) ---

function Slide13({ active }: { active: boolean }) {
  const cards = [
    {
      icon: <CalendarOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "Schedule-based",
      desc: "Weekly review of GitHub issues that mention docs.",
    },
    {
      icon: <RocketOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "Release-based",
      desc: "When a release is cut, diff the release branch against the docs for new features and behavior changes.",
    },
    {
      icon: <CheckSquareOutlined className="w-12 h-12 text-[#1A1A2E]" />,
      title: "Label-based",
      desc: "Let engineers proactively tag PRs that need documentation.",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white">
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        The trigger: when does it run?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className="border border-[#1A1A2E]/10 rounded-3xl p-8 shadow-sm"
          >
            <div className="mb-6 text-[#1A1A2E]">{card.icon}</div>
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

// --- Slide 14 component (Three decisions for any routine) ---

function Slide14({ active }: { active: boolean }) {
  const sections = [
    { num: "1", title: "Trigger", desc: "When does it run?" },
    { num: "2", title: "Context", desc: "What does it know?" },
    { num: "3", title: "Steering", desc: "How do you keep it honest?" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white">
      <h1 className="text-[#1A1A2E] text-4xl md:text-5xl lg:text-6xl font-serif mb-16 tracking-tight">
        Three decisions for any routine
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
        {sections.map((s, i) => (
          <motion.div
            key={i}
            initial={active ? { opacity: 0, y: 20 } : { opacity: 0 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: active ? 0.2 + i * 0.1 : 0 }}
            className={`flex flex-col items-start ${
              i < 2 ? 'md:border-r border-[#1A1A2E]/10 pr-8' : ''
            }`}
          >
            <div className="text-[#D47A5C] text-6xl md:text-7xl font-serif mb-6 font-light">
              {s.num}
            </div>
            <div className="text-[#1A1A2E] text-2xl md:text-3xl font-serif font-semibold mb-4">
              {s.title}
            </div>
            <div className="text-[#1A1A2E]/65 text-lg leading-relaxed">
              {s.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Slide 15 ---

function Slide15({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col justify-between bg-white px-[48px] pt-[40px] pb-[40px]">
      <div>
        <h1 className="text-[60px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          Let&apos;s create a routine
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[1000px]">
          {/* terminal window */}
          <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            {/* terminal header */}
            <div className="flex justify-between items-center px-6 py-3 bg-white">
              <span className="text-lg text-[#C86B4E] font-mono">Claude Code</span>
              <span className="text-lg text-gray-500 font-mono">~/anthropic/docs</span>
            </div>

            {/* claude welcome */}
            <div className="flex flex-col items-center py-8">
              {/* asterisk icon */}
              <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="10" fill="#E49173" />
                <rect x="37" y="4" width="6" height="18" rx="3" fill="#E49173" />
                <rect x="37" y="58" width="6" height="18" rx="3" fill="#E49173" />
                <rect x="4" y="37" width="18" height="6" rx="3" fill="#E49173" />
                <rect x="58" y="37" width="18" height="6" rx="3" fill="#E49173" />
                <rect x="14" y="14" width="6" height="14" rx="3" fill="#E49173" transform="rotate(-45 17 21)" />
                <rect x="60" y="14" width="6" height="14" rx="3" fill="#E49173" transform="rotate(45 63 21)" />
                <rect x="14" y="52" width="6" height="14" rx="3" fill="#E49173" transform="rotate(45 17 59)" />
                <rect x="60" y="52" width="6" height="14" rx="3" fill="#E49173" transform="rotate(-45 63 59)" />
              </svg>
              <p className="mt-4 text-xl text-gray-800 font-serif">Welcome to Claude Code.</p>
            </div>

            {/* input box */}
            <div className="px-8 pb-8">
              <div className="bg-[#161616] rounded-xl px-6 py-5">
                <p className="text-xl text-white font-mono leading-relaxed">
                  <span className="text-[#E49173]">&gt;</span>{" "}
                  <span className="text-[#E49173]">/schedule</span>{" "}
                  <span>Once a week review all the new changes merged to main against </span>
                  <span className="text-[#7B9DE0]">claude-code-docs</span>{" "}
                  <span>and create a PR to update docs.</span>
                  <span className="inline-block w-1 h-6 bg-gray-400 ml-1 align-middle animate-pulse"></span>
                </p>
              </div>
              <div className="mt-3 px-4 pb-4">
                <p className="text-base text-gray-500 font-mono">
                  <span className="text-[#E4B65A]">auto mode on</span> · shift+tab to cycle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 16 ---

function Slide16({ active }: { active: boolean }) {
  const points = [
    { x: 0, y: 150, label: "Jan" },
    { x: 180, y: 130, label: "Feb" },
    { x: 360, y: 75, label: "Mar" },
    { x: 540, y: 25, label: "Apr" },
  ];
  return (
    <div className="w-full h-full flex flex-col bg-white px-[48px] pt-[40px] pb-[30px]">
      <div>
        <h1 className="text-[50px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          Weekly PRs for Claude Code up 200%
        </h1>
        <p className="mt-3 text-[28px] text-gray-500 font-light">
          with 1 engineer on documentation
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center mt-6">
        <div className="w-full max-w-[1100px]">
          <div className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-10">
            <h2 className="text-[28px] text-center text-gray-800 font-bold tracking-tight">
              PRs merged to main by Claude Code team per week
            </h2>
            <p className="mt-2 text-center text-lg text-gray-500 font-mono">claude-cli-internal</p>

            {/* chart */}
            <div className="relative mt-8" style={{ height: 240 }}>
              {/* y axis label */}
              <div className="absolute left-0 top-0 bottom-0 flex items-center">
                <span className="text-base text-gray-700 font-bold -rotate-90 origin-center whitespace-nowrap" style={{ transform: "rotate(-90deg)" }}>
                  PRs merged
                </span>
              </div>

              {/* chart area */}
              <div className="ml-16 relative" style={{ height: 220 }}>
                {/* baseline */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>

                {/* line */}
                <svg width="100%" height="180" viewBox="0 0 540 180" preserveAspectRatio="none" className="absolute bottom-6 left-0">
                  <defs>
                    <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#888888" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#888888" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${points.map((p) => `${p.x},${p.y}`).join(" L ")} L 540,180 L 0,180 Z`}
                    fill="url(#fillGrad)"
                  />
                  <path
                    d={`M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`}
                    fill="none"
                    stroke="#777777"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="8" fill="#999999" stroke="white" strokeWidth="3" />
                    </g>
                  ))}
                </svg>

                {/* x labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0" style={{ marginLeft: 0 }}>
                  {points.map((p, i) => (
                    <span key={i} className="text-base text-gray-600" style={{ marginLeft: i === 0 ? -5 : 0, marginRight: i === points.length - 1 ? -5 : 0 }}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 17 ---

function Slide17({ active }: { active: boolean }) {
  const items = [
    {
      title: "Always available with managed infrastructure",
      desc: "Routines run on Claude Code's cloud with hosting, session state, and connector auth handled. Nothing depends on your laptop being open.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 72 72" fill="none">
          {/* folder/cloud icon */}
          <rect x="10" y="22" width="48" height="32" rx="4" stroke="#555" strokeWidth="2.5" fill="none" />
          <rect x="16" y="16" width="20" height="10" rx="3" stroke="#555" strokeWidth="2.5" fill="none" />
          {/* globe inside */}
          <circle cx="34" cy="40" r="10" stroke="#555" strokeWidth="2" fill="none" />
          <path d="M24 40 L44 40" stroke="#555" strokeWidth="1.5" />
          <path d="M34 30 Q30 35 30 40 Q30 45 34 50" stroke="#555" strokeWidth="1.5" fill="none" />
          <path d="M34 30 Q38 35 38 40 Q38 45 34 50" stroke="#555" strokeWidth="1.5" fill="none" />
        </svg>
      ),
    },
    {
      title: "Work proactively with customizable triggers",
      desc: "Kick off on a schedule, from any HTTP call, or on GitHub events — with the event payload loaded as context.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 72 72" fill="none">
          {/* zigzag lightning */}
          <path
            d="M20 12 L38 30 L28 34 L44 58 L30 40 L38 36 L24 18 Z"
            stroke="#555"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M40 8 L58 26 L48 30 L64 54 L50 36 L58 32 L44 14 Z"
            stroke="#555"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </svg>
      ),
    },
    {
      title: "Interactive and steerable agent teammates",
      desc: "Every run is a Claude Code session you can open, watch, follow up on, and pause from the web, CLI, and desktop.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 72 72" fill="none">
          {/* hand/puppet icon */}
          <path
            d="M22 44 L22 34 Q22 30 26 30 L26 20 Q26 16 30 16 Q34 16 34 20 L34 30 Q34 26 38 26 Q42 26 42 30 L42 34 Q42 30 46 30 Q50 30 50 34 L50 50 Q50 58 42 60 L30 60 Q22 58 22 50 Z"
            stroke="#555"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="40" r="2" fill="#555" />
          <circle cx="42" cy="40" r="2" fill="#555" />
          <path d="M30 48 Q36 52 42 48" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white px-[48px] pt-[40px] pb-[30px]">
      <div>
        <h1 className="text-[72px] leading-[1] font-serif text-gray-900 tracking-tight">
          Routines
        </h1>
      </div>
      <div className="flex-1 flex items-center mt-6">
        <div className="w-full max-w-[1100px] mx-auto">
          <div className="space-y-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-6 px-6 rounded-2xl"
                style={{
                  background: i === 1 ? "rgba(255,255,255,1)" : "rgba(250,250,252,0.6)",
                  borderTop: i > 0 ? "1px solid rgba(220,220,230,0.5)" : "none",
                }}
              >
                <div className="flex-shrink-0 mt-2">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-[28px] font-semibold text-gray-900 leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[18px] text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 18 ---

function Slide18({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-white px-[48px] pt-[30px] pb-[30px]">
      <div className="flex-1 flex">
        {/* left section */}
        <div className="w-1/3 flex flex-col justify-center pr-16">
          <h1 className="text-[70px] leading-[1] font-serif text-gray-900 tracking-tight">
            Routines
          </h1>
          <p className="mt-4 text-[22px] text-gray-500 leading-relaxed">
            Define the prompt, repo,
            <br />
            connectors, and trigger.
            <br />
            Claude Code handles
            <br />
            the rest.
          </p>
        </div>

        {/* right section - card */}
        <div className="w-2/3 flex items-center">
          <div className="w-full bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-8">
            {/* header */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Telegram Channel Improver</h2>
              <div className="flex items-center gap-4">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="6" stroke="#999" strokeWidth="2" />
                  <path d="M12 16 L18 16 M16 12 L16 18" stroke="#999" strokeWidth="2" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <rect x="6" y="8" width="20" height="20" rx="2" stroke="#999" strokeWidth="2" />
                  <path d="M10 12 L22 12" stroke="#999" strokeWidth="2" />
                  <path d="M10 16 L18 16" stroke="#999" strokeWidth="2" />
                  <path d="M10 20 L16 20" stroke="#999" strokeWidth="2" />
                </svg>
                <button className="bg-black text-white px-4 py-2 rounded-xl text-base font-semibold flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <polygon points="5,3 15,10 5,17" fill="white" />
                  </svg>
                  Run now
                </button>
              </div>
            </div>

            {/* status */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-5 bg-blue-500 rounded-full flex items-center justify-end pr-0.5">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="bg-[#E8F5E9] text-green-700 px-4 py-1.5 rounded-full text-base font-medium flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 9 L8 12 L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Active
              </span>
              <span className="text-gray-500 text-base">Next run: Apr 13 at 11:33 AM</span>
            </div>

            {/* two columns */}
            <div className="flex gap-10">
              {/* left column */}
              <div className="flex-1 space-y-6">
                {/* Repositories */}
                <div>
                  <h3 className="text-gray-500 text-base mb-3">Repositories</h3>
                  <ul className="space-y-2">
                    <li className="text-base text-gray-800">anthropics/claude-plugins-official</li>
                    <li className="text-base text-gray-800">anthropics/claude-cli-internal</li>
                    <li className="text-base text-gray-800">anthropics/claude-code</li>
                  </ul>
                </div>

                {/* Repeats */}
                <div>
                  <h3 className="text-gray-500 text-base mb-3">Repeats</h3>
                  <p className="text-base text-gray-800">Custom cron — 30 18 * * 1,3,5</p>
                  <p className="text-sm text-gray-500 mt-1">At 06:30 PM, only on Monday, Wednesday, and Friday (times in UTC)</p>
                </div>

                {/* Connectors */}
                <div>
                  <h3 className="text-gray-500 text-base mb-3">Connectors</h3>
                  <div className="flex flex-wrap gap-3">
                    {["datadog", "Google Drive", "Growthbook", "PubMed", "Slack"].map((conn) => (
                      <span key={conn} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                        {conn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* right column */}
              <div className="flex-1 space-y-6">
                {/* Instructions */}
                <div>
                  <h3 className="text-gray-500 text-base mb-3">Instructions</h3>
                  <p className="text-base text-gray-800 leading-relaxed">
                    Review open issues and PRs in JUST these two repos:
                    <br />
                    1. claude-plugins-official
                    <br />
                    2. claude-code
                    <br />
                    <br />
                    Note PRs that are in claude-plugins-official are automatically closed so please look at closed PR&apos;s too.
                    <br />
                    <br />
                    claude-cli-internal repo is just there for you to understand the implementation of channels on the harness end. You may need to make a PR to fix the issue either directly in the claude-plugins-official (directly) or in the core harness. Aim for fixes at the plugin level.
                  </p>
                </div>

                {/* Session */}
                <div>
                  <h3 className="text-gray-500 text-base mb-3">Session</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-base font-semibold text-gray-900">Telegram Channel Improver — session</p>
                    <p className="text-sm text-gray-500 mt-1">Last active Today at 12:03 PM</p>

                    {/* Recent Activity */}
                    <div className="mt-4">
                      <h4 className="text-gray-500 text-xs mb-2">RECENT ACTIVITY</h4>
                      <ul className="space-y-1">
                        {["Today at 12:02 PM", "Today at 12:02 PM", "Today at 12:01 PM"].map((time) => (
                          <li key={time} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="6" stroke="#555" strokeWidth="1.5" />
                              <path d="M5 8 L7 8 L10 5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {time}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className="mt-4 w-full text-right text-sm text-blue-600 font-medium flex items-center justify-end gap-2">
                      Open session
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M10 5 L15 10 L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 19 ---

function Slide19({ active }: { active: boolean }) {
  const items = [
    {
      title: "Where to run",
      desc: "Hosting, data persistence, and authentication. Everything outside your prompt.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="12" width="48" height="40" rx="4" stroke="#555" strokeWidth="2" fill="none" />
          <rect x="14" y="18" width="12" height="8" rx="2" stroke="#555" strokeWidth="1.5" fill="none" />
          <rect x="30" y="18" width="12" height="8" rx="2" stroke="#555" strokeWidth="1.5" fill="none" />
          <rect x="46" y="18" width="6" height="8" rx="2" stroke="#555" strokeWidth="1.5" fill="none" />
          <rect x="14" y="32" width="38" height="14" rx="2" stroke="#555" strokeWidth="1.5" fill="none" />
        </svg>
      ),
    },
    {
      title: "When to run",
      desc: "No clean way to start an agent because a PR opened or an alert fired.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
          <path
            d="M16 20 L36 38 L26 42 L44 60 L30 46 L38 42 L22 26 Z"
            stroke="#555"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M36 16 L54 34 L44 38 L62 56 L48 42 L56 38 L40 22 Z"
            stroke="#555"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </svg>
      ),
    },
    {
      title: "How to partner",
      desc: "Headless means invisible. No way to watch, steer, or bound it.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
          <rect x="14" y="16" width="36" height="32" rx="4" stroke="#555" strokeWidth="2" fill="none" />
          <path d="M22 44 L22 32" stroke="#555" strokeWidth="2" />
          <path d="M22 32 Q22 26 28 26 L36 26" stroke="#555" strokeWidth="2" />
          <path d="M36 26 L36 36" stroke="#555" strokeWidth="2" />
          <circle cx="26" cy="36" r="4" stroke="#555" strokeWidth="2" fill="none" />
          <circle cx="38" cy="36" r="4" stroke="#555" strokeWidth="2" fill="none" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white px-[48px] pt-[30px] pb-[30px]">
      <div className="flex-1 flex">
        {/* left title */}
        <div className="w-1/3 flex items-center pr-16">
          <h1 className="text-[60px] leading-[1.1] font-serif text-gray-900 tracking-tight">
            Challenges with
            <br />
            proactive agents
          </h1>
        </div>

        {/* right content */}
        <div className="w-2/3 flex flex-col justify-center space-y-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-6 py-6 px-6 rounded-2xl"
              style={{
                background: i === 1 ? "rgba(255,255,255,1)" : "rgba(250,250,252,0.6)",
                borderTop: i > 0 ? "1px solid rgba(220,220,230,0.5)" : "none",
              }}
            >
              <div className="flex-shrink-0 mt-2">{item.icon}</div>
              <div className="flex-1">
                <h3 className="text-[26px] font-semibold text-gray-900 leading-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-[16px] text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Slide 20 ---

function Slide20({ active }: { active: boolean }) {
  const agendaItems = [
    { num: "01", text: "The challenges with proactive agents today" },
    { num: "02", text: "Introducing routines" },
    { num: "03", text: "Building routines for documentation at Anthropic" },
    { num: "04", text: "Apply routines to your own workflows" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white px-[48px] pt-[30px] pb-[30px]">
      <div className="flex-1 flex">
        {/* left title */}
        <div className="w-1/3 flex items-center pr-16">
          <h1 className="text-[70px] leading-[1] font-serif text-gray-900 tracking-tight">
            Agenda
          </h1>
        </div>

        {/* right content */}
        <div className="w-2/3 flex flex-col justify-center">
          <div className="space-y-0">
            {agendaItems.map((item, i) => (
              <div key={i} className="flex items-center gap-6 py-6">
                <span className="text-[24px] text-gray-400 font-mono font-semibold">{item.num}</span>
                <div className="flex-1">
                  <p className="text-[30px] font-serif text-gray-900 leading-tight tracking-tight">
                    {item.text}
                  </p>
                </div>
                {i < agendaItems.length - 1 && (
                  <div className="absolute left-[40%] right-[10%] h-px bg-gray-200" style={{ marginLeft: "30%" }}></div>
                )}
              </div>
            ))}
          </div>
          {/* horizontal divider lines between items */}
          <div className="absolute left-[35%] top-[25%] right-[10%] h-px bg-gray-200"></div>
          <div className="absolute left-[35%] top-[42%] right-[10%] h-px bg-gray-200"></div>
          <div className="absolute left-[35%] top-[59%] right-[10%] h-px bg-gray-200"></div>
          <div className="absolute left-[35%] top-[76%] right-[10%] h-px bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 21 ---

function Slide21({ active }: { active: boolean }) {
  const stages = [
    { label: "Prototype", color: "#E8E4DC" },
    { label: "Design", color: "#B5B0A8" },
    { label: "Build", color: "#F0DCC8" },
    { label: "Deploy", color: "#C8D5D3" },
    { label: "Support", color: "#D4D5E5" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAF5] px-[60px] pt-[40px] pb-[60px]">
      <div>
        <h1 className="text-[60px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          What you saw
        </h1>
      </div>

      {/* top flow */}
      <div className="flex-1 flex items-center justify-center mt-6">
        <div className="flex items-center gap-4">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center">
              <div
                className="w-36 h-24 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: stage.color }}
              >
                <span className="text-xl font-semibold text-gray-900">{stage.label}</span>
              </div>
              {i < stages.length - 1 && (
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="mx-1">
                  <path d="M15 20 L25 20 M25 20 L20 15 M25 20 L20 25" stroke="#999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* divider */}
      <div className="w-full h-px bg-gray-300 mt-4"></div>

      {/* bottom three cards */}
      <div className="flex-1 flex items-center justify-center gap-6 mt-6">
        {/* Claude Code */}
        <div className="w-64 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-4">Claude Code</h3>
          <div className="text-center text-gray-500 text-lg mb-4">=</div>
          <div className="flex flex-wrap justify-center gap-2">
            {["Memory", "Tools", "Subagents", "Skills", "MCP"].map((tag) => (
              <span key={tag} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Google Cloud */}
        <div className="w-64 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-4">Google Cloud</h3>
          <div className="text-center text-gray-500 text-lg mb-4">=</div>
          <div className="bg-gray-200 rounded-xl p-3">
            <p className="text-gray-700 text-center text-sm">
              Claude inside your Google Cloud project (IAM, region, billing)
            </p>
          </div>
        </div>

        {/* Combination */}
        <div className="w-64 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-1">Claude Code +</h3>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-4">Google Cloud</h3>
          <div className="text-center text-gray-500 text-lg mb-4">=</div>
          <div className="flex justify-center">
            <svg width="60" height="60" viewBox="0 0 80 80" fill="none">
              <polygon points="40,10 55,65 25,65" fill="#E49173" />
              <circle cx="55" cy="25" r="4" fill="#B5B0A8" />
              <circle cx="65" cy="35" r="5" fill="#D4D5E5" />
              <circle cx="62" cy="50" r="3" fill="#C8D5D3" />
              <circle cx="50" cy="55" r="4" fill="#F0DCC8" />
              <circle cx="30" cy="55" r="3" fill="#E8E4DC" />
              <circle cx="18" cy="50" r="4" fill="#B5B0A8" />
              <circle cx="15" cy="35" r="5" fill="#C8D5D3" />
              <circle cx="25" cy="25" r="4" fill="#F0DCC8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 22 ---

function Slide22({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAF5] px-[48px] pt-[30px] pb-[30px]">
      <div>
        <h1 className="text-[55px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          Support: Growth Marketer
        </h1>
        <p className="mt-3 text-[24px] text-gray-500 font-light">
          "App is live. I need docs and a way to read results."
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center gap-6 mt-6">
        {/* left terminal */}
        <div className="flex-1 bg-gray-100 rounded-3xl p-4 shadow-sm">
          <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden">
            {/* terminal header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#2D2D2D]">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {/* terminal content */}
            <div className="p-4 font-mono text-white">
              <p className="text-sm text-gray-400"># BigQuery MCP Terminal</p>
              <p className="text-sm mt-2">
                SELECT COUNT(*) FROM <span className="text-blue-400">`cwc-demo.feedback.responses`</span>
              </p>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-gray-400 text-xs">+----------------+------------------+</div>
                <div className="text-gray-400 text-xs">| responses | avg_rating |</div>
                <div className="text-gray-400 text-xs">+----------------+------------------+</div>
                <div className="text-xs mt-1">| 20 | 5 |</div>
                <div className="text-gray-400 text-xs">+----------------+------------------+</div>
              </div>
            </div>
          </div>
        </div>

        {/* right dashboard */}
        <div className="flex-1 bg-gray-100 rounded-3xl p-4 shadow-sm">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            {/* toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">This is a report title and it can be several characters long</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">Share</button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">View</button>
              </div>
            </div>
            {/* content */}
            <div className="p-4">
              <div className="flex gap-3">
                {/* left side charts */}
                <div className="flex-1 space-y-3">
                  {/* line chart */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-3">Sales over time</p>
                    <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E49173" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#E49173" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,75 L30,68 L60,64 L90,72 L120,60 L150,56 L180,49 L210,52 L240,41 L270,45 L300,38 L300,100 L0,100 Z" fill="url(#chartGrad)" />
                      <path d="M0,75 L30,68 L60,64 L90,72 L120,60 L150,56 L180,49 L210,52 L240,41 L270,45 L300,38" fill="none" stroke="#D47A5C" strokeWidth="2" />
                    </svg>
                  </div>
                  {/* bar chart */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <svg width="100%" height="60" viewBox="0 0 300 60">
                      <rect x="20" y="20" width="40" height="40" fill="#4A7BC4" rx="3" />
                      <rect x="70" y="15" width="40" height="45" fill="#4A7BC4" rx="3" />
                      <rect x="120" y="25" width="40" height="35" fill="#4A7BC4" rx="3" />
                      <rect x="170" y="32" width="40" height="28" fill="#4A7BC4" rx="3" />
                      <rect x="220" y="38" width="40" height="22" fill="#4A7BC4" rx="3" />
                      <rect x="270" y="28" width="25" height="32" fill="#4A7BC4" rx="3" />
                    </svg>
                  </div>
                  {/* bottom bars */}
                  <div className="flex gap-2 h-12">
                    <div className="flex-1 bg-blue-600 rounded-t-lg"></div>
                    <div className="flex-1 bg-blue-500 rounded-t-lg"></div>
                    <div className="flex-1 bg-teal-600 rounded-t-lg"></div>
                    <div className="flex-1 bg-teal-500 rounded-t-lg"></div>
                    <div className="flex-1 bg-teal-400 rounded-t-lg"></div>
                  </div>
                </div>

                {/* right sidebar */}
                <div className="w-40 space-y-3">
                  <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Properties</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Style</span>
                        <span className="text-gray-400">Search style options</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Color by</span>
                        <span className="text-blue-600">Series order</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Line weight</span>
                        <span className="text-gray-600">2</span>
                      </div>
                    </div>
                  </div>
                  {/* donut chart */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex justify-center">
                    <svg width="60" height="60" viewBox="0 0 70 70">
                      <circle cx="35" cy="35" r="28" fill="none" stroke="#4A7BC4" strokeWidth="12" strokeDasharray="60 120" strokeDashoffset="0" />
                      <circle cx="35" cy="35" r="28" fill="none" stroke="#D47A5C" strokeWidth="12" strokeDasharray="40 120" strokeDashoffset="60" />
                      <circle cx="35" cy="35" r="28" fill="none" stroke="#C8D5D3" strokeWidth="12" strokeDasharray="20 120" strokeDashoffset="100" />
                      <text x="35" y="30" textAnchor="middle" fontSize="9" fill="#555">3hr</text>
                      <text x="35" y="42" textAnchor="middle" fontSize="7" fill="#555">22min</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 23 ---

function Slide23({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAF5] px-[48px] pt-[30px] pb-[30px]">
      <div>
        <h1 className="text-[55px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          Deploy: Security Engineer
        </h1>
        <p className="mt-3 text-[24px] text-gray-500 font-light">
          "Nothing ships without my review."
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mt-6">
        {/* top row */}
        <div className="flex items-center gap-4">
          {/* /security-review */}
          <div className="bg-black text-white px-6 py-4 rounded-xl">
            <span className="text-lg font-mono">/security-review</span>
          </div>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M12 16 L20 16 M20 16 L16 12 M20 16 L16 20" stroke="#999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Found missing input validation */}
          <div className="bg-[#E8B098] px-6 py-6 rounded-2xl text-center">
            <svg width="40" height="40" viewBox="0 0 56 56" fill="none" className="mx-auto mb-3">
              <path d="M14 42 L14 30 Q14 24 20 24 L20 16 Q20 12 24 12 Q28 12 28 16 L28 24 Q28 20 32 20 Q36 20 36 24 L36 34 Q36 30 40 30 Q44 30 44 34 L44 46 Q44 52 36 54 L22 54 Q14 52 14 46 Z" stroke="#555" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="36" r="6" stroke="#555" strokeWidth="2" fill="none" />
              <circle cx="36" cy="36" r="6" stroke="#555" strokeWidth="2" fill="none" />
              <circle cx="48" cy="22" r="2" fill="#555" />
              <circle cx="52" cy="30" r="2.5" fill="#555" />
              <circle cx="48" cy="38" r="2" fill="#555" />
              <circle cx="42" cy="44" r="2" fill="#555" />
            </svg>
            <p className="text-sm font-bold text-gray-900">Found missing</p>
            <p className="text-sm font-bold text-gray-900">input validation</p>
          </div>
        </div>

        {/* down arrow */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="my-4">
          <path d="M12 8 L12 16 M12 16 L8 12 M12 16 L16 12" stroke="#999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* bottom row */}
        <div className="flex items-center gap-3">
          {/* Edit Code */}
          <div className="bg-white px-6 py-4 rounded-xl text-center border border-gray-200 shadow-sm">
            <p className="text-base font-bold text-gray-900">Edit Code</p>
            <p className="text-xs text-gray-500 mt-1">Add schema check</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Set Permissions */}
          <div className="bg-white px-6 py-4 rounded-xl text-center border border-gray-200 shadow-sm">
            <p className="text-base font-bold text-gray-900">Set Permissions</p>
            <p className="text-xs text-gray-500 mt-1">Least-privilege service account</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Build & Deploy */}
          <div className="bg-white px-6 py-4 rounded-xl text-center border border-gray-200 shadow-sm">
            <p className="text-base font-bold text-gray-900">Build & Deploy</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Laptop */}
          <div className="bg-gray-200 px-6 py-4 rounded-xl flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
              <rect x="6" y="10" width="44" height="32" rx="4" stroke="#555" strokeWidth="2.5" />
              <rect x="8" y="12" width="40" height="26" rx="2" stroke="#555" strokeWidth="2" fill="white" />
              <path d="M26 24 L38 20 L34 30 Z" stroke="#555" strokeWidth="2" fill="none" />
              <rect x="18" y="42" width="20" height="4" rx="2" stroke="#555" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 24 ---

function Slide24({ active }: { active: boolean }) {
  const outputFiles = [
    "landing.html",
    "form.html",
    "thanks.html",
    "dashboard.html",
    "styles.css",
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAF5] px-[48px] pt-[30px] pb-[30px]">
      <div>
        <h1 className="text-[55px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          Design: UI/UX Developer
        </h1>
        <p className="mt-3 text-[24px] text-gray-500 font-light">
          "I take the wireframe and define the architecture."
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center mt-6">
        <div className="flex items-center gap-4">
          {/* left input */}
          <div className="bg-gray-200 px-8 py-4 rounded-xl">
            <span className="text-lg font-bold text-gray-900">01/wireframe.html</span>
          </div>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M10 16 L22 16 M22 16 L18 12 M22 16 L18 20" stroke="#999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* center Claude Code */}
          <div className="relative">
            <div className="bg-black text-white px-10 py-6 rounded-xl">
              <span className="text-2xl font-bold">Claude Code</span>
            </div>
            {/* MCP arrows */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 14 L10 6 M10 6 L6 10 M10 6 L14 10" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">MCP</span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 6 L10 14 M10 14 L6 10 M10 14 L14 10" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Figma Board */}
              <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 mt-3 text-center">
                <p className="text-sm font-bold text-gray-900">Figma Board</p>
                <p className="text-xs text-gray-500">mcp.figma.com</p>
              </div>
            </div>
          </div>

          {/* right output files */}
          <div className="relative">
            {/* curved arrows */}
            <svg className="absolute left-0 top-0 w-12 h-40" viewBox="0 0 60 200" fill="none">
              <path d="M0 20 C60 20 60 20 60 50" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 60 C60 60 60 60 60 90" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 100 C60 100 60 100 60 130" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 140 C60 140 60 140 60 170" stroke="#999" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 180 C60 180 60 180 60 210" stroke="#999" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <div className="ml-14 flex flex-col gap-3">
              {outputFiles.map((file) => (
                <div key={file} className="bg-gray-200 px-10 py-3 rounded-xl">
                  <span className="text-base font-bold text-gray-900">{file}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 25 ---

function Slide25({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAF5] px-[48px] pt-[30px] pb-[30px]">
      <div>
        <h1 className="text-[55px] leading-[1.05] font-serif text-gray-900 tracking-tight">
          Build: SWE
        </h1>
        <p className="mt-3 text-[24px] text-gray-500 font-light">
          "I design the cloud architecture, then build all three services in parallel."
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center mt-6">
        <div className="flex items-center gap-4">
          {/* hand icon */}
          <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
            <path d="M10 52 L10 40 Q10 34 16 34 L16 24 Q16 20 20 20 Q24 20 24 24 L24 34 Q24 30 28 30 Q32 30 32 34 L32 44 Q32 40 36 40 Q40 40 40 44 L40 56 Q40 62 32 64 L18 64 Q10 62 10 56 Z" stroke="#555" strokeWidth="2.5" fill="none" />
            <circle cx="20" cy="44" r="4" stroke="#555" strokeWidth="2" fill="none" />
            <circle cx="32" cy="44" r="4" stroke="#555" strokeWidth="2" fill="none" />
            <circle cx="48" cy="28" r="3" fill="#555" />
            <circle cx="54" cy="36" r="3.5" fill="#555" />
            <circle cx="50" cy="46" r="3" fill="#555" />
            <circle cx="42" cy="52" r="3" fill="#555" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Cloud Run */}
          <div className="bg-gray-200 px-6 py-4 rounded-xl text-center">
            <p className="text-base font-bold text-gray-900">Cloud Run</p>
            <p className="text-sm text-gray-700">Feedback API</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Firestore */}
          <div className="bg-white px-8 py-6 rounded-xl text-center border border-gray-200 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="mx-auto mb-2">
              <rect x="6" y="4" width="28" height="32" rx="3" stroke="#555" strokeWidth="2" />
              <rect x="10" y="8" width="20" height="6" rx="2" stroke="#555" strokeWidth="1.5" />
              <rect x="10" y="16" width="20" height="6" rx="2" stroke="#555" strokeWidth="1.5" />
              <rect x="10" y="24" width="20" height="6" rx="2" stroke="#555" strokeWidth="1.5" />
            </svg>
            <p className="text-base font-bold text-gray-900">Firestore</p>
            <p className="text-sm text-gray-700">Responses</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* BigQuery */}
          <div className="bg-white px-8 py-6 rounded-xl text-center border border-gray-200 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="mx-auto mb-2">
              <rect x="6" y="4" width="28" height="32" rx="3" stroke="#555" strokeWidth="2" />
              <rect x="10" y="8" width="20" height="6" rx="2" stroke="#555" strokeWidth="1.5" />
              <rect x="10" y="16" width="20" height="6" rx="2" stroke="#555" strokeWidth="1.5" />
              <rect x="10" y="24" width="20" height="6" rx="2" stroke="#555" strokeWidth="1.5" />
            </svg>
            <p className="text-base font-bold text-gray-900">BigQuery</p>
            <p className="text-sm text-gray-700">Analytics</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 12 L14 12 M14 12 L12 10 M14 12 L12 14" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Looker */}
          <div className="bg-gray-200 px-8 py-4 rounded-xl text-center">
            <p className="text-base font-bold text-gray-900">Looker</p>
            <p className="text-sm text-gray-700">Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide 26 ---

function Slide26({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAF5] px-[60px] pt-[60px] pb-[60px]">
      <div className="flex-1 flex items-center">
        {/* left title */}
        <div className="w-1/3 pr-12">
          <h1 className="text-[90px] leading-[1.1] font-serif text-gray-900 tracking-tight">
            Prototype:
            <br />
            Product
            <br />
            Manager
          </h1>
          <p className="mt-8 text-[32px] text-gray-500 font-light">
            "I just joined. What do we have, and what are we building?"
          </p>
        </div>

        {/* right image */}
        <div className="w-2/3">
          <div className="bg-[#C8D5D3] rounded-3xl p-8">
            <div className="bg-white rounded-2xl overflow-hidden">
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=napkin%20sketch%20wireframe%20of%20mobile%20app%20UI%20design%20on%20white%20paper%20napkin%20with%20blue%20pen%20drawing%20smartphone%20interface%20mockup%20with%20QR%20code%20and%20buttons%2C%20coffee%20cup%20and%20pen%20on%20wooden%20table%2C%20realistic%20photo%20style&image_size=landscape_16_9"
                alt="Napkin wireframe"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide27({ active }: { active: boolean }) {
  const items = [
    { text: "Pay per token, no caps", highlight: false },
    { text: "gcloud ADC and you are already signed in", highlight: false },
    { text: "Your project, your IAM", highlight: false },
    { text: "GCP support SLA", highlight: false },
    { text: "You pick the region: US / EU", highlight: false },
    { text: "Lower latency, higher throughput", highlight: true },
  ];
  return (
    <div className={`w-full h-full flex flex-col justify-center items-center bg-[#f2efe5] px-24 ${active ? "" : "hidden"}`}>
      <div className="flex flex-row w-full h-full items-center gap-20 py-24">
        <div className="flex-shrink-0">
          <h2 className="text-7xl font-serif text-gray-900 leading-[1.05]">Why run Claude on Google Cloud</h2>
        </div>
        <div className="flex-1 flex flex-col gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className={`rounded-3xl px-12 py-8 ${
                item.highlight
                  ? "bg-[#c6d5d3] shadow-sm"
                  : "bg-[#f8f6ec] border border-gray-200"
              }`}
            >
              <span className="text-3xl font-serif text-gray-900">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-24 text-sm text-gray-500 font-serif">
        1. OpenRouter. (2026, April 15). Claude 4.6 Opus performance. Retrieved April 15, 2026, from https://openrouter.ai/anthropic/claude-opus-4.6/performance
      </div>
    </div>
  );
}

function Slide28({ active }: { active: boolean }) {
  const roles = [
    {
      name: "Product Manager",
      bg: "bg-[#e3e1dc]",
      border: "border-gray-300",
      icon: (
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          <circle cx="22" cy="22" r="10" fill="none" stroke="#333" strokeWidth="2.5" />
          <polygon points="18,32 38,18 42,22 22,36" fill="#333" />
          <circle cx="50" cy="40" r="6" fill="none" stroke="#333" strokeWidth="2.5" />
          <circle cx="58" cy="58" r="6" fill="none" stroke="#333" strokeWidth="2.5" />
          <line x1="26" y1="26" x2="46" y2="36" stroke="#333" strokeWidth="2" />
          <line x1="52" y1="44" x2="56" y2="54" stroke="#333" strokeWidth="2" />
        </svg>
      ),
      topLabel: "Multimodal",
      bottomLabels: [],
    },
    {
      name: "UI/UX Developer",
      bg: "bg-[#cfcfcf]",
      border: "border-gray-400",
      icon: (
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          <rect x="20" y="30" width="12" height="22" fill="none" stroke="#333" strokeWidth="2.5" />
          <polygon points="36,30 46,25 52,30 52,40 46,45 36,40" fill="none" stroke="#333" strokeWidth="2.5" />
          <circle cx="44" cy="35" r="5" fill="#f2efe5" stroke="#333" strokeWidth="2" />
          <rect x="38" y="46" width="10" height="10" fill="none" stroke="#333" strokeWidth="2.5" />
        </svg>
      ),
      topLabel: "",
      bottomLabels: ["Plan Mode", "Figma MCP"],
    },
    {
      name: "Software Engineer",
      bg: "bg-[#f4e2dc]",
      border: "border-[#e0c8bf]",
      icon: (
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          <rect x="18" y="22" width="44" height="32" rx="4" fill="none" stroke="#333" strokeWidth="2.5" />
          <polyline points="28,38 38,48 28,58" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="42" y1="52" x2="52" y2="52" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="54" cy="20" r="8" fill="#f2efe5" stroke="#333" strokeWidth="2.5" />
          <polyline points="51,20 54,23 58,19" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      topLabel: "Skills (Google Cloud)\nMCP (DevDoc)\nSubagents",
      bottomLabels: [],
    },
    {
      name: "Security Engineer",
      bg: "bg-[#c4d4d1]",
      border: "border-[#a8bfbb]",
      icon: (
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          <path d="M40,16 L64,26 C64,48 52,62 40,66 C28,62 16,48 16,26 Z" fill="#f2efe5" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M40,16 L64,26 C64,48 52,62 40,66" fill="#d1dfdc" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32,38 L38,46 L50,32" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      topLabel: "",
      bottomLabels: ["Plugins", "Hooks"],
    },
    {
      name: "Growth Marketer",
      bg: "bg-[#d3d1e0]",
      border: "border-[#b8b5ce]",
      icon: (
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          <rect x="20" y="50" width="6" height="14" fill="#f2efe5" stroke="#333" strokeWidth="2" />
          <rect x="30" y="42" width="6" height="22" fill="#f2efe5" stroke="#333" strokeWidth="2" />
          <rect x="40" y="34" width="6" height="30" fill="#f2efe5" stroke="#333" strokeWidth="2" />
          <polyline points="20,38 33,28 43,20 60,14" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points="58,12 64,14 60,20" fill="#333" stroke="#333" strokeWidth="1" />
        </svg>
      ),
      topLabel: "BigQuery MCP",
      bottomLabels: [],
    },
  ];

  const renderLabel = (text: string, position: "top" | "bottom") => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div
        className={`bg-[#f8f6ec] border border-gray-200 rounded-2xl px-6 py-4 w-fit ${
          position === "top" ? "mb-6" : "mt-6"
        }`}
      >
        {lines.map((line, i) => (
          <div key={i} className="text-xl font-serif text-gray-800 text-center">
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col items-center bg-[#f2efe5] px-20 ${active ? "" : "hidden"}`}>
      <h2 className="text-5xl font-serif text-gray-900 mt-20 mb-16 text-center">
        Claude Code augments every role across the SDLC
      </h2>
      <div className="flex flex-row items-start justify-center gap-2 w-full flex-1 py-10">
        {roles.map((role, i) => (
          <div key={i} className="flex flex-col items-center">
            {role.topLabel && (
              <div className="flex flex-col items-center mb-4">
                <div className="bg-[#f8f6ec] border border-gray-200 rounded-2xl px-6 py-4">
                  {role.topLabel.split("\n").map((line, j) => (
                    <div key={j} className="text-xl font-serif text-gray-800 text-center">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="w-px h-8 bg-gray-400" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #999 0, #999 3px, transparent 3px, transparent 6px)" }} />
              </div>
            )}
            <div className={`${role.bg} border ${role.border} rounded-3xl px-8 py-10 flex flex-col items-center w-[180px]`}>
              <div className="mb-6 mt-2">{role.icon}</div>
              <div className="text-2xl font-serif text-gray-900 text-center leading-tight">
                {role.name.split(" ").map((part, j) => (
                  <div key={j}>{part}</div>
                ))}
              </div>
            </div>
            {role.bottomLabels.length > 0 && (
              <div className="flex flex-col items-center mt-4">
                <div className="w-px h-8" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #999 0, #999 3px, transparent 3px, transparent 6px)" }} />
                <div className="bg-[#f8f6ec] border border-gray-200 rounded-2xl px-6 py-4">
                  {role.bottomLabels.map((label, j) => (
                    <div key={j} className="text-xl font-serif text-gray-800 text-center">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {i < roles.length - 1 && (
              <div className="flex flex-col items-center">
                <div className="text-gray-500 font-serif text-base mt-4">Handoff</div>
                <svg viewBox="0 0 40 20" className="w-10 h-5 mt-1">
                  <path d="M2,10 L34,10" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="38,10 30,5 30,15" fill="#999" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide29({ active }: { active: boolean }) {
  return (
    <div className={`w-full h-full flex flex-row items-center bg-[#f2efe5] px-24 gap-20 ${active ? "" : "hidden"}`}>
      <div className="flex-shrink-0 flex flex-col justify-center h-full">
        <h2 className="text-6xl font-serif text-gray-900 leading-[1.1] mb-16">
          Setup: Claude<br />Code on<br />Google Cloud
        </h2>
        <div className="flex flex-col gap-8">
          <div className="text-3xl font-serif text-gray-500">Env vars + ADC</div>
          <div className="text-3xl font-serif text-gray-500 leading-tight">
            Existing Google Cloud<br />IAM governs access
          </div>
          <div className="text-3xl font-serif text-gray-500 leading-tight">
            Works in VS Code, terminal
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="bg-[#c6d5d3] rounded-3xl p-10 w-full">
          <div className="bg-black rounded-3xl p-10" style={{ minHeight: "400px" }}>
            <div className="font-mono text-sm text-[#d4a5a5] mb-4">Welcome to Claude Code v2.1.100</div>
            <div className="w-full h-px bg-gray-700 mb-8" />
            <div className="font-mono text-white text-lg leading-relaxed">
              <div className="mb-4">
                <span className="text-gray-400">*</span>
                <span className="ml-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;████&nbsp;████&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;███&nbsp;█████&nbsp;███&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;████████&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;█████&nbsp;████&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;███&nbsp;████&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██&nbsp;██&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;███&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;████&nbsp;█████&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;███&nbsp;█████&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="mb-6">
                <span className="text-gray-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*</span>
              </div>
              <div className="w-full h-px bg-gray-700 mb-8" />
            </div>
            <div className="font-mono text-base text-white leading-relaxed">
              <div className="mb-4">
                <span className="text-white">Claude Code can be used with your </span>
                <span className="text-white">Claude subscription or billed based on </span>
                <span className="text-white">API usage through your Console account.</span>
              </div>
              <div className="mb-3">&nbsp;</div>
              <div className="mb-3 text-gray-400">Select login method:</div>
              <div className="mb-3">&nbsp;</div>
              <div className="mb-3">
                <span className="text-gray-400">1. </span>
                <span className="text-white">Claude account with subscription · Pro, Max, Team, or Enterprise</span>
              </div>
              <div className="mb-3">&nbsp;</div>
              <div className="mb-3">
                <span className="text-gray-400">2. </span>
                <span className="text-white">Anthropic Console account · API usage billing</span>
              </div>
              <div className="mb-3">&nbsp;</div>
              <div className="mb-3">
                <span className="text-gray-400">&gt; 3. </span>
                <span className="text-[#a8b5e0]">3rd-party platform · Amazon Bedrock, Microsoft Foundry, or Vertex AI</span>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <svg viewBox="0 0 40 60" className="w-12 h-16">
                <path d="M30,5 L20,25 L28,25 L18,55" fill="none" stroke="#e8855f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide30({ active }: { active: boolean }) {
  const dataPoints = [
    { label: "Sonnet 3.7", date: "Feb 24, 2025", value: 62.3, bold: false },
    { label: "Opus 4", date: "May 22, 2025", value: 72.5, bold: false },
    { label: "Opus 4.1", date: "Aug 5, 2025", value: 74.5, bold: false },
    { label: "Opus 4.5", date: "Sep 29, 2025", value: 77.2, bold: false },
    { label: "Opus 4.5", date: "Nov 24, 2025", value: 80.9, bold: false },
    { label: "Opus 4.6", date: "Feb 5, 2026", value: 80.8, bold: false },
    { label: "Opus 4.7", date: "Apr 16, 2026", value: 87.6, bold: false },
    { label: "Opus 4.8", date: "May 28, 2026", value: 88.6, bold: true },
  ];

  const n = dataPoints.length;
  const xStart = 10;
  const xEnd = 92;
  const yTop = 25;
  const yBottom = 70;
  const yRange = yBottom - yTop;

  const getX = (i: number) => xStart + (i * (xEnd - xStart)) / (n - 1);
  const getY = (v: number) => yBottom - ((v - 50) / 50) * yRange;

  const linePoints = dataPoints.map((dp, i) => `${getX(i)},${getY(dp.value)}`).join(" ");

  return (
    <div className={`w-full h-full flex flex-col justify-center items-center bg-[#f2efe5] px-24 ${active ? "" : "hidden"}`}>
      <div className="w-full max-w-[1400px] flex-1 flex flex-col justify-center">
        <h2 className="text-7xl font-serif text-gray-900 mb-6">Every model moves the ceiling</h2>
        <p className="text-4xl font-serif text-gray-500 mb-14">SWE-bench Verified since Sonnet 3.7</p>

        <div className="relative w-full" style={{ height: "480px" }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            <line x1="9" y1="18" x2="93" y2="18" stroke="#d9d4c8" strokeWidth="0.15" />
            <line x1="9" y1="40" x2="93" y2="40" stroke="#d9d4c8" strokeWidth="0.15" />
            <line x1="9" y1="62" x2="93" y2="62" stroke="#d9d4c8" strokeWidth="0.15" />
            <line x1="9" y1="84" x2="93" y2="84" stroke="#d9d4c8" strokeWidth="0.15" />
            <line x1="9" y1="85" x2="93" y2="85" stroke="#2a2a2a" strokeWidth="0.4" />

            <polyline
              points={linePoints}
              fill="none"
              stroke="#d4806b"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {dataPoints.map((dp, i) => {
              const cx = getX(i);
              const cy = getY(dp.value);
              const isLast = i === n - 1;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={isLast ? 1.4 : 1.1} fill={isLast ? "#d4806b" : "#f2efe5"} stroke="#d4806b" strokeWidth="0.35" />
                  <text
                    x={cx}
                    y={cy - 3.5}
                    textAnchor="middle"
                    className="font-serif"
                    fontSize="2.2"
                    fill="#1a1a1a"
                    fontWeight={isLast ? "700" : "400"}
                  >
                    {dp.value}%
                  </text>
                </g>
              );
            })}

            <text x="7" y="18.5" textAnchor="end" fontSize="1.8" fill="#666" className="font-serif">100%</text>
            <text x="7" y="40.5" textAnchor="end" fontSize="1.8" fill="#666" className="font-serif">75%</text>
            <text x="7" y="62.5" textAnchor="end" fontSize="1.8" fill="#666" className="font-serif">50%</text>
            <text x="7" y="84.5" textAnchor="end" fontSize="1.8" fill="#666" className="font-serif">25%</text>
            <text x="7" y="89.5" textAnchor="end" fontSize="1.8" fill="#666" className="font-serif">0%</text>

            {dataPoints.map((dp, i) => {
              const cx = getX(i);
              return (
                <g key={`label-${i}`}>
                  <text
                    x={cx}
                    y="92"
                    textAnchor="middle"
                    fontSize="2.3"
                    fill={dp.bold ? "#1a1a1a" : "#333"}
                    fontWeight={dp.bold ? "700" : "400"}
                    className="font-serif"
                  >
                    {dp.label}
                  </text>
                  <text
                    x={cx}
                    y="94.8"
                    textAnchor="middle"
                    fontSize="1.6"
                    fill="#666"
                    className="font-serif"
                  >
                    {dp.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// --- main page ---

export default function SlidePage() {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const total = 30;

  const SLIDE_W = 1280;
  const SLIDE_H = 720;

  const goNext = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

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

  // responsive scale
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const sw = window.innerWidth;
      const sh = window.innerHeight;
      setScale(Math.min(sw / SLIDE_W, sh / SLIDE_H, 1));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, toggleFullscreen]);

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
      if (dx < 0) goNext(); else goPrev();
    }
    touchStart.current = null;
  };

  const slides = [<Slide1 key={0} active={index === 0} />, <Slide2 key={1} active={index === 1} />, <Slide3 key={2} active={index === 2} />, <Slide4 key={3} active={index === 3} />, <Slide5 key={4} active={index === 4} />, <Slide6 key={5} active={index === 5} />, <Slide7 key={6} active={index === 6} />, <Slide8 key={7} active={index === 7} />, <Slide9 key={8} active={index === 8} />, <Slide10 key={9} active={index === 9} />, <Slide11 key={10} active={index === 10} />, <Slide12 key={11} active={index === 11} />, <Slide13 key={12} active={index === 12} />, <Slide14 key={13} active={index === 13} />, <Slide15 key={14} active={index === 14} />, <Slide16 key={15} active={index === 15} />, <Slide17 key={16} active={index === 16} />, <Slide18 key={17} active={index === 17} />, <Slide19 key={18} active={index === 18} />, <Slide20 key={19} active={index === 19} />, <Slide21 key={20} active={index === 20} />, <Slide22 key={21} active={index === 21} />, <Slide23 key={22} active={index === 23} />, <Slide24 key={23} active={index === 23} />, <Slide25 key={24} active={index === 24} />, <Slide26 key={25} active={index === 25} />, <Slide27 key={26} active={index === 26} />, <Slide28 key={27} active={index === 27} />, <Slide29 key={28} active={index === 28} />, <Slide30 key={29} active={index === 29} />];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#1A1A2E] flex items-center justify-center"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 1280x720 fixed-size slide canvas, centered & scaled */}
      <div
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          overflow: "hidden",
          background: "#FAFAF8",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -120 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* nav dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "bg-white w-8" : "bg-white/25 w-2 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* counter */}
      <div className="absolute top-6 right-8 text-sm text-white/50 font-medium tracking-wider select-none">
        {String(index + 1).padStart(2, "0")} <span className="mx-1">/</span> {String(total).padStart(2, "0")}
      </div>

      {/* prev / next buttons */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/0 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/0 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* fullscreen button */}
      <button
        onClick={toggleFullscreen}
        aria-label="Toggle fullscreen"
        className="absolute top-6 left-8 w-9 h-9 rounded-full bg-white/0 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center"
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

      {/* keyboard hint */}
      <div className="absolute bottom-6 right-8 text-xs text-white/30 hidden md:block">
        ← → 切换 / 空格 / F 全屏
      </div>
    </div>
  );
}
