#!/usr/bin/env bash
set -euo pipefail

# Ensure dev server is cleaned up on exit
trap 'if [[ -f .devserver.pid ]]; then kill $(cat .devserver.pid) 2>/dev/null || true; rm -f .devserver.pid; fi' EXIT

echo "Killing existing dev servers..."
pgrep -af "npm run dev" || true
pkill -f "npm run dev" || true
pkill -f vite || true

echo "Building project..."
npm run build

echo "Starting dev server in background..."
npm run dev &> .devserver.log &
DEV_PID=$!
echo $DEV_PID > .devserver.pid

echo "Waiting for dev server to respond on http://localhost:5173..."
npx wait-on http://localhost:5173 --timeout 60000

echo "Running unit tests..."
npm run test -- --run

echo "Running Playwright tests..."
npx playwright test --config=playwright.config.ts

echo "All tests passed — publishing to Firebase..."
firebase deploy --only hosting

echo "Stopping dev server..."
kill "$DEV_PID" || true
rm -f .devserver.pid

echo "Done."