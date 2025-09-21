#!/bin/bash

set -e

uv venv
# uv creates a ".venv" folder by default
if [ -f ./.venv/bin/activate ]; then
  source ./.venv/bin/activate
else
  # Fallback if a different venv name was used
  source ./venv/bin/activate 2>/dev/null || true
fi

uv pip install -r requirements.txt
