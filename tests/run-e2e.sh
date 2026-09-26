#!/usr/bin/env bash
# Boots a sandboxed production server (fresh DB) and runs the E2E journey.
# Usage: bash tests/run-e2e.sh [--no-build]
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" != "--no-build" ]; then
  echo "== building =="
  npm run build >/dev/null
fi

echo "== booting sandbox server on :3100 =="
lsof -ti:3100 | xargs kill 2>/dev/null || true
sleep 1
rm -rf /tmp/wf-e2e
mkdir -p /tmp/wf-e2e
DATABASE_PATH=/tmp/wf-e2e/wordforge.db HOSTNAME=127.0.0.1 PORT=3100 \
  node .next/standalone/server.js > /tmp/wf-e2e/server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 3

echo "== mapping server-action ids =="
node <<'EOF'
const fs = require('fs');
const dir = '.next/static/chunks';
const map = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
  const t = fs.readFileSync(dir + '/' + f, 'utf8');
  const re = /createServerReference\)\("([0-9a-f]+)",\w+\.callServer,void 0,\w+\.findSourceMapURL,"(\w+)"\)/g;
  let m; while ((m = re.exec(t))) map[m[2]] = m[1];
}
if (Object.keys(map).length === 0) { console.error('no actions mapped'); process.exit(1); }
fs.writeFileSync('/tmp/wf-e2e/actions.json', JSON.stringify(map));
console.log('mapped', Object.keys(map).length, 'actions');
EOF

echo "== running journey =="
node tests/e2e-journey.mjs
