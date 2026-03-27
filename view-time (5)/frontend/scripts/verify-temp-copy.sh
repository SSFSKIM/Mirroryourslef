#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TMP_ROOT="${TMPDIR:-/tmp}"
VERIFY_DIR="${TEMP_FRONTEND_DIR:-${TMP_ROOT}/viewtime-frontend-verify}"
CACHE_ROOT="${VERIFY_CACHE_ROOT:-${TMP_ROOT}/viewtime-frontend-cache}"
HOME_ROOT="${VERIFY_HOME:-${TMP_ROOT}/viewtime-frontend-home}"
ORIGINAL_HOME="${HOME:-${TMP_ROOT}}"
NATIVE_TMP_ROOT="${CACHE_ROOT}/tmp"
INSTALL_MODE="${VERIFY_INSTALL_MODE:-${YARN_INSTALL_MODE:-skip-build}}"
YARN_GLOBAL_FOLDER_OVERRIDE="${VERIFY_YARN_GLOBAL_FOLDER:-${ORIGINAL_HOME}/.yarn/berry}"
YARN_CACHE_FOLDER_OVERRIDE="${VERIFY_YARN_CACHE_FOLDER:-${YARN_GLOBAL_FOLDER_OVERRIDE}/cache}"
REBUILD_PACKAGES_INPUT="${VERIFY_REBUILD_PACKAGES:-esbuild}"

if [[ -z "${NODE_BIN_DIR:-}" && -d "${TMP_ROOT}/codex-node/bin" ]]; then
  NODE_BIN_DIR="${TMP_ROOT}/codex-node/bin"
fi

if [[ -n "${NODE_BIN_DIR:-}" ]]; then
  export PATH="${NODE_BIN_DIR}:${PATH}"
fi

unset YARN_INSTALL_MODE

if ! command -v node >/dev/null 2>&1; then
  echo "node not found. Install Node or set NODE_BIN_DIR to a Node bin directory."
  exit 1
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "corepack not found. Install Node with corepack support or set NODE_BIN_DIR appropriately."
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required to prepare the temp verification copy."
  exit 1
fi

mkdir -p "${VERIFY_DIR}" \
  "${CACHE_ROOT}/xdg" \
  "${CACHE_ROOT}/npm" \
  "${CACHE_ROOT}/node-gyp" \
  "${NATIVE_TMP_ROOT}" \
  "${HOME_ROOT}"

rsync -a \
  --delete \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'node_modules' \
  "${FRONTEND_DIR}/" "${VERIFY_DIR}/"

export HOME="${HOME_ROOT}"
export TMPDIR="${NATIVE_TMP_ROOT}"
export XDG_CACHE_HOME="${CACHE_ROOT}/xdg"
export COREPACK_HOME="${COREPACK_HOME:-${ORIGINAL_HOME}/.cache/node/corepack}"
export YARN_GLOBAL_FOLDER="${YARN_GLOBAL_FOLDER_OVERRIDE}"
export YARN_CACHE_FOLDER="${YARN_CACHE_FOLDER_OVERRIDE}"
export YARN_ENABLE_GLOBAL_CACHE=1
export npm_config_cache="${CACHE_ROOT}/npm"
export npm_config_devdir="${CACHE_ROOT}/node-gyp"
export npm_config_fund=false
export npm_config_audit=false
export npm_config_update_notifier=false

mkdir -p "${COREPACK_HOME}" "${YARN_GLOBAL_FOLDER}" "${YARN_CACHE_FOLDER}"

cd "${VERIFY_DIR}"

# Running this script via `yarn verify:temp` injects the caller's PnP loader into
# NODE_OPTIONS. Clear it so the temp copy can resolve packages against its own
# .pnp.cjs without colliding with the workspace that launched the script.
unset NODE_OPTIONS

case "${INSTALL_MODE}" in
  selective-build)
    YARN_ENABLE_SCRIPTS=0 corepack yarn install --immutable

    if [[ -n "${REBUILD_PACKAGES_INPUT}" ]]; then
      read -r -a rebuild_packages <<< "${REBUILD_PACKAGES_INPUT}"
      YARN_ENABLE_SCRIPTS=1 corepack yarn rebuild "${rebuild_packages[@]}"
    fi
    ;;
  skip-build)
    YARN_ENABLE_SCRIPTS=0 corepack yarn install --immutable
    ;;
  full)
    corepack yarn install --immutable
    ;;
  *)
    echo "Unsupported YARN_INSTALL_MODE: ${INSTALL_MODE}" >&2
    echo "Expected one of: selective-build, skip-build, full" >&2
    exit 1
    ;;
esac

corepack yarn build
corepack yarn lint
