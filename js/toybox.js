(() => {
  const STORAGE_THEME = "toybox-theme";
  const FORBIDDEN_URL = "kingleonardjr19";
  const GITHUB_USER = "T0PK1DK";

  const formatDate = (iso) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${iso}T12:00:00Z`));
    } catch {
      return iso;
    }
  };

  const statusClass = (status) => {
    const map = {
      Live: "status-live",
      "In progress": "status-progress",
      Early: "status-early",
      Parked: "status-parked",
    };
    return map[status] || "status-progress";
  };

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const isAllowedUrl = (url) => url && !url.toLowerCase().includes(FORBIDDEN_URL);

  const setTheme = (theme) => {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_THEME, next);
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      toggle.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
    }
  };

  const initTheme = () => {
    const saved = localStorage.getItem(STORAGE_THEME);
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  };

  async function fetchPublicRepoNames() {
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) return new Set();
      const repos = await res.json();
      return new Set(
        repos.filter((r) => !r.private && !r.fork).map((r) => r.name),
      );
    } catch {
      return new Set();
    }
  }

  function resolveCardHref(project, publicRepos) {
    if (isAllowedUrl(project.liveUrl)) return project.liveUrl;
    if (project.githubRepo && publicRepos.has(project.githubRepo)) {
      return `https://github.com/${GITHUB_USER}/${encodeURIComponent(project.githubRepo)}`;
    }
    return null;
  }

  const arrowIcon = `<svg class="toy-arrow" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4M6 4h6v6" stroke="currentColor" stroke-width="1.7"/></svg>`;

  const renderUpdates = (projects, container) => {
    const items = [...projects]
      .filter((p) => p.updateNote)
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
      .slice(0, 8);

    if (!items.length) {
      container.hidden = true;
      return;
    }

    container.innerHTML = items
      .map(
        (p) => `
      <article class="update-item">
        <time class="update-date" datetime="${escapeHtml(p.lastUpdated)}">${escapeHtml(formatDate(p.lastUpdated))}</time>
        <div class="update-body">
          <strong class="update-project">${escapeHtml(p.name)}</strong>
          <p>${escapeHtml(p.updateNote)}</p>
        </div>
      </article>`,
      )
      .join("");
  };

  const renderCards = (projects, grid, publicRepos) => {
    const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name, "en"));
    let clickable = 0;

    grid.innerHTML = sorted
      .map((p) => {
        const kind = p.category;
        const href = resolveCardHref(p, publicRepos);
        if (href) clickable += 1;

        const showGithubChip =
          isAllowedUrl(p.liveUrl) &&
          p.githubRepo &&
          publicRepos.has(p.githubRepo);

        const githubFoot = showGithubChip
          ? `<div class="toy-card-foot">
          <a class="toy-meta-link" href="https://github.com/${GITHUB_USER}/${encodeURIComponent(p.githubRepo)}" target="_blank" rel="noopener noreferrer">GitHub repo</a>
        </div>`
          : "";

        const goLabel = p.liveUrl && isAllowedUrl(p.liveUrl)
          ? "Open live site"
          : href
            ? "Open on GitHub"
            : "";

        const body = `
        <div class="toy-card-top">
          <span class="toy-status ${statusClass(p.status)}">${escapeHtml(p.status)}</span>
          <span class="toy-kind">${escapeHtml(kind)}</span>
        </div>
        <h3 class="toy-name">${escapeHtml(p.name)}</h3>
        <p class="toy-desc">${escapeHtml(p.description)}</p>
        <div class="toy-update">
          <span class="toy-updated-label">Last updated</span>
          <time datetime="${escapeHtml(p.lastUpdated)}">${escapeHtml(formatDate(p.lastUpdated))}</time>
          <p class="toy-note">${escapeHtml(p.updateNote)}</p>
        </div>`;

        if (href) {
          return `
      <article class="toy-card toy-card--linked" data-kind="${escapeHtml(kind)}" data-clickable="true">
        <a class="toy-card-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
          <span class="sr-only">${escapeHtml(p.name)} — ${escapeHtml(goLabel)}</span>
          ${body}
          <span class="toy-card-go">
            <span class="toy-card-go-text">${escapeHtml(goLabel)}</span>
            ${arrowIcon}
          </span>
        </a>
        ${githubFoot}
      </article>`;
        }

        return `
      <article class="toy-card toy-card--static" data-kind="${escapeHtml(kind)}" data-clickable="false" tabindex="0">
        ${body}
        <span class="toy-coming-soon" role="status">Coming soon</span>
      </article>`;
      })
      .join("");

    return clickable;
  };

  const bindFilters = () => {
    const filters = document.querySelectorAll("[data-toy-filter]");
    const cards = document.querySelectorAll(".toy-card[data-kind]");

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.getAttribute("data-toy-filter");
        filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        cards.forEach((card) => {
          const match = next === "all" || card.getAttribute("data-kind") === next;
          card.hidden = !match;
          card.classList.toggle("is-filtered-out", !match);
        });
      });
    });
  };

  const load = async () => {
    const grid = document.querySelector("[data-toy-grid]");
    const updates = document.querySelector("[data-updates-feed]");
    const statusEl = document.querySelector("[data-toy-status]");

    if (!grid) return;

    try {
      const [projectRes, publicRepos] = await Promise.all([
        fetch("/data/projects.json", { cache: "no-cache" }),
        fetchPublicRepoNames(),
      ]);
      if (!projectRes.ok) throw new Error(`HTTP ${projectRes.status}`);
      const doc = await projectRes.json();
      const projects = doc.projects || [];

      renderUpdates(projects, updates);
      const clickable = renderCards(projects, grid, publicRepos);
      bindFilters();

      if (statusEl) {
        statusEl.textContent = `${projects.length} projects in the box · ${clickable} clickable`;
      }
      grid.dataset.clickableCount = String(clickable);
    } catch (err) {
      grid.innerHTML = `<p class="toy-error" role="alert">Could not load projects. ${escapeHtml(err.message)}</p>`;
      if (statusEl) statusEl.textContent = "Load failed";
    }
  };

  initTheme();
  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      setTheme(isDark ? "light" : "dark");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
