(() => {
  const SESSION_KEY = "toybox-private-unlock-v1";
  const ENC_URL = "/data/private.enc.json";
  const PBKDF2_ITERATIONS = 210_000;

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const b64Decode = (str) => {
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  async function deriveAesKey(password, saltBytes) {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }

  async function decryptEnvelope(password, envelope) {
    const salt = b64Decode(envelope.salt);
    const iv = b64Decode(envelope.iv);
    const data = b64Decode(envelope.ciphertext);
    const key = await deriveAesKey(password, salt);
    try {
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
      return JSON.parse(textDecoder.decode(plain));
    } catch {
      return null;
    }
  }

  const arrowIcon = `<svg class="toy-arrow" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4M6 4h6v6" stroke="currentColor" stroke-width="1.7"/></svg>`;

  function renderPrivateCards(projects, grid) {
    const sorted = [...projects].sort((a, b) => a.title.localeCompare(b.title, "en"));
    grid.innerHTML = sorted
      .map((p) => {
        const href = p.url;
        const note = p.note || "";
        return `
      <article class="toy-card toy-card--linked toy-card--private" data-private-card="true">
        <a class="toy-card-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
          <span class="sr-only">${escapeHtml(p.title)} — open private project</span>
          <div class="toy-card-top">
            <span class="toy-status status-parked">Private</span>
            <span class="toy-kind">locked shelf</span>
          </div>
          <h3 class="toy-name">${escapeHtml(p.title)}</h3>
          <p class="toy-desc">${escapeHtml(note)}</p>
          <span class="toy-card-go">
            <span class="toy-card-go-text">Open</span>
            ${arrowIcon}
          </span>
        </a>
      </article>`;
      })
      .join("");
  }

  function readSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.projects)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeSession(payload) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function fetchEnvelope() {
    const res = await fetch(ENC_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function mountShell(root) {
    root.innerHTML = `
      <div class="private-vault" data-private-vault>
        <div class="private-locked" data-private-locked>
          <article class="private-lock-card">
            <div class="private-lock-icon" aria-hidden="true">🔒</div>
            <h3 class="private-lock-title">Private · King only</h3>
            <p class="private-lock-lede">Personal builds and links. Password required.</p>
            <form class="private-lock-form" data-private-form>
              <label class="private-lock-label" for="private-password">Password</label>
              <input class="private-lock-input" id="private-password" name="password" type="password" autocomplete="current-password" required />
              <p class="private-lock-error" data-private-error hidden role="alert">Wrong password</p>
              <button class="btn btn-primary private-lock-submit" type="submit">Unlock</button>
            </form>
          </article>
        </div>
        <div class="private-unlocked" data-private-unlocked hidden>
          <div class="private-unlocked-head">
            <h3 class="private-unlocked-title">Private shelf</h3>
            <button class="btn btn-ghost private-lock-btn" type="button" data-private-lock>Lock</button>
          </div>
          <div class="toy-grid private-grid" data-private-grid></div>
        </div>
      </div>`;
  }

  async function init() {
    const section = document.querySelector("[data-private-section]");
    if (!section) return;

    mountShell(section);
    const locked = section.querySelector("[data-private-locked]");
    const unlocked = section.querySelector("[data-private-unlocked]");
    const form = section.querySelector("[data-private-form]");
    const errorEl = section.querySelector("[data-private-error]");
    const grid = section.querySelector("[data-private-grid]");
    const lockBtn = section.querySelector("[data-private-lock]");

    const showUnlocked = (payload) => {
      locked.hidden = true;
      unlocked.hidden = false;
      renderPrivateCards(payload.projects, grid);
      section.dataset.privateCount = String(payload.projects.length);
    };

    const showLocked = () => {
      unlocked.hidden = true;
      locked.hidden = false;
      grid.innerHTML = "";
      delete section.dataset.privateCount;
    };

    const cached = readSession();
    if (cached) showUnlocked(cached);

    lockBtn.addEventListener("click", () => {
      clearSession();
      showLocked();
      errorEl.hidden = true;
      form.reset();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorEl.hidden = true;
      const password = new FormData(form).get("password");
      if (!password) return;

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      try {
        const envelope = await fetchEnvelope();
        const payload = await decryptEnvelope(String(password), envelope);
        if (!payload) {
          errorEl.hidden = false;
          return;
        }
        writeSession(payload);
        showUnlocked(payload);
      } catch {
        errorEl.textContent = "Could not load private data. Try again.";
        errorEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
