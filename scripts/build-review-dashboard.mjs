#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIMENSIONS = ["product_understanding", "ux_reasoning", "design_judgment", "visual_hierarchy", "interaction_completeness", "accessibility_responsiveness", "implementation_quality"];
const LABELS = {
  product_understanding: "Product understanding",
  ux_reasoning: "UX reasoning",
  design_judgment: "Design judgment",
  visual_hierarchy: "Visual hierarchy",
  interaction_completeness: "Interaction completeness",
  accessibility_responsiveness: "Accessibility and responsiveness",
  implementation_quality: "Implementation quality"
};
const SHORT = {
  product_understanding: "Product",
  ux_reasoning: "UX reasoning",
  design_judgment: "Design judgment",
  visual_hierarchy: "Visual hierarchy",
  interaction_completeness: "Interaction",
  accessibility_responsiveness: "Accessibility",
  implementation_quality: "Implementation"
};
const WEIGHTS = { product_understanding: 15, ux_reasoning: 20, design_judgment: 15, visual_hierarchy: 15, interaction_completeness: 15, accessibility_responsiveness: 10, implementation_quality: 10 };
const TASK_LABELS = {
  "subscription-settings": "Subscription settings",
  "product-onboarding": "First-run onboarding",
  "operations-dashboard": "Operations dashboard"
};
const REVIEWERS = ["r1", "r2"];

const mean = (values) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0);
const round = (value) => Math.round(value * 100) / 100;
const esc = (value) => String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
const labelFor = (task) => TASK_LABELS[task] ?? task.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!["--review", "--out", "--title", "--status", "--back-link", "--back-label"].includes(flag)) {
      throw new Error("Unknown option: " + flag);
    }
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + flag);
    options[flag.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase())] = value;
  }
  if (!options.review) {
    throw new Error("usage: node scripts/build-review-dashboard.mjs --review <review-dir> [--out <file>] [--title <text>] [--status <text>] [--back-link <url>] [--back-label <text>]");
  }
  return options;
}

export async function loadReviewData(reviewDir) {
  const review = path.resolve(reviewDir);
  const summary = JSON.parse(await readFile(path.join(review, "discussion-summary.json"), "utf8"));
  const legacy = !existsSync(path.join(review, "out", "r1"));
  const reviewerRoot = legacy ? "" : "out/";
  const freezePath = path.join(review, "freeze-round1.json");
  const freeze = existsSync(freezePath) ? JSON.parse(await readFile(freezePath, "utf8")) : null;

  const pairs = [];
  for (const entry of summary.pairs ?? []) {
    const pairId = entry.pair_id ?? entry.pair;
    const task = entry.task ?? entry.task_id;
    const repetition = entry.repetition;
    const aCondition = entry.candidate_a_condition;
    if (!pairId || !task || !repetition || !aCondition) {
      throw new Error("discussion-summary pair is missing pair/task/repetition/candidate_a_condition: " + JSON.stringify(entry).slice(0, 120));
    }
    const keyFor = (condition) => (aCondition === condition ? "candidate_a" : "candidate_b");
    const rounds = {};
    const discussions = {};
    for (const reviewer of REVIEWERS) {
      const base = path.join(review, reviewerRoot, reviewer);
      rounds[reviewer] = JSON.parse(await readFile(path.join(base, pairId + ".json"), "utf8"));
      discussions[reviewer] = JSON.parse(await readFile(path.join(base, pairId + ".discussion.json"), "utf8"));
    }
    const scores = {};
    const evidence = {};
    const strengths = {};
    const defects = {};
    for (const condition of ["baseline", "uadi"]) {
      const key = keyFor(condition);
      scores[condition] = {
        r1: discussions.r1.final_scores[key],
        r2: discussions.r2.final_scores[key],
        round1: rounds.r1[key].scores,
        panel: Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, round((discussions.r1.final_scores[key][dimension] + discussions.r2.final_scores[key][dimension]) / 2)]))
      };
      evidence[condition] = REVIEWERS.flatMap((reviewer) => (rounds[reviewer][key].evidence ?? []).map((item) => ({
        reviewer: reviewer.toUpperCase(),
        file: reviewerRoot + reviewer + "/" + item.file,
        caption: item.caption,
        dimension: item.dimension
      })));
      strengths[condition] = rounds.r1[key].strengths ?? [];
      defects[condition] = rounds.r1[key].critical_defects ?? [];
    }
    const splitSource = entry.disputes ?? [];
    const splits = splitSource.map((split) => {
      const condition = split.candidate === "candidate_a" ? aCondition : (aCondition === "baseline" ? "uadi" : "baseline");
      const letter = split.candidate === "candidate_a" ? "a" : "b";
      const reason = (reviewer) => discussions[reviewer].responses?.find((response) => response.candidate === letter && response.dimension === split.dimension)?.reason ?? "No separate note.";
      return { condition, dimension: split.dimension, dimensionLabel: LABELS[split.dimension] ?? split.dimension, r1: split.r1, r2: split.r2, panel: split.panel, r1Reason: reason("r1"), r2Reason: reason("r2") };
    });
    pairs.push({
      id: pairId,
      task,
      taskLabel: labelFor(task),
      repetition,
      aCondition,
      baseline: round(DIMENSIONS.reduce((total, dimension) => total + (scores.baseline.panel[dimension] / 4) * WEIGHTS[dimension], 0)),
      uadi: round(DIMENSIONS.reduce((total, dimension) => total + (scores.uadi.panel[dimension] / 4) * WEIGHTS[dimension], 0)),
      delta: 0,
      splits,
      scores,
      evidence,
      strengths,
      defects,
      links: {
        r1: reviewerRoot + "r1/" + pairId + ".json",
        r1d: reviewerRoot + "r1/" + pairId + ".discussion.json",
        r2: reviewerRoot + "r2/" + pairId + ".json",
        r2d: reviewerRoot + "r2/" + pairId + ".discussion.json"
      }
    });
    pairs[pairs.length - 1].delta = round(pairs[pairs.length - 1].uadi - pairs[pairs.length - 1].baseline);
  }

  const byTask = [...new Set(pairs.map((pair) => pair.task))].sort().map((task) => {
    const entries = pairs.filter((pair) => pair.task === task);
    const baseline = mean(entries.map((pair) => pair.baseline));
    const uadi = mean(entries.map((pair) => pair.uadi));
    return { id: task, label: labelFor(task), baseline: round(baseline), uadi: round(uadi), delta: round(uadi - baseline), wins: entries.filter((pair) => pair.delta > 0).length, losses: entries.filter((pair) => pair.delta < 0).length };
  });

  const dimensions = DIMENSIONS.map((dimension) => {
    const baseline = mean(pairs.map((pair) => pair.scores.baseline.panel[dimension]));
    const uadi = mean(pairs.map((pair) => pair.scores.uadi.panel[dimension]));
    return { key: dimension, label: LABELS[dimension], short: SHORT[dimension], weight: WEIGHTS[dimension], baseline: round(baseline), uadi: round(uadi), delta: round(uadi - baseline) };
  });

  let evidenceCount = 0;
  for (const reviewer of REVIEWERS) {
    const root = path.join(review, reviewerRoot, reviewer, "evidence");
    if (!existsSync(root)) continue;
    evidenceCount += (await readdir(root, { recursive: true, withFileTypes: true })).filter((entry) => entry.isFile()).length;
  }

  const aPairs = pairs.filter((pair) => pair.aCondition === "uadi");
  const bPairs = pairs.filter((pair) => pair.aCondition === "baseline");
  const position = {
    a: { pairs: aPairs, mean: round(mean(aPairs.map((pair) => pair.delta))) },
    b: { pairs: bPairs, mean: round(mean(bPairs.map((pair) => pair.delta))) }
  };

  const baseline = mean(pairs.map((pair) => pair.baseline));
  const uadi = mean(pairs.map((pair) => pair.uadi));

  return {
    frozenAt: freeze?.frozen_at ?? null,
    rule: summary.rule ?? "Agreed scores are final; remaining splits are reported.",
    overall: {
      baseline: round(baseline),
      uadi: round(uadi),
      delta: round(uadi - baseline),
      wins: pairs.filter((pair) => pair.delta > 0).length,
      losses: pairs.filter((pair) => pair.delta < 0).length,
      ties: pairs.filter((pair) => pair.delta === 0).length,
      splits: pairs.reduce((total, pair) => total + pair.splits.length, 0),
      judgments: pairs.length * 2 * DIMENSIONS.length,
      evidence: evidenceCount
    },
    byTask,
    dimensions,
    position,
    pairs
  };
}

export function renderDashboard(data, options = {}) {
  const title = options.title ?? "Review dashboard";
  const status = options.status ?? "Machine-reviewed";
  const backLink = options.backLink ?? null;
  const backLabel = options.backLabel ?? "Study record";
  const prefix = options.prefix ?? "";
  const embedded = JSON.stringify(data).replace(/</g, "\\u003c");
  const back = backLink ? '<a href="' + esc(backLink) + '">' + esc(backLabel) + '</a>' : "";
  const dataLinks = '<a href="' + prefix + 'discussion-summary.json">Summary JSON</a><a href="' + prefix + 'freeze-round1.json">Freeze JSON</a>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root {
    color-scheme: light;
    --bg: #f3f5f9; --panel: #fff; --ink: #111827; --muted: #667085; --line: #e4e7ec; --line-strong: #d0d5dd;
    --blue: #1d4ed8; --blue-soft: #e8efff; --gray: #64748b; --gray-soft: #eef1f5;
    --green: #047857; --green-soft: #e6f4ee; --red: #b42318; --red-soft: #fdecea;
    --amber: #b45309; --amber-soft: #fff4e0; --shadow: 0 12px 30px rgba(16, 24, 40, .12); --radius: 12px;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { background: var(--bg); color: var(--ink); font: 14px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  a { color: var(--blue); }
  button { font: inherit; }
  .wrap { max-width: 1440px; margin: 0 auto; padding: 22px 22px 60px; }
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .mark { width: 38px; height: 38px; border-radius: 10px; background: #0b1f4d; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 11px; letter-spacing: .04em; flex: none; }
  h1 { font-size: 20px; line-height: 1.2; margin: 0; }
  .sub { color: var(--muted); font-size: 12px; margin: 2px 0 0; }
  .status { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #b7dfcc; background: var(--green-soft); color: #05603a; border-radius: 999px; padding: 5px 11px; font-size: 12px; font-weight: 650; white-space: nowrap; }
  .status::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #0e9f6e; }
  .topnav { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
  .topnav a { font-size: 12px; text-decoration: none; color: #475467; border: 1px solid var(--line-strong); background: #fff; border-radius: 8px; padding: 5px 10px; }
  .topnav a:hover { background: #f9fafb; color: var(--ink); }
  .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 14px; }
  .kpi { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 13px 15px; }
  .kpi .label { font-size: 11px; text-transform: uppercase; letter-spacing: .055em; color: var(--muted); font-weight: 600; }
  .kpi .value { font-size: 26px; font-weight: 750; font-variant-numeric: tabular-nums; line-height: 1.2; margin-top: 2px; }
  .kpi .note { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .kpi.accent-blue { border-top: 3px solid var(--blue); }
  .kpi.accent-gray { border-top: 3px solid var(--gray); }
  .kpi.accent-amber { border-top: 3px solid var(--amber); }
  .workflow { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; overflow-x: auto; }
  .step { display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 12px; color: var(--muted); }
  .step .dot { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #b7dfcc; background: var(--green-soft); color: #05603a; display: grid; place-items: center; font-size: 11px; font-weight: 700; flex: none; }
  .step.done { color: var(--ink); font-weight: 600; }
  .step .sep { width: 26px; height: 1px; background: var(--line-strong); margin: 0 4px; }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 14px; align-items: start; }
  .main { display: grid; gap: 14px; align-content: start; min-width: 0; }
  .card { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); }
  .layout > .card { align-self: start; }
  .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 15px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
  .card-head h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 0; }
  .card-body { padding: 14px 15px; }
  .toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { border: 1px solid var(--line-strong); background: #fff; border-radius: 999px; padding: 4px 10px; font-size: 12px; color: #475467; cursor: pointer; }
  .chip:hover { background: #f9fafb; }
  .chip[aria-pressed="true"] { background: #0b1f4d; border-color: #0b1f4d; color: #fff; }
  .search { border: 1px solid var(--line-strong); border-radius: 8px; padding: 5px 9px; font-size: 12px; min-width: 150px; }
  .sort { border: 1px solid var(--line-strong); border-radius: 8px; padding: 5px 8px; font-size: 12px; background: #fff; }
  .toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #475467; cursor: pointer; user-select: none; }
  .toggle input { accent-color: var(--amber); }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); font-size: 13px; white-space: nowrap; }
  th { font-size: 10.5px; text-transform: uppercase; letter-spacing: .055em; color: var(--muted); background: #fbfcfd; font-weight: 650; }
  th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tbody tr { cursor: pointer; }
  tbody tr:hover { background: #f8fafc; }
  tbody tr:last-child td { border-bottom: 0; }
  td.task { font-weight: 600; }
  td.task .rep { color: var(--muted); font-weight: 400; }
  .delta { font-weight: 700; font-variant-numeric: tabular-nums; }
  .pos { color: var(--green); } .neg { color: var(--red); } .zero { color: var(--muted); }
  .pill { display: inline-block; border-radius: 999px; padding: 1px 8px; font-size: 11px; font-weight: 650; }
  .pill.split { background: var(--amber-soft); color: var(--amber); }
  .pill.agree { background: var(--green-soft); color: var(--green); }
  .winner { font-size: 11px; font-weight: 650; padding: 2px 8px; border-radius: 6px; }
  .winner.baseline { background: var(--gray-soft); color: #344054; }
  .winner.uadi { background: var(--blue-soft); color: var(--blue); }
  .winner.tie { background: #f2f4f7; color: var(--muted); }
  .open { border: 1px solid var(--line-strong); background: #fff; border-radius: 7px; width: 28px; height: 26px; cursor: pointer; color: #344054; }
  .open:hover { background: #f2f4f7; }
  .pair-link { border: 0; background: none; padding: 0; color: inherit; cursor: pointer; text-align: left; font: inherit; font-weight: 600; }
  .divbar { position: relative; width: 92px; height: 8px; background: #f0f2f6; border-radius: 999px; overflow: hidden; }
  .divbar::after { content: ""; position: absolute; left: 50%; top: -2px; bottom: -2px; width: 1px; background: #c8ced8; }
  .divbar .fill { position: absolute; top: 0; bottom: 0; border-radius: 999px; }
  .divbar .fill.pos { background: #34a26f; left: 50%; }
  .divbar .fill.neg { background: #e05a4f; right: 50%; }
  .delta-cell { display: flex; align-items: center; gap: 8px; }
  .empty { padding: 28px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  .table-foot { padding: 8px 12px; border-top: 1px solid var(--line); font-size: 11.5px; color: var(--muted); }
  .pair-cards { display: none; }
  .pair-card { width: 100%; text-align: left; border: 1px solid var(--line); background: #fff; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
  .pair-card:hover { background: #f8fafc; }
  .pc-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .pc-task { font-weight: 650; font-size: 13px; }
  .pc-scores { display: flex; gap: 12px; margin-top: 6px; font-size: 12px; color: var(--muted); align-items: baseline; }
  .pc-scores strong { color: var(--ink); font-variant-numeric: tabular-nums; }
  .pc-delta { margin-left: auto; font-weight: 750; font-variant-numeric: tabular-nums; }
  .pc-meta { margin-top: 4px; font-size: 11px; color: var(--muted); }
  .aside { display: grid; gap: 14px; }
  .dim { display: grid; grid-template-columns: 104px 1fr 44px; gap: 8px; align-items: center; font-size: 12px; padding: 5px 0; }
  .dim .name { color: #475467; font-weight: 550; white-space: nowrap; }
  .dim .track { position: relative; height: 7px; background: #f0f2f6; border-radius: 999px; overflow: hidden; }
  .dim .track::after { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: #c8ced8; }
  .dim .track .fill { position: absolute; top: 0; bottom: 0; }
  .dim .track .fill.pos { left: 50%; background: #34a26f; }
  .dim .track .fill.neg { right: 50%; background: #e05a4f; }
  .dim .val { text-align: right; font-variant-numeric: tabular-nums; font-weight: 650; }
  .pos-table { width: 100%; font-size: 12px; }
  .pos-table td { padding: 6px 0; border: 0; }
  .pos-table td:last-child { text-align: right; font-variant-numeric: tabular-nums; font-weight: 650; }
  .note { color: var(--muted); font-size: 11.5px; margin: 8px 0 0; }
  .next { display: grid; gap: 8px; }
  .next .item { display: flex; align-items: start; gap: 8px; border: 1px solid var(--line); border-radius: 9px; padding: 8px 10px; font-size: 12.5px; }
  .next .num { width: 20px; height: 20px; border-radius: 50%; background: var(--amber-soft); color: var(--amber); display: grid; place-items: center; font-size: 11px; font-weight: 700; flex: none; }
  .next .txt strong { display: block; font-size: 12.5px; }
  .next .txt span { color: var(--muted); font-size: 11.5px; }
  .limitations { margin-top: 14px; }
  .limitations ul { margin: 0; padding-left: 18px; color: #475467; font-size: 12.5px; }
  .limitations li { margin: 4px 0; }
  .scrim { position: fixed; inset: 0; background: rgba(16, 24, 40, .38); opacity: 0; pointer-events: none; transition: opacity .16s ease; z-index: 40; }
  .scrim.on { opacity: 1; pointer-events: auto; }
  .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(760px, 94vw); background: #fff; z-index: 50; transform: translateX(102%); transition: transform .2s ease, visibility .2s; visibility: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow); }
  .drawer.on { transform: translateX(0); visibility: visible; }
  .drawer-head { padding: 16px 18px; border-bottom: 1px solid var(--line); display: flex; align-items: start; justify-content: space-between; gap: 12px; }
  .drawer-head h2 { font-size: 17px; margin: 0; }
  .drawer-head .meta { color: var(--muted); font-size: 12px; margin-top: 3px; }
  .close { border: 1px solid var(--line-strong); background: #fff; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: #344054; flex: none; }
  .close:hover { background: #f2f4f7; }
  .drawer-body { padding: 16px 18px 34px; overflow: auto; }
  .drawer-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
  .drawer-kpis .k { border: 1px solid var(--line); border-radius: 9px; padding: 9px 10px; }
  .drawer-kpis .k .l { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); }
  .drawer-kpis .k .v { font-size: 19px; font-weight: 750; font-variant-numeric: tabular-nums; }
  .drawer h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 20px 0 8px; }
  .score-table th, .score-table td { padding: 7px 8px; font-size: 12px; }
  .score-table th { font-size: 10px; }
  .score-table td:first-child { font-weight: 550; }
  .split-card { border: 1px solid #f0d48a; background: #fffaf0; border-radius: 9px; padding: 10px 12px; margin-bottom: 8px; }
  .split-card .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; flex-wrap: wrap; }
  .split-card .top strong { font-size: 12.5px; }
  .split-card p { margin: 6px 0 0; font-size: 12px; color: #475467; }
  .split-card .rv { font-weight: 650; color: var(--ink); }
  .agree-note { border: 1px solid #b7dfcc; background: var(--green-soft); color: #05603a; border-radius: 9px; padding: 9px 12px; font-size: 12.5px; }
  .evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .evidence-col h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 6px; color: #475467; }
  .figs { display: grid; grid-template-columns: 1fr; gap: 8px; }
  figure { margin: 0; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: #fbfcfd; }
  figure img { width: 100%; display: block; background: #fff; }
  figcaption { font-size: 10.5px; color: #475467; padding: 5px 7px; }
  figcaption .rv { font-weight: 700; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .list-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 5px; color: #475467; }
  .list-block ul { margin: 0 0 10px; padding-left: 16px; font-size: 12px; color: #475467; }
  .list-block li { margin: 3px 0; }
  .drawer-foot { margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; }
  @media (max-width: 1100px) {
    .layout { grid-template-columns: minmax(0, 1fr); }
    .kpis { grid-template-columns: repeat(3, 1fr); }
    .aside { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  }
  @media (max-width: 720px) {
    .kpis { grid-template-columns: 1fr 1fr; }
    .kpis .kpi:last-child { grid-column: span 2; }
    .aside { grid-template-columns: minmax(0, 1fr); }
    .table-wrap { display: none; }
    .pair-cards { display: grid; gap: 8px; padding: 10px; }
    .drawer-kpis { grid-template-columns: 1fr 1fr; }
    .evidence-grid, .two-col { grid-template-columns: 1fr; }
    .topbar { align-items: start; flex-direction: column; }
    .topnav { margin-left: 0; }
    .workflow { padding: 10px 12px; flex-wrap: wrap; gap: 6px 12px; }
    .step .sep { display: none; }
    .step { font-size: 11.5px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="topbar">
    <div class="brand">
      <div class="mark">UADI</div>
      <div>
        <h1>${esc(title)}</h1>
        <p class="sub">${data.pairs.length} pairs · ${data.overall.evidence} evidence crops${data.frozenAt ? " · round 1 frozen " + esc(new Date(data.frozenAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })) : ""}</p>
      </div>
    </div>
    <div class="status">${esc(status)}</div>
    <nav class="topnav" aria-label="Review navigation">${back}${dataLinks}</nav>
  </header>

  <section class="kpis" aria-label="Overall result">
    <div class="kpi accent-gray"><div class="label">Baseline mean</div><div class="value" id="kpi-baseline"></div><div class="note">weighted / 100</div></div>
    <div class="kpi accent-blue"><div class="label">UADI mean</div><div class="value" id="kpi-uadi"></div><div class="note">weighted / 100</div></div>
    <div class="kpi"><div class="label">Panel delta</div><div class="value" id="kpi-delta"></div><div class="note" id="kpi-wins"></div></div>
    <div class="kpi accent-amber"><div class="label">Split judgments</div><div class="value" id="kpi-splits"></div><div class="note" id="kpi-judgments"></div></div>
    <div class="kpi"><div class="label">Evidence crops</div><div class="value" id="kpi-evidence"></div><div class="note">reviewer captures</div></div>
  </section>

  <section class="workflow" aria-label="Review workflow">
    <div class="step done"><span class="dot">✓</span>Blinded packets</div><span class="sep"></span>
    <div class="step done"><span class="dot">✓</span>Independent grade</div><span class="sep"></span>
    <div class="step done"><span class="dot">✓</span>Freeze round 1</div><span class="sep"></span>
    <div class="step done"><span class="dot">✓</span>Evidence exchange</div><span class="sep"></span>
    <div class="step done"><span class="dot">✓</span>Final decision</div>
  </section>

  <div class="layout">
    <div class="main">
      <section class="card" aria-label="Pairs">
        <div class="card-head">
          <h2>Pairs</h2>
          <div class="toolbar">
            <div class="chips" id="task-chips" role="group" aria-label="Filter by task"></div>
            <input class="search" id="search" type="search" placeholder="Search pair…" aria-label="Search pairs">
            <label class="toggle"><input type="checkbox" id="splits-only"> Splits only</label>
            <select class="sort" id="sort" aria-label="Sort pairs">
              <option value="task">Sort: task</option>
              <option value="delta-desc">Delta high → low</option>
              <option value="delta-asc">Delta low → high</option>
              <option value="splits">Most splits</option>
              <option value="score">UADI score</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Pair</th><th class="num">Baseline</th><th class="num">UADI</th><th>Delta</th><th class="num">Splits</th><th>Winner</th><th></th></tr></thead>
            <tbody id="rows"></tbody>
          </table>
        </div>
        <div class="pair-cards" id="cards"></div>
        <div class="empty" id="empty" hidden>No pairs match these filters.</div>
        <div class="table-foot" id="count"></div>
      </section>

      <section class="card" aria-label="By task">
        <div class="card-head"><h2>By task</h2><span class="pill agree">UADI − baseline</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Task</th><th class="num">Baseline</th><th class="num">UADI</th><th>Delta</th><th class="num">W / L</th></tr></thead>
            <tbody id="task-rows"></tbody>
          </table>
        </div>
      </section>
    </div>

    <aside class="aside">
      <section class="card"><div class="card-head"><h2>Dimension deltas</h2><span class="pill agree">UADI − baseline</span></div><div class="card-body" id="dims"></div><p class="note">0–4 rubric scale.</p></section>
      <section class="card"><div class="card-head"><h2>Position sensitivity</h2></div><div class="card-body"><table class="pos-table"><tbody id="position"></tbody></table><p class="note">Randomized mapping. A sign flip is an order or composition interaction, not evidence that the treatment performs differently by label.</p></div></section>
      <section class="card"><div class="card-head"><h2>Next actions</h2></div><div class="card-body next">
        <div class="item"><span class="num">1</span><span class="txt"><strong>Validate the panel</strong><span>Run <code>npm run review:validate -- --review &lt;dir&gt; --runs &lt;dir&gt;</code> before publishing.</span></span></div>
        <div class="item"><span class="num">2</span><span class="txt"><strong>Add a second model family</strong><span>Required for a confirmatory machine study.</span></span></div>
        <div class="item"><span class="num">3</span><span class="txt"><strong>Record the study</strong><span>Keep results, reviewer files, evidence and the freeze with the study.</span></span></div>
      </div></section>
    </aside>
  </div>

  <section class="card limitations">
    <div class="card-head"><h2>Limits of this dashboard</h2></div>
    <div class="card-body"><ul>
      <li>Reviewer type is not inferred here. Check the study record: LLM sessions are not independent people.</li>
      <li>A machine review is screening-grade. It is not human review and does not establish human-perceived quality.</li>
      <li>${data.overall.splits} of ${data.overall.judgments} dimension judgments remained split. Averaging is a decision rule, not consensus.</li>
      <li>Visual scoring used the screenshots the reviewers captured, typically default states only.</li>
      <li>All values are descriptive; no statistical test was performed.</li>
    </ul></div>
  </section>
</div>

<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">
  <div class="drawer-head">
    <div><h2 id="drawer-title"></h2><div class="meta" id="drawer-meta"></div></div>
    <button class="close" id="close" aria-label="Close details">✕</button>
  </div>
  <div class="drawer-body" id="drawer-body"></div>
</aside>

<script>
const DATA = ${embedded};
const LABELS = ${JSON.stringify(LABELS)};
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (value) => (value > 0 ? "+" : "") + Number(value).toFixed(1);
const cls = (value) => (value > 0 ? "pos" : value < 0 ? "neg" : "zero");
const state = { task: "all", query: "", splitsOnly: false, sort: "task" };

$("#kpi-baseline").textContent = DATA.overall.baseline.toFixed(1);
$("#kpi-uadi").textContent = DATA.overall.uadi.toFixed(1);
$("#kpi-delta").textContent = fmt(DATA.overall.delta);
$("#kpi-delta").className = "value " + cls(DATA.overall.delta);
$("#kpi-wins").textContent = DATA.overall.wins + " wins · " + DATA.overall.losses + " losses";
$("#kpi-splits").textContent = DATA.overall.splits;
$("#kpi-judgments").textContent = "of " + DATA.overall.judgments + " judgments";
$("#kpi-evidence").textContent = DATA.overall.evidence;

const tasks = [...new Set(DATA.pairs.map((pair) => pair.task))];
$("#task-chips").innerHTML = '<button class="chip" data-task="all" aria-pressed="true">All</button>' +
  tasks.map((task) => '<button class="chip" data-task="' + esc(task) + '" aria-pressed="false">' + esc(DATA.pairs.find((pair) => pair.task === task).taskLabel.replace(/ settings$| dashboard$/, "")) + '</button>').join("");

function selectedPairs() {
  let rows = DATA.pairs.slice();
  if (state.task !== "all") rows = rows.filter((pair) => pair.task === state.task);
  if (state.splitsOnly) rows = rows.filter((pair) => pair.splits.length > 0);
  if (state.query) {
    const query = state.query.toLowerCase();
    rows = rows.filter((pair) => (pair.taskLabel + " " + pair.id).toLowerCase().includes(query));
  }
  const byTask = (a, b) => a.task.localeCompare(b.task) || a.repetition - b.repetition;
  if (state.sort === "task") rows.sort(byTask);
  if (state.sort === "delta-desc") rows.sort((a, b) => b.delta - a.delta || byTask(a, b));
  if (state.sort === "delta-asc") rows.sort((a, b) => a.delta - b.delta || byTask(a, b));
  if (state.sort === "splits") rows.sort((a, b) => b.splits.length - a.splits.length || byTask(a, b));
  if (state.sort === "score") rows.sort((a, b) => b.uadi - a.uadi || byTask(a, b));
  return rows;
}

function winner(pair) {
  if (pair.delta > 0) return '<span class="winner uadi">UADI</span>';
  if (pair.delta < 0) return '<span class="winner baseline">Baseline</span>';
  return '<span class="winner tie">Tie</span>';
}

function bar(pair, scale) {
  const width = Math.min(50, Math.round(Math.abs(pair.delta) / scale * 50));
  return '<div class="divbar" aria-hidden="true"><span class="fill ' + cls(pair.delta) + '" style="width:' + width + '%"></span></div>';
}

function row(pair) {
  return '<tr data-id="' + pair.id + '">' +
    '<td class="task"><button class="pair-link" data-open="' + pair.id + '">' + esc(pair.taskLabel) + ' <span class="rep">· r' + pair.repetition + '</span></button></td>' +
    '<td class="num">' + pair.baseline.toFixed(1) + '</td>' +
    '<td class="num">' + pair.uadi.toFixed(1) + '</td>' +
    '<td><div class="delta-cell">' + bar(pair, 20) + '<span class="delta ' + cls(pair.delta) + '">' + fmt(pair.delta) + '</span></div></td>' +
    '<td class="num">' + (pair.splits.length ? '<span class="pill split">' + pair.splits.length + '</span>' : '<span class="pill agree">0</span>') + '</td>' +
    '<td>' + winner(pair) + '</td>' +
    '<td><button class="open" data-open="' + pair.id + '" aria-label="Open ' + esc(pair.taskLabel) + ' repetition ' + pair.repetition + '">→</button></td>' +
    '</tr>';
}

function card(pair) {
  const meta = pair.splits.length + (pair.splits.length === 1 ? " split" : " splits") + " · " + (pair.evidence.baseline.length + pair.evidence.uadi.length) + " crops";
  return '<button class="pair-card" data-open="' + pair.id + '">' +
    '<div class="pc-top"><span class="pc-task">' + esc(pair.taskLabel) + ' · r' + pair.repetition + '</span>' + winner(pair) + '</div>' +
    '<div class="pc-scores"><span>Baseline <strong>' + pair.baseline.toFixed(1) + '</strong></span><span>UADI <strong>' + pair.uadi.toFixed(1) + '</strong></span><span class="pc-delta ' + cls(pair.delta) + '">' + fmt(pair.delta) + '</span></div>' +
    '<div class="pc-meta">' + meta + '</div>' +
    '</button>';
}

function renderRows() {
  const rows = selectedPairs();
  $("#rows").innerHTML = rows.map(row).join("");
  $("#cards").innerHTML = rows.map(card).join("");
  $("#empty").hidden = rows.length !== 0;
  $("#count").textContent = "Showing " + rows.length + " of " + DATA.pairs.length + " pairs · select a pair for scores, evidence and splits";
}

function renderTasks() {
  $("#task-rows").innerHTML = DATA.byTask.map((task) => {
    const pseudo = { delta: task.delta };
    return '<tr data-task-filter="' + task.id + '">' +
      '<td class="task">' + esc(task.label) + '</td>' +
      '<td class="num">' + task.baseline.toFixed(1) + '</td>' +
      '<td class="num">' + task.uadi.toFixed(1) + '</td>' +
      '<td><div class="delta-cell">' + bar(pseudo, 20) + '<span class="delta ' + cls(task.delta) + '">' + fmt(task.delta) + '</span></div></td>' +
      '<td class="num">' + task.wins + ' / ' + task.losses + '</td>' +
      '</tr>';
  }).join("");
}

function renderAside() {
  const max = 0.35;
  $("#dims").innerHTML = DATA.dimensions.map((dimension) => {
    const width = Math.min(50, Math.round(Math.abs(dimension.delta) / max * 50));
    const fill = '<span class="fill ' + cls(dimension.delta) + '" style="width:' + width + '%"></span>';
    return '<div class="dim"><span class="name">' + esc(dimension.short) + '</span><div class="track" aria-hidden="true">' + fill + '</div><span class="val ' + cls(dimension.delta) + '">' + fmt(dimension.delta) + '</span></div>';
  }).join("");
  $("#position").innerHTML = [
    ["Candidate A", DATA.position.a],
    ["Candidate B", DATA.position.b]
  ].map(([label, group]) => '<tr><td>' + label + ' <span class="sub">' + group.pairs.length + ' pairs</span></td><td class="' + cls(group.mean) + '">' + fmt(group.mean) + '</td></tr>').join("");
}

function detail(pair) {
  const dimRows = Object.keys(LABELS).map((dimension) => {
    const baseline = pair.scores.baseline.panel[dimension];
    const uadi = pair.scores.uadi.panel[dimension];
    const delta = Math.round((uadi - baseline) * 100) / 100;
    return '<tr><td>' + LABELS[dimension] + '</td>' +
      '<td class="num">' + pair.scores.baseline.r1[dimension] + '</td><td class="num">' + pair.scores.baseline.r2[dimension] + '</td><td class="num"><strong>' + baseline + '</strong></td>' +
      '<td class="num">' + pair.scores.uadi.r1[dimension] + '</td><td class="num">' + pair.scores.uadi.r2[dimension] + '</td><td class="num"><strong>' + uadi + '</strong></td>' +
      '<td class="num ' + cls(delta) + '">' + fmt(delta) + '</td></tr>';
  }).join("");
  const splitHtml = pair.splits.length
    ? pair.splits.map((split) => '<div class="split-card"><div class="top"><strong>' + (split.condition === "uadi" ? "UADI" : "Baseline") + ' · ' + LABELS[split.dimension] + '</strong><span>R1 ' + split.r1 + ' · R2 ' + split.r2 + ' · panel ' + (split.panel % 1 ? split.panel.toFixed(1) : split.panel) + '</span></div>' +
      '<p><span class="rv">R1:</span> ' + esc(split.r1Reason) + '</p><p><span class="rv">R2:</span> ' + esc(split.r2Reason) + '</p></div>').join("")
    : '<div class="agree-note">Both reviewers agreed on every dimension for this pair.</div>';
  const evidenceColumn = (condition) => {
    const items = pair.evidence[condition];
    return '<div class="evidence-col"><h4>' + (condition === "uadi" ? "UADI" : "Baseline") + ' · ' + items.length + ' crops</h4><div class="figs">' +
      items.map((item) => '<figure><a href="' + item.file + '" target="_blank" rel="noopener"><img src="' + item.file + '" alt="' + esc(item.caption) + '" loading="lazy"></a><figcaption><span class="rv">' + item.reviewer + '</span> · ' + esc(item.caption) + '</figcaption></figure>').join("") +
      '</div></div>';
  };
  const list = (items) => items.length ? '<ul>' + items.map((item) => '<li>' + esc(item) + '</li>').join('') + '</ul>' : '<p class="note">None recorded.</p>';
  return '<div class="drawer-kpis">' +
      '<div class="k"><div class="l">Baseline</div><div class="v">' + pair.baseline.toFixed(1) + '</div></div>' +
      '<div class="k"><div class="l">UADI</div><div class="v">' + pair.uadi.toFixed(1) + '</div></div>' +
      '<div class="k"><div class="l">Delta</div><div class="v ' + cls(pair.delta) + '">' + fmt(pair.delta) + '</div></div>' +
      '<div class="k"><div class="l">Splits</div><div class="v">' + pair.splits.length + '</div></div>' +
    '</div>' +
    '<h3>Dimension scores</h3><div class="table-wrap"><table class="score-table"><thead><tr><th>Dimension</th><th class="num">B R1</th><th class="num">B R2</th><th class="num">B panel</th><th class="num">U R1</th><th class="num">U R2</th><th class="num">U panel</th><th class="num">Δ</th></tr></thead><tbody>' + dimRows + '</tbody></table></div>' +
    '<h3>Discussion</h3>' + splitHtml +
    '<h3>Evidence</h3><div class="evidence-grid">' + evidenceColumn("baseline") + evidenceColumn("uadi") + '</div>' +
    '<h3>Strengths and defects</h3><div class="two-col">' +
      '<div class="list-block"><h4>Baseline strengths</h4>' + list(pair.strengths.baseline) + '<h4>Baseline defects</h4>' + list(pair.defects.baseline) + '</div>' +
      '<div class="list-block"><h4>UADI strengths</h4>' + list(pair.strengths.uadi) + '<h4>UADI defects</h4>' + list(pair.defects.uadi) + '</div>' +
    '</div>' +
    '<div class="drawer-foot"><a href="' + pair.links.r1 + '">R1 result</a><a href="' + pair.links.r1d + '">R1 discussion</a><a href="' + pair.links.r2 + '">R2 result</a><a href="' + pair.links.r2d + '">R2 discussion</a></div>';
}

let lastFocus = null;
function openPair(id) {
  const pair = DATA.pairs.find((item) => item.id === id);
  if (!pair) return;
  lastFocus = document.activeElement;
  $("#drawer-title").textContent = pair.taskLabel + " · r" + pair.repetition;
  $("#drawer-meta").textContent = "Candidate A = " + pair.aCondition + " · panel score is the mean of R1 and R2";
  $("#drawer-body").innerHTML = detail(pair);
  $("#drawer").classList.add("on");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#scrim").classList.add("on");
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", "#pair=" + pair.id);
  $("#close").focus();
}
function closeDrawer() {
  $("#drawer").classList.remove("on");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#scrim").classList.remove("on");
  document.body.style.overflow = "";
  if (location.hash.startsWith("#pair=")) history.replaceState(null, "", location.pathname + location.search);
  if (lastFocus) lastFocus.focus();
}
$("#scrim").addEventListener("click", closeDrawer);
$("#close").addEventListener("click", closeDrawer);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && $("#drawer").classList.contains("on")) closeDrawer(); });
document.addEventListener("click", (event) => {
  const taskRow = event.target.closest("[data-task-filter]");
  if (taskRow) {
    state.task = taskRow.dataset.taskFilter;
    for (const item of $("#task-chips").querySelectorAll(".chip")) item.setAttribute("aria-pressed", String(item.dataset.task === state.task));
    renderRows();
    return;
  }
  const trigger = event.target.closest("[data-open]");
  if (trigger) { event.preventDefault(); openPair(trigger.dataset.open); return; }
  const row = event.target.closest("tr[data-id]");
  if (row) openPair(row.dataset.id);
});
$("#task-chips").addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  for (const item of $("#task-chips").querySelectorAll(".chip")) item.setAttribute("aria-pressed", String(item === chip));
  state.task = chip.dataset.task;
  renderRows();
});
$("#search").addEventListener("input", (event) => { state.query = event.target.value.trim(); renderRows(); });
$("#splits-only").addEventListener("change", (event) => { state.splitsOnly = event.target.checked; renderRows(); });
$("#sort").addEventListener("change", (event) => { state.sort = event.target.value; renderRows(); });

renderRows();
renderTasks();
renderAside();
const initial = location.hash.match(/^#pair=(.+)$/);
if (initial) openPair(initial[1]);
</script>
</body>
</html>`;
}

export async function buildReviewDashboard({ review, out, title, status, backLink, backLabel }) {
  const reviewDir = path.resolve(review);
  const outFile = path.resolve(out ?? path.join(reviewDir, "dashboard.html"));
  const relative = path.relative(path.dirname(outFile), reviewDir).split(path.sep).join("/");
  const prefix = relative && relative !== "." ? relative + "/" : "";
  const data = await loadReviewData(reviewDir);
  if (prefix) {
    for (const pair of data.pairs) {
      for (const condition of ["baseline", "uadi"]) {
        for (const item of pair.evidence[condition]) item.file = prefix + item.file;
      }
      for (const key of Object.keys(pair.links)) pair.links[key] = prefix + pair.links[key];
    }
  }
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, renderDashboard(data, {
    title,
    status,
    backLink,
    backLabel,
    prefix
  }));
  return { out: outFile, data };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await buildReviewDashboard({
    review: options.review,
    out: options.out,
    title: options.title,
    status: options.status,
    backLink: options.backLink,
    backLabel: options.backLabel
  });
  console.log("wrote " + result.out);
  console.log(result.data.pairs.length + " pairs, " + result.data.overall.evidence + " evidence crops, " + result.data.overall.splits + " split judgments");
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) {
  main().catch((error) => {
    console.error("dashboard build failed: " + error.message);
    process.exitCode = 1;
  });
}
