# Project guidance

## Scope and roadmap

- Read `docs/DEVELOPMENT_PLAN.md` before starting a feature and `docs/REFERENCES.md` for FTO, notation, or learning decisions.
- Current stage: development foundation. The timer, persistence, PWA, case catalog, and learning flows are planned features, not completed features.
- Use Japanese for the initial product interface and user documentation.

## Architecture

- `apps/web` owns browser UI and browser adapters.
- `packages/core` stays independent of DOM, React, storage implementations, and cubing.js workers.
- `packages/scrambler` currently supports browsers and Node. Verify compatibility before using it in React Native.
- Consume workspace TypeScript source through the application bundler. Packages are private.
- Preserve raw milliseconds, penalties, source algorithms, and provider/catalog versions.

## FTO correctness

- Use the existing random-state provider for full solves. Do not substitute random moves as an equivalent generator.
- Stage-specific scrambles must be validated against Nautilus piece constraints. Existing Bencisco modes are not interchangeable.
- Normalize notation, AUF, CIF/EIF orientation, and regrips separately before importing algorithms.
- Keep personal progress separate from the source case catalog. Do not label unverified data as validated.
- Do not represent a practice generator as approved for official WCA competitions.

## Development and checks

- Enter `nix develop` before running project commands. `flake.lock` pins pnpm, Git, Betterleaks, Lefthook, actionlint, ShellCheck, and nixfmt for local development and CI/CD. Do not replace them with independently installed versions.
- Node 24.21.0 is managed by pnpm through root `package.json` `devEngines.runtime`; use pnpm 11.11.0. Runtime and dependencies are pinned in manifests and `pnpm-lock.yaml`.
- Run Node through `pnpm exec node` and update it with `pnpm runtime set node <version>`. Nix supplies pnpm's bootstrap runtime; pnpm manages the application's Node. Keep the runtime declaration as the version source.
- Install Git hooks with `lefthook install`. Pre-commit runs staged Betterleaks scanning, `git diff --cached --check`, `pnpm check`, and local environment file rejection. Use `pnpm test:repo` to verify these rejection rules.
- Main-targeting PRs run CI; main updates run CD with the same checks on the merged commit. Dependency audit covers development and production dependencies and fails on known vulnerabilities or registry errors.
- Keep the HTML robots directive and Workers `X-Robots-Tag` set to noindex. Check root URLs, SPA fallback URLs, and static files when changing hosting.
- Use `pnpm check` for static checks, type checks, unit tests, and production build.
- When changing the generator or bundling, run `pnpm verify:scrambler` and `pnpm test:e2e` against a fresh production build.
- Test timer transitions, statistics boundaries, storage recovery, and constrained states where the behavior can fail. Avoid tests that merely duplicate trivial implementation details.
- Follow Biome formatting. Keep secrets, generated builds, and downloaded caches out of Git.
