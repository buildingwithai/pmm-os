#!/usr/bin/env bash
# Regenerate every README screenshot and the social preview from the CURRENT build.
#
# Why this exists: the images in docs/images/ were captured 2026-07-08 and drifted.
# By 2026-07-29 the kit had four more research desks in the sidebar (Market, Channels,
# KOL, GTM) that no screenshot showed, and the social preview was built from one of
# those stale shots. Anyone restyling the kit would have silently made it worse.
#
# Run this after ANY change to .kit-style.css, .kit-app.js, or the demo content:
#     bash scripts/regen-screenshots.sh
#
# Needs Chrome for Testing or Google Chrome. No npm dependencies.
set -euo pipefail
cd "$(dirname "$0")/.."

DEMO="demo/plotline-launch"
OUT="docs/images"
W=1440; H=900

CHROME=""
for c in "$HOME/.cache/chrome-for-testing/chrome/mac_arm-"*/chrome-mac-arm64/"Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
  [ -x "$c" ] && CHROME="$c" && break
done
[ -n "$CHROME" ] || { echo "✗ no Chrome found — install Chrome or Chrome for Testing"; exit 1; }

echo "── rebuilding the demo kit ──"
node skills/pmm-launch-kit/scripts/build-kit.mjs "$DEMO" >/dev/null
echo "  ✓ $DEMO/plotline-launch-kit.html"

# The kit shows a full-screen intro and a first-run tip on a fresh profile, and
# headless Chrome is always a fresh profile. This same-origin shim sets both
# "seen" flags, then forwards to the real page carrying the hash through.
SHIM="$DEMO/.shot.html"
cat > "$SHIM" <<'EOF'
<!doctype html><meta charset="utf-8"><script>
  try {
    localStorage.setItem('kit_intro_seen', '1');
    localStorage.setItem('kit_hint_seen', '1');
    localStorage.setItem('kit_offline_note_seen', '1');
  } catch (e) {}
  location.replace('./plotline-launch-kit.html' + location.hash);
</script>
EOF
trap 'rm -f "$SHIM"' EXIT

shot() {  # shot <hash> <output-name>
  "$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --window-size=$W,$H --virtual-time-budget=6000 \
    --screenshot="$OUT/$2.png" "file://$PWD/$SHIM#$1" >/dev/null 2>&1
  printf '  ✓ %-22s %s\n' "$2.png" "$(du -h "$OUT/$2.png" | cut -f1)"
}

echo "── capturing views ──"
shot v-overview     overview
shot v-positioning  positioning
shot v-competitive  competitive
shot v-pricing      pricing
shot v-events       events-desk
shot v-market       market-desk

echo "── command palette ──"
# Chrome CLI can't run script after load, so screenshot a throwaway copy of the
# kit with an opener injected. Same output, no automation dependency.
PAL="$DEMO/.palette-shot.html"
python3 - "$DEMO/plotline-launch-kit.html" "$PAL" <<'PY'
import sys, pathlib
src, dst = sys.argv[1], sys.argv[2]
h = pathlib.Path(src).read_text(encoding="utf-8")
# The seen-flags must be set BEFORE the app boots, or it renders the intro and
# nothing later can un-render it cleanly — so this goes at the top of <head>,
# not before </body>.
inject = ("<script>try{localStorage.setItem('kit_intro_seen','1');"
          "localStorage.setItem('kit_hint_seen','1');"
          "localStorage.setItem('kit_offline_note_seen','1');}catch(e){}"
          "addEventListener('load',function(){setTimeout(function(){"
          "var intro=document.querySelector('.intro');if(intro){intro.classList.remove('open');"
          "intro.style.display='none';}"
          "var s=document.querySelector('#scrim'),p=document.querySelector('#palette'),"
          "i=document.querySelector('#pInput');"
          "if(s)s.classList.add('open');if(p)p.classList.add('open');"
          "if(i){i.value='pric';i.dispatchEvent(new Event('input',{bubbles:true}));}"
          "},600);});</script>")
marker = "<head>" if "<head>" in h else "<html>"
out = h.replace(marker, marker + inject, 1) if marker in h else inject + h
pathlib.Path(dst).write_text(out, encoding="utf-8")
PY
"$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --window-size=$W,$H --virtual-time-budget=6000 \
  --screenshot="$OUT/command-palette.png" "file://$PWD/$PAL#v-overview" >/dev/null 2>&1
rm -f "$PAL"
printf '  ✓ %-22s %s\n' "command-palette.png" "$(du -h "$OUT/command-palette.png" | cut -f1)"

if command -v ffmpeg >/dev/null 2>&1; then
  echo "── click-through gif ──"
  T=$(mktemp -d); i=0
  for v in overview positioning competitive pricing events-desk market-desk; do
    cp "$OUT/$v.png" "$(printf '%s/f%02d.png' "$T" "$i")"; i=$((i+1))
  done
  # 1.6s a frame, halved width — readable in a README without a 10MB payload
  ffmpeg -y -framerate 0.625 -i "$T/f%02d.png" \
    -vf "scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer" \
    -loop 0 "$OUT/launch-kit-demo.gif" >/dev/null 2>&1
  rm -rf "$T"
  printf '  ✓ %-22s %s\n' "launch-kit-demo.gif" "$(du -h "$OUT/launch-kit-demo.gif" | cut -f1)"
else
  echo "  ! ffmpeg not found — launch-kit-demo.gif left as-is"
fi

echo "── social preview (reuses the fresh events-desk shot) ──"
"$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --force-device-scale-factor=2 --window-size=1280,640 --virtual-time-budget=4000 \
  --screenshot="$OUT/.social@2x.png" "file://$PWD/$OUT/social-preview.source.html" >/dev/null 2>&1
sips -z 640 1280 "$OUT/.social@2x.png" --out "$OUT/social-preview.png" >/dev/null 2>&1
rm -f "$OUT/.social@2x.png"
printf '  ✓ %-22s %s\n' "social-preview.png" "$(du -h "$OUT/social-preview.png" | cut -f1)"

echo
echo "✓ done — review with: git diff --stat docs/images/"
