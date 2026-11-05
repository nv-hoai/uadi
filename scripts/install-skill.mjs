#!/usr/bin/env node
import { cp, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_FILES = [
  "SKILL.md",
  "docs/DESIGN-INTELLIGENCE.md",
  "docs/QUALITY-GATES.md"
];
const TARGETS = {
  codex: ".agents/skills/uadi",
  claude: ".claude/skills/uadi",
  cursor: ".cursor/skills/uadi"
};

function parseArgs(args) {
  const options = { agent: null, cwd: process.cwd(), force: false, help: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--agent" || arg === "--cwd") {
      const value = args[++i];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      options[arg === "--agent" ? "agent" : "cwd"] = value;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

function printHelp() {
  console.log(`UADI Skill installer

Usage:
  node scripts/install-skill.mjs --agent <codex|claude|cursor|all> [--cwd <project>] [--force]

Options:
  --agent   Target agent. Use "all" to install for all supported agents.
  --cwd     Project directory (defaults to the current directory).
  --force   Replace existing UADI skill files. Without this flag, existing
            files are preserved and reported as skipped.
  --help    Show this help.

The installer copies only SKILL.md and the two core design references.
It does not install dependencies, change agent settings, or contact a server.`);
}

export async function installSkill({ agent, cwd = process.cwd(), force = false, root = ROOT }) {
  if (!Object.hasOwn(TARGETS, agent) && agent !== "all") {
    throw new Error(`Unsupported agent "${agent}". Choose codex, claude, cursor or all.`);
  }

  const projectDir = path.resolve(cwd);
  const agents = agent === "all" ? Object.keys(TARGETS) : [agent];
  const results = [];

  for (const name of agents) {
    const destination = path.resolve(projectDir, TARGETS[name]);
    const relative = path.relative(projectDir, destination);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Resolved install destination is outside the project directory.");
    }

    await mkdir(destination, { recursive: true });
    for (const sourcePath of SKILL_FILES) {
      const targetPath = path.join(destination, sourcePath);
      let exists = false;
      try {
        await stat(targetPath);
        exists = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }

      if (exists && !force) {
        results.push({ agent: name, file: sourcePath, status: "skipped" });
        continue;
      }

      await mkdir(path.dirname(targetPath), { recursive: true });
      await cp(path.join(root, sourcePath), targetPath);
      results.push({ agent: name, file: sourcePath, status: exists ? "replaced" : "installed" });
    }
  }
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();
  if (!options.agent) throw new Error('Specify --agent <codex|claude|cursor|all>.');

  const results = await installSkill(options);
  for (const result of results) {
    console.log(`[${result.status}] ${result.agent}: ${result.file}`);
  }
  console.log("UADI Skill installation finished. Restart or refresh your agent if it does not discover the skill.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`UADI install failed: ${error.message}`);
    process.exitCode = 1;
  });
}
