import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const url = "https://www.usertour.io/";
const edgePath =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = {
  research: path.join(root, "docs", "research", "usertour.io"),
  components: path.join(root, "docs", "research", "components"),
  references: path.join(root, "docs", "design-references", "usertour.io"),
  images: path.join(root, "public", "images", "usertour"),
  seo: path.join(root, "public", "seo", "usertour"),
};

for (const dir of Object.values(out)) {
  await mkdir(dir, { recursive: true });
}

const browser = spawn(edgePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--remote-debugging-port=9229",
  "--user-data-dir=" + path.join(root, ".tmp-edge-usertour"),
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(url) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {}
    await sleep(250);
  }
  throw new Error(`Could not connect to ${url}`);
}

const tabs = await json("http://127.0.0.1:9229/json");
const tab = tabs.find((item) => item.type === "page") || tabs[0];
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
});

await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

function send(method, params = {}) {
  const callId = ++id;
  ws.send(JSON.stringify({ id: callId, method, params }));
  return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result.value;
}

async function screenshot(name, width, height, fullPage = true) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await sleep(800);
  const metrics = await send("Page.getLayoutMetrics");
  const clip = fullPage
    ? {
        x: 0,
        y: 0,
        width: Math.ceil(metrics.cssContentSize.width),
        height: Math.ceil(metrics.cssContentSize.height),
        scale: 1,
      }
    : undefined;
  const image = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: fullPage,
    clip,
  });
  await writeFile(path.join(out.references, name), Buffer.from(image.data, "base64"));
}

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url });
await sleep(4000);

await screenshot("desktop-full.png", 1440, 1400, true);
await screenshot("mobile-full.png", 390, 1000, true);

const extraction = await evaluate(`(async () => {
  const pick = (el) => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      className: String(el.className || ""),
      text: (el.innerText || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 900),
      styles: {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
        background: cs.background,
        padding: cs.padding,
        margin: cs.margin,
        display: cs.display,
        gap: cs.gap,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        position: cs.position,
        zIndex: cs.zIndex,
      },
    };
  };
  const sections = [...document.querySelectorAll("header, main > section, footer")].map((el, index) => ({
    index,
    ...pick(el),
    headings: [...el.querySelectorAll("h1,h2,h3")].map(h => h.textContent.trim()),
    links: [...el.querySelectorAll("a")].map(a => ({ text: a.textContent.trim(), href: a.href })).filter(a => a.text || a.href),
    images: [...el.querySelectorAll("img")].map(img => ({ src: img.currentSrc || img.src, alt: img.alt, width: img.naturalWidth, height: img.naturalHeight })),
  }));
  const assets = {
    images: [...document.querySelectorAll("img")].map(img => ({ src: img.currentSrc || img.src, alt: img.alt, width: img.naturalWidth, height: img.naturalHeight })),
    backgroundImages: [...document.querySelectorAll("*")].map(el => getComputedStyle(el).backgroundImage).filter(bg => bg && bg !== "none"),
    favicons: [...document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')].map(l => ({ href: l.href, rel: l.rel, sizes: l.sizes?.toString() || "" })),
    fonts: [...new Set([...document.querySelectorAll("body, h1, h2, h3, p, a, button, span")].map(el => getComputedStyle(el).fontFamily))],
    svgCount: document.querySelectorAll("svg").length,
  };
  return { title: document.title, description: document.querySelector('meta[name="description"]')?.content || "", sections, assets };
})()`);

await writeFile(
  path.join(out.research, "extraction.json"),
  JSON.stringify(extraction, null, 2),
);

async function downloadAsset(assetUrl, dir, index) {
  if (!assetUrl || assetUrl.startsWith("data:")) return null;
  try {
    const clean = new URL(assetUrl);
    const ext = path.extname(clean.pathname).split("?")[0] || ".bin";
    const base = path.basename(clean.pathname, ext).replace(/[^a-z0-9-]/gi, "-").slice(0, 50) || `asset-${index}`;
    const filename = `${String(index).padStart(2, "0")}-${base}${ext}`;
    const res = await fetch(clean.href);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    return { source: clean.href, file: filename, bytes: buffer.length };
  } catch {
    return null;
  }
}

const imageUrls = [
  ...new Set([
    ...extraction.assets.images.map((img) => img.src),
    ...extraction.assets.backgroundImages.flatMap((bg) =>
      [...bg.matchAll(/url\\(["']?([^"')]+)["']?\\)/g)].map((m) => m[1]),
    ),
  ]),
];
const downloads = [];
for (let i = 0; i < imageUrls.length; i += 1) {
  const item = await downloadAsset(imageUrls[i], out.images, i + 1);
  if (item) downloads.push(item);
}
const seoDownloads = [];
for (let i = 0; i < extraction.assets.favicons.length; i += 1) {
  const item = await downloadAsset(extraction.assets.favicons[i].href, out.seo, i + 1);
  if (item) seoDownloads.push(item);
}
await writeFile(
  path.join(out.research, "downloaded-assets.json"),
  JSON.stringify({ images: downloads, seo: seoDownloads }, null, 2),
);

ws.close();
browser.kill();
console.log(`Captured ${extraction.sections.length} sections and downloaded ${downloads.length} images.`);
