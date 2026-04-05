# Legacy Web Studio — Dark Mode (Aurora Theme) Implementation

> **Purpose:** Complete specification for adding a toggleable dark mode to the Legacy Web Studio website. This file is designed to be read by Claude Code alongside the existing codebase.
>
> **Architecture:** Pure vanilla HTML, CSS, JavaScript. No frameworks, no build tools, no npm.
>
> **Files affected:** `index.html`, `privacy.html`, `css/style.css`, `js/main.js`

---

## 1. Overview

The site currently has a "sunset" light theme (warm purples, oranges, cream backgrounds). This implementation adds an "aurora" dark theme (deep space blues, teal and violet accents) that the user can toggle via an animated sun/moon switch in the navigation header.

The dark mode is **class-based** (`body.dark`), not purely `prefers-color-scheme`. The toggle sets the class, stores the preference in `localStorage`, and on page load checks `localStorage` first, then falls back to the user's system preference.

---

## 2. Toggle Component

### 2.1 Placement

The toggle goes in the `<ul class="nav__links">` list, as a new `<li>` element positioned **between the last pill link (About) and the CTA button (Book a Call)**.

Current order:
```
Why Us | Services | Portfolio | About | Book a Call
```

New order:
```
Why Us | Services | Portfolio | About | [toggle] | Book a Call
```

### 2.2 Toggle HTML

Insert this as a new `<li>` in the nav links list, immediately before the Book a Call `<li>`:

```html
<li class="nav__theme-toggle">
  <label class="theme-switch" aria-label="Toggle dark mode">
    <input type="checkbox" class="theme-switch__checkbox" id="theme-toggle">
    <div class="theme-switch__container">
      <div class="theme-switch__clouds"></div>
      <div class="theme-switch__stars-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
        </svg>
      </div>
      <div class="theme-switch__circle-container">
        <div class="theme-switch__sun-moon-container">
          <div class="theme-switch__moon">
            <div class="theme-switch__spot"></div>
            <div class="theme-switch__spot"></div>
            <div class="theme-switch__spot"></div>
          </div>
        </div>
      </div>
    </div>
  </label>
</li>
```

**Important:** Add the same toggle HTML to `privacy.html` in the same position within its `nav__links` list.

### 2.3 Toggle CSS

Add the full toggle CSS block to `style.css`. The colours must be rebranded to match the site:

**Key colour overrides from the original component:**
- `--container-light-bg`: Change from `#3D7EAE` (sky blue) to `#D97706` (sunset amber — matches the warm theme)
- `--container-night-bg`: Change from `#1D1F2C` to `#0B0D17` (deep space — matches aurora theme)
- `--sun-bg`: Change from `#ECCA2F` to `#F59E0B` (sunset gold — matches `--sunset-gold`)
- `--clouds-color`: Change from `#F3FDFF` to `#FEE8D6` (peach — warm-tinted clouds)
- `--back-clouds-color`: Change from `#AACADF` to `#D97706` (amber — warm back-clouds)
- `--toggle-size`: Set to `16px` (scaled down from default 30px to fit nav)

**All other toggle styles** from the provided Uiverse CSS should be included as-is, just with these colour overrides applied.

**Additional toggle positioning styles needed:**

```css
.nav__theme-toggle {
  display: flex;
  align-items: center;
}
```

**Mobile menu behaviour:** Inside `@media (max-width: 860px)`, the toggle should remain visible in the mobile menu overlay. Add:

```css
@media (max-width: 860px) {
  .nav__theme-toggle {
    order: -1; /* Move toggle to top of mobile menu, or keep in flow — test both */
  }
}
```

---

## 3. Aurora Dark Mode Palette

All dark mode colours are applied via a `body.dark` selector that overrides CSS custom properties.

### 3.1 Token Overrides

Add this block at the end of `style.css`, before the `/* ---- PRINT ---- */` section:

```css
/* ---- DARK MODE (Aurora Theme) ---- */
body.dark {
  /* Backgrounds */
  --cream:         #0B0D17;
  --sand:          #111827;
  --peach:         #1A1F2E;
  --peach-deep:    #252A3A;

  /* Text */
  --text-dark:     #F1F5F9;
  --text-warm:     #E2E8F0;
  --text-muted:    #94A3B8;
  --text-light:    rgba(241,245,249,0.88);
  --text-light-dim: rgba(241,245,249,0.58);

  /* Borders */
  --border-warm:   rgba(255,255,255,0.08);

  /* Accent shifts — sunset to aurora */
  --sunset-deep:    #0B0D17;
  --sunset-indigo:  #1A1F2E;
  --sunset-purple:  #8B5CF6;
  --sunset-grape:   #A78BFA;
  --sunset-coral:   #2DD4BF;
  --sunset-orange:  #2DD4BF;
  --sunset-amber:   #34D399;
  --sunset-gold:    #5EEAD4;

  /* Shadows — darker, cooler */
  --sh-sm: 0 2px 8px  rgba(0, 0, 0, 0.3);
  --sh-md: 0 6px 24px rgba(0, 0, 0, 0.4);
  --sh-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  --sh-coral: 0 8px 32px rgba(45, 212, 191, 0.2);
  --sh-purple: 0 8px 28px rgba(139, 92, 246, 0.2);

  /* State */
  --success: #34D399;
  --error:   #F87171;
}
```

### 3.2 Component-Specific Dark Overrides

Some elements use hardcoded colours (not tokens) and need explicit dark mode rules. Add these inside or after the `body.dark` block:

```css
/* Nav — dark mode */
body.dark .nav-header.scrolled {
  background: rgba(11, 13, 23, 0.95);
  box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3);
}

body.dark .nav-header.scrolled .nav__hamburger span {
  background: #E2E8F0;
}

body.dark .nav-header.scrolled .logo-legacy {
  fill: #F1F5F9;
}

body.dark .logo-sub {
  fill: #A78BFA; /* violet in dark mode */
}

/* Hero overlay — adjust for dark palette */
body.dark .hero__overlay {
  background: linear-gradient(
    to right,
    rgba(11, 13, 23, 0.7) 0%,
    rgba(11, 13, 23, 0.35) 55%,
    rgba(11, 13, 23, 0.0) 100%
  );
}

/* Cards — dark surfaces */
body.dark .why-card {
  background: #1E2235;
  border-color: rgba(255,255,255,0.06);
}

body.dark .why-card:hover {
  border-color: rgba(45, 212, 191, 0.2);
}

body.dark .why-card__icon-wrap {
  background: rgba(45, 212, 191, 0.1);
  color: #2DD4BF;
}

/* Services — dark section already uses deep colours, but update tags */
body.dark .service-item__tags li {
  color: #5EEAD4;
  background: rgba(94, 234, 212, 0.1);
  border-color: rgba(94, 234, 212, 0.2);
}

/* Portfolio cards */
body.dark .portfolio-card {
  background: #1E2235;
  border-color: rgba(255,255,255,0.06);
}

body.dark .portfolio-card__tag {
  background: rgba(0,0,0,0.5);
}

/* About stats */
body.dark .about__stat {
  background: #1E2235;
  border-color: rgba(255,255,255,0.06);
}

/* Contact form */
body.dark .contact__form {
  background: #1E2235;
  border-color: rgba(255,255,255,0.06);
}

body.dark .form__input,
body.dark .form__textarea {
  background: #0B0D17;
  border-color: rgba(255,255,255,0.1);
  color: #F1F5F9;
}

body.dark .form__input::placeholder,
body.dark .form__textarea::placeholder {
  color: #64748B;
}

body.dark .form__input:focus,
body.dark .form__textarea:focus {
  border-color: #2DD4BF;
  background: #111827;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
}

body.dark .form__success {
  background: rgba(52, 211, 153, 0.1);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34D399;
}

/* Footer — already dark, but adjust for aurora palette */
body.dark .footer {
  background: linear-gradient(to bottom, #0B0D17 0px, #060810 80px, #060810 100%);
}

body.dark .footer__logo-svg text:first-child {
  fill: #F1F5F9 !important;
}

body.dark .footer__logo-svg text:last-child {
  fill: #A78BFA !important;
}

/* Buttons — teal in dark mode */
body.dark .btn--warm {
  background: #2DD4BF;
  color: #0B0D17;
  box-shadow: 0 8px 32px rgba(45, 212, 191, 0.25);
}

body.dark .btn--warm:hover {
  background: #5EEAD4;
  color: #0B0D17;
  box-shadow: 0 14px 40px rgba(45, 212, 191, 0.35);
}

body.dark .btn--outline-light {
  border-color: rgba(255,255,255,0.3);
}

body.dark .btn--outline-light:hover {
  border-color: #5EEAD4;
  background: rgba(45, 212, 191, 0.1);
  color: #5EEAD4;
}

/* CTA in nav */
body.dark .nav__link--cta {
  background: #2DD4BF;
  color: #0B0D17 !important;
}

body.dark .nav__link--cta:hover {
  background: #5EEAD4;
  color: #0B0D17 !important;
}

/* Skip link */
body.dark .skip-link {
  background: #2DD4BF;
  color: #0B0D17;
}

/* Privacy page */
body.dark .privacy-toc {
  background: #1E2235;
  border-color: rgba(255,255,255,0.06);
}

body.dark .privacy-contact-box {
  background: #1A1F2E;
  border-color: rgba(255,255,255,0.06);
  border-left-color: #2DD4BF;
}

body.dark .privacy-contact-box p {
  color: #E2E8F0 !important;
}

body.dark .privacy-table th {
  background: #1A1F2E;
  color: #F1F5F9;
  border-bottom-color: rgba(255,255,255,0.1);
}

body.dark .privacy-table td {
  border-bottom-color: rgba(255,255,255,0.06);
  color: #94A3B8;
}

body.dark .privacy-table tr:nth-child(even) td {
  background: rgba(255,255,255,0.02);
}
```

---

## 4. Section Gradient Transitions

### 4.1 Light Mode — Extend Existing Gradients

The current 80px gradient blends between sections are too short and appear as hard colour cuts. Increase all gradient transitions to **200px** for a smooth, atmospheric feel.

Update every section gradient in `style.css`. Here are the specific rules to change:

```css
/* Why Us: hero dark → cream */
.why-us {
  background: linear-gradient(to bottom, var(--sunset-deep) 0px, var(--cream) 200px, var(--cream) 100%);
}

/* Services: cream → deep */
.section--deep {
  background: linear-gradient(to bottom, var(--cream) 0px, var(--sunset-deep) 200px, var(--sunset-deep) 100%);
}

/* Portfolio: deep → sand */
.portfolio {
  background: linear-gradient(to bottom, var(--sunset-deep) 0px, var(--sand) 200px, var(--sand) 100%);
}

/* About: sand → warm accent (keep the layered gradient but extend the top blend) */
.section--warm-accent {
  background:
    linear-gradient(to bottom, var(--sand) 0px, transparent 200px),
    linear-gradient(135deg, #FFF3E0 0%, #FEE8D6 50%, #FDD5B2 100%);
}

/* Contact: peach → cream */
.contact {
  background: linear-gradient(to bottom, #FDD5B2 0px, var(--cream) 200px, var(--cream) 100%);
}

/* Footer: cream → dark */
.footer {
  background: linear-gradient(to bottom, var(--cream) 0px, #0F0805 200px, #0F0805 100%);
}
```

### 4.2 Dark Mode — Aurora Section Gradients

In dark mode, sections should blend through deep space colours. Add these overrides inside the dark mode CSS:

```css
body.dark .why-us {
  background: linear-gradient(to bottom, var(--sunset-deep) 0px, var(--cream) 200px, var(--cream) 100%);
}

body.dark .section--deep {
  background: linear-gradient(to bottom, var(--cream) 0px, #0F1629 200px, #0F1629 100%);
  color: var(--text-light);
}

body.dark .portfolio {
  background: linear-gradient(to bottom, #0F1629 0px, var(--sand) 200px, var(--sand) 100%);
}

body.dark .section--warm-accent {
  background: linear-gradient(to bottom, var(--sand) 0px, #1A1F2E 200px, #1A1F2E 100%);
}

body.dark .contact {
  background: linear-gradient(to bottom, #1A1F2E 0px, var(--cream) 200px, var(--cream) 100%);
}

body.dark .footer {
  background: linear-gradient(to bottom, var(--cream) 0px, #060810 200px, #060810 100%);
}

/* Calendly banner — aurora version */
body.dark .contact__calendly-banner {
  background: linear-gradient(135deg, #1A1F2E 0%, #252A3A 50%, rgba(45, 212, 191, 0.15) 100%);
  box-shadow: 0 8px 28px rgba(0,0,0,0.4);
}
```

---

## 5. JavaScript — Toggle Logic

Add this to `main.js`, in a new section after the Footer Year block (Section 6). This handles the toggle, localStorage persistence, and system preference fallback.

```javascript
/* =========================================================
   7. DARK MODE TOGGLE
   ========================================================= */
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  // Check stored preference, then system preference
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored === 'dark' || (!stored && prefersDark);

  if (isDark) {
    document.body.classList.add('dark');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', () => {
    const dark = themeToggle.checked;
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  // Listen for system preference changes (if no stored preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.body.classList.toggle('dark', e.matches);
      themeToggle.checked = e.matches;
    }
  });
}
```

**Critical: Prevent flash of wrong theme on page load.**

In both `index.html` and `privacy.html`, add this inline script in the `<head>`, immediately after the `<link rel="stylesheet">` tags and before `</head>`:

```html
<script>
  (function() {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

**Important:** This script uses `document.documentElement` (i.e., `<html>`) rather than `document.body` because the body hasn't loaded yet at this point. So the CSS selector needs to work for BOTH `body.dark` and `html.dark`. The simplest approach: use `.dark` as the selector prefix (which matches either), OR use `html.dark` in CSS and have the main.js toggle also toggle on `documentElement`. 

**Recommended approach:** Use `document.body` everywhere in main.js (toggle on body), but in the head script, set the class on BOTH html and body isn't possible (body doesn't exist yet). Instead:

- The head script adds `.dark` to `<html>`.
- The main.js toggle adds/removes `.dark` on `<body>`.
- All CSS dark mode selectors use `body.dark` — BUT also add a duplicate top-level rule: `html.dark { color-scheme: dark; }` and ensure the `:root` overrides work with `.dark` on html.

**Simplest correct approach:** Change ALL CSS selectors from `body.dark` to `.dark` (no element prefix). The head script adds `.dark` to `document.documentElement`. The main.js toggle adds/removes `.dark` on `document.documentElement` (not body). This way the class is always on `<html>` and works both in the head script and in main.js.

Update the JS in Section 5 above accordingly — replace `document.body.classList` with `document.documentElement.classList` everywhere.

---

## 6. Mobile Menu Considerations

In the mobile overlay menu, the toggle should be visible and functional. It should appear as a standalone element within the mobile menu, not hidden or cramped.

The `.nav__theme-toggle` li should NOT have the pill reset styles applied. It keeps its toggle appearance in both desktop and mobile views.

Add inside `@media (max-width: 860px)`:

```css
.nav__theme-toggle .theme-switch {
  /* Keep toggle appearance in mobile menu — do not reset */
}
```

---

## 7. Contrast Verification Checklist

After implementation, verify the following pass WCAG AA (4.5:1 for body text, 3:1 for large text):

- [ ] Body text (`#E2E8F0` on `#0B0D17`) — should pass easily
- [ ] Muted text (`#94A3B8` on `#0B0D17`) — verify
- [ ] Muted text (`#94A3B8` on `#1E2235` cards) — verify
- [ ] Teal buttons (`#2DD4BF` text `#0B0D17`) — verify
- [ ] Heading text (`#F1F5F9` on `#0B0D17`) — should pass easily
- [ ] Footer text (inherited opacities on `#060810`) — verify

If any fail, increase lightness of the text colour or darken the surface until AA is met.

---

## 8. Things NOT to Change

- The canvas animation colours — they already work on both light and dark backgrounds since they use screen blend mode
- The hero section's base structure — it's already dark-on-dark
- Print styles — they should always use light colours regardless of dark mode
- The `prefers-reduced-motion` block — leave as-is
- Any deferred items from the IMPROVEMENTS.md living record

---

## 9. Testing Checklist

After implementation:

- [ ] Toggle works on index.html — switches classes, updates localStorage
- [ ] Toggle works on privacy.html — reads localStorage, shows correct state
- [ ] Navigating from index.html to privacy.html preserves the dark/light state
- [ ] System preference fallback works when no localStorage value is set
- [ ] No flash of wrong theme on page load (head script runs before paint)
- [ ] All section gradients transition smoothly (200px blends, no hard cuts)
- [ ] Canvas animation still looks correct in dark mode
- [ ] All text is readable against dark backgrounds (contrast check)
- [ ] Mobile menu toggle is visible and functional
- [ ] Form inputs, placeholders, and error states look correct in dark mode
- [ ] Footer is readable in dark mode
- [ ] Privacy page (table, contact boxes, TOC) renders correctly in dark mode
- [ ] Buttons (warm CTA, outline, nav CTA) all look correct in dark mode
- [ ] The toggle itself is correctly coloured (sunset amber in light, deep space in dark)
