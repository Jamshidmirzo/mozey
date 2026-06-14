#!/bin/bash
#
# copy-photos.sh
#
# Copies photo files from the Flutter app's assets directory
# to the backend's public/uploads directory for static serving.
#
# Usage:
#   bash scripts/copy-photos.sh
#
# This script is idempotent -- safe to run multiple times.
# It will overwrite existing files with the same name.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLUTTER_PROJECT="${FLUTTER_PROJECT:-$(realpath "$SCRIPT_DIR/../../Projects/ozbekiston_museylari")}"
BACKEND_PUBLIC="$SCRIPT_DIR/../apps/api/public"

MUSEUMS_SRC="$FLUTTER_PROJECT/assets/museums"
HISTORICALS_SRC="$FLUTTER_PROJECT/assets/historicals"
MUSEUMS_DST="$BACKEND_PUBLIC/uploads/museums"
HISTORICALS_DST="$BACKEND_PUBLIC/uploads/historicals"

echo "============================================"
echo "  Copy Flutter Photos to Backend Static Dir"
echo "============================================"
echo "Flutter project: $FLUTTER_PROJECT"
echo "Backend public:  $BACKEND_PUBLIC"
echo ""

# Check source directories exist
if [ ! -d "$MUSEUMS_SRC" ]; then
  echo "ERROR: Museums source not found: $MUSEUMS_SRC"
  exit 1
fi

if [ ! -d "$HISTORICALS_SRC" ]; then
  echo "ERROR: Historicals source not found: $HISTORICALS_SRC"
  exit 1
fi

# Create destination directories
mkdir -p "$MUSEUMS_DST"
mkdir -p "$HISTORICALS_DST"

# Copy museums
echo "Copying museum photos..."
MUSEUM_COUNT=$(ls -1 "$MUSEUMS_SRC"/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l | tr -d ' ')
cp -v "$MUSEUMS_SRC"/*.{jpg,jpeg,png,webp} "$MUSEUMS_DST/" 2>/dev/null || true
MUSEUM_COPIED=$(ls -1 "$MUSEUMS_DST"/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l | tr -d ' ')
echo "  Copied: $MUSEUM_COPIED museum photos"

# Copy historicals
echo "Copying historical place photos..."
HIST_COUNT=$(ls -1 "$HISTORICALS_SRC"/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l | tr -d ' ')
cp -v "$HISTORICALS_SRC"/*.{jpg,jpeg,png,webp} "$HISTORICALS_DST/" 2>/dev/null || true
HIST_COPIED=$(ls -1 "$HISTORICALS_DST"/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l | tr -d ' ')
echo "  Copied: $HIST_COPIED historical photos"

echo ""
echo "============================================"
echo "  DONE"
echo "============================================"
echo "Museum photos:     $MUSEUM_COPIED"
echo "Historical photos: $HIST_COPIED"
echo "Total:             $((MUSEUM_COPIED + HIST_COPIED))"
echo ""
echo "Photos are now served at:"
echo "  /static/uploads/museums/<filename>"
echo "  /static/uploads/historicals/<filename>"
