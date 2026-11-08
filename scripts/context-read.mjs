#!/usr/bin/env node
// Wrapper read instrumentation for context-efficiency probes.
//
// Real host agents usually read files through their own tools. This wrapper
// gives the harness a machine-readable event without relying on the agent to
// write a report. It prints the file exactly as a normal read would and appends
// one JSONL event to the log.
//
// Usage:
//   node scripts/context-read.mjs --log <events.jsonl> --turn 3 --path SKILL.md
import { appendFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CONTEXT_EVENT_SOURCES = ["host_event", "wrapper", "self_report"];

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative);
}

export async function appendReadEvent(options) {
  const root = path.resolve(options.root ?? ROOT);
  const absolute = path.resolve(root, options.path);
  if (!within(root, absolute)) throw new Error("Read path escapes the project root: " + options.path);
  const info = await stat(absolute);
  if (!info.isFile()) throw new Error("Read path is not a file: " + options.path);
  const text = await readFile(absolute, "utf8");
  const relative = path.relative(root, absolute).split(path.sep).join("/");
  const event = {
    ts: new Date().toISOString(),
    turn: Number.isInteger(options.turn) ? options.turn : 0,
    tool: options.tool ?? "read",
    path: relative,
    ...(options.section ? { section: options.section } : {}),
    bytes: Buffer.byteLength(text, "utf8"),
    tokens_est: Math.ceil(text.length / 4),
    source: options.source ?? "wrapper",
    ...(options.note ? { note: options.note } : {})
  };
  const log = path.resolve(options.log);
  await mkdir(path.dirname(log), { recursive: true });
  await appendFile(log, JSON.stringify(event) + "\n", "utf8");
  return { event, text };
}

function parseArgs(args) {
  const options = { turn: 0, root: ROOT };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (!["--log", "--path", "--turn", "--section", "--tool", "--note", "--source", "--root"].includes(arg)) {
      throw new Error("Unknown option: " + arg);
    }
    const value = args[++index];
    if (value === undefined || value.startsWith("--")) throw new Error("Missing value for " + arg);
    if (arg === "--turn") options.turn = Number(value);
    else options[arg.slice(2)] = value;
  }
  if (!options.help && (!options.log || !options.path)) throw new Error("--log and --path are required");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/context-read.mjs --log <events.jsonl> --path <file> [--turn <n>] [--section <name>] [--tool <name>] [--source wrapper|host_event|self_report] [--root <dir>]");
    return;
  }
  const { text } = await appendReadEvent(options);
  process.stdout.write(text);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Context read failed: " + error.message);
    process.exitCode = 1;
  });
}
