#!/usr/bin/env bash
# Empaqueta el tema en un .zip listo para subir a Shopify
# (Tienda online → Temas → Añadir tema → Subir archivo zip).
#
# Uso: bash scripts/build-zip.sh            → dist/dermarel-pdp-v<versión>.zip
#      SKIP_CHECKS=1 bash scripts/build-zip.sh  (sin validar)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEME="$ROOT/theme"
DIST="$ROOT/dist"
VERSION="$(python3 -c "import json;print(next(g for g in json.load(open('$THEME/config/settings_schema.json')) if g['name']=='theme_info')['theme_version'])")"
OUT="$DIST/dermarel-pdp-v$VERSION.zip"

if [[ "${SKIP_CHECKS:-0}" != "1" ]]; then
  if [[ -d "$ROOT/tools/node_modules" ]]; then
    echo "→ Validando el tema…"
    node "$ROOT/tools/validate.mjs" "$THEME"
    node "$ROOT/tools/theme-check.mjs" "$THEME" | tail -1
  else
    echo "⚠ Validación omitida (ejecuta 'npm install' en tools/ para activarla)."
  fi
fi

mkdir -p "$DIST"
rm -f "$OUT"
# Shopify exige las carpetas del tema en la raíz del zip (layout/, sections/, …).
python3 - "$THEME" "$OUT" <<'PY'
import os, sys, zipfile
theme, out = sys.argv[1], sys.argv[2]
folders = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for folder in folders:
        for base, _, files in os.walk(os.path.join(theme, folder)):
            for name in sorted(files):
                if name.startswith('.'):
                    continue
                full = os.path.join(base, name)
                z.write(full, os.path.relpath(full, theme))
PY
echo "✓ Tema empaquetado: ${OUT#$ROOT/} ($(du -h "$OUT" | cut -f1))"
