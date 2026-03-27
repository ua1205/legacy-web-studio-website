/* ============================================================
   LEGACY WEB STUDIO — Main JavaScript
   ============================================================ */

'use strict';

/* ---- NAV SCROLL BEHAVIOUR ---- */
const navHeader = document.getElementById('nav-header');

const handleNavScroll = () => {
  navHeader.classList.toggle('scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ---- MOBILE HAMBURGER ---- */
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on nav link click
navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navHeader.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ---- INTERSECTION OBSERVER ANIMATIONS ---- */
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up, .fade-up-stagger').forEach(el => {
  observer.observe(el);
});

/* ---- CONTACT FORM VALIDATION & SUBMISSION ---- */
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');

const validators = {
  name: {
    el:    document.getElementById('name'),
    err:   document.getElementById('name-error'),
    check: v => v.trim().length >= 2,
    msg:   'Please enter your full name.',
  },
  firm: {
    el:    document.getElementById('firm'),
    err:   document.getElementById('firm-error'),
    check: v => v.trim().length >= 2,
    msg:   'Please enter your firm name.',
  },
  email: {
    el:    document.getElementById('email'),
    err:   document.getElementById('email-error'),
    check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    msg:   'Please enter a valid email address.',
  },
  message: {
    el:    document.getElementById('message'),
    err:   document.getElementById('message-error'),
    check: v => v.trim().length >= 20,
    msg:   'Please tell us a little more about your firm (at least 20 characters).',
  },
};

const validateField = (key) => {
  const { el, err, check, msg } = validators[key];
  const valid = check(el.value);
  el.classList.toggle('error', !valid);
  err.textContent = valid ? '' : msg;
  return valid;
};

// Live validation on blur
Object.keys(validators).forEach(key => {
  validators[key].el.addEventListener('blur', () => validateField(key));
  validators[key].el.addEventListener('input', () => {
    if (validators[key].el.classList.contains('error')) validateField(key);
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate all fields
  const results = Object.keys(validators).map(k => validateField(k));
  if (results.includes(false)) {
    // Focus first invalid field
    const firstInvalid = Object.values(validators).find(v => v.el.classList.contains('error'));
    if (firstInvalid) firstInvalid.el.focus();
    return;
  }

  // Set loading state
  submitBtn.classList.add('btn--loading');
  submitBtn.disabled = true;
  successMsg.classList.remove('visible');

  try {
    // Collect form data
    const data = {
      name:    validators.name.el.value.trim(),
      firm:    validators.firm.el.value.trim(),
      email:   validators.email.el.value.trim(),
      phone:   document.getElementById('phone').value.trim(),
      message: validators.message.el.value.trim(),
    };

    // -------------------------------------------------------
    // TODO: Replace this fetch with your actual endpoint.
    // Options: Formspree, Netlify Forms, EmailJS, or a
    // serverless function that sends via your Google Workspace.
    // Example Formspree endpoint:
    //   const res = await fetch('https://formspree.io/f/YOUR_ID', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    //     body: JSON.stringify(data),
    //   });
    // -------------------------------------------------------

    // DEMO: simulate a 1.2s network request
    await new Promise(resolve => setTimeout(resolve, 1200));

    // On success
    form.reset();
    successMsg.textContent = '✓ Thank you — we\'ve received your enquiry and will be in touch within one business day.';
    successMsg.classList.add('visible');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    successMsg.textContent = 'Something went wrong. Please email us directly at usman@legacywebstudio.co.uk';
    successMsg.style.background = '#ffebee';
    successMsg.style.borderColor = '#ef9a9a';
    successMsg.style.color = '#c62828';
    successMsg.classList.add('visible');
  } finally {
    submitBtn.classList.remove('btn--loading');
    submitBtn.disabled = false;
  }
});

/* ---- FOOTER YEAR ---- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- SMOOTH SCROLL POLYFILL FOR OLDER BROWSERS ---- */
// Only applied to anchor clicks (native scroll-behavior handles modern browsers)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
