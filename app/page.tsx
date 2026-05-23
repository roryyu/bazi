"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  analyzePatterns,
  analyzeSoulSpirit,
  buildAnalysisPrompt,
  calcBazi,
  elementOfBranch,
  elementOfStem,
  summarizeTenGodEnergy,
  type BaziResult,
} from "@/lib/bazi";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  // 把小时与时辰一起标出，方便用户辨识
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const branchIdx = Math.floor((i + 1) / 2) % 12;
  return { value: i, label: `${String(i).padStart(2, "0")}:00 (${branches[branchIdx]}时)` };
});

type GenderType = "male" | "female";
type SubmittedInput = {
  y: number;
  m: number;
  d: number;
  h: number;
  name?: string;
  gender?: GenderType;
};

export default function Home() {
  const now = new Date();
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<GenderType>("male");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [day, setDay] = useState<number>(now.getDate());
  const [hour, setHour] = useState<number>(12);
  const [submitted, setSubmitted] = useState<SubmittedInput | null>({
    y: 2026, m: 5, d: 16, h: 12, name: "", gender: "male",
  });
  // 每次点击「排盘」递增，用于触发 AI 自动分析（默认 0 不调用接口）
  const [runId, setRunId] = useState(0);

  const result: BaziResult | null = useMemo(() => {
    if (!submitted) return null;
    try {
      return calcBazi(submitted.y, submitted.m, submitted.d, submitted.h);
    } catch {
      return null;
    }
  }, [submitted]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted({ y: year, m: month, d: day, h: hour, name, gender });
    setRunId((r) => r + 1);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>四柱八字排盘</h1>
        <p>输入阳历出生时间，自动推算四柱、藏干与十神</p>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <h2>出生信息（公历 / 阳历）</h2>
        <div className="form-row">
          <div className="field">
            <label>姓名</label>
            <input
              type="text"
              value={name}
              maxLength={20}
              placeholder="选填"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>性别</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderType)}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div className="field">
            <label>年</label>
            <input
              type="number"
              value={year}
              min={1900}
              max={2099}
              onChange={(e) => setYear(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="field">
            <label>月</label>
            <input
              type="number"
              value={month}
              min={1}
              max={12}
              onChange={(e) => setMonth(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="field">
            <label>日</label>
            <input
              type="number"
              value={day}
              min={1}
              max={31}
              onChange={(e) => setDay(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="field">
            <label>时（24 小时制）</label>
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
            >
              {HOUR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn">排 盘</button>
        <p className="tip" style={{ marginTop: 12 }}>
          说明：年柱以 <code>立春</code> 为界、月柱以 <code>节气</code> 为界（21
          世纪寿星算法），日柱按干支纪日推算，时柱按
          <code>五鼠遁</code> 起时。23:00 后归入次日子时。
        </p>
      </form>

      {result && submitted && (
        <ResultView result={result} input={submitted} runId={runId} />
      )}
    </div>
  );
}

function ResultView({
  result,
  input,
  runId,
}: {
  result: BaziResult;
  input: SubmittedInput;
  runId: number;
}) {
  const cols = [
    { key: "year", title: "年柱", pillar: result.year, god: result.stemGods.year },
    { key: "month", title: "月柱", pillar: result.month, god: result.stemGods.month },
    { key: "day", title: "日柱（日主）", pillar: result.day, god: result.stemGods.day },
    { key: "hour", title: "时柱", pillar: result.hour, god: result.stemGods.hour },
  ] as const;

  return (
    <>
      <div className="card">
        <h2>排盘结果</h2>
        <p className="tip" style={{ marginBottom: 14 }}>
          公历 <strong>{input.y}</strong> 年 <strong>{input.m}</strong> 月{" "}
          <strong>{input.d}</strong> 日 <strong>{String(input.h).padStart(2, "0")}:00</strong>
          ｜月令节气：<span className="tag">{result.solarTerm}</span>
        </p>
        <div className="bazi-grid">
          {cols.map((c) => {
            const stemEl = elementOfStem(c.pillar.stem);
            const branchEl = elementOfBranch(c.pillar.branch);
            const hidden =
              c.key === "year"
                ? result.branchHiddenGods.year
                : c.key === "month"
                ? result.branchHiddenGods.month
                : c.key === "day"
                ? result.branchHiddenGods.day
                : result.branchHiddenGods.hour;
            return (
              <div className="bazi-col" key={c.key}>
                <div className="col-title">{c.title}</div>
                <div className="god">{c.god}</div>
                <div className="gz">
                  <span className={`el-${stemEl}`}>{c.pillar.stem}</span>
                </div>
                <div className="gz">
                  <span className={`el-${branchEl}`}>{c.pillar.branch}</span>
                </div>
                <div className="hidden">
                  藏干：
                  {hidden.length === 0 ? (
                    <span>—</span>
                  ) : (
                    hidden.map((h, i) => (
                      <div key={i}>
                        <span className={`el-${elementOfStem(h.stem)}`}>{h.stem}</span>{" "}
                        <span style={{ color: "var(--accent)" }}>{h.god}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="day-master">
          日主（命主本人）：
          <strong className={`el-${elementOfStem(result.dayMaster)}`}>
            {result.dayMaster}
          </strong>
          （{elementOfStem(result.dayMaster)}）
        </div>
      </div>

      <div className="card">
        <h2>十神速览</h2>
        <p className="tip" style={{ marginBottom: 10 }}>
          以日主 <strong>{result.dayMaster}</strong> 为中心，与其余天干及地支主气的关系：
        </p>
        <ul style={{ paddingLeft: 18, fontSize: 13, lineHeight: 2 }}>
          <li>
            年干 {result.year.stem}：<span className="tag">{result.stemGods.year}</span>
            ；年支 {result.year.branch} 主气：
            <span className="tag">{result.branchMainGods.year}</span>
          </li>
          <li>
            月干 {result.month.stem}：<span className="tag">{result.stemGods.month}</span>
            ；月支 {result.month.branch} 主气：
            <span className="tag">{result.branchMainGods.month}</span>
          </li>
          <li>
            日干 {result.day.stem}：<span className="tag">日主</span>
            ；日支 {result.day.branch} 主气：
            <span className="tag">{result.branchMainGods.day}</span>
          </li>
          <li>
            时干 {result.hour.stem}：<span className="tag">{result.stemGods.hour}</span>
            ；时支 {result.hour.branch} 主气：
            <span className="tag">{result.branchMainGods.hour}</span>
          </li>
        </ul>
      </div>

      <PatternView result={result} />
      <EnergyView result={result} />
      <SoulSpiritView result={result} />
      <AiAnalysisView result={result} input={input} runId={runId} />
    </>
  );
}

function PatternView({ result }: { result: BaziResult }) {
  const patterns = analyzePatterns(result);
  return (
    <div className="card">
      <h2>十神组合格局</h2>
      <p className="tip" style={{ marginBottom: 10 }}>
        两方都透干为
        <strong>有力</strong>，部分藏支为<strong>潜质</strong>。
      </p>
      {patterns.length === 0 ? (
        <p className="tip">未识别到经典二元组合。</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {patterns.map((p) => (
            <li
              key={p.name}
              style={{
                padding: "10px 12px",
                marginBottom: 8,
                borderLeft: `3px solid ${p.category === "吉" ? "var(--el-mu)" : p.category === "凶" ? "var(--el-huo)" : "var(--accent)"}`,
                background: "#fdfaf2",
                borderRadius: 4,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <div style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 14 }}>{p.name}</strong>{" "}
                <span
                  className="tag"
                  style={{
                    background: p.strong ? "#e8d4ad" : "#f1e7d2",
                    color: p.strong ? "#8b3a2a" : "#7a6f5b",
                  }}
                >
                  {p.strong ? "有力" : "潜质"}
                </span>
              </div>
              <div style={{ color: "var(--sub)" }}>{p.description}</div>
              <div style={{ marginTop: 4, color: "var(--primary)" }}>
                依据：{p.evidence}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EnergyView({ result }: { result: BaziResult }) {
  const summary = summarizeTenGodEnergy(result);
  const max = Math.max(1, ...summary.map((s) => s.weight));
  return (
    <div className="card">
      <h2>五大十神能量分布</h2>
      <p className="tip" style={{ marginBottom: 10 }}>
        天干透出计 2 分，地支藏干计 1 分。判断身强身弱与宜忌的初步参考。
      </p>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {summary.map((s) => (
          <li key={s.category} style={{ marginBottom: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{s.category}</span>
              <span style={{ color: "var(--sub)" }}>
                {s.members.length === 0 ? "—" : s.members.join("、")}
              </span>
            </div>
            <div style={{ height: 6, background: "#f1e7d2", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(s.weight / max) * 100}%`,
                  height: "100%",
                  background: "var(--accent)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SoulSpiritView({ result }: { result: BaziResult }) {
  const { souls, spirits } = analyzeSoulSpirit(result);

  const barColor = (level: number) =>
    level >= 4 ? "#6b8e5e" : level >= 3 ? "var(--accent)" : level >= 2 ? "#c9a96e" : "#a89080";

  const renderItem = (item: { name: string; alias: string; meaning: string; level: number; desc: string }) => (
    <div key={item.name} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {item.name}
          <span style={{ fontWeight: 400, color: "var(--sub)", marginLeft: 6, fontSize: 12 }}>
            {item.alias}
          </span>
        </span>
        <span style={{ fontSize: 12, color: "var(--sub)" }}>{item.level}/5</span>
      </div>
      <div style={{ height: 6, background: "#f1e7d2", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
        <div
          style={{
            width: `${(item.level / 5) * 100}%`,
            height: "100%",
            background: barColor(item.level),
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.6 }}>{item.desc}</div>
    </div>
  );

  return (
    <div className="card">
      <h2>三魂七魄</h2>
      <p className="tip" style={{ marginBottom: 14 }}>
        根据五行偏枯与十神能量推算精神（三魂）和身体（七魄）的状态。
      </p>
      <div className="soul-spirit-grid">
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 10, color: "var(--primary)" }}>三魂（精神）</h3>
          {souls.map(renderItem)}
        </div>
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 10, color: "var(--primary)" }}>七魄（身体）</h3>
          {spirits.map(renderItem)}
        </div>
      </div>
    </div>
  );
}

function AiAnalysisView({
  result,
  input,
  runId,
}: {
  result: BaziResult;
  input: SubmittedInput;
  runId: number;
}) {
  const [text, setText] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const promptText = useMemo(() => buildAnalysisPrompt(input, result), [input, result]);

  const onAnalyze = async () => {
    setLoading(true);
    setError(null);
    setText("");
    setReasoning("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText }),
      });
      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let serverError: string | null = null;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          let evt: { type: string; text?: string };
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.type === "content" && evt.text) {
            setText((prev) => prev + evt.text);
          } else if (evt.type === "reasoning" && evt.text) {
            setReasoning((prev) => prev + evt.text);
          } else if (evt.type === "error") {
            serverError = evt.text || "stream error";
          }
        }
      }
      if (serverError) throw new Error(serverError);
    } catch (e) {
      setError((e as Error).message || "调用失败");
    } finally {
      setLoading(false);
    }
  };

  // 点击「排盘」后自动调用 AI 分析（runId 变化时触发）
  const onAnalyzeRef = useRef(onAnalyze);
  onAnalyzeRef.current = onAnalyze;
  useEffect(() => {
    if (runId > 0) {
      void onAnalyzeRef.current();
    }
  }, [runId]);

  return (
    <div className="card">
      <h2>深入分析</h2>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <button className="btn" onClick={onAnalyze} disabled={loading}>
          {loading ? "分析中…" : text ? "重新分析" : "开始 AI 分析"}
        </button>

      </div>
      {showPrompt && (
        <pre
          style={{
            background: "#fdfaf2",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: 12,
            fontSize: 12,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "var(--sub)",
            marginBottom: 12,
          }}
        >
          {promptText}
        </pre>
      )}
      {error && (
        <div
          style={{
            color: "var(--el-huo)",
            background: "#fbeae6",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}
      {text ? (
        <div
          className="md-body"
          style={{
            background: "#fdfaf2",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: "14px 18px",
            fontSize: 14,
            lineHeight: 1.85,
            wordBreak: "break-word",
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          {loading && <span style={{ color: "var(--accent)" }}>█</span>}
        </div>
      ) : loading ? (
        <p className="tip">正在处理…</p>
      ) : !error ? (
        <p className="tip"></p>
      ) : null}
      {reasoning && (
        <div style={{ marginTop: 12,display:'none' }}>
          <button
            type="button"
            onClick={() => setShowReasoning((v) => !v)}
            style={{
              background: "transparent",
              border: "1px dashed var(--line)",
              color: "var(--sub)",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {showReasoning ? "隐藏思考过程" : "查看思考过程"}
          </button>
          {showReasoning && (
            <pre
              style={{
                marginTop: 8,
                background: "#f3ecdc",
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: 12,
                fontSize: 12,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "var(--sub)",
              }}
            >
              {reasoning}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
