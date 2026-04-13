#!/usr/bin/env node

const { execSync, spawn } = require("child_process");

const command = process.argv[2];
const commandArgs = process.argv.slice(3);

if (!command) {
  console.error("Usage: run-with-firebase-env.js <start|build> [...args]");
  process.exit(1);
}

const resolveBranchName = () => {
  const envBranch =
    process.env.GITHUB_REF_NAME ||
    process.env.GITHUB_HEAD_REF ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.NETLIFY_BRANCH ||
    process.env.CI_COMMIT_BRANCH ||
    process.env.BRANCH_NAME ||
    process.env.CF_PAGES_BRANCH ||
    process.env.GIT_BRANCH;

  if (envBranch) {
    return String(envBranch).trim();
  }

  try {
    return execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch (error) {
    return "";
  }
};

const resolveAppEnv = () => {
  const explicit = process.env.REACT_APP_APP_ENV;
  if (explicit === "test" || explicit === "prod") {
    return explicit;
  }

  const hasCIRuntime =
    Boolean(process.env.CI) ||
    Boolean(process.env.GITHUB_REF_NAME) ||
    Boolean(process.env.GITHUB_HEAD_REF) ||
    Boolean(process.env.VERCEL_GIT_COMMIT_REF) ||
    Boolean(process.env.NETLIFY_BRANCH) ||
    Boolean(process.env.CI_COMMIT_BRANCH) ||
    Boolean(process.env.BRANCH_NAME) ||
    Boolean(process.env.CF_PAGES_BRANCH) ||
    Boolean(process.env.GIT_BRANCH);

  if (!hasCIRuntime) {
    return "test";
  }

  const branch = resolveBranchName().toLowerCase();
  if (branch === "main" || branch === "master") {
    return "prod";
  }

  return "test";
};

const appEnv = resolveAppEnv();
const env = {
  ...process.env,
  REACT_APP_APP_ENV: appEnv,
};

console.info(`[firebase] local target = ${appEnv}`);

const child = spawn("react-scripts", [command, ...commandArgs], {
  stdio: "inherit",
  env,
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
