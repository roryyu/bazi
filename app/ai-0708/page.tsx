"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          AI实战营
        </h1>
        <div className="text-[#1A1A2E]/80 text-xl md:text-2xl font-medium leading-relaxed mb-20">
          解锁企业新潜力，用AI撬动企业增长新势能
        </div>
        <div className="text-[#1A1A2E]/70">
          <div className="text-2xl font-medium text-[#1A1A2E] mb-3">郁辰磊</div>
          <div className="text-lg">AI 实战营 · 讲师</div>
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

export default function Ai0708Page() {
  const [index, setIndex] = useState(0);
  const total = 1;

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slides = [
    <Slide1 key={0} active={index === 0} />,
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F5F2EC]">
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

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#1A1A2E]/60 text-sm font-mono z-30">
        {index + 1} / {total}
      </div>
    </div>
  );
}
