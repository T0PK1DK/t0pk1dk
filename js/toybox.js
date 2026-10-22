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
    const dark = isDark();
    root.toggleAttribute("data-dark", dark);
    const b = $("[data-theme-toggle]");
    if (b) {
      b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      b.setAttribute("aria-pressed", String(dark));
    }
    const meta = $("[data-theme-color]");
    if (meta) meta.setAttribute("content", dark ? "#17110e" : "#fbf3ea");
  };
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const withTransition = (fn) => {
    if (!reduceMotion() && document.startViewTransition) return document.startViewTransition(fn);
    fn();
  };
  syncTheme();
  mq.addEventListener?.("change", syncTheme);
  $("[data-theme-toggle]")?.addEventListener("click", () => {
    const flip = () => {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem("toybox-theme", root.dataset.theme); } catch {}
      syncTheme();
    };
    withTransition(flip);
  });

  const initials = (n) => n.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const fmtDate = (d) => { const t = new Date(`${d}T12:00:00`); return isNaN(t) ? "" : t.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(t.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) }); };
  const isFresh = (d) => { const t = new Date(`${d}T12:00:00`); return !isNaN(t) && Date.now() - t < 7 * 864e5; };
  const host = (u) => { try { return new URL(u).host + (new URL(u).pathname.length > 1 ? new URL(u).pathname : ""); } catch { return ""; } };

  // Sheet
  const sheet = $("[data-sheet]");
  let lastCard = null;
  const FALLBACK = "/assets/previews/fallback.svg";
  const openSheet = (p, opener) => {
    lastCard = opener || document.activeElement;
    const img = $("[data-sheet-img]");
    const avif = $("[data-sheet-avif]");
    img.src = p.image || FALLBACK;
    img.alt = p.url ? `Screenshot of ${p.name}` : `Coming soon art for ${p.name}`;
    if (avif) {
      if (p.avif) avif.srcset = p.avif;
      else avif.removeAttribute("srcset");
    }
    img.onerror = () => { img.onerror = null; if (avif) avif.removeAttribute("srcset"); img.src = FALLBACK; };
    const badge = $("[data-sheet-badge]");
    badge.textContent = p.status; badge.className = `badge ${BADGE[p.status] || ""}`;
    $("[data-sheet-kind]").textContent = p.kind || "";
    $("[data-sheet-title]").textContent = p.name;
    $("[data-sheet-desc]").textContent = p.description || "";
    $("[data-sheet-note]").textContent = p.url
      ? [p.note, p.lastUpdated && `Updated ${fmtDate(p.lastUpdated)}`].filter(Boolean).join(" · ")
      : (p.lastUpdated ? `Updated ${fmtDate(p.lastUpdated)}` : "");
    const soon = $("[data-sheet-soon]");
    if (soon) soon.hidden = Boolean(p.url);
    const open = $("[data-sheet-open]"), nolink = $("[data-sheet-nolink]");
    const nolinkCopy = $("[data-sheet-nolink-copy]");
    if (p.url) {
      open.hidden = false; open.href = p.url;
      open.textContent = p.url.includes("github.com") ? "View on GitHub ↗" : `Open ${p.name} ↗`;
      $("[data-sheet-host]").textContent = p.private ? "" : host(p.url);
      nolink.hidden = true;
    } else {
      open.hidden = true; open.removeAttribute("href");
      $("[data-sheet-host]").textContent = "";
      nolink.hidden = false;
      if (nolinkCopy) {
        nolinkCopy.textContent = p.status === "Android app"
          ? "Android app. There's no web version to open yet."
          : "Still being built. A link shows up here as soon as there's something to open.";
      }
    }
    sheet.showModal();
    open.hidden ? $("[data-close]").focus() : open.focus();
  };
  $("[data-close]")?.addEventListener("click", () => sheet.close());
  sheet?.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  sheet?.addEventListener("close", () => { lastCard?.focus?.({ preventScroll: true }); lastCard = null; });

  const tintOf = (id) => [...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % 4;
  const pictureHtml = (p, { eager = false, high = false, sizes, width = 720, height = 450 } = {}) => {
    if (!p.image) {
      return `<div class="thumb-empty thumb"><span class="thumb-mark">${esc(initials(p.name))}</span><span class="thumb-soon">Soon</span></div>`;
    }
    const load = eager ? `loading="eager"${high ? ` fetchpriority="high"` : ""}` : `loading="lazy"`;
    const src = `<img src="${esc(p.image)}" alt="" ${load} decoding="async" width="${width}" height="${height}" sizes="${esc(sizes)}">`;
    return p.avif
      ? `<picture><source type="image/avif" srcset="${esc(p.avif)}">${src}</picture>`
      : src;
  };
  const cardHtml = (p, i) => {
    const eager = i < 2;
    const img = pictureHtml(p, { eager, high: i === 0, sizes: "(max-width:400px) 100vw,(max-width:720px) 50vw,280px" });
    const vt = `card-${String(p.id || i).replace(/[^a-z0-9-]/gi, "")}`;
    return `
    <button class="card" type="button" data-tint="${tintOf(p.id || i)}" style="--i:${Math.min(i, 8)};--vt:${vt}" data-idx="${i}">
      <div class="thumb">${img}
        <span class="badge ${BADGE[p.status] || ""}">${esc(p.status)}</span></div>
      <div class="card-body"><h3>${esc(p.name)}</h3>${p.lastUpdated ? `<span class="upd${isFresh(p.lastUpdated) ? " fresh" : ""}">Updated ${esc(fmtDate(p.lastUpdated))}</span>` : ""}<p>${esc(p.description)}</p></div>
    </button>`;
  };

  const bindThumbs = (el) => {
    el.querySelectorAll(".thumb img").forEach((img) => {
      const ready = () => img.classList.add("ready");
      if (img.complete && img.naturalWidth) ready();
      else img.addEventListener("load", ready, { once: true });
      img.addEventListener("error", () => {
        img.onerror = null;
        img.src = FALLBACK;
        ready();
      }, { once: true });
    });
  };

  const renderInto = (el, list) => {
    if (!list.length) {
      el.innerHTML = `<p class="muted">Nothing in this shelf matches. Clear search or filters to see everything.</p>`;
      el.onclick = null;
      return;
    }
    el.innerHTML = list.map(cardHtml).join("");
    bindThumbs(el);
    el.onclick = (e) => { const c = e.target.closest(".card"); if (c) openSheet(list[+c.dataset.idx], c); };
  };
  window.ToyBox = { renderInto, openSheet };

  const grid = $("[data-grid]");
  let all = [];
  let painted = false;
  const state = { cat: "all", status: "", recent: false, q: "" };
  const byRecent = (a, b) => String(b.lastUpdated).localeCompare(String(a.lastUpdated));
  const matchesQ = (p, q) => {
    if (!q) return true;
    const hay = `${p.name} ${p.description} ${p.status} ${p.kind} ${p.note || ""}`.toLowerCase();
    return hay.includes(q);
  };
  const labelFor = (n) => {
    const bits = [`${n} ${n === 1 ? "project" : "projects"}`];
    if (state.cat === "game") bits[0] = `${n} ${n === 1 ? "game" : "games"}`;
    if (state.cat === "site") bits[0] = `${n} ${n === 1 ? "site" : "sites"}`;
    if (state.cat === "tool") bits[0] = `${n} ${n === 1 ? "tool" : "tools"}`;
    if (state.status) bits.push(state.status === "In development" ? "coming soon" : state.status.toLowerCase());
    if (state.recent) bits.push("newest first");
    if (state.q) bits.push(`matching “${state.q}”`);
    return bits.join(", ");
  };
  const filtered = () => {
    let list = all.filter((p) => (state.cat === "all" || p.category === state.cat) && (!state.status || p.status === state.status) && matchesQ(p, state.q));
    if (state.recent) list = [...list].sort(byRecent);
    return list;
  };
  const paint = () => {
    const list = filtered();
    renderInto(grid, list);
    const status = $("[data-filter-status]");
    if (status) status.textContent = list.length ? labelFor(list.length) : "No projects match.";
    const first = grid.querySelector(".card");
    if (first) {
      const barH = $(".shelf-bar")?.getBoundingClientRect().height || 0;
      const top = first.getBoundingClientRect().top;
      if (top < barH + 8 || top > innerHeight * 0.65) {
        const y = window.scrollY + grid.getBoundingClientRect().top - barH - 4;
        window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      }
    }
  };
  const show = (useVt) => {
    if (painted && useVt) withTransition(paint);
    else { paint(); painted = true; }
  };
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    state.cat = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    show(true);
  }));
  document.querySelectorAll("[data-status]").forEach((b) => b.addEventListener("click", () => {
    state.status = state.status === b.dataset.status ? "" : b.dataset.status;
    document.querySelectorAll("[data-status]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.status === state.status)));
    show(true);
  }));
  $("[data-sort=recent]")?.addEventListener("click", () => {
    state.recent = !state.recent;
    $("[data-sort=recent]").setAttribute("aria-pressed", String(state.recent));
    show(true);
  });
  let searchTick = 0;
  $("[data-search]")?.addEventListener("input", (e) => {
    state.q = String(e.target.value || "").trim().toLowerCase();
    clearTimeout(searchTick);
    searchTick = setTimeout(() => show(false), 120);
  });
  const jumpLockbox = () => {
    $("#lockbox")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
    setTimeout(() => $("#lock-pass")?.focus({ preventScroll: true }), 400);
  };
  $("[data-jump-lockbox]")?.addEventListener("click", jumpLockbox);

  const paintNews = () => {
    const host = $("[data-news]");
    if (!host || !all.length) return;
    const newest = [...all].sort(byRecent).slice(0, 3);
    host.innerHTML = newest.map((p, i) => `
      <button class="news-item" type="button" data-news-idx="${i}">
        <span class="news-thumb">${pictureHtml(p, { eager: true, high: i === 0, sizes: "72px", width: 144, height: 90 })}</span>
        <span class="news-body"><h3>${esc(p.name)}</h3><p>${esc(p.note || `Updated ${fmtDate(p.lastUpdated)}`)}</p></span>
      </button>`).join("");
    host.onclick = (e) => {
      const b = e.target.closest(".news-item");
      if (b) openSheet(newest[+b.dataset.newsIdx], b);
    };
  };

  fetch("/data/projects.json", { cache: "no-cache" }).then((r) => r.json()).then((doc) => {
    all = doc.projects.map((p) => ({
      ...p,
      url: p.liveUrl,
      kind: KIND[p.category],
      note: p.updateNote,
      image: `/assets/previews/${p.id}.webp?v=${encodeURIComponent(p.lastUpdated)}`,
      avif: `/assets/previews/${p.id}.avif?v=${encodeURIComponent(p.lastUpdated)}`,
    }));
    const live = all.filter((p) => p.status === "Live").length, prog = all.filter((p) => p.status === "In progress" || p.status === "Android app").length;
    $("[data-stats]").innerHTML = `<b>${all.length}</b> projects · <b>${live}</b> live · <b>${prog}</b> in progress`;
    paintNews();
    const hash = (location.hash || "").slice(1);
    const hashFilter = { games: "game", game: "game", sites: "site", site: "site", tools: "tool", tool: "tool", all: "all" }[hash];
    const hashStatus = { live: "Live", progress: "In progress", soon: "In development", "coming-soon": "In development" }[hash];
    if (hash === "recent") {
      state.recent = true;
      $("[data-sort=recent]")?.setAttribute("aria-pressed", "true");
    }
    if (hashStatus) {
      state.status = hashStatus;
      document.querySelectorAll("[data-status]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.status === hashStatus)));
    }
    if (hash === "new" || hash === "whats-new") {
      show(false);
      $("#whats-new")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
    } else if (hash === "lockbox") show(false);
    else if (hashFilter) {
      state.cat = hashFilter;
      const btn = document.querySelector(`[data-filter="${hashFilter}"]`);
      if (btn) document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
      show(false);
    } else show(false);
    if (hash === "lockbox") jumpLockbox();
  }).catch(() => { grid.innerHTML = `<p class="muted">Couldn't load projects. Refresh to try again.</p>`; });
})();
