import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INSTALLER = path.join(ROOT, "scripts/install-skill.mjs");
const INSTALLED_FILES = [
  "SKILL.md",
  "docs/DESIGN-INTELLIGENCE.md",
  "docs/QUALITY-GATES.md",
  "intelligence/README.md",
  "intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md",
  "intelligence/UX-REASONING-PLAYBOOK.md",
  "intelligence/VISUAL-DESIGN-PLAYBOOK.md",
  "intelligence/patterns/README.md",
  "intelligence/patterns/settings-information-architecture.md",
  "intelligence/patterns/permission-aware-actions.md",
  "intelligence/patterns/destructive-actions.md",
  "intelligence/patterns/status-and-recovery.md",
  "intelligence/patterns/data-tables-and-filtering.md",
  "intelligence/patterns/forms-and-validation.md",
  "schemas/design-specification.schema.json",
  "schemas/discovery-result.schema.json",
  "schemas/project-context.schema.json",
  "schemas/component-catalog.schema.json",
  "component-catalog/catalog.json",
  "examples/minimal/design-specification.json",
  "examples/subscription-settings/README.md"
];

async function withTempDir(run) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uadi-install-"));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("installs the complete portable design skill for Codex", async () => {
  await withTempDir(async (cwd) => {
    const result = spawnSync(process.execPath, [INSTALLER, "--agent", "codex", "--cwd", cwd], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    for (const file of INSTALLED_FILES) {
      const installed = await readFile(path.join(cwd, ".agents/skills/uadi", file), "utf8");
      const source = await readFile(path.join(ROOT, file), "utf8");
      assert.equal(installed, source, `Installed copy differs: ${file}`);
    }
  });
});

test("all installs the complete skill into each supported agent directory", async () => {
  await withTempDir(async (cwd) => {
    const result = spawnSync(process.execPath, [INSTALLER, "--agent", "all", "--cwd", cwd], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    for (const dir of [".agents/skills/uadi", ".claude/skills/uadi", ".cursor/skills/uadi"]) {
      for (const file of INSTALLED_FILES) {
        assert.equal(
          await readFile(path.join(cwd, dir, file), "utf8"),
          await readFile(path.join(ROOT, file), "utf8")
        );
      }
    }
  });
});

test("preserves existing files unless --force is supplied", async () => {
  await withTempDir(async (cwd) => {
    const destination = path.join(cwd, ".claude/skills/uadi");
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "SKILL.md"), "user-customized");
    const safe = spawnSync(process.execPath, [INSTALLER, "--agent", "claude", "--cwd", cwd], { encoding: "utf8" });
    assert.equal(safe.status, 0, safe.stderr);
    assert.match(safe.stdout, /\[skipped\] claude: SKILL.md/);
    assert.equal(await readFile(path.join(destination, "SKILL.md"), "utf8"), "user-customized");

    const forced = spawnSync(process.execPath, [INSTALLER, "--agent", "claude", "--cwd", cwd, "--force"], { encoding: "utf8" });
    assert.equal(forced.status, 0, forced.stderr);
    assert.match(forced.stdout, /\[replaced\] claude: SKILL.md/);
    assert.equal(await readFile(path.join(destination, "SKILL.md"), "utf8"), await readFile(path.join(ROOT, "SKILL.md"), "utf8"));
  });
});

test("rejects unsupported agents", async () => {
  await withTempDir(async (cwd) => {
    const result = spawnSync(process.execPath, [INSTALLER, "--agent", "unknown", "--cwd", cwd], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unsupported agent/);
  });
});
