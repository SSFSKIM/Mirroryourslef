#!/bin/bash

# Activate the virtual environment created by install.sh
if [ -f "./venv/bin/activate" ]; then
  source ./venv/bin/activate
elif [ -f ".venv/bin/activate" ]; then
  # Fallback if a .venv was created manually
  source .venv/bin/activate
else
  echo "Virtual environment not found. Run ./install.sh first." >&2
  exit 1
fi

uvicorn main:app --reload
