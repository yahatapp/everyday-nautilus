#!/usr/bin/env bash
set -euo pipefail

tool="${1:?Specify actionlint or gitleaks}"
platform="$(uname -s)-$(uname -m)"

case "$tool" in
  actionlint)
    repository="rhysd/actionlint"
    version="1.7.12"
    case "$platform" in
      Linux-x86_64)
        target="linux_amd64"
        checksum="8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8"
        ;;
      Darwin-arm64)
        target="darwin_arm64"
        checksum="aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f"
        ;;
      *) printf 'Unsupported platform: %s\n' "$platform" >&2; exit 1 ;;
    esac
    ;;
  gitleaks)
    repository="gitleaks/gitleaks"
    version="8.30.1"
    case "$platform" in
      Linux-x86_64)
        target="linux_x64"
        checksum="551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb"
        ;;
      Darwin-arm64)
        target="darwin_arm64"
        checksum="b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5"
        ;;
      *) printf 'Unsupported platform: %s\n' "$platform" >&2; exit 1 ;;
    esac
    ;;
  *) printf 'Unsupported tool: %s\n' "$tool" >&2; exit 1 ;;
esac

archive="$(mktemp)"
trap 'rm -f "$archive"' EXIT
install_directory="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/everyday-nautilus-ci-tools"
url="https://github.com/$repository/releases/download/v$version/${tool}_${version}_${target}.tar.gz"

curl --fail --silent --show-error --location --retry 3 "$url" --output "$archive"
actual_checksum="$(shasum -a 256 "$archive" | cut -d ' ' -f 1)"
if [[ "$actual_checksum" != "$checksum" ]]; then
  printf 'Checksum mismatch for %s %s\n' "$tool" "$version" >&2
  exit 1
fi

mkdir -p "$install_directory"
tar -xzf "$archive" -C "$install_directory" "$tool"
chmod 755 "$install_directory/$tool"
if [[ -n "${GITHUB_PATH:-}" ]]; then
  printf '%s\n' "$install_directory" >> "$GITHUB_PATH"
fi
printf 'Installed %s %s at %s\n' "$tool" "$version" "$install_directory/$tool"
