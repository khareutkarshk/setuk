#!/usr/bin/env bash
# Refreshes lib/voter-list/data from the live site: downloads the landing page, every state's page and
# its all-* lists (and the district pages of states with no assembly list), then parses them.
#
#   scripts/voter-list/export.sh [download dir]
#
# Downloads are kept and reused (delete the directory to start fresh). About 150 requests, one at a time.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
app="$(cd "$here/../.." && pwd)"
dl="${1:-$(mktemp -d)}"
mkdir -p "$dl/raw"
ua="Mozilla/5.0 (setuk revamp data export)"
get() { [ -s "$2" ] || { curl -sfL -A "$ua" -o "$2" "https://setuk.org/voter-list-excel/$1"; sleep 0.3; }; }

get "" "$dl/index.html"
grep -o 'href="/voter-list-excel/[^"]*"' "$dl/index.html" | sed 's/href="//;s/"$//' | sort -u > "$dl/links.txt"
for st in $(grep -oE '^/voter-list-excel/[a-z0-9-]+/$' "$dl/links.txt" | cut -d/ -f3 | sort -u); do
  mkdir -p "$dl/raw/$st"
  get "$st/" "$dl/raw/$st/state.html"
  for kind in all-districts all-assembly-constituencies all-parliamentary-constituencies; do
    grep -qx "/voter-list-excel/$st/$kind/" "$dl/links.txt" && get "$st/$kind/" "$dl/raw/$st/$kind.html"
  done
  # no assembly list: its constituencies are read off the district pages
  if ! grep -qx "/voter-list-excel/$st/all-assembly-constituencies/" "$dl/links.txt"; then
    for di in $(grep -oE "^/voter-list-excel/$st/[a-z0-9-]+/$" "$dl/links.txt" | cut -d/ -f4 | grep -v '^all-' | grep -vE -- '-excel-voter-list$'); do
      get "$st/$di/" "$dl/raw/$st/$di.district.html"
    done
  fi
  echo "fetched $st"
done
python3 -I "$here/parse.py" "$dl" "$app/lib/voter-list/data"
echo "downloads kept in $dl"
