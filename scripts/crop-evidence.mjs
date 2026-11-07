#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

function parseArgs(args) {
  if (args.length < 3) {
    throw new Error("usage: node scripts/crop-evidence.mjs <source.png> <out.png> <WxH+X+Y>");
  }
  const [source, out, geometry] = args;
  if (!/^\d+x\d+\+\d+\+\d+$/.test(geometry)) {
    throw new Error("geometry must look like 640x360+120+80");
  }
  return { source: path.resolve(source), out: path.resolve(out), geometry };
}

function findBinary() {
  for (const name of ["magick", "convert"]) {
    const probe = spawnSync(name, ["-version"], { stdio: "ignore" });
    if (probe.status === 0) return name;
  }
  throw new Error("ImageMagick not found: install `magick` or `convert`");
}

try {
  const { source, out, geometry } = parseArgs(process.argv.slice(2));
  mkdirSync(path.dirname(out), { recursive: true });
  const binary = findBinary();
  const result = spawnSync(binary, [source, "-crop", geometry, "+repage", out], { stdio: "inherit" });
  if (result.status !== 0) throw new Error("crop failed");
  console.log(out);
} catch (error) {
  console.error("crop-evidence: " + error.message);
  process.exitCode = 1;
}
