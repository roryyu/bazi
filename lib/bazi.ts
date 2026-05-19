/**
 * 八字排盘核心库
 * 严格依据 chance/命理.md 中描述的逻辑实现：
 *  - 年柱以立春为界
 *  - 月柱以节气为界，按五虎遁起月
 *  - 日柱用儒略日法（以 2026-05-16 庚寅日为参考点）
 *  - 时柱按五鼠遁起时（23:00-01:00 为子时，跨日处理）
 *  - 十神按日主的五行/阴阳与其他干支推导
 */

// 十天干：0=甲 阳木, 1=乙 阴木, 2=丙 阳火, 3=丁 阴火,
//        4=戊 阳土, 5=己 阴土, 6=庚 阳金, 7=辛 阴金,
//        8=壬 阳水, 9=癸 阴水
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

// 十二地支：0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳,
//          6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

// 地支藏干（主气、中气、余气）
export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

// 五行：0=木, 1=火, 2=土, 3=金, 4=水
const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

export type Pillar = {
  stem: string;
  branch: string;
  hiddenStems: string[];
};

export type BaziResult = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;
  // 四柱天干十神（日柱本身留空）
  stemGods: { year: string; month: string; day: string; hour: string };
  // 四柱地支主气十神
  branchMainGods: { year: string; month: string; day: string; hour: string };
  // 四柱地支全部藏干十神
  branchHiddenGods: {
    year: { stem: string; god: string }[];
    month: { stem: string; god: string }[];
    day: { stem: string; god: string }[];
    hour: { stem: string; god: string }[];
  };
  solarTerm: string; // 所处月令节气名
};

// ---------- 节气：寿星算法 (21 世纪 2000-2099) ----------
// 公式：day = floor(Y * 0.2422 + C) - floor(Y / 4)
// 其中 Y 为年份后两位，C 为节气常数。仅覆盖月令分界用 12 节气。
const SOLAR_TERM_C: { name: string; month: number; C: number }[] = [
  { name: "小寒", month: 1, C: 5.4055 }, // 1月
  { name: "立春", month: 2, C: 3.87 }, // 2月
  { name: "惊蛰", month: 3, C: 5.63 }, // 3月
  { name: "清明", month: 4, C: 4.81 }, // 4月
  { name: "立夏", month: 5, C: 5.52 }, // 5月
  { name: "芒种", month: 6, C: 5.678 }, // 6月
  { name: "小暑", month: 7, C: 7.108 }, // 7月
  { name: "立秋", month: 8, C: 7.5 }, // 8月
  { name: "白露", month: 9, C: 7.646 }, // 9月
  { name: "寒露", month: 10, C: 8.318 }, // 10月
  { name: "立冬", month: 11, C: 7.438 }, // 11月
  { name: "大雪", month: 12, C: 7.18 }, // 12月
];

/** 节气对应的月支（顺序：立春→寅, 惊蛰→卯, ...）*/
const TERM_TO_BRANCH_IDX: Record<string, number> = {
  立春: 2, // 寅
  惊蛰: 3, // 卯
  清明: 4, // 辰
  立夏: 5, // 巳
  芒种: 6, // 午
  小暑: 7, // 未
  立秋: 8, // 申
  白露: 9, // 酉
  寒露: 10, // 戌
  立冬: 11, // 亥
  大雪: 0, // 子
  小寒: 1, // 丑
};

/** 计算指定阳历年某节气在该月的日期 (1-31) */
function solarTermDay(year: number, C: number): number {
  const Y = year % 100;
  return Math.floor(Y * 0.2422 + C) - Math.floor(Y / 4);
}

/** 给定阳历日期/小时，返回当前所处的节气信息及月支编号 */
function getMonthBranch(date: Date): { branchIdx: number; termName: string; termYear: number } {
  // 把 12 节气按时间顺序排列，遍历找出最近一个已经到达的节气
  // 要从 上一年的小寒 开始计算（覆盖 1月初到立春前）
  const year = date.getFullYear();

  // 构造候选节气列表（包含上一年小寒、大雪用于跨年判定）
  const candidates: { ts: number; term: string; refYear: number }[] = [];
  // 上一年的小寒 (1月) 和 大雪 (12月) 仍可能影响当年 1 月初/2 月初出生
  for (const t of SOLAR_TERM_C) {
    const d = solarTermDay(year, t.C);
    candidates.push({
      ts: new Date(year, t.month - 1, d, 0, 0, 0).getTime(),
      term: t.name,
      refYear: year,
    });
  }
  // 加入上一年最后两个节气（立冬/大雪/小寒等可能跨入今年 1 月）
  for (const t of SOLAR_TERM_C) {
    if (t.month >= 11) {
      const d = solarTermDay(year - 1, t.C);
      candidates.push({
        ts: new Date(year - 1, t.month - 1, d, 0, 0, 0).getTime(),
        term: t.name,
        refYear: year - 1,
      });
    }
  }

  candidates.sort((a, b) => a.ts - b.ts);
  const t = date.getTime();
  let chosen = candidates[0];
  for (const c of candidates) {
    if (c.ts <= t) chosen = c;
    else break;
  }

  return {
    branchIdx: TERM_TO_BRANCH_IDX[chosen.term],
    termName: chosen.term,
    termYear: chosen.refYear,
  };
}

// ---------- 年柱：以立春为界 ----------
function getYearPillar(date: Date): { stemIdx: number; branchIdx: number } {
  const year = date.getFullYear();
  const liChunDay = solarTermDay(year, 3.87);
  const liChunTs = new Date(year, 1, liChunDay, 0, 0, 0).getTime();
  const useYear = date.getTime() < liChunTs ? year - 1 : year;
  // 公元 4 年为甲子年
  const stemIdx = ((useYear - 4) % 10 + 10) % 10;
  const branchIdx = ((useYear - 4) % 12 + 12) % 12;
  return { stemIdx, branchIdx };
}

// ---------- 月柱：五虎遁 ----------
// 寅月起干索引 = (年干 % 5 * 2 + 2) % 10
function getMonthStemIdx(yearStemIdx: number, branchIdx: number): number {
  const yinStartStem = (yearStemIdx % 5 * 2 + 2) % 10;
  // 从寅(2) 顺数到当前月支
  const offset = (branchIdx - 2 + 12) % 12;
  return (yinStartStem + offset) % 10;
}

// ---------- 日柱：以 1900-01-01 甲戌日为基准的日数差法 ----------
// 甲戌：天干索引 0（甲），地支索引 10（戌）
const DAY_BASE_DATE_MS = new Date(1900, 0, 1, 0, 0, 0).getTime();
const DAY_BASE_STEM = 0; // 甲
const DAY_BASE_BRANCH = 10; // 戌
const ONE_DAY = 24 * 60 * 60 * 1000;

function getDayPillar(date: Date): { stemIdx: number; branchIdx: number } {
  // 子时：23 点之后已属次日
  const adjusted = new Date(date.getTime());
  if (adjusted.getHours() === 23) {
    adjusted.setDate(adjusted.getDate() + 1);
  }
  // 取当日 0 点，避免夏令时/时区偏移干扰 floor 计算
  const target = new Date(adjusted.getFullYear(), adjusted.getMonth(), adjusted.getDate(), 0, 0, 0);
  const diffDays = Math.floor((target.getTime() - DAY_BASE_DATE_MS) / ONE_DAY);
  const stemIdx = ((DAY_BASE_STEM + diffDays) % 10 + 10) % 10;
  const branchIdx = ((DAY_BASE_BRANCH + diffDays) % 12 + 12) % 12;
  return { stemIdx, branchIdx };
}

// ---------- 时柱：五鼠遁 ----------
function getHourBranchIdx(hour: number): number {
  // 23-1 子, 1-3 丑 ...
  return (Math.floor((hour + 1) / 2)) % 12;
}

function getHourStemIdx(dayStemIdx: number, hourBranchIdx: number): number {
  // 子时起干索引 = (日干 % 5) * 2
  const ziStartStem = (dayStemIdx % 5) * 2;
  return (ziStartStem + hourBranchIdx) % 10;
}

// ---------- 十神 ----------
const TEN_GOD_TABLE = [
  // [diff_element, sameYY] -> name
  // diff_element: 0 同我, 1 我生, 2 我克, 3 克我, 4 生我
  // 阴阳同性 / 异性
  ["比肩", "劫财"], // 0
  ["食神", "伤官"], // 1
  ["偏财", "正财"], // 2
  ["七杀", "正官"], // 3
  ["偏印", "正印"], // 4
];

export function getTenGod(dayStemIdx: number, otherStemIdx: number): string {
  const dayE = STEM_ELEMENT[dayStemIdx];
  const otherE = STEM_ELEMENT[otherStemIdx];
  const diff = ((otherE - dayE) % 5 + 5) % 5;
  const sameYY = dayStemIdx % 2 === otherStemIdx % 2;
  return TEN_GOD_TABLE[diff][sameYY ? 0 : 1];
}

function buildPillar(stemIdx: number, branchIdx: number): Pillar {
  const branch = BRANCHES[branchIdx];
  return {
    stem: STEMS[stemIdx],
    branch,
    hiddenStems: HIDDEN_STEMS[branch] ?? [],
  };
}

/**
 * 主入口：根据出生阳历年、月（1-12）、日、时（0-23）计算八字。
 */
export function calcBazi(year: number, month: number, day: number, hour: number): BaziResult {
  const date = new Date(year, month - 1, day, hour, 0, 0);

  const { stemIdx: yStem, branchIdx: yBranch } = getYearPillar(date);

  const monthInfo = getMonthBranch(date);
  // 月干应使用 "进入立春后的纪年" 对应的年干
  const monthYearInfo = getYearPillar(date);
  const mStem = getMonthStemIdx(monthYearInfo.stemIdx, monthInfo.branchIdx);

  const { stemIdx: dStem, branchIdx: dBranch } = getDayPillar(date);

  const hBranch = getHourBranchIdx(hour);
  const hStem = getHourStemIdx(dStem, hBranch);

  const yearP = buildPillar(yStem, yBranch);
  const monthP = buildPillar(mStem, monthInfo.branchIdx);
  const dayP = buildPillar(dStem, dBranch);
  const hourP = buildPillar(hStem, hBranch);

  const stemIdxOf = (s: string) => STEMS.indexOf(s as typeof STEMS[number]);
  const branchMain = (b: string) => HIDDEN_STEMS[b][0];

  return {
    year: yearP,
    month: monthP,
    day: dayP,
    hour: hourP,
    dayMaster: dayP.stem,
    stemGods: {
      year: getTenGod(dStem, yStem),
      month: getTenGod(dStem, mStem),
      day: "—",
      hour: getTenGod(dStem, hStem),
    },
    branchMainGods: {
      year: getTenGod(dStem, stemIdxOf(branchMain(yearP.branch))),
      month: getTenGod(dStem, stemIdxOf(branchMain(monthP.branch))),
      day: getTenGod(dStem, stemIdxOf(branchMain(dayP.branch))),
      hour: getTenGod(dStem, stemIdxOf(branchMain(hourP.branch))),
    },
    branchHiddenGods: {
      year: yearP.hiddenStems.map((s) => ({ stem: s, god: getTenGod(dStem, stemIdxOf(s)) })),
      month: monthP.hiddenStems.map((s) => ({ stem: s, god: getTenGod(dStem, stemIdxOf(s)) })),
      day: dayP.hiddenStems.map((s) => ({ stem: s, god: getTenGod(dStem, stemIdxOf(s)) })),
      hour: hourP.hiddenStems.map((s) => ({ stem: s, god: getTenGod(dStem, stemIdxOf(s)) })),
    },
    solarTerm: monthInfo.termName,
  };
}

/** 干支配色，方便页面渲染 */
export function elementOfStem(stem: string): "木" | "火" | "土" | "金" | "水" {
  const idx = STEMS.indexOf(stem as typeof STEMS[number]);
  return (["木", "火", "土", "金", "水"] as const)[STEM_ELEMENT[idx]];
}

export function elementOfBranch(branch: string): "木" | "火" | "土" | "金" | "水" {
  // 寅卯木 巳午火 申酉金 亥子水 辰戌丑未土
  const map: Record<string, "木" | "火" | "土" | "金" | "水"> = {
    寅: "木", 卯: "木",
    巳: "火", 午: "火",
    申: "金", 酉: "金",
    亥: "水", 子: "水",
    辰: "土", 戌: "土", 丑: "土", 未: "土",
  };
  return map[branch];
}

// ===========================================================================
// 十神组合格局分析（依据 chance/十神.md）
// ===========================================================================

/** 十神分类 */
const GROUP_BIJIE = ["比肩", "劫财"]; // 比劫
const GROUP_SHISHANG = ["食神", "伤官"]; // 食伤
const GROUP_CAI = ["正财", "偏财"]; // 财星
const GROUP_GUANSHA = ["正官", "七杀"]; // 官杀
const GROUP_YIN = ["正印", "偏印"]; // 印星

export type GodOccurrence = {
  god: string; // 十神名
  stem: string; // 对应天干
  pos: string; // 位置描述，如 "月干" / "日支藏"
  visible: boolean; // 是否透干（天干为 true，地支藏干为 false）
};

export type Pattern = {
  name: string; // 格局名
  category: "吉" | "凶" | "中性"; // 吉凶倾向
  description: string; // 意象说明
  evidence: string; // 命局中的依据描述
  strong: boolean; // 是否“有力”（所需两方都透干为有力，否则为潜质）
};

/** 收集所有透干十神（不含日主） */
function collectStemGods(result: BaziResult): GodOccurrence[] {
  return [
    { god: result.stemGods.year, stem: result.year.stem, pos: "年干", visible: true },
    { god: result.stemGods.month, stem: result.month.stem, pos: "月干", visible: true },
    { god: result.stemGods.hour, stem: result.hour.stem, pos: "时干", visible: true },
  ];
}

/** 收集所有藏干十神 */
function collectHiddenGods(result: BaziResult): GodOccurrence[] {
  const out: GodOccurrence[] = [];
  const groups: { pos: string; list: { stem: string; god: string }[] }[] = [
    { pos: `年支藏`, list: result.branchHiddenGods.year },
    { pos: `月支藏`, list: result.branchHiddenGods.month },
    { pos: `日支藏`, list: result.branchHiddenGods.day },
    { pos: `时支藏`, list: result.branchHiddenGods.hour },
  ];
  for (const g of groups) {
    for (const h of g.list) {
      out.push({ god: h.god, stem: h.stem, pos: g.pos, visible: false });
    }
  }
  return out;
}

/** 查找某类十神最佳存在证据：优先透干，次为藏支 */
function findGod(
  occurrences: GodOccurrence[],
  names: string[],
): GodOccurrence | undefined {
  return (
    occurrences.find((o) => o.visible && names.includes(o.god)) ||
    occurrences.find((o) => names.includes(o.god))
  );
}

/**
 * 识别六大经典组合格局。
 * 只返回命局中实际貌似成立的格局。
 * 判定原则：两方都透干="有力"；部分藏支="潜质"；完全未现不输出。
 */
export function analyzePatterns(result: BaziResult): Pattern[] {
  const stems = collectStemGods(result);
  const all = [...stems, ...collectHiddenGods(result)];
  const patterns: Pattern[] = [];

  const evi = (...os: (GodOccurrence | undefined)[]) =>
    os
      .filter((o): o is GodOccurrence => !!o)
      .map((o) => `${o.pos}${o.stem}(${o.god})`)
      .join(" + ");

  // 1. 食伤生财：食神/伤官 + 财星
  {
    const a = findGod(all, GROUP_SHISHANG);
    const b = findGod(all, GROUP_CAI);
    if (a && b) {
      patterns.push({
        name: "食伤生财（才华变现）",
        category: "吉",
        description:
          "以才华、技术、思想（食伤）源源不断地创造财富（财星）。最经典的凭本事吃饭组合。",
        evidence: evi(a, b),
        strong: a.visible && b.visible,
      });
    }
  }

  // 2. 食神制杀：食神 + 七杀
  {
    const a = findGod(all, ["食神"]);
    const b = findGod(all, ["七杀"]);
    if (a && b) {
      patterns.push({
        name: "食神制杀（智慧降服压力）",
        category: "吉",
        description:
          "七杀是巨大压力与凶险，食神是从容智慧与福气；以智慧化解压力，把困难转为功业。",
        evidence: evi(a, b),
        strong: a.visible && b.visible,
      });
    }
  }

  // 3. 杀印相生：七杀 + 印星
  {
    const a = findGod(all, ["七杀"]);
    const b = findGod(all, GROUP_YIN);
    if (a && b) {
      patterns.push({
        name: "杀印相生（压力化为权柄）",
        category: "吉",
        description:
          "印星护在中间，把七杀的严酷攻击化为学习力、思想深度与权柄地位。逆境出人才的格局。",
        evidence: evi(a, b),
        strong: a.visible && b.visible,
      });
    }
  }

  // 4. 伤官配印：伤官 + 印星
  {
    const a = findGod(all, ["伤官"]);
    const b = findGod(all, GROUP_YIN);
    if (a && b) {
      patterns.push({
        name: "伤官配印（用学识驾驭才华）",
        category: "吉",
        description:
          "伤官是狂放天才，印星代表学问、涵养。为天才配名师，既能发挥才华又不至于走偏。",
        evidence: evi(a, b),
        strong: a.visible && b.visible,
      });
    }
  }

  // 5. 官印相生：官杀 + 印星（与上一项区别：包含正官）
  {
    const a = findGod(all, GROUP_GUANSHA);
    const b = findGod(all, GROUP_YIN);
    if (a && b) {
      patterns.push({
        name: "官印相生（贵气与学识）",
        category: "吉",
        description:
          "官生印、印生身，能量顺畅流通。为最标准的贵气、稳定、有社会地位的组合。",
        evidence: evi(a, b),
        strong: a.visible && b.visible,
      });
    }
  }

  // 6. 枭神夺食：偏印 + 食神（凶）
  {
    const a = findGod(all, ["偏印"]);
    const b = findGod(all, ["食神"]);
    if (a && b) {
      patterns.push({
        name: "枭神夺食（需要警惕）",
        category: "凶",
        description:
          "偏印过旺克制食神，如同继母夺去你的饭碗，剥夺福气与快乐。需要财星来破印救食。",
        evidence: evi(a, b),
        strong: a.visible && b.visible,
      });
    }
  }

  return patterns;
}

/**
 * 分析十神能量流向：返回五大十神类别在命局中的存在强度（透干=2，藏支=1）
 */
export function summarizeTenGodEnergy(result: BaziResult): {
  category: string;
  weight: number;
  members: string[];
}[] {
  const stems = collectStemGods(result);
  const hidden = collectHiddenGods(result);
  const groups = [
    { category: "印星（土生金）", names: GROUP_YIN },
    { category: "比劫（同我）", names: GROUP_BIJIE },
    { category: "食伤（我生）", names: GROUP_SHISHANG },
    { category: "财星（我克）", names: GROUP_CAI },
    { category: "官杀（克我）", names: GROUP_GUANSHA },
  ];
  return groups.map((g) => {
    const matchedStems = stems.filter((s) => g.names.includes(s.god));
    const matchedHidden = hidden.filter((s) => g.names.includes(s.god));
    const weight = matchedStems.length * 2 + matchedHidden.length;
    const members = [
      ...matchedStems.map((m) => `${m.god}(透${m.stem})`),
      ...matchedHidden.map((m) => `${m.god}(藏${m.stem})`),
    ];
    return { category: g.category, weight, members };
  });
}

// ===========================================================================
// 构建送给大模型的提示词
// ===========================================================================

export function buildAnalysisPrompt(
  input: {
    y: number;
    m: number;
    d: number;
    h: number;
    name?: string;
    gender?: "male" | "female";
  },
  result: BaziResult,
): string {
  const patterns = analyzePatterns(result);
  const energy = summarizeTenGodEnergy(result);

  const fmtPillar = (
    title: string,
    p: Pillar,
    stemGod: string,
    branchHidden: { stem: string; god: string }[],
  ) => {
    const hidden = branchHidden
      .map((h) => `${h.stem}(${h.god})`)
      .join("、");
    return `- ${title}：${p.stem}${p.branch}（天干十神：${stemGod}；地支藏干十神：${hidden || "—"}）`;
  };

  const lines: string[] = [];
  const nameStr = (input.name || "").trim() || "未填";
  const genderStr =
    input.gender === "male" ? "男" : input.gender === "female" ? "女" : "未填";
  lines.push("【基本信息】");
  lines.push(`- 姓名：${nameStr}`);
  lines.push(`- 性别：${genderStr}`);
  lines.push(
    `- 出生阳历：${input.y} 年 ${input.m} 月 ${input.d} 日 ${String(input.h).padStart(2, "0")}:00`,
  );
  lines.push(`- 月令节气：${result.solarTerm}`);
  lines.push(`- 日主（命主本人）：${result.dayMaster}（${elementOfStem(result.dayMaster)}）`);
  lines.push("");

  lines.push("【四柱八字】");
  lines.push(fmtPillar("年柱", result.year, result.stemGods.year, result.branchHiddenGods.year));
  lines.push(fmtPillar("月柱", result.month, result.stemGods.month, result.branchHiddenGods.month));
  lines.push(fmtPillar("日柱", result.day, "日主", result.branchHiddenGods.day));
  lines.push(fmtPillar("时柱", result.hour, result.stemGods.hour, result.branchHiddenGods.hour));
  lines.push("");

  lines.push("【五大十神能量分布（透干计2分，藏支计1分）】");
  for (const e of energy) {
    lines.push(`- ${e.category}：${e.weight} 分${e.members.length ? "（" + e.members.join("、") + "）" : "（无）"}`);
  }
  lines.push("");

  lines.push("【识别到的组合格局】");
  if (patterns.length === 0) {
    lines.push("- 未识别到经典二元组合。");
  } else {
    for (const p of patterns) {
      lines.push(
        `- ${p.name}（${p.category} / ${p.strong ? "有力" : "潜质"}）：${p.evidence}。${p.description}`,
      );
    }
  }
  lines.push("");

  lines.push("请基于以上排盘信息输出一份系统的命理分析，要求：");
  lines.push("1．《命局总评》：判断日主强弱、五行起伏、核心格局。");
  lines.push("2．《性格与天赋》：从日主及透干十神看个性、思维、才华。");
  lines.push("3．《事业财运》：适合的赛道、财富获取方式。");
  lines.push("4．《感情婚姻》：从财星/官杀看感情倾向。");
  lines.push("5．《健康提示》：从五行偏枯看需注意的部位。");
  lines.push("6．《当下建议》：结合格局给出可操作的人生建议。");
  lines.push("");
  lines.push("要求输出使用中文 Markdown 格式，段落清晰；");

  return lines.join("\n");
}
