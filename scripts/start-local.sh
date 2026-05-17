#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.tmp/pids"
LOG_DIR="$ROOT_DIR/.tmp/logs"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

mkdir -p "$PID_DIR" "$LOG_DIR"

if [ -f "$PID_DIR/frontend.pid" ] && kill -0 "$(cat "$PID_DIR/frontend.pid")" 2>/dev/null; then
  echo "Frontend already running on pid $(cat "$PID_DIR/frontend.pid")"
else
  echo "Starting frontend on http://127.0.0.1:$FRONTEND_PORT"
  nohup bash -lc "cd '$ROOT_DIR/frontend' && VITE_USE_MOCK_API=true deno task dev --host 127.0.0.1 --port '$FRONTEND_PORT'" >"$LOG_DIR/frontend.log" 2>&1 &
  echo $! > "$PID_DIR/frontend.pid"
fi

echo "Logs: $LOG_DIR/frontend.log"
echo "URL: http://127.0.0.1:$FRONTEND_PORT"
