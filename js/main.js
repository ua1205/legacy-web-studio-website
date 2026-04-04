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
    this.w = 0;
    this.h = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Orbs: bx/by = base position (0–1), r = radius fraction,
    // c0 = dawn colour, c1 = dusk colour, speed/phase = float params
    this.orbs = [
      { bx:0.72, by:0.40, r:0.50, c0:[74,20,140],   c1:[212,70,10],   s:0.60, p:0.00 },
      { bx:0.88, by:0.68, r:0.43, c0:[148,24,138],  c1:[238,130,6],   s:0.45, p:1.25 },
      { bx:0.55, by:0.82, r:0.38, c0:[224,60,20],   c1:[245,155,6],   s:0.80, p:2.50 },
      { bx:0.80, by:0.18, r:0.30, c0:[44,26,100],   c1:[168,22,148],  s:0.55, p:3.75 },
      { bx:0.42, by:0.55, r:0.28, c0:[100,10,80],   c1:[195,80,10],   s:0.70, p:5.00 },
    ];

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

    // Scale for DPR
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ── Background gradient ──────────────────────────────
    //   dawn (sp=0): deep indigo → purple → magenta
    //   dusk (sp=1): dark navy  → coral  → amber
    const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);

    const s0 = this._lc([28, 10, 70],   [12,  5, 30],  sp);
    const s1 = this._lc([74, 20, 140],  [100, 15,  5], sp);
    const s2 = this._lc([155,27, 140],  [210, 75, 10], sp);
    const s3 = this._lc([210,60,  30],  [240,140,  6], sp);

    bg.addColorStop(0,    `rgb(${s0})`);
    bg.addColorStop(0.30, `rgb(${s1})`);
    bg.addColorStop(0.65, `rgb(${s2})`);
    bg.addColorStop(1,    `rgb(${s3})`);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // ── Orbs (screen blend — additive light) ────────────
    ctx.globalCompositeOperation = 'screen';

    this.orbs.forEach((orb, i) => {
      const fx = Math.sin(t * orb.s       + orb.p) * 0.038;
      const fy = Math.cos(t * orb.s * 0.7 + orb.p) * 0.030;

      // Scroll shifts orbs: even-indexed drift right/down, odd drift left/down
      const sdx = sp * 0.08 * (i % 2 === 0 ?  0.6 : -0.4);
      const sdy = sp * 0.06;

      const x = (orb.bx + fx + sdx) * w;
      const y = (orb.by + fy + sdy) * h;
      const r = orb.r * Math.min(w, h) * (1 + sp * 0.12);

      const [cr, cg, cb] = this._lc(orb.c0, orb.c1, sp);

      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(${cr},${cg},${cb},0.62)`);
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
    const [hr, hgr, hb] = this._lc([255,175,90], [255,200,50], sp);
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
