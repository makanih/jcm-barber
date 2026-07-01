import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

window.__cancelForceReveal && window.__cancelForceReveal();

const isTouch = () => window.matchMedia("(pointer: coarse)").matches;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   LOADER
   ============================================================ */
const loader = document.getElementById("loader");
const loaderInner = loader?.querySelector(".loader-inner");
const loaderBar = loader?.querySelector(".loader-bar-wrap");

function runLoader(onDone) {
  if (!loader || reduced()) {
    loader && (loader.style.display = "none");
    onDone();
    return;
  }
  gsap.timeline()
    .to(loaderBar, { opacity: 1, duration: 0.2 })
    .to(loaderInner, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.1)
    .to([loaderInner, loaderBar], {
      opacity: 0, y: -14, duration: 0.45, ease: "power2.in", delay: 0.85,
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0, duration: 0.4, ease: "power2.inOut",
          onComplete: () => { loader.style.display = "none"; onDone(); }
        });
      }
    });
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

if (!isTouch() && cursorDot && cursorRing) {
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  }, { passive: true });

  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    gsap.set(cursorRing, { x: ringX, y: ringY });
  });

  const expandTargets = document.querySelectorAll(
    "a, button, [data-cursor-expand], .gallery-item, .policy-row, .service-row, .btn-magnetic"
  );
  expandTargets.forEach(el => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("expanded"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("expanded"));
  });
}

/* ============================================================
   NAV
   ============================================================ */
const nav = document.getElementById("siteNav");
const burger = document.getElementById("navHamburger");
const mMenu = document.getElementById("mobileMenu");
const mLinks = mMenu?.querySelectorAll(".mobile-link");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

burger?.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!open));
  mMenu.classList.toggle("open", !open);
  mMenu.setAttribute("aria-hidden", String(open));
  mLinks?.forEach(l => l.setAttribute("tabindex", open ? "-1" : "0"));
});

mLinks?.forEach(l => l.addEventListener("click", () => {
  burger.setAttribute("aria-expanded", "false");
  mMenu.classList.remove("open");
  mMenu.setAttribute("aria-hidden", "true");
  mLinks.forEach(x => x.setAttribute("tabindex", "-1"));
}));

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic() {
  if (isTouch() || reduced()) return;
  document.querySelectorAll(".btn-magnetic").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.35, ease: "power2.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ============================================================
   WORD REVEAL
   ============================================================ */
function prepareWordReveal(el) {
  if (!el) return [];
  const processNode = (node) => {
    const collected = [];
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const words = child.textContent.split(/(\s+)/);
        words.forEach(seg => {
          if (seg.trim()) {
            const wrap = document.createElement("span");
            wrap.className = "word-wrap";
            const inner = document.createElement("span");
            inner.className = "word";
            inner.textContent = seg;
            wrap.appendChild(inner);
            child.parentNode.insertBefore(wrap, child);
            collected.push(inner);
          } else if (seg) {
            child.parentNode.insertBefore(document.createTextNode(seg), child);
          }
        });
        child.remove();
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === "BR") return;
        collected.push(...processNode(child));
      }
    });
    return collected;
  };
  return processNode(el);
}

function animateWordReveal(words, trigger, delay = 0) {
  if (!words.length || reduced()) { gsap.set(words, { y: "0%", opacity: 1 }); return; }
  gsap.fromTo(words,
    { y: "108%", opacity: 0 },
    {
      y: "0%", opacity: 1, duration: 0.85, ease: "power3.out", stagger: 0.045, delay,
      scrollTrigger: trigger ? { trigger, start: "top 82%" } : null
    }
  );
}

function initWordRevealEls() {
  document.querySelectorAll("[data-word-reveal]").forEach(el => {
    const words = prepareWordReveal(el);
    animateWordReveal(words, el);
  });
}

/* ============================================================
   HERO ENTRANCE
   ============================================================ */
function heroEntrance() {
  const right = document.getElementById("heroRight");
  if (!right) return;
  const eyebrow = right.querySelector(".hero-eyebrow");
  const tagline = right.querySelector(".hero-tagline");
  const rest = right.querySelectorAll("[data-reveal]");
  const wordmark = document.getElementById("heroWordmark");
  const scrollCue = document.querySelector(".hero-scroll-cue");

  if (reduced()) {
    const lines = tagline?.querySelectorAll(".reveal-inner");
    lines && gsap.set(lines, { y: "0%" });
    gsap.set([eyebrow, ...rest], { opacity: 1, y: 0 });
    wordmark && gsap.set(wordmark, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(wordmark, { opacity: 0, y: 30 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(eyebrow, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6 }, 0.2)
    .to(tagline.querySelectorAll(".reveal-inner"), { y: "0%", duration: 1.0, stagger: 0.12 }, 0.32)
    .to(rest, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.7)
    .to(wordmark, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 0.5);

  if (scrollCue) gsap.set(scrollCue, { clearProps: "none" });
}

/* ============================================================
   SECTION RULE DRAWS
   ============================================================ */
function initRules() {
  document.querySelectorAll(".section-rule").forEach(rule => {
    ScrollTrigger.create({
      trigger: rule, start: "top 88%",
      onEnter: () => rule.classList.add("visible"),
    });
  });
}

/* ============================================================
   DATA-REVEAL ELEMENTS
   ============================================================ */
function initRevealEls() {
  document.querySelectorAll("[data-reveal]").forEach(el => {
    if (el.closest("#heroRight")) return;
    if (reduced()) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });
}

/* ============================================================
   STORY SECTION
   ============================================================ */
function initStory() {
  const cols = document.querySelector(".story-cols");
  if (cols && !reduced()) {
    gsap.fromTo(cols, { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: cols, start: "top 88%" }
    });
  } else if (cols) { gsap.set(cols, { opacity: 1, y: 0 }); }
}

/* ============================================================
   SERVICES — row stagger
   ============================================================ */
function initServices() {
  const rows = document.querySelectorAll(".service-row");
  if (!rows.length || reduced()) return;
  gsap.fromTo(rows, { opacity: 0, y: 18 }, {
    opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06,
    scrollTrigger: { trigger: "#servicesList", start: "top 85%" }
  });
}

/* ============================================================
   GALLERY — tile stagger
   ============================================================ */
function initGallery() {
  const tiles = document.querySelectorAll(".gallery-item");
  if (!tiles.length || reduced()) return;
  gsap.fromTo(tiles, { opacity: 0, y: 24 }, {
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.05,
    scrollTrigger: { trigger: "#galleryGrid", start: "top 85%" }
  });
}

/* ============================================================
   STATS COUNTER
   ============================================================ */
function initStats() {
  document.querySelectorAll(".stat-num[data-count]").forEach(el => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.hasAttribute("data-decimal");
    if (reduced()) { el.textContent = isDecimal ? target.toFixed(1) : Math.round(target).toLocaleString(); return; }
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 1.8, ease: "power2.out",
          onUpdate: () => { el.textContent = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val).toLocaleString(); }
        });
      }
    });
  });
}

/* ============================================================
   POLICY — row reveals
   ============================================================ */
function initPolicy() {
  const rows = document.querySelectorAll(".policy-row");
  if (!rows.length || reduced()) return;
  gsap.fromTo(rows, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1,
    scrollTrigger: { trigger: "#policyList", start: "top 84%" }
  });
}

/* ============================================================
   STATUS PULSE
   ============================================================ */
function initStatusPulse() {
  const pulse = document.getElementById("statusPulse");
  if (!pulse || reduced()) return;
  gsap.fromTo(pulse,
    { scale: 1, opacity: 0.8 },
    { scale: 2.6, opacity: 0, duration: 1.9, ease: "power2.out", repeat: -1, repeatDelay: 0.25 }
  );
}

/* ============================================================
   FOOTER — column fade-in
   ============================================================ */
function initFooter() {
  const cols = document.querySelectorAll(".footer-grid > div");
  if (!cols.length || reduced()) return;
  gsap.fromTo(cols, { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1,
    scrollTrigger: { trigger: ".footer-grid", start: "top 88%" }
  });
}

/* ============================================================
   BACKGROUND VIDEOS — play in place of the static photo once
   ready; silently no-op (leaving the photo) if missing, blocked,
   or (hero only) on small/reduced-motion screens
   ============================================================ */
function initVideoSlot(container, video, { skipMobile = false } = {}) {
  if (!video) return;
  if (reduced() || (skipMobile && window.matchMedia("(max-width: 700px)").matches)) {
    video.remove();
    return;
  }
  const desktopSrc = video.dataset.srcDesktop;
  const mobileSrc = video.dataset.srcMobile;
  if (desktopSrc && mobileSrc) {
    const isNarrow = window.matchMedia("(max-width: 900px)").matches;
    video.src = isNarrow ? mobileSrc : desktopSrc;
  } else if (video.dataset.src) {
    video.src = video.dataset.src;
  }
  video.load();
  const reveal = () => container.classList.add("video-ready");
  if (video.readyState >= 2) reveal();
  else video.addEventListener("loadeddata", reveal, { once: true });
  video.addEventListener("error", () => video.remove());
  video.play().catch(() => video.remove());
}

function initHeroVideo() {
  const heroBg = document.querySelector(".hero-bg");
  initVideoSlot(heroBg, heroBg?.querySelector(".hero-video"));
}

function initGalleryVideos() {
  const items = document.querySelectorAll(".gallery-item-video");
  if (!items.length) return;
  if (reduced() || !("IntersectionObserver" in window)) {
    items.forEach(item => initVideoSlot(item, item.querySelector(".gallery-video")));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      initVideoSlot(entry.target, entry.target.querySelector(".gallery-video"));
      io.unobserve(entry.target);
    });
  }, { rootMargin: "200px 0px" });
  items.forEach(item => io.observe(item));
}

/* ============================================================
   PHOTO SLOTS — catch already-cached 404s missed by inline onerror
   ============================================================ */
function initPhotoSlots() {
  document.querySelectorAll(".photo-slot img").forEach(img => {
    if (img.complete && img.naturalWidth === 0) {
      img.closest(".photo-slot")?.classList.add("img-missing");
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
function initAll() {
  initMagnetic();
  initHeroVideo();
  initGalleryVideos();
  heroEntrance();
  initRules();
  initRevealEls();
  initWordRevealEls();
  initStory();
  initServices();
  initGallery();
  initStats();
  initPolicy();
  initStatusPulse();
  initFooter();
  initPhotoSlots();
  ScrollTrigger.refresh();
}

function forceRevealNow(err) {
  if (err) console.error("JCM Barbershop script error — revealing page without animation:", err);
  window.__cancelForceReveal && window.__cancelForceReveal();
  document.documentElement.classList.add("force-visible");
  const loaderEl = document.getElementById("loader");
  if (loaderEl) loaderEl.style.display = "none";
  initPhotoSlots();
}

try {
  runLoader(() => {
    try { initAll(); } catch (err) { forceRevealNow(err); }
  });
} catch (err) {
  forceRevealNow(err);
}
