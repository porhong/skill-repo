#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const cp = require("node:child_process");

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function usage() {
  console.log(
    [
      "Usage:",
      "  npx skills list",
      "  npx skills add <skill-name> [--dir <path>] [--cursor]",
      "  npx skills add <git-url> --skill <skill-name> [--ref <branch|tag|sha>] [--dir <path>] [--cursor]",
      "",
      "Notes:",
      "  - Default install dir: ./.agent-skills",
      "  - --cursor installs to ~/.cursor/skills",
    ].join("\n"),
  );
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    die(`Failed to read JSON: ${filePath}\n${e?.message ?? e}`);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(srcDir, destDir) {
  // Node 18+: fs.cpSync is available.
  fs.cpSync(srcDir, destDir, {
    recursive: true,
    force: false,
    errorOnExist: true,
  });
}

function isProbablyGitUrl(value) {
  if (!value) return false;
  if (value.startsWith("https://")) return true;
  if (value.startsWith("http://")) return true;
  if (value.startsWith("git@")) return true;
  if (value.startsWith("ssh://")) return true;
  if (value.endsWith(".git")) return true;
  return false;
}

function safeRm(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
}

function runGit(args, cwd) {
  const result = cp.spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8",
  });
  if (result.error) die(`Failed to run git: ${result.error.message}`);
  if (result.status !== 0) {
    die(`git ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`.trim());
  }
  return result.stdout.trim();
}

function loadRegistryFrom(repoRoot) {
  const registryPath = path.join(repoRoot, "skills", "registry.json");
  if (!fs.existsSync(registryPath)) return { skills: [] };
  return readJson(registryPath);
}

function resolveSkillSourceDir(repoRoot, skillName) {
  // Prefer registry if present, fall back to skills/<name>
  const registry = loadRegistryFrom(repoRoot);
  const skills = Array.isArray(registry?.skills) ? registry.skills : [];
  const fromRegistry = skills.find((s) => s?.name === skillName && typeof s?.path === "string");
  const candidate = fromRegistry?.path
    ? path.resolve(repoRoot, fromRegistry.path)
    : path.resolve(repoRoot, "skills", skillName);

  if (!fs.existsSync(candidate)) {
    die(
      `Skill not found in source repo: ${skillName}\nTried: ${path.relative(repoRoot, candidate)}`,
    );
  }
  return candidate;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];

  const flags = {
    dir: undefined,
    cursor: false,
    skill: undefined,
    ref: undefined,
  };

  const positionals = [];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") return { command: "help", flags, positionals };
    if (a === "--cursor") {
      flags.cursor = true;
      continue;
    }
    if (a === "--skill") {
      const v = args[i + 1];
      if (!v) die("Missing value for --skill");
      flags.skill = v;
      i++;
      continue;
    }
    if (a === "--ref") {
      const v = args[i + 1];
      if (!v) die("Missing value for --ref");
      flags.ref = v;
      i++;
      continue;
    }
    if (a === "--dir") {
      const v = args[i + 1];
      if (!v) die("Missing value for --dir");
      flags.dir = v;
      i++;
      continue;
    }
    if (a.startsWith("--")) die(`Unknown flag: ${a}`);
    positionals.push(a);
  }

  return { command, flags, positionals };
}

function main() {
  const { command, flags, positionals } = parseArgs(process.argv);

  const pkgRoot = path.resolve(__dirname, "..");
  const registryPath = path.join(pkgRoot, "skills", "registry.json");

  if (!command || command === "help") {
    usage();
    return;
  }

  const registry = readJson(registryPath);
  const skills = Array.isArray(registry?.skills) ? registry.skills : [];

  if (command === "list") {
    for (const s of skills) {
      console.log(`${s.name}\t${s.description ?? ""}`.trimEnd());
    }
    return;
  }

  if (command === "add") {
    const source = positionals[0];
    if (!source) {
      usage();
      die("\nMissing <skill-name> or <git-url>.");
    }

    const defaultDir = path.resolve(process.cwd(), ".agent-skills");
    const cursorDir = path.join(os.homedir(), ".cursor", "skills");
    const targetRoot = flags.cursor
      ? cursorDir
      : flags.dir
        ? path.resolve(process.cwd(), flags.dir)
        : defaultDir;

    ensureDir(targetRoot);

    // Mode A: install from this package by skill name
    if (!isProbablyGitUrl(source)) {
      const skillName = source;
      const skill = skills.find((s) => s.name === skillName);
      if (!skill) {
        die(
          `Unknown skill: ${skillName}\nAvailable: ${skills.map((s) => s.name).join(", ")}`,
        );
      }

      const srcDir = path.resolve(pkgRoot, skill.path);
      const destDir = path.join(targetRoot, skill.name);

      if (!fs.existsSync(srcDir)) die(`Skill source directory missing: ${srcDir}`);
      if (fs.existsSync(destDir)) {
        die(
          `Skill already exists at ${destDir}\nDelete it first or choose a different --dir.`,
        );
      }

      copyDir(srcDir, destDir);
      console.log(`Installed ${skill.name} -> ${destDir}`);
      return;
    }

    // Mode B: install from a git repo URL
    const repoUrl = source;
    const skillName = flags.skill;
    if (!skillName) {
      usage();
      die("\nMissing --skill <skill-name> when installing from a git URL.");
    }

    const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), "skills-"));
    const cloneDir = path.join(tempBase, "repo");
    try {
      const ref = flags.ref;
      if (ref) {
        // Shallow clone a single ref when possible
        runGit(["clone", "--depth", "1", "--branch", ref, repoUrl, cloneDir], process.cwd());
      } else {
        runGit(["clone", "--depth", "1", repoUrl, cloneDir], process.cwd());
      }

      const srcDir = resolveSkillSourceDir(cloneDir, skillName);
      const destDir = path.join(targetRoot, skillName);

      if (fs.existsSync(destDir)) {
        die(
          `Skill already exists at ${destDir}\nDelete it first or choose a different --dir.`,
        );
      }

      copyDir(srcDir, destDir);
      console.log(`Installed ${skillName} -> ${destDir}`);
    } finally {
      safeRm(tempBase);
    }
    return;
  }

  usage();
  die(`\nUnknown command: ${command}`);
}

main();

