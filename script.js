/* ============================================================
   BSCP.ONLINE — script.js
   Progress Bar | Dark Mode | Language Switcher | ROI Calc
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. PROGRESS BAR ───────────────────────────────────── */
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    const docH = document.documentElement.scrollHeight;
    const viewH = window.innerHeight;
    const scrolled = window.scrollY;
    const pct = Math.round((scrolled / (docH - viewH)) * 100);
    progressBar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();


  /* ── 2. DARK MODE TOGGLE ───────────────────────────────── */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.setAttribute('data-theme', savedTheme);

  const iconSun  = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  function applyThemeIcons(theme) {
    if (!iconSun || !iconMoon) return;
    iconSun.style.display  = theme === 'dark' ? 'block' : 'none';
    iconMoon.style.display = theme === 'dark' ? 'none'  : 'block';
  }
  applyThemeIcons(savedTheme);

  document.querySelectorAll('.js-theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      applyThemeIcons(next);
    });
  });


  /* ── 3. LANGUAGE SWITCHER ──────────────────────────────── */
  let currentLang = localStorage.getItem('lang') || 'de';

  function applyLang(lang) {
    document.querySelectorAll('[data-de]').forEach(el => {
      el.textContent = el.getAttribute(`data-${lang}`) || el.textContent;
    });
    document.querySelectorAll('[data-de-html]').forEach(el => {
      el.innerHTML = el.getAttribute(`data-${lang}-html`) || el.innerHTML;
    });
    document.querySelectorAll('[data-de-placeholder]').forEach(el => {
      el.placeholder = el.getAttribute(`data-${lang}-placeholder`) || el.placeholder;
    });
    document.querySelectorAll('.js-lang-btn').forEach(btn => {
      btn.textContent = lang === 'de' ? 'DE | EN' : 'EN | DE';
    });
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    currentLang = lang;
  }

  document.querySelectorAll('.js-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLang(currentLang === 'de' ? 'en' : 'de');
    });
  });

  applyLang(currentLang);


  /* ── 4. NAVIGATION — HAMBURGER ─────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('nav-overlay');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', open);
    });

    overlay.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  }


  /* ── 5. ROI CALCULATOR ─────────────────────────────────── */
  const volumeSlider  = document.getElementById('roi-volume');
  const yearsSlider   = document.getElementById('roi-years');
  const volumeDisplay = document.getElementById('roi-volume-display');
  const yearsDisplay  = document.getElementById('roi-years-display');
  const resultEl      = document.getElementById('roi-result-value');

  function formatEuro(n) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency', currency: 'EUR',
      maximumFractionDigits: 0
    }).format(n);
  }

  function animateValue(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatEuro(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let lastValue = 0;

  function updateROI() {
    if (!volumeSlider || !yearsSlider) return;
    const volume = parseInt(volumeSlider.value, 10);
    const years  = parseInt(yearsSlider.value, 10);
    const savings = volume * 0.10 * years;

    volumeDisplay.textContent = formatEuro(volume);
    yearsDisplay.textContent  = years + (currentLang === 'de' ? ' Jahr' : ' year') + (years > 1 ? (currentLang === 'de' ? 'e' : 's') : '');

    animateValue(resultEl, lastValue, savings, 600);
    lastValue = savings;
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', updateROI);
    yearsSlider.addEventListener('input', updateROI);
    updateROI();
  }


  /* ── 6. CONTACT FORM (Formspree) ───────────────────────── */
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = currentLang === 'de' ? 'Wird gesendet…' : 'Sending…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.style.display = 'none';
          successMsg.classList.add('visible');
        } else {
          alert(currentLang === 'de' ? 'Fehler beim Senden. Bitte versuchen Sie es erneut.' : 'Error sending. Please try again.');
          btn.disabled = false;
          btn.textContent = currentLang === 'de' ? 'Absenden' : 'Send';
        }
      } catch {
        alert(currentLang === 'de' ? 'Netzwerkfehler. Bitte versuchen Sie es erneut.' : 'Network error. Please try again.');
        btn.disabled = false;
        btn.textContent = currentLang === 'de' ? 'Absenden' : 'Send';
      }
    });
  }

});
