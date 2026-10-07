import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("../", import.meta.url));
const fixture = mkdtempSync(join(tmpdir(), "everyday-nautilus-repo-checks-"));

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: fixture,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
    },
  });
  assert.ifError(result.error);
  return result;
}

function git(...args) {
  assert.equal(run("git", args).status, 0, `Fixture git ${args[0]} failed`);
}

function reject(mode = "--staged") {
  return run("bash", [
    join(project, "scripts/reject-local-environment-files.sh"),
    mode,
  ]);
}

function scan(mode, ...args) {
  return run("betterleaks", [
    mode,
    ".",
    `--config=${join(project, ".betterleaks.toml")}`,
    "--redact=100",
    "--no-banner",
    "--no-color",
    "--ignore-gitleaks-allow",
    ...args,
  ]);
}

try {
  git("init", "--quiet");
  git("config", "user.name", "Repository check fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.hooksPath", "/dev/null");
  writeFileSync(join(fixture, ".gitignore"), ".env*\n.dev.vars*\n.direnv/\n");
  git("add", ".gitignore");
  git("commit", "--quiet", "-m", "Initialize fixture");

  for (const name of [
    ".env",
    ".env.local",
    ".dev.vars.production",
    ".npmrc",
    "lefthook-local.yml",
    "nested space\nfolder/.env.local",
    ".direnv/state",
    ".direnv/.env.example",
  ]) {
    const path = join(fixture, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "local settings\n");
    git("add", "--force", "--", name);
    assert.equal(reject().status, 1, `Expected rejection of ${name}`);
    git("reset", "--quiet", "--hard", "HEAD");
  }
  for (const name of [".env.example", ".dev.vars.example"]) {
    writeFileSync(join(fixture, name), "PUBLIC_SETTING=\n");
    git("add", "--force", "--", name);
  }
  assert.equal(reject().status, 0, "Templates should be allowed");
  git("reset", "--quiet", "--hard", "HEAD");
  console.log(
    "Local environment files: forced additions and unusual paths rejected; templates allowed.",
  );

  writeFileSync(join(fixture, ".env"), "LOCAL_SETTING=\n");
  git("add", "--force", ".env");
  git("commit", "--quiet", "-m", "Add local fixture file");
  assert.equal(
    reject("--tracked").status,
    1,
    "CI must reject already tracked local files",
  );
  git("rm", "--quiet", ".env");
  assert.equal(reject().status, 0, "Deleting local files should be allowed");
  git("commit", "--quiet", "-m", "Remove local fixture file");

  const secret = `ghp_${randomBytes(18).toString("hex")}`;
  writeFileSync(
    join(fixture, "credential.txt"),
    `token=${secret} # betterleaks:allow\n`,
  );
  git("add", "credential.txt");
  // The index contains the token even though the working copy has been cleaned.
  writeFileSync(join(fixture, "credential.txt"), "clean working copy\n");
  const staged = scan("git", "--pre-commit", "--staged");
  assert.equal(
    staged.status,
    1,
    "Staged token must fail, including inline allow comments",
  );
  assert.ok(
    !`${staged.stdout}${staged.stderr}`.includes(secret),
    "Token must be redacted",
  );
  git("commit", "--quiet", "-m", "Add synthetic credential");
  git("rm", "--quiet", "--force", "credential.txt");
  git("commit", "--quiet", "-m", "Remove synthetic credential");
  const history = scan("git", "--log-opts=--all");
  assert.equal(history.status, 1, "Deleted historical token must fail");
  assert.ok(
    !`${history.stdout}${history.stderr}`.includes(secret),
    "History token must be redacted",
  );
  assert.equal(scan("dir").status, 0, "Clean checkout must pass");
  console.log(
    "Betterleaks: staged and deleted historical tokens blocked; logs redacted; clean checkout passed.",
  );

  writeFileSync(join(fixture, "whitespace.txt"), "trailing space \n");
  git("add", "whitespace.txt");
  assert.notEqual(
    run("git", ["diff", "--cached", "--check"]).status,
    0,
    "Staged whitespace must fail",
  );
  console.log("Git diff check: staged whitespace rejected.");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
