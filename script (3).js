/* Naga Sharmila Portfolio — plain JavaScript, no libraries */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const progressBar = document.getElementById("progress-bar");
  const backToTop = document.getElementById("back-to-top");

  // Mobile navigation: close after selection, Escape, or tapping outside.
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navLinks.classList.toggle("open", !isOpen);
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", event => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  // Theme preference is saved locally. If no preference exists, use system settings.
  const savedTheme = localStorage.getItem("naga-portfolio-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeIcon.textContent = isDark ? "☀" : "☾";
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", isDark ? "#10131e" : "#f7f8fc");
  }
  applyTheme(savedTheme || (systemPrefersDark ? "dark" : "light"));
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("naga-portfolio-theme", nextTheme);
  });

  // Typing effect with a reduced-motion fallback.
  const typingText = document.getElementById("typing-text");
  const roles = ["Network Engineer", "IT Support Professional", "Problem Solver"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typingText && !reduceMotion) {
    let roleIndex = 0, charIndex = roles[0].length, deleting = true;
    const typeNext = () => {
      const role = roles[roleIndex];
      charIndex += deleting ? -1 : 1;
      typingText.textContent = role.slice(0, charIndex);
      let delay = deleting ? 48 : 82;
      if (charIndex <= 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 300;
      } else if (charIndex >= roles[roleIndex].length && !deleting) {
        deleting = true;
        delay = 1500;
      }
      window.setTimeout(typeNext, delay);
    };
    window.setTimeout(typeNext, 1600);
  }

  // Project category filters.
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const noResults = document.getElementById("no-results");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      let visibleCount = 0;
      projectCards.forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visibleCount++;
      });
      noResults.hidden = visibleCount !== 0;
    });
  });

  // Expand/collapse project descriptions with accessible state.
  document.querySelectorAll(".details-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const details = button.nextElementSibling;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      details.hidden = expanded;
      button.firstChild.textContent = expanded ? "More details " : "Hide details ";
      button.querySelector("span").textContent = expanded ? "＋" : "−";
    });
  });

  // Reveal elements when they enter the viewport.
  const revealTargets = document.querySelectorAll(".section-heading, .project-card, .about-art, .about-copy, .timeline-item, .skill-card, .contact-form");
  if ("IntersectionObserver" in window && !reduceMotion) {
    revealTargets.forEach(element => element.classList.add("reveal"));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(element => revealObserver.observe(element));
  }

  // Highlight the navigation item for the section currently in view.
  const sections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav-link").forEach(link => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Scroll progress and back-to-top visibility.
  function updateScrollUI() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, progress)}%`;
    backToTop.hidden = window.scrollY < 500;
  }
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Contact form validation. No backend is used; valid messages open the visitor's email app.
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const charCount = document.getElementById("char-count");
  const formStatus = document.getElementById("form-msg");
  const fields = [
    { input: nameInput, error: document.getElementById("name-error"), message: "Please enter your name." },
    { input: emailInput, error: document.getElementById("email-error"), message: "Enter a valid email address.", validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
    { input: messageInput, error: document.getElementById("message-error"), message: "Please enter a message (at least 10 characters).", validate: value => value.trim().length >= 10 }
  ];
  messageInput.addEventListener("input", () => { charCount.textContent = String(messageInput.value.length); });
  fields.forEach(field => {
    field.input.addEventListener("input", () => {
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
      formStatus.textContent = "";
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    formStatus.textContent = "";
    let firstInvalid = null;
    fields.forEach(field => {
      const value = field.input.value.trim();
      const valid = value.length > 0 && (!field.validate || field.validate(value));
      field.input.setAttribute("aria-invalid", String(!valid));
      field.error.textContent = valid ? "" : field.message;
      if (!valid && !firstInvalid) firstInvalid = field.input;
    });
    if (firstInvalid) {
      formStatus.textContent = "Please correct the highlighted fields before continuing.";
      firstInvalid.focus();
      return;
    }
    const recipient = document.getElementById("email-link").textContent.trim();
    const subject = `Portfolio enquiry from ${nameInput.value.trim()}`;
    const body = `Name: ${nameInput.value.trim()}\nReply email: ${emailInput.value.trim()}\n\nMessage:\n${messageInput.value.trim()}`;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    formStatus.style.color = "var(--accent)";
    formStatus.textContent = "Your email app should open with the message prepared. If it does not, email me directly using the address shown.";
    window.location.href = mailto;
  });

  // Copy email address with a fallback for browsers without Clipboard API support.
  const copyButton = document.getElementById("copy-email");
  const copyMessage = document.getElementById("copy-msg");
  copyButton.addEventListener("click", async () => {
    const email = document.getElementById("email-link").textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      copyMessage.textContent = "Email address copied.";
    } catch {
      const helper = document.createElement("textarea");
      helper.value = email;
      helper.setAttribute("readonly", "");
      helper.style.position = "absolute";
      helper.style.left = "-9999px";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      copyMessage.textContent = copied ? "Email address copied." : "Please copy the email address manually.";
    }
  });

  // Current year in footer.
  document.getElementById("year").textContent = String(new Date().getFullYear());
});
