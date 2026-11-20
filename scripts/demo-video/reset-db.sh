#!/bin/bash
# THROWAWAY local DB only (127.0.0.1:55432/lpdemo)
set -e
"/c/Program Files/PostgreSQL/17/bin/psql" -q -p 55432 -U postgres -d lpdemo -c "drop schema if exists leaguepour_lp cascade"
cd "${REPO_ROOT:-.}"
npx prisma db push 2>&1 | grep -i -E "in sync|error" || true
