(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".nav-toggle");
  const overlay = document.querySelector("#mobile-nav");
  const form = document.querySelector("[data-mailto-form]");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const setMenu = (open) => {
    if (!toggle || !overlay) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    overlay.classList.toggle("is-open", open);
    overlay.hidden = !open;
    document.body.classList.toggle("nav-open", open);
  };

  if (toggle && overlay) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    overlay.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 960px)").matches) setMenu(false);
    });
  }

  const filters = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-kind]");

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.getAttribute("data-filter");
      filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      cards.forEach((card) => {
        const match = next === "all" || card.getAttribute("data-kind") === next;
        card.hidden = !match;
      });
    });
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const type = String(data.get("type") || "").trim();
      const message = String(data.get("message") || "").trim();
      const subject = `Project inquiry from ${name || "a client"}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Type: ${type}`,
        "",
        message
      ].join("\n");
      window.location.href = `mailto:hello@t0pk1dk.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
