#!/usr/bin/env bash
set -euo pipefail

# Inspect names from the Git index, including files added with git add --force.
# A deletion is allowed so an accidentally tracked local file can be removed.
file_list=$(mktemp)
trap 'rm -f "$file_list"' EXIT
case "${1:---staged}" in
  --staged) git diff --cached --name-only --diff-filter=ACMRT -z > "$file_list" ;;
  --tracked) git ls-files -z > "$file_list" ;;
  *) printf 'Usage: %s [--staged|--tracked]\n' "$0" >&2; exit 2 ;;
esac

rejected=0
while IFS= read -r -d '' file; do
  case "/$file/" in
    */.direnv/*|*/.wrangler/*|*/.pnpm-store/*|*/.pnpm-cache/*|*/.npm-cache/*)
      printf 'Local environment directory is not allowed in Git: %q\n' "$file" >&2
      rejected=1
      continue
      ;;
  esac
  name=${file##*/}
  case "$name" in
    .env.example|.dev.vars.example) continue ;;
    .env|.env.*|.dev.vars|.dev.vars.*|.envrc.local|.npmrc|.pnpmrc|.netrc|.pypirc|lefthook-local.*)
      printf 'Local environment file is not allowed in Git: %q\n' "$file" >&2
      rejected=1
      continue
      ;;
  esac
done < "$file_list"
exit "$rejected"
