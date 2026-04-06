/* ============================================================
   LEGACY WEB STUDIO — Main JavaScript
   Sunset canvas · Scroll animation · Nav · Form
   ============================================================ */

'use strict';

/* =========================================================
   1. SUNSET CANVAS ANIMATION
   Scroll-driven: progress 0→1 as hero scrolls by.
   Reverses automatically when scrolling back up.
   ========================================================= */
class SunsetCanvas {
  constructor(el) {
    this.canvas  = el;
    this.ctx     = el.getContext('2d');
    this.hero    = document.getElementById('home');
    this.scroll  = 0;   // 0–1
    this.time    = 0;
    this.running = true;
    this.isDark  = false;
    this.w = 0;
    this.h = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Orbs: spatial config only — colours sourced from active palette
    this.orbs = [
      { bx:0.72, by:0.40, r:0.50, s:0.60, p:0.00 },
      { bx:0.88, by:0.68, r:0.43, s:0.45, p:1.25 },
      { bx:0.55, by:0.82, r:0.38, s:0.80, p:2.50 },
      { bx:0.80, by:0.18, r:0.30, s:0.55, p:3.75 },
      { bx:0.42, by:0.55, r:0.28, s:0.70, p:5.00 },
    ];

    // Two palettes — light (warm sunrise) and dark (aurora night)
    this.palettes = {
      light: {
        // bg stops: each pair interpolates dawn→dusk via scroll progress sp
        bg: [
          { c0:[28, 10,  70], c1:[12,   5, 30]  },
          { c0:[74, 20, 140], c1:[100, 15,  5]  },
          { c0:[155,27, 140], c1:[210, 75, 10]  },
          { c0:[210,60,  30], c1:[240,140,  6]  },
        ],
        orbs: [
          { c0:[74, 20,140],  c1:[212, 70, 10] },
          { c0:[148,24,138],  c1:[238,130,  6] },
          { c0:[224,60, 20],  c1:[245,155,  6] },
          { c0:[44, 26,100],  c1:[168, 22,148] },
          { c0:[100,10, 80],  c1:[195, 80, 10] },
        ],
        orbOpacity: 0.62,
        horizon: { c0:[255,175, 90], c1:[255,200,50] },
      },
      dark: {
        // bg stops: near-black → deep navy → dark teal-blue → faint aurora green
        bg: [
          { c0:[5,  8, 22],  c1:[8,  12, 30]  },
          { c0:[11,21, 40],  c1:[15, 28, 52]  },
          { c0:[12,35, 64],  c1:[14, 40, 72]  },
          { c0:[10,46, 42],  c1:[12, 52, 48]  },
        ],
        orbs: [
          { c0:[20, 80,120],  c1:[ 45,212,191] },  // teal
          { c0:[60, 40,140],  c1:[139, 92,246] },  // violet
          { c0:[10, 60, 80],  c1:[ 52,211,153] },  // green
          { c0:[30, 20, 80],  c1:[167,139,250] },  // light violet
          { c0:[15, 50, 70],  c1:[ 94,234,212] },  // bright teal
        ],
        orbOpacity: 0.45,
        horizon: { c0:[100,220,200], c1:[100,220,200] },
      },
    };

    this._resize();
    this._resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._resize(), 150);
    }, { passive: true });

    // Respect reduced motion: paint once, skip animation loop
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._draw();
      this.running = false;
    } else {
      this._loop();
    }
  }

  _resize() {
    this.dpr  = Math.min(window.devicePixelRatio || 1, 2);
    this.w    = this.canvas.offsetWidth;
    this.h    = this.canvas.offsetHeight;
    this.canvas.width  = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
  }

  setScroll(p) {
    this.scroll = Math.max(0, Math.min(1, p));
  }

  setTheme(isDark) {
    this.isDark = isDark;
    // When motion is reduced the loop is stopped — repaint once with new palette
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._draw();
    }
  }

  _lerp(a, b, t)  { return a + (b - a) * t; }
  _lc(c0, c1, t)  {
    return [
      Math.round(this._lerp(c0[0], c1[0], t)),
      Math.round(this._lerp(c0[1], c1[1], t)),
      Math.round(this._lerp(c0[2], c1[2], t)),
    ];
  }

  _draw() {
    const { ctx, w, h, time: t, scroll: sp, dpr } = this;
    const pal = this.palettes[this.isDark ? 'dark' : 'light'];

    // Scale for DPR
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ── Background gradient ──────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
    const s0 = this._lc(pal.bg[0].c0, pal.bg[0].c1, sp);
    const s1 = this._lc(pal.bg[1].c0, pal.bg[1].c1, sp);
    const s2 = this._lc(pal.bg[2].c0, pal.bg[2].c1, sp);
    const s3 = this._lc(pal.bg[3].c0, pal.bg[3].c1, sp);

    bg.addColorStop(0,    `rgb(${s0})`);
    bg.addColorStop(0.30, `rgb(${s1})`);
    bg.addColorStop(0.65, `rgb(${s2})`);
    bg.addColorStop(1,    `rgb(${s3})`);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // ── Orbs (screen blend — additive light) ────────────
    ctx.globalCompositeOperation = 'screen';

    this.orbs.forEach((orb, i) => {
      const orbCol = pal.orbs[i];
      const fx = Math.sin(t * orb.s       + orb.p) * 0.038;
      const fy = Math.cos(t * orb.s * 0.7 + orb.p) * 0.030;

      // Scroll shifts orbs: even-indexed drift right/down, odd drift left/down
      const sdx = sp * 0.08 * (i % 2 === 0 ?  0.6 : -0.4);
      const sdy = sp * 0.06;

      const x = (orb.bx + fx + sdx) * w;
      const y = (orb.by + fy + sdy) * h;
      const r = orb.r * Math.min(w, h) * (1 + sp * 0.12);

      const [cr, cg, cb] = this._lc(orbCol.c0, orbCol.c1, sp);

      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(${cr},${cg},${cb},${pal.orbOpacity})`);
      g.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.22)`);
      g.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    // ── Horizon glow ─────────────────────────────────────
    const hy = h * this._lerp(0.62, 0.48, sp);
    const hg = ctx.createLinearGradient(0, hy - h * 0.15, 0, hy + h * 0.18);
    const [hr, hgr, hb] = this._lc(pal.horizon.c0, pal.horizon.c1, sp);
    const ha = 0.10 + sp * 0.08;
    hg.addColorStop(0,   `rgba(${hr},${hgr},${hb},0)`);
    hg.addColorStop(0.5, `rgba(${hr},${hgr},${hb},${ha})`);
    hg.addColorStop(1,   `rgba(${hr},${hgr},${hb},0)`);
    ctx.fillStyle = hg;
    ctx.fillRect(0, hy - h * 0.15, w, h * 0.33);
  }

  _loop() {
    if (!this.running) return;
    this.time += 0.004;
    this._draw();
    requestAnimationFrame(() => this._loop());
  }

  destroy() {
    this.running = false;
    clearTimeout(this._resizeTimer);
  }
}

// Initialise canvas
const heroCanvas = document.getElementById('hero-canvas');
const heroSection = document.getElementById('home');
let sunset = null;

// Defined at module level so the unified scroll handler below can call it
const updateScroll = () => {
  if (!sunset || !heroSection) return;
  const heroH = heroSection.offsetHeight;
  sunset.setScroll(window.scrollY / heroH);
};

if (heroCanvas && heroSection) {
  sunset = new SunsetCanvas(heroCanvas);
  sunset.setTheme(document.documentElement.classList.contains('dark'));

  // J1: Pause canvas loop when hero scrolls out of view — saves battery on mobile
  const heroObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!sunset.running && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sunset.running = true;
        sunset._loop();
      }
    } else {
      sunset.running = false;
    }
  });
  heroObserver.observe(heroSection);

  updateScroll();
}

/* =========================================================
   2. NAV: scroll state + hamburger
   ========================================================= */
const navHeader = document.getElementById('nav-header');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

const setNavScrolled = () => {
  if (!heroSection) return; // Don't toggle on pages without a hero
  navHeader.classList.toggle('scrolled', window.scrollY > 50);
};

// J2: Single scroll handler — replaces two separate listeners
const handleScroll = () => {
  updateScroll();
  setNavScrolled();
};

window.addEventListener('scroll', handleScroll, { passive: true });
setNavScrolled();

// J3: Outside-click listener — defined once, added only when menu opens,
// removes itself on close to avoid firing on every page click
const closeOnOutsideClick = (e) => {
  if (!navHeader.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('click', closeOnOutsideClick);
  }
};

// Hamburger toggle
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  // Defer by one tick so this click doesn't immediately trigger closeOnOutsideClick
  if (open) {
    setTimeout(() => document.addEventListener('click', closeOnOutsideClick), 0);
  } else {
    document.removeEventListener('click', closeOnOutsideClick);
  }
});

// Close on nav link click
navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('click', closeOnOutsideClick);
  });
});

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && hamburger.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('click', closeOnOutsideClick);
    hamburger.focus(); // Return focus to the trigger element
  }
});

// Clean up mobile menu state if viewport resizes past the breakpoint
window.addEventListener('resize', () => {
  if (window.innerWidth > 860 && hamburger.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('click', closeOnOutsideClick);
  }
}, { passive: true });

/* =========================================================
   3. SCROLL-IN ANIMATIONS (IntersectionObserver)
   ========================================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in, .stagger-in').forEach(el => io.observe(el));

/* =========================================================
   4. SMOOTH SCROLL for anchor links
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================================
   5. CONTACT FORM VALIDATION
   ========================================================= */
const form      = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');

if (form) {
  const fields = {
    name:    { el: document.getElementById('name'),    err: document.getElementById('name-error'),    check: v => v.trim().length >= 2,            msg: 'Please enter your full name.' },
    firm:    { el: document.getElementById('firm'),    err: document.getElementById('firm-error'),    check: v => v.trim().length >= 2,            msg: 'Please enter your firm name.' },
    email:   { el: document.getElementById('email'),   err: document.getElementById('email-error'),   check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
    message: { el: document.getElementById('message'), err: document.getElementById('message-error'), check: v => v.trim().length >= 20,           msg: 'Please add a little more detail (20+ characters).' },
  };

  const validateField = key => {
    const f = fields[key];
    const ok = f.check(f.el.value);
    f.el.classList.toggle('error', !ok);
    f.el.setAttribute('aria-invalid', String(!ok));
    f.err.textContent = ok ? '' : f.msg;
    return ok;
  };

  // Initialise aria-invalid on page load (WCAG best practice)
  Object.values(fields).forEach(f => f.el.setAttribute('aria-invalid', 'false'));

  Object.keys(fields).forEach(k => {
    fields[k].el.addEventListener('blur',  () => validateField(k));
    fields[k].el.addEventListener('input', () => {
      if (fields[k].el.classList.contains('error')) validateField(k);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const valid = Object.keys(fields).map(k => validateField(k)).every(Boolean);
    if (!valid) {
      const first = Object.values(fields).find(f => f.el.classList.contains('error'));
      if (first) first.el.focus();
      return;
    }

    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;
    formSuccess.classList.remove('visible');

    try {
      const res = await fetch('https://formspree.io/f/mqeggegw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name:    fields.name.el.value.trim(),
          firm:    fields.firm.el.value.trim(),
          email:   fields.email.el.value.trim(),
          phone:   document.getElementById('phone').value.trim(),
          message: fields.message.el.value.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 422) throw new Error('Validation error');
        if (res.status === 429) throw new Error('Rate limited');
        throw new Error(data.error || 'Submission failed');
      }

      form.reset();
      Object.values(fields).forEach(f => f.el.setAttribute('aria-invalid', 'false'));
      formSuccess.textContent = '✓  Thank you — we\'ve received your message and will be in touch within one business day.';
      formSuccess.style.cssText = '';
      formSuccess.classList.add('visible');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch {
      formSuccess.textContent = 'Something went wrong — please email us directly at usman@legacywebstudio.co.uk';
      formSuccess.style.background = '#FFF5F5';
      formSuccess.style.borderColor = '#FCA5A5';
      formSuccess.style.color = '#DC2626';
      formSuccess.classList.add('visible');
    } finally {
      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
    }
  });
}

/* =========================================================
   6. FOOTER YEAR
   ========================================================= */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================================================
   7. DARK MODE TOGGLE
   ========================================================= */
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  // Sync toggle state with current class on <html>
  themeToggle.checked = document.documentElement.classList.contains('dark');

  themeToggle.addEventListener('change', () => {
    const dark = themeToggle.checked;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (sunset) sunset.setTheme(dark);
    if (ambientBg) ambientBg.setTheme(dark);
  });

  // Listen for system preference changes (only when no stored preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.toggle('dark', e.matches);
      themeToggle.checked = e.matches;
      if (sunset) sunset.setTheme(e.matches);
      if (ambientBg) ambientBg.setTheme(e.matches);
    }
  });
}

/* =========================================================
   8. AMBIENT SECTION BACKGROUNDS
   Light mode: drifting gradient orbs (2–4 % opacity)
   Dark mode:  twinkling starfield + occasional shooting star
   Each eligible section has its own canvas as first child.
   Skipped entirely when prefers-reduced-motion is set.
   ========================================================= */
let ambientBg = null;

class AmbientBackground {
  constructor() {
    this.isDark  = document.documentElement.classList.contains('dark');
    this.time    = 0;
    this.running = false;
    this.dpr     = Math.min(window.devicePixelRatio || 1, 2);

    // Collect all section canvases
    this.sections = [];
    document.querySelectorAll('.ambient-section-canvas').forEach((canvas, i) => {
      const section = canvas.parentElement;
      const starsOnly = section.classList.contains('hero') || section.classList.contains('services');
      this.sections.push({
        canvas,
        ctx: canvas.getContext('2d'),
        section,
        visible: false,
        index: i,
        starsOnly,
        w: 0,
        h: 0,
        stars: this._generateStarsForSection(30 + Math.floor(Math.random() * 6)),
        orbs:  starsOnly ? [] : this._generateOrbsForSection(i),
      });
    });

    // Shooting star state — rendered on first visible section only
    this.shootingStar       = null;
    this.nextShootingStarAt = this._randomShootingDelay();

    this._setupObserver();
    this._resize();

    this._resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._resize(), 150);
    }, { passive: true });
  }

  // ── Star generation (per section) ────────────────────────
  _generateStarsForSection(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const period = (3 + Math.random() * 5) * 60 * 0.004;
      stars.push({
        nx:     Math.random(),
        ny:     Math.random(),
        radius: 0.5 + Math.random() * 1.5,
        phase:  Math.random() * Math.PI * 2,
        speed:  (2 * Math.PI) / period,
      });
    }
    return stars;
  }

  // ── Orb generation (per section) ─────────────────────────
  _generateOrbsForSection(index) {
    const configs = [
      // Section 0 (hero): starsOnly — not used
      [],
      // Section 1 (why-us): 2 orbs
      [
        { bx: 0.25, by: 0.35, rs: 0.36, speed: 0.50, phase: 0.0, r: 234, g:  88, b:  12, a: 0.075 },
        { bx: 0.75, by: 0.65, rs: 0.31, speed: 0.40, phase: 2.0, r: 245, g: 158, b:  11, a: 0.065 },
      ],
      // Section 2 (services): starsOnly — not used
      [],
      // Section 3 (portfolio): 2 orbs
      [
        { bx: 0.65, by: 0.30, rs: 0.34, speed: 0.45, phase: 1.2, r:  74, g:  20, b: 140, a: 0.055 },
        { bx: 0.30, by: 0.70, rs: 0.32, speed: 0.55, phase: 3.5, r: 253, g: 213, b: 178, a: 0.085 },
      ],
      // Section 4 (about): 3 orbs
      [
        { bx: 0.20, by: 0.40, rs: 0.30, speed: 0.48, phase: 0.8, r: 194, g:  65, b:  12, a: 0.055 },
        { bx: 0.70, by: 0.25, rs: 0.28, speed: 0.60, phase: 4.0, r: 234, g:  88, b:  12, a: 0.065 },
        { bx: 0.50, by: 0.75, rs: 0.32, speed: 0.35, phase: 5.5, r: 245, g: 158, b:  11, a: 0.075 },
      ],
      // Section 5 (contact): 2 orbs
      [
        { bx: 0.80, by: 0.45, rs: 0.34, speed: 0.42, phase: 2.5, r:  74, g:  20, b: 140, a: 0.055 },
        { bx: 0.15, by: 0.60, rs: 0.30, speed: 0.52, phase: 4.8, r: 253, g: 213, b: 178, a: 0.085 },
      ],
    ];
    return configs[index] || configs[1];
  }

  // ── Public API ───────────────────────────────────────────
  setTheme(isDark) {
    this.isDark = isDark;
    if (!isDark) this.shootingStar = null; // cancel active shooting star on switch to light
  }

  // ── IntersectionObserver ─────────────────────────────────
  _setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sec = this.sections.find(s => s.section === entry.target);
        if (sec) sec.visible = entry.isIntersecting;
      });
      const anyVisible = this.sections.some(s => s.visible);
      if (anyVisible && !this.running) {
        this.running = true;
        this._loop();
      } else if (!anyVisible) {
        this.running = false;
      }
    }, { threshold: 0 });

    this.sections.forEach(s => observer.observe(s.section));
  }

  // ── Resize ───────────────────────────────────────────────
  _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.sections.forEach(s => {
      const w = s.section.offsetWidth;
      const h = s.section.offsetHeight;
      s.w = w;
      s.h = h;
      s.canvas.width  = w * this.dpr;
      s.canvas.height = h * this.dpr;
    });
  }

  // ── Animation loop ───────────────────────────────────────
  _loop() {
    if (!this.running) return;
    this.time += 0.004;
    this._draw();
    requestAnimationFrame(() => this._loop());
  }

  _draw() {
    const t = this.time;

    // Determine which section gets the shooting star (first visible)
    const shootingTarget = this.isDark
      ? this.sections.find(s => s.visible) || null
      : null;

    // Spawn shooting star when timer expires (dark mode only)
    if (this.isDark && shootingTarget && !this.shootingStar && t >= this.nextShootingStarAt) {
      this._spawnShootingStar(shootingTarget);
      this.nextShootingStarAt = t + this._randomShootingDelay();
    }

    this.sections.forEach(sec => {
      if (!sec.visible) return;

      const { ctx, w, h } = sec;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (this.isDark) {
        this._drawDarkStars(sec);
        if (sec === shootingTarget) this._drawShootingStar(sec);
      } else if (!sec.starsOnly) {
        this._drawLightOrbs(sec);
      }
    });
  }

  // ── Light mode — drifting gradient orbs ──────────────────
  _drawLightOrbs(sec) {
    const { ctx, w, h } = sec;
    const t    = this.time;
    const base = Math.min(w, h);

    sec.orbs.forEach(orb => {
      const fx = Math.sin(t * orb.speed       + orb.phase) * 0.05;
      const fy = Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.04;

      const x = (orb.bx + fx) * w;
      const y = (orb.by + fy) * h;
      const r = orb.rs * base;

      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(${orb.r},${orb.g},${orb.b},${orb.a})`);
      g.addColorStop(0.7, `rgba(${orb.r},${orb.g},${orb.b},0)`);
      g.addColorStop(1,   `rgba(${orb.r},${orb.g},${orb.b},0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ── Dark mode — twinkling starfield ──────────────────────
  _drawDarkStars(sec) {
    const { ctx, w, h } = sec;
    const t = this.time;

    sec.stars.forEach(star => {
      const x = star.nx * w;
      const y = star.ny * h;
      // Opacity oscillates between 0.15 and 0.60 on a sine wave
      const opacity = 0.375 + 0.225 * Math.sin(t * star.speed + star.phase);

      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
      ctx.fill();
    });
  }

  // ── Dark mode — shooting star ────────────────────────────
  _randomShootingDelay() {
    // 8–15 s × 60 fps × 0.004 time-units/frame = 1.92–3.60 time-units
    return (8 + Math.random() * 7) * 60 * 0.004;
  }

  _spawnShootingStar(sec) {
    const angleDeg = 30 + Math.random() * 15;          // 30–45 °
    const angle    = angleDeg * Math.PI / 180;
    const speed    = sec.w * 0.010;                    // crosses ~40 % of width in ~0.8 s
    this.shootingStar = {
      x:  sec.w * (0.4 + Math.random() * 0.6),         // start right 60 %
      y:  sec.h * Math.random() * 0.3,                  // start top 30 %
      vx: -Math.cos(angle) * speed,                     // always left
      vy:  Math.sin(angle) * speed,                     // always down
    };
  }

  _drawShootingStar(sec) {
    const ss = this.shootingStar;
    if (!ss) return;

    // Advance position by one frame
    ss.x += ss.vx;
    ss.y += ss.vy;

    // Remove when fully off canvas
    if (ss.x < -100 || ss.y > sec.h + 100) {
      this.shootingStar = null;
      return;
    }

    // Tail: 50 px behind the head, fading to transparent
    const mag = Math.hypot(ss.vx, ss.vy);
    const tailLength = 50;
    const tx = ss.x - (ss.vx / mag) * tailLength;
    const ty = ss.y - (ss.vy / mag) * tailLength;

    const grad = sec.ctx.createLinearGradient(tx, ty, ss.x, ss.y);
    grad.addColorStop(0, 'rgba(94,234,212,0)');          // tail tip — transparent
    grad.addColorStop(1, 'rgba(94,234,212,0.7)');        // head — teal

    sec.ctx.save();
    sec.ctx.beginPath();
    sec.ctx.moveTo(tx, ty);
    sec.ctx.lineTo(ss.x, ss.y);
    sec.ctx.strokeStyle = grad;
    sec.ctx.lineWidth   = 1.0;
    sec.ctx.lineCap     = 'round';
    sec.ctx.stroke();
    sec.ctx.restore();
  }
}

// Instantiate — skip entirely when reduced motion is active
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  if (document.querySelector('.ambient-section-canvas')) {
    ambientBg = new AmbientBackground();
  }
}
