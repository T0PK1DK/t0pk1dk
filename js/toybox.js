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
  const sameSite = (u) => { try { return new URL(u).host === "t0pk1dk.com"; } catch { return false; } };
  const HOME_TITLE = document.title;
  const HOME_OG = {
    title: "King's Toy Box",
    desc: "Every game, site and tool T0PK1DK is building, live and in progress.",
    url: "https://t0pk1dk.com/",
    image: "https://t0pk1dk.com/assets/previews/rdf.webp",
  };
  const setMeta = (sel, val, attr = "content") => {
    const el = $(sel);
    if (el && val != null) el.setAttribute(attr, val);
  };
  const shareMeta = (p) => {
    if (!p) {
      document.title = HOME_TITLE;
      setMeta('meta[property="og:title"]', HOME_OG.title);
      setMeta('meta[property="og:description"]', HOME_OG.desc);
      setMeta('meta[property="og:url"]', HOME_OG.url);
      setMeta('meta[property="og:image"]', HOME_OG.image);
      setMeta('meta[name="twitter:title"]', HOME_OG.title);
      setMeta('meta[name="twitter:description"]', HOME_OG.desc);
      setMeta('meta[name="twitter:image"]', HOME_OG.image);
      setMeta('link[rel="canonical"]', HOME_OG.url, "href");
      return;
    }
    const img = `https://t0pk1dk.com/assets/previews/${p.id}.webp`;
    document.title = `${p.name} · King's Toy Box`;
    setMeta('meta[property="og:title"]', p.name);
    setMeta('meta[property="og:description"]', p.description || "");
    setMeta('meta[property="og:url"]', `https://t0pk1dk.com/p/${p.id}/`);
    setMeta('meta[property="og:image"]', img);
    setMeta('meta[name="twitter:title"]', p.name);
    setMeta('meta[name="twitter:description"]', p.description || "");
    setMeta('meta[name="twitter:image"]', img);
    setMeta('link[rel="canonical"]', `https://t0pk1dk.com/p/${p.id}/`, "href");
  };
  const setProjectParam = (id) => {
    const url = new URL(location.href);
    if (id) url.searchParams.set("p", id);
    else url.searchParams.delete("p");
    const next = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(null, "", next);
  };

  // Sheet
  const sheet = $("[data-sheet]");
  let lastCard = null;
  const FALLBACK = "/assets/previews/fallback.svg";
  const stripSources = (img) => img.closest("picture")?.querySelectorAll("source")?.forEach((s) => s.removeAttribute("srcset"));
  const revealThumb = (img) => img.classList.add("ready");
  const fallbackThumb = (img) => {
    stripSources(img);
    if (img.dataset.fallback === "1") {
      const box = img.closest(".thumb, .news-thumb, .sheet-shot");
      if (box && !box.querySelector(".thumb-empty")) {
        const mark = document.createElement("div");
        mark.className = "thumb-empty";
        mark.innerHTML = `<span class="thumb-mark" aria-hidden="true">🧸</span>`;
        img.replaceWith(mark);
      }
      return;
    }
    img.dataset.fallback = "1";
    img.src = FALLBACK;
    revealThumb(img);
  };
  const watchSheetImg = (img) => {
    img.classList.remove("ready");
    delete img.dataset.fallback;
    const ready = () => revealThumb(img);
    img.onload = ready;
    img.onerror = () => fallbackThumb(img);
    if (img.complete && img.naturalWidth) ready();
  };
  const openSheet = (p, opener) => {
    lastCard = opener || document.activeElement;
    const img = $("[data-sheet-img]");
    const avif = $("[data-sheet-avif]");
    if (avif) {
      if (p.avif) avif.srcset = p.avif;
      else avif.removeAttribute("srcset");
    }
    img.src = p.image || FALLBACK;
    img.alt = p.url ? `Screenshot of ${p.name}` : `Coming soon art for ${p.name}`;
    watchSheetImg(img);
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
    const dismiss = $("[data-sheet-dismiss]");
    const nolinkCopy = $("[data-sheet-nolink-copy]");
    if (p.url) {
      open.hidden = false; open.href = p.url;
      const local = sameSite(p.url);
      open.textContent = p.url.includes("github.com")
        ? "View on GitHub ↗"
        : local
          ? `Play ${p.name}`
          : `Open ${p.name} ↗`;
      if (local) {
        open.removeAttribute("target");
        open.removeAttribute("rel");
      } else {
        open.target = "_blank";
        open.rel = "noopener noreferrer";
      }
      $("[data-sheet-host]").textContent = p.private ? "" : host(p.url);
      nolink.hidden = true;
      if (dismiss) dismiss.hidden = true;
    } else {
      open.hidden = true; open.removeAttribute("href");
      $("[data-sheet-host]").textContent = "";
      nolink.hidden = false;
      if (dismiss) dismiss.hidden = false;
      if (nolinkCopy) {
        nolinkCopy.textContent = p.status === "Android app"
          ? "Android app. There's no web version to open yet."
          : "Still being built. A link shows up here as soon as there's something to open.";
      }
    }
    sheet.showModal();
    if (p.id) {
      shareMeta(p);
      setProjectParam(p.id);
    }
    if (p.url) open.focus();
    else (dismiss || $("[data-close]")).focus();
  };
  $("[data-close]")?.addEventListener("click", () => sheet.close());
  $("[data-sheet-dismiss]")?.addEventListener("click", () => sheet.close());
  sheet?.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  sheet?.addEventListener("close", () => {
    shareMeta(null);
    setProjectParam("");
    try { lastCard?.focus?.({ preventScroll: true }); } catch {}
    lastCard = null;
  });

  const tintOf = (id) => [...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % 4;
  const pictureHtml = (p, { eager = false, high = false, sizes, width = 720, height = 450, thumb = false } = {}) => {
    if (!p.image) {
      return `<div class="thumb-empty thumb"><span class="thumb-mark">${esc(initials(p.name))}</span><span class="thumb-soon">Soon</span></div>`;
    }
    const load = eager ? `loading="eager"${high ? ` fetchpriority="high"` : ""}` : `loading="lazy"`;
    const webp = thumb
      ? `${esc(p.image144)} 144w, ${esc(p.image360)} 360w`
      : `${esc(p.image360)} 360w, ${esc(p.image)} 720w`;
    const avif = thumb
      ? `${esc(p.avif144)} 144w, ${esc(p.avif360)} 360w`
      : `${esc(p.avif360)} 360w, ${esc(p.avif)} 720w`;
    const fallback = thumb ? p.image144 : p.image;
    const src = `<img src="${esc(fallback)}" srcset="${webp}" alt="" ${load} decoding="async" width="${width}" height="${height}" sizes="${esc(sizes)}">`;
    return `<picture><source type="image/avif" srcset="${avif}" sizes="${esc(sizes)}">${src}</picture>`;
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
  const LAUNCH_ORDER = ["hilo-game", "invert", "sprain", "iron-command"];
  const launchCardHtml = (p, i) => {
    const soon = Boolean(p.launchSoon);
    const img = pictureHtml(p, {
      eager: i < 2,
      high: i === 0,
      sizes: soon ? "(max-width:899px) 100vw, 280px" : "(max-width:400px) 100vw,(max-width:1099px) 50vw, 25vw",
    });
    const vt = `launch-${String(p.id || i).replace(/[^a-z0-9-]/gi, "")}`;
    const go = soon ? "Playtest soon" : "Play";
    const badge = soon ? "Coming soon" : p.status;
    const badgeClass = soon ? "b-dev" : (BADGE[p.status] || "");
    const label = soon
      ? `${p.name}, coming soon. ${p.description} Playtest soon.`
      : `${p.name}. ${p.description} Play`;
    return `
    <button class="card launch-card${soon ? " launch-soon" : ""}" type="button" data-tint="${tintOf(p.id || i)}" style="--i:${i};--vt:${vt}" data-idx="${i}" aria-label="${esc(label)}">
      <div class="thumb">${img}
        <span class="badge ${badgeClass}">${esc(badge)}</span>
        ${soon ? `<span class="soon-flag">Playtest soon</span>` : ""}</div>
      <div class="card-body"><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
        <span class="launch-go${soon ? " launch-go-soon" : ""}">${go}</span></div>
    </button>`;
  };

  const bindThumbs = (el) => {
    el.querySelectorAll(".thumb img, .news-thumb img").forEach((img) => {
      const ready = () => revealThumb(img);
      if (img.complete && img.naturalWidth) ready();
      else img.addEventListener("load", ready, { once: true });
      img.addEventListener("error", () => fallbackThumb(img), { once: true });
    });
  };

  const renderInto = (el, list) => {
    if (!list.length) {
      const q = state.q ? ` “${esc(state.q)}”` : "";
      el.innerHTML = `<div class="empty" role="status">
        <p class="empty-mark" aria-hidden="true">🧸</p>
        <p class="empty-title">Nothing in this shelf matches${q}.</p>
        <p>Clear search or filters to see everything.</p>
        <button class="chip" type="button" data-clear>Clear search or filters</button>
      </div>`;
      el.onclick = (e) => { if (e.target.closest("[data-clear]")) clearShelf(); };
      return;
    }
    el.innerHTML = list.map(cardHtml).join("");
    bindThumbs(el);
    el.onclick = (e) => { const c = e.target.closest(".card"); if (c) openSheet(list[+c.dataset.idx], c); };
  };
  window.ToyBox = { renderInto, openSheet };

  const grid = $("[data-grid]");
  const launchHost = $("[data-launch]");
  const launchSec = $("#launch");
  let all = [];
  let painted = false;
  const state = { cat: "all", status: "", recent: false, q: "" };
  const launchList = () => LAUNCH_ORDER.map((id) => all.find((p) => p.id === id)).filter(Boolean);
  const paintLaunch = () => {
    if (!launchHost || !launchSec) return;
    const list = launchList();
    const hide = Boolean(state.q || state.status || state.cat !== "all") || !list.length;
    launchSec.hidden = hide;
    if (hide) return;
    launchHost.innerHTML = list.map(launchCardHtml).join("");
    bindThumbs(launchHost);
    launchHost.onclick = (e) => {
      const c = e.target.closest(".card");
      if (!c) return;
      const p = list[+c.dataset.idx];
      const go = e.target.closest(".launch-go");
      if (go && p?.url && !p.launchSoon) {
        e.preventDefault();
        if (sameSite(p.url)) location.assign(p.url);
        else window.open(p.url, "_blank", "noopener,noreferrer");
        return;
      }
      openSheet(p, c);
    };
  };
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
  const paint = (snap) => {
    if (!grid) return;
    const list = filtered();
    grid.classList.toggle("reshuffle", Boolean(snap));
    renderInto(grid, list);
    paintLaunch();
    const status = $("[data-filter-status]");
    if (status) status.textContent = list.length ? labelFor(list.length) : "No projects match.";
    const first = grid.querySelector(".card") || grid.querySelector(".empty");
    if ((snap || !list.length) && first) {
      const barH = $(".shelf-bar")?.getBoundingClientRect().height || 0;
      const top = first.getBoundingClientRect().top;
      if (top < barH + 8 || top > innerHeight * 0.65) {
        const y = window.scrollY + first.getBoundingClientRect().top - barH - 8;
        window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      }
    }
  };
  const show = (useVt) => {
    const snap = painted;
    if (painted && useVt) withTransition(() => paint(true));
    else { paint(snap); painted = true; }
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
  const clearShelf = () => {
    state.cat = "all";
    state.status = "";
    state.recent = false;
    state.q = "";
    const input = $("[data-search]");
    if (input) input.value = "";
    document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.filter === "all")));
    document.querySelectorAll("[data-status]").forEach((x) => x.setAttribute("aria-pressed", "false"));
    $("[data-sort=recent]")?.setAttribute("aria-pressed", "false");
    show(false);
    input?.focus();
  };
  let searchTick = 0;
  $("[data-search]")?.addEventListener("input", (e) => {
    state.q = String(e.target.value || "").trim().toLowerCase();
    clearTimeout(searchTick);
    searchTick = setTimeout(() => show(false), 120);
  });
  $(".skip")?.addEventListener("click", (e) => {
    const input = $("[data-search]");
    if (!input) return;
    e.preventDefault();
    input.focus();
    input.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
  });
  $("[data-search]")?.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !state.q) return;
    e.target.value = "";
    state.q = "";
    show(false);
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
        <span class="news-thumb">${pictureHtml(p, { eager: i === 0, high: i === 0, sizes: "(max-width:400px) 64px, 72px", width: 144, height: 90, thumb: true })}</span>
        <span class="news-body"><h3>${esc(p.name)}</h3><p>${esc(p.note || `Updated ${fmtDate(p.lastUpdated)}`)}</p></span>
      </button>`).join("");
    bindThumbs(host);
    host.onclick = (e) => {
      const b = e.target.closest(".news-item");
      if (b) openSheet(newest[+b.dataset.newsIdx], b);
    };
  };

  fetch("/data/projects.json", { cache: "no-cache" }).then((r) => r.json()).then((doc) => {
    all = doc.projects.map((p) => {
      const v = encodeURIComponent(p.lastUpdated);
      const base = `/assets/previews/${p.id}`;
      return {
        ...p,
        url: p.liveUrl,
        kind: KIND[p.category],
        note: p.updateNote,
        image: `${base}.webp?v=${v}`,
        avif: `${base}.avif?v=${v}`,
        image360: `${base}-360.webp?v=${v}`,
        avif360: `${base}-360.avif?v=${v}`,
        image144: `${base}-144.webp?v=${v}`,
        avif144: `${base}-144.avif?v=${v}`,
      };
    });
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
    } else if (hash === "launch" || hash === "soft-launch") {
      show(false);
      $("#launch")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
    } else if (hash === "lockbox") show(false);
    else if (hashFilter) {
      state.cat = hashFilter;
      const btn = document.querySelector(`[data-filter="${hashFilter}"]`);
      if (btn) document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
      show(false);
    } else show(false);
    if (hash === "lockbox") jumpLockbox();
    const qid = new URLSearchParams(location.search).get("p");
    if (qid) {
      const hit = all.find((p) => p.id === qid);
      if (hit) openSheet(hit);
    }
  }).catch(() => { grid.innerHTML = `<p class="muted">Couldn't load projects. Refresh to try again.</p>`; });
})();
