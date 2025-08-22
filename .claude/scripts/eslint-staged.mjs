#!/usr/bin/env node
/* eslint-env node */
import { execSync } from "node:child_process";
import process from "node:process";

const filesArg = process.argv.slice(2);
let files = filesArg.length
  ? filesArg
  : execSync("git diff --name-only --cached --diff-filter=ACMR", { encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .filter(f => /\.(ts|tsx|js|mjs|cjs)$/.test(f));

if (files.length === 0) process.exit(0);

const parts = [
  "eslint",
  "--cache",
  "--cache-location",
  "node_modules/.cache/eslint",
  "--max-warnings=0",
  ...files
];
execSync(parts.join(" "), { stdio: "inherit" });