#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.tmp/pids"

stop_pid_file() {
  local name="$1"
  local file="$PID_DIR/$name.pid"

  if [ ! -f "$file" ]; then
    echo "$name is not running"
    return
  fi

  local pid
  pid="$(cat "$file")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "Stopping $name pid $pid"
    kill "$pid"
  else
    echo "$name pid $pid is not active"
  fi

  rm -f "$file"
}

stop_pid_file frontend
