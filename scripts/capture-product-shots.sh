#!/usr/bin/env bash
# Marketing-grade product shots of the launch kit — the states worth showing on a
# site, in an ad, or in a post. Separate from scripts/regen-screenshots.sh, which
# keeps the README's inline images in sync.
#
#   bash scripts/capture-product-shots.sh
#
# Output: docs/images/product/*.png at 2x (2880x1800), plus @1x web copies.
# Needs Chrome for Testing or Google Chrome. No npm dependencies.
set -euo pipefail
cd "$(dirname "$0")/.."

DEMO="demo/plotline-launch"
OUT="docs/images/product"
W=1440; H=900
mkdir -p "$OUT"

CHROME=""
for c in "$HOME/.cache/chrome-for-testing/chrome/mac_arm-"*/chrome-mac-arm64/"Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
  [ -x "$c" ] && CHROME="$c" && break
done
[ -n "$CHROME" ] || { echo "✗ no Chrome found"; exit 1; }

node skills/pmm-launch-kit/scripts/build-kit.mjs "$DEMO" >/dev/null
echo "── capturing product shots ──"

TMP="$DEMO/.shot-state.html"
trap 'rm -f "$TMP"' EXIT

# Each shot is the kit with a snippet of setup JS injected at the top of <head>,
# so the flags land before the app boots. Anything later is too late — the intro
# renders first and can't be cleanly undone.
capture() {  # capture <name> <hash> <setup-js>
  python3 - "$DEMO/plotline-launch-kit.html" "$TMP" "$3" <<'PY'
import sys, pathlib
src, dst, extra = sys.argv[1], sys.argv[2], sys.argv[3]
h = pathlib.Path(src).read_text(encoding="utf-8")
boot = ("<script>try{localStorage.setItem('kit_intro_seen','1');"
        "localStorage.setItem('kit_hint_seen','1');"
        "localStorage.setItem('kit_offline_note_seen','1');}catch(e){}"
        "addEventListener('load',function(){setTimeout(function(){"
        "var i=document.querySelector('.intro');if(i){i.classList.remove('open');i.style.display='none';}"
        + extra + "},700);});</script>")
m = "<head>" if "<head>" in h else "<html>"
pathlib.Path(dst).write_text(h.replace(m, m + boot, 1), encoding="utf-8")
PY
  "$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=2 --window-size=$W,$H --virtual-time-budget=8000 \
    --screenshot="$OUT/$1@2x.png" "file://$PWD/$TMP#$2" >/dev/null 2>&1
  sips -z $H $W "$OUT/$1@2x.png" --out "$OUT/$1.png" >/dev/null 2>&1
  printf '  %-26s %s\n' "$1.png" "$(du -h "$OUT/$1@2x.png" | cut -f1) @2x"
}

capture 01-overview            v-overview     ""
capture 02-command-palette     v-overview     "var s=document.querySelector('#scrim'),p=document.querySelector('#palette'),i=document.querySelector('#pInput');if(s)s.classList.add('open');if(p)p.classList.add('open');if(i){i.value='batt';i.dispatchEvent(new Event('input',{bubbles:true}));}"
capture 03-positioning         v-positioning  ""
capture 04-events-desk         v-events       ""
capture 05-market-desk         v-market       ""
capture 06-competitive         v-competitive  ""
capture 07-pricing             v-pricing      ""
capture 08-present-mode        v-positioning  "var b=document.querySelector('#presentBtn');if(b)b.click();"
capture 09-notes-notebook      v-overview     "var n=document.querySelector('[data-open=notes],#notesBtn');if(n){n.click();}else{var d=document.querySelector('#notes');if(d)d.classList.add('open');}"
capture 10-inspector           v-personas     "var r=document.querySelector('#v-personas .row[data-detail]')||document.querySelector('.row[data-detail]');if(r)r.click();"
capture 11-coach-review        v-coach        ""

echo
echo "✓ $(ls "$OUT"/*.png | grep -vc '@2x') shots in $OUT (each with an @2x twin)"
echo "  Retina/print: use the @2x files. Web/social: use the plain ones."
