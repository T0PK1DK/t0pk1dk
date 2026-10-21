(() => {
  const KEY = "toybox-lockbox-v2";
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const root = document.querySelector("[data-lockbox]");
  if (!root) return;

  async function decrypt(pass, env) {
    const km = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(env.salt), iterations: env.iterations || 210000, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    try { return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(env.iv) }, key, b64(env.ciphertext)))); } catch { return null; }
  }

  function showLocked(count) {
    root.innerHTML = `
      <form class="lock-form" data-form autocomplete="off">
        <label class="sr-only" for="lock-pass">Lockbox passcode</label>
        <input id="lock-pass" type="password" inputmode="numeric" enterkeyhint="go" placeholder="Passcode" autocomplete="current-password" required aria-describedby="lock-err" aria-invalid="false">
        <button class="btn" type="submit">Unlock</button>
        <p class="lock-err" id="lock-err" data-err hidden role="alert">That passcode didn't work.</p>
      </form>
      <p class="muted small" style="margin:12px 0 0">${count ? `${count} private projects inside.` : ""}</p>`;
    const form = root.querySelector("[data-form]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button"); btn.disabled = true; btn.textContent = "Unlocking…";
      const env = await fetch("/data/private.enc.json", { cache: "no-cache" }).then((r) => r.json());
      const data = await decrypt(form.querySelector("input").value, env);
      btn.disabled = false; btn.textContent = "Unlock";
      if (!data) {
        form.querySelector("[data-err]").hidden = false;
        const input = form.querySelector("input");
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
      showOpen(data);
    });
  }

  function showOpen(data) {
    root.innerHTML = `<div class="lock-bar"><span class="muted small">Unlocked for this tab.</span><button class="chip" type="button" data-relock>Lock</button></div><div class="grid" data-lgrid></div>`;
    const list = data.projects.map((p) => ({ name: p.title, url: p.url, description: p.note, status: "Private", kind: p.kind || "Private", private: true, image: null }));
    window.ToyBox.renderInto(root.querySelector("[data-lgrid]"), list);
    const relock = root.querySelector("[data-relock]");
    relock.addEventListener("click", () => { sessionStorage.removeItem(KEY); init(); });
    relock.focus({ preventScroll: true });
  }

  async function init() {
    try { const s = JSON.parse(sessionStorage.getItem(KEY)); if (s?.projects) return showOpen(s); } catch {}
    let count = 0;
    try { count = (await fetch("/data/private.enc.json", { cache: "no-cache" }).then((r) => r.json())).cardCount; } catch {}
    showLocked(count);
  }
  init();
})();
