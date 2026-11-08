#!/usr/bin/env node
import { cp, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SKILL_FILES = [
  "SKILL.md",
  "docs/DESIGN-INTELLIGENCE.md",
  "docs/QUALITY-GATES.md",
  "docs/ACCESSIBILITY-AND-INTERACTION-REVIEW.md",
  "docs/BENCHMARKING.md",
  "workflows/design-memory.md",
  "intelligence/README.md",
  "intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md",
  "intelligence/UX-REASONING-PLAYBOOK.md",
  "intelligence/DESIGN-DECISIONS-PLAYBOOK.md",
  "intelligence/VISUAL-DESIGN-PLAYBOOK.md",
  "intelligence/modules/product-context.md",
  "intelligence/modules/flow-and-states.md",
  "intelligence/modules/content-and-consequences.md",
  "intelligence/modules/visual-composition.md",
  "intelligence/modules/alternatives-and-tradeoffs.md",
  "intelligence/modules/accessibility-review.md",
  "intelligence/risks/billing-changes.md",
  "intelligence/risks/permissions-and-destructive.md",
  "intelligence/risks/data-freshness.md",
  "intelligence/risks/health-and-claims.md",
  "intelligence/risks/ownership-handover.md",
  "intelligence/patterns/README.md",
  "intelligence/patterns/settings-information-architecture.md",
  "intelligence/patterns/permission-aware-actions.md",
  "intelligence/patterns/destructive-actions.md",
  "intelligence/patterns/status-and-recovery.md",
  "intelligence/patterns/data-tables-and-filtering.md",
  "intelligence/patterns/forms-and-validation.md",
  "intelligence/patterns/onboarding-and-activation.md",
  "intelligence/patterns/metrics-and-data-visualization.md",
  "schemas/design-specification.schema.json",
  "schemas/discovery-result.schema.json",
  "schemas/project-context.schema.json",
  "schemas/design-memory.schema.json",
  "schemas/component-catalog.schema.json",
  "component-catalog/catalog.json",
  "templates/design-memory.json",
  "examples/minimal/design-specification.json",
  "examples/subscription-settings/README.md",
  "examples/product-onboarding/README.md",
  "examples/product-onboarding/index.html",
  "examples/operations-dashboard/README.md",
  "examples/operations-dashboard/app.js",
  "examples/operations-dashboard/data.js",
  "examples/operations-dashboard/index.html",
  "examples/operations-dashboard/styles.css",
  "examples/sso-discovery/README.md",
  "examples/sso-discovery/app/app.js",
  "examples/sso-discovery/app/index.html",
  "examples/sso-discovery/app/styles.css",
  "examples/sso-discovery/artifacts/01-blocked/discovery-result.json",
  "examples/sso-discovery/artifacts/02-resolved/design-brief.md",
  "examples/sso-discovery/artifacts/02-resolved/discovery-result.json",
  "examples/sso-discovery/artifacts/02-resolved/project-context.json",
  "examples/sso-discovery/evidence/README.md",
  "examples/sso-discovery/evidence/app/README.md",
  "examples/sso-discovery/evidence/app/src/auth/permissions.ts",
  "examples/sso-discovery/evidence/app/src/auth/session-context.ts",
  "examples/sso-discovery/evidence/app/src/auth/sso.ts",
  "examples/sso-discovery/evidence/app/src/auth/useCurrentRole.ts",
  "examples/sso-discovery/evidence/app/src/billing/plans.ts",
  "examples/sso-discovery/evidence/app/src/routes/settings.tsx",
  "examples/sso-discovery/evidence/app/src/settings/profile-panel.tsx",
  "examples/sso-discovery/evidence/app/src/settings/security-panel.tsx",
  "examples/sso-discovery/evidence/app/tests/permissions.checks.ts",
  "examples/sso-discovery/evidence/help-center-sso.md",
  "examples/sso-discovery/evidence/product-brief.md",
  "examples/sso-discovery/evidence/support-themes.md",
];
const COMPACT_FILES = [
  "SKILL.md",
  "docs/QUALITY-GATES.md",
  "docs/ACCESSIBILITY-AND-INTERACTION-REVIEW.md",
  "workflows/design-memory.md",
  "intelligence/modules/product-context.md",
  "intelligence/modules/flow-and-states.md",
  "intelligence/modules/content-and-consequences.md",
  "intelligence/modules/visual-composition.md",
  "intelligence/modules/alternatives-and-tradeoffs.md",
  "intelligence/modules/accessibility-review.md",
  "intelligence/risks/billing-changes.md",
  "intelligence/risks/permissions-and-destructive.md",
  "intelligence/risks/data-freshness.md",
  "intelligence/risks/health-and-claims.md",
  "intelligence/risks/ownership-handover.md",
  "intelligence/patterns/README.md",
  "intelligence/patterns/settings-information-architecture.md",
  "intelligence/patterns/permission-aware-actions.md",
  "intelligence/patterns/destructive-actions.md",
  "intelligence/patterns/status-and-recovery.md",
  "intelligence/patterns/data-tables-and-filtering.md",
  "intelligence/patterns/forms-and-validation.md",
  "intelligence/patterns/onboarding-and-activation.md",
  "intelligence/patterns/metrics-and-data-visualization.md",
  "schemas/design-memory.schema.json",
  "schemas/design-specification.schema.json",
  "schemas/component-catalog.schema.json",
  "component-catalog/catalog.json",
  "templates/design-memory.json"
];

const EXTENDED_FILES = [
  "examples/design-memory/README.md",
  "examples/design-memory/design-memory.json",
  "examples/design-memory/DESIGN-MEMORY.md"
];

export const SKILL_PROFILES = {
  compact: COMPACT_FILES,
  standard: [...SKILL_FILES],
  extended: [...SKILL_FILES, ...EXTENDED_FILES]
};

export const ROUTER_TARGETS = [
  "intelligence/modules/product-context.md",
  "intelligence/modules/flow-and-states.md",
  "intelligence/modules/content-and-consequences.md",
  "intelligence/modules/visual-composition.md",
  "intelligence/modules/alternatives-and-tradeoffs.md",
  "intelligence/modules/accessibility-review.md",
  "intelligence/risks/billing-changes.md",
  "intelligence/risks/permissions-and-destructive.md",
  "intelligence/risks/data-freshness.md",
  "intelligence/risks/health-and-claims.md",
  "intelligence/risks/ownership-handover.md",
  "intelligence/patterns/README.md",
  "schemas/design-specification.schema.json",
  "component-catalog/catalog.json"
];

export function missingRouterTargets(profile = "standard") {
  const files = profileFiles(profile);
  return ROUTER_TARGETS.filter((target) => !files.includes(target));
}

export function profileFiles(profile = "standard") {
  if (!Object.hasOwn(SKILL_PROFILES, profile)) {
    throw new Error(`Unsupported profile "${profile}". Choose compact, standard or extended.`);
  }
  const missing = ROUTER_TARGETS.filter((target) => !SKILL_PROFILES[profile].includes(target));
  if (missing.length > 0) throw new Error(`Profile "${profile}" is missing router targets: ${missing.join(", ")}`);
  return SKILL_PROFILES[profile];
}

const TARGETS = {
  codex: ".agents/skills/uadi",
  claude: ".claude/skills/uadi",
  cursor: ".cursor/skills/uadi"
};

function parseArgs(args) {
  const options = { agent: null, cwd: process.cwd(), force: false, help: false, profile: "standard" };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (args[i] === "--help" || args[i] === "-h") options.help = true;
    else if (args[i] === "--force") options.force = true;
    else if (args[i] === "--agent" || args[i] === "--cwd" || args[i] === "--profile") {
      const value = args[++i];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${args[i - 1]}`);
      options[args[i - 1].slice(2)] = value;
    } else {
      throw new Error(`Unknown option: ${args[i]}`);
    }
  }
  return options;
}

function printHelp() {
  console.log(`UADI Skill installer

Usage:
  node scripts/install-skill.mjs --agent <codex|claude|cursor|all> [--profile <compact|standard|extended>] [--cwd <project>] [--force]

Options:
  --agent    Target agent. Use "all" to install for all supported agents.
  --profile  compact: runtime kernel, modules, risk cards, patterns and memory.
             standard: full skill including reference playbooks, schemas and examples (default).
             extended: standard plus the design-memory worked example.
  --cwd      Project directory (defaults to the current directory).
  --force    Replace existing UADI skill files. Without this flag, existing
             files are preserved and reported as skipped.
  --help     Show this help.

The installer copies only the selected profile. It does not install dependencies,
change agent settings, or contact a server.`);
}

export async function installSkill({ agent, cwd = process.cwd(), force = false, root = ROOT, profile = "standard" }) {
  if (!Object.hasOwn(TARGETS, agent) && agent !== "all") {
    throw new Error(`Unsupported agent "${agent}". Choose codex, claude, cursor or all.`);
  }

  const files = profileFiles(profile);
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
    for (const sourcePath of files) {
      const targetPath = path.join(destination, sourcePath);
      let exists = false;
      try {
        await stat(targetPath);
        exists = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }

      if (exists && !force) {
        results.push({ agent: name, file: sourcePath, status: "skipped", profile });
        continue;
      }

      await mkdir(path.dirname(targetPath), { recursive: true });
      await cp(path.join(root, sourcePath), targetPath);
      results.push({ agent: name, file: sourcePath, status: exists ? "replaced" : "installed", profile });
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
  console.log(`UADI Skill installation finished (${options.profile} profile). Restart or refresh your agent if it does not discover the skill.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`UADI install failed: ${error.message}`);
    process.exitCode = 1;
  });
}
