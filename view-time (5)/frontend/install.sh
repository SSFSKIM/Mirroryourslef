#!/bin/bash

set -euo pipefail

CACHE_ROOT="${VIEWTIME_NATIVE_CACHE_ROOT:-${TMPDIR:-/tmp}/viewtime-native-cache}"
mkdir -p \
  "${CACHE_ROOT}/tmp" \
  "${CACHE_ROOT}/xdg" \
  "${CACHE_ROOT}/npm" \
  "${CACHE_ROOT}/node-gyp"

export TMPDIR="${TMPDIR:-${CACHE_ROOT}/tmp}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-${CACHE_ROOT}/xdg}"
export npm_config_cache="${npm_config_cache:-${CACHE_ROOT}/npm}"
export npm_config_devdir="${npm_config_devdir:-${CACHE_ROOT}/node-gyp}"
export npm_config_fund=false
export npm_config_audit=false
export npm_config_update_notifier=false

corepack enable
yarn set version stable
yarn install

yarn dlx @yarnpkg/sdks vscode
