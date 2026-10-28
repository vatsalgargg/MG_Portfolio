(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('themeToggle');
  var metaThemes = document.querySelectorAll('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    metaThemes.forEach(function (m) { m.setAttribute('content', theme === 'dark' ? '#0c1214' : '#f3f4f1'); });
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
  }

  applyTheme(root.getAttribute('data-theme') || 'light');

  toggle.addEventListener('click', function (ev) {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }

    // Circular wipe that grows from the button
    var r = toggle.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var t = document.startViewTransition(function () { applyTheme(next); });
    t.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () { });
  });

  /* ---------- Nav: scrolled state, mobile menu, active link ---------- */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');

  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { menuBtn.click(); menuBtn.focus(); }
  });

  var navLinks = {};
  document.querySelectorAll('#navLinks a').forEach(function (a) { navLinks[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.toggle('is-active', k === en.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(navLinks).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Split headings into words for the mask reveal ---------- */
  function splitWords(el) {
    var wi = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var inner = document.createElement('span'); inner.textContent = part;
            inner.style.setProperty('--wi', wi++);
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    // Hide the split fragments from screen readers; the aria-label carries the text
    el.querySelectorAll('.w').forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
  }
  document.querySelectorAll('.split').forEach(splitWords);

  /* ---------- Count-up ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveals ---------- */
  var revealTargets = document.querySelectorAll('[data-reveal], .split');
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero load sequence ---------- */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add('is-in'); });
  });

  /* ---------- Scroll-linked: nav shadow, portrait parallax, experience rule ---------- */
  var portraitImg = document.getElementById('portraitImg');
  var roles = document.getElementById('roles');
  var rule = roles ? roles.querySelector('.roles-rule span') : null;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);

    if (!reduceMotion) {
      if (portraitImg && y < innerHeight * 1.2) {
        portraitImg.style.transform = 'scale(1.08) translateY(' + (y * 0.06).toFixed(1) + 'px)';
      }
      if (rule) {
        var r = roles.getBoundingClientRect();
        var p = (innerHeight * 0.6 - r.top) / r.height;
        rule.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      }
    } else if (rule) {
      rule.style.setProperty('--p', 1);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- FAQ: animate open/close height ---------- */
  document.querySelectorAll('.faq details').forEach(function (d) {
    var summary = d.querySelector('summary');
    var answer = d.querySelector('.answer');
    summary.addEventListener('click', function (e) {
      if (reduceMotion || !answer.animate) return;
      e.preventDefault();
      if (d.open) {
        var h = answer.offsetHeight;
        answer.animate({ height: [h + 'px', '0px'], opacity: [1, 0] }, { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' })
          .onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var full = answer.offsetHeight;
        answer.animate({ height: ['0px', full + 'px'], opacity: [0, 1] }, { duration: 250, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });

  /* ---------- Contact form: compose a mailto ---------- */
  var form = document.getElementById('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.namedItem('name').value.trim();
    var org = f.namedItem('org').value.trim();
    var msg = f.namedItem('message').value.trim();
    var subject = 'Enquiry from ' + name + (org ? ' (' + org + ')' : '');
    var body = msg + '\n\n' + name + (org ? '\n' + org : '');
    window.location.href = 'mailto:maheshgarg76@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
