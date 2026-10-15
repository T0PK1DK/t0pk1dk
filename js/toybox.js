(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const KIND = { game: "Game", site: "Site", tool: "Tool" };
  const BADGE = { "Live": "b-live", "In progress": "b-prog", "Android app": "b-droid", "In development": "b-dev", "Private": "b-lock" };
  const root = document.documentElement;

  // Theme
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
  const syncTheme = () => {
    root.toggleAttribute("data-dark", isDark());
    const b = $("[data-theme-toggle]");
    if (b) b.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  };
  syncTheme();
  mq.addEventListener?.("change", syncTheme);
  $("[data-theme-toggle]")?.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("toybox-theme", root.dataset.theme); } catch {}
    syncTheme();
  });

  const initials = (n) => n.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const fmtDate = (d) => { const t = new Date(`${d}T12:00:00`); return isNaN(t) ? "" : t.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(t.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) }); };
  const isFresh = (d) => { const t = new Date(`${d}T12:00:00`); return !isNaN(t) && Date.now() - t < 7 * 864e5; };
  const host = (u) => { try { return new URL(u).host + (new URL(u).pathname.length > 1 ? new URL(u).pathname : ""); } catch { return ""; } };

  // Sheet
  const sheet = $("[data-sheet]");
  const openSheet = (p) => {
    const img = $("[data-sheet-img]");
    img.src = p.image || "/assets/previews/fallback.svg";
    img.alt = p.image ? `Screenshot of ${p.name}` : "";
    img.onerror = () => { img.onerror = null; img.src = "/assets/previews/fallback.svg"; };
    const badge = $("[data-sheet-badge]");
    badge.textContent = p.status; badge.className = `badge ${BADGE[p.status] || ""}`;
    $("[data-sheet-kind]").textContent = p.kind || "";
    $("[data-sheet-title]").textContent = p.name;
    $("[data-sheet-desc]").textContent = p.description || "";
    $("[data-sheet-note]").textContent = [p.note, p.lastUpdated && `Updated ${fmtDate(p.lastUpdated)}`].filter(Boolean).join(" · ");
    const open = $("[data-sheet-open]"), nolink = $("[data-sheet-nolink]");
    if (p.url) {
      open.hidden = false; open.href = p.url;
      open.textContent = p.url.includes("github.com") ? "View on GitHub ↗" : `Open ${p.name} ↗`;
      $("[data-sheet-host]").textContent = p.private ? "" : host(p.url);
      nolink.hidden = true;
    } else {
      open.hidden = true; open.removeAttribute("href");
      $("[data-sheet-host]").textContent = "";
      nolink.hidden = false;
      nolink.textContent = p.status === "Android app" ? "Android app. There's no web version to open yet." : "Still being built. A link shows up here as soon as there's something to play.";
    }
    sheet.showModal();
    open.hidden ? $("[data-close]").focus() : open.focus();
  };
  $("[data-close]")?.addEventListener("click", () => sheet.close());
  sheet?.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

  const cardHtml = (p, i) => `
    <button class="card" type="button" style="--i:${i}" data-idx="${i}" aria-label="${esc(p.name)}, ${esc(p.status)}. Open preview">
      <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" width="720" height="450">` : `<div class="thumb-empty thumb">${esc(initials(p.name))}</div>`}
        <span class="badge ${BADGE[p.status] || ""}">${esc(p.status)}</span></div>
      <div class="card-body"><h3>${esc(p.name)}</h3>${p.lastUpdated ? `<span class="upd${isFresh(p.lastUpdated) ? " fresh" : ""}">Updated ${esc(fmtDate(p.lastUpdated))}</span>` : ""}<p>${esc(p.description)}</p></div>
    </button>`;

  const renderInto = (el, list) => {
    el.innerHTML = list.map(cardHtml).join("");
    el.onclick = (e) => { const c = e.target.closest(".card"); if (c) openSheet(list[+c.dataset.idx]); };
  };
  window.ToyBox = { renderInto, openSheet };

  const grid = $("[data-grid]");
  let all = [];
  const byRecent = (a, b) => String(b.lastUpdated).localeCompare(String(a.lastUpdated));
  const show = (f) => renderInto(grid, f === "all" ? all : f === "recent" ? [...all].sort(byRecent) : all.filter((p) => p.category === f));
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    show(b.dataset.filter);
  }));
  $("[data-jump-lockbox]")?.addEventListener("click", () => { $("#lockbox").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $("#lock-pass")?.focus({ preventScroll: true }), 400); });

  fetch("/data/projects.json", { cache: "no-cache" }).then((r) => r.json()).then((doc) => {
    all = doc.projects.map((p) => ({ ...p, url: p.liveUrl, kind: KIND[p.category], note: p.updateNote, image: p.liveUrl ? `/assets/previews/${p.id}.webp` : null }));
    const live = all.filter((p) => p.status === "Live").length, prog = all.filter((p) => p.status === "In progress" || p.status === "Android app").length;
    $("[data-stats]").innerHTML = `<b>${all.length}</b> projects · <b>${live}</b> live · <b>${prog}</b> in progress`;
    show("all");
  }).catch(() => { grid.innerHTML = `<p class="muted">Couldn't load projects. Refresh to try again.</p>`; });
})();
