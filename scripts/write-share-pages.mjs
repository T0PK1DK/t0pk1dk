#!/usr/bin/env node
/**
 * Writes static /p/<id>/index.html share cards and refreshes sitemap.xml
 * from data/projects.json. Not a required build step — run when cards change.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KIND = { game: "Game", site: "Site", tool: "Tool" };
const V = "19";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const attr = (s) => esc(s).replace(/'/g, "&#39;");

function pageHtml(p) {
  const kind = KIND[p.category] || "";
  const url = `https://t0pk1dk.com/p/${p.id}/`;
  const img = `https://t0pk1dk.com/assets/previews/${p.id}.webp`;
  const title = `${p.name} · King's Toy Box`;
  const desc = p.description;
  const bust = encodeURIComponent(p.lastUpdated);
  const alt = p.liveUrl ? `Screenshot of ${p.name}` : `Coming soon art for ${p.name}`;
  const openLabel = p.liveUrl
    ? p.liveUrl.includes("github.com")
      ? "View on GitHub ↗"
      : `Open ${p.name} ↗`
    : "";
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.name,
    description: desc,
    url,
    image: img,
    isPartOf: { "@type": "WebSite", name: "King's Toy Box", url: "https://t0pk1dk.com/" },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}">
  <meta name="theme-color" content="#fbf3ea" data-theme-color>
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${attr(p.name)}">
  <meta property="og:description" content="${attr(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="720">
  <meta property="og:image:height" content="450">
  <meta property="og:image:alt" content="${attr(alt)}">
  <meta property="og:site_name" content="King's Toy Box">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(p.name)}">
  <meta name="twitter:description" content="${attr(desc)}">
  <meta name="twitter:image" content="${img}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/css/toybox.css?v=${V}">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <script>
    try {
      var t = localStorage.getItem("toybox-theme");
      if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
      var dark = t === "dark" || (!t && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
      if (dark) document.documentElement.setAttribute("data-dark", "");
      var m = document.querySelector("[data-theme-color]");
      if (m) m.setAttribute("content", dark ? "#17110e" : "#fbf3ea");
    } catch (e) {}
  </script>
</head>
<body class="share-page">
  <a class="skip" href="#share-title">Skip to project</a>
  <header class="top">
    <a class="brand" href="/"><span class="brand-bear" aria-hidden="true">🧸</span> King's Toy Box</a>
    <nav class="top-nav" aria-label="Primary">
      <a href="/">Shelf</a>
      <a href="/work/">Work</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
  </header>
  <main>
    <article class="share-card">
      <div class="sheet-shot">
        <picture>
          <source type="image/avif" srcset="/assets/previews/${esc(p.id)}-360.avif?v=${bust} 360w, /assets/previews/${esc(p.id)}.avif?v=${bust} 720w" sizes="(max-width:640px) 100vw, 560px">
          <img src="/assets/previews/${esc(p.id)}.webp?v=${bust}" srcset="/assets/previews/${esc(p.id)}-360.webp?v=${bust} 360w, /assets/previews/${esc(p.id)}.webp?v=${bust} 720w" sizes="(max-width:640px) 100vw, 560px" width="720" height="450" alt="${attr(alt)}" decoding="async">
        </picture>
      </div>
      <div class="sheet-body">
        <div class="sheet-meta"><span class="badge">${esc(p.status)}</span><span class="kind">${esc(kind)}</span></div>
        <h1 id="share-title">${esc(p.name)}</h1>
        <p>${esc(desc)}</p>
        <p class="muted small">${esc(p.updateNote)}</p>
        <div class="share-actions">
          ${p.liveUrl ? `<a class="btn" href="${attr(p.liveUrl)}" target="_blank" rel="noopener noreferrer">${esc(openLabel)}</a>` : ""}
          <a class="btn btn-ghost" href="/?p=${encodeURIComponent(p.id)}">See it on the shelf</a>
        </div>
      </div>
    </article>
  </main>
  <footer class="foot">
    <span>t0pk1dk.com · built by T0PK1DK</span>
    <nav class="foot-links" aria-label="Footer">
      <a href="/">Shelf</a>
      <a href="/work/">Work</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
  </footer>
</body>
</html>
`;
}

const doc = JSON.parse(readFileSync(join(ROOT, "data", "projects.json"), "utf8"));
const items = [];
for (const p of doc.projects) {
  const dir = join(ROOT, "p", p.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), pageHtml(p));
  items.push(`  <url><loc>https://t0pk1dk.com/p/${p.id}/</loc></url>`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://t0pk1dk.com/</loc></url>
  <url><loc>https://t0pk1dk.com/work/</loc></url>
  <url><loc>https://t0pk1dk.com/about/</loc></url>
  <url><loc>https://t0pk1dk.com/contact/</loc></url>
${items.join("\n")}
</urlset>
`;
writeFileSync(join(ROOT, "sitemap.xml"), sitemap);
console.log(`write-share-pages: ${doc.projects.length} share pages`);
