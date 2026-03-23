/* =============================================
   JAVASCRIPT – Finance Portfolio
   ============================================= */

(function () {
    'use strict';

    /* ── Navbar scroll effect ── */
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightActiveSection();
    }, { passive: true });

    /* ── Active section highlight ── */
    function highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 120;
        sections.forEach(sec => {
            const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
            if (!link) return;
            if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }

    /* ── Hamburger menu ── */
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinksContainer.classList.toggle('open');
    });
    navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinksContainer.classList.remove('open');
        });
    });

    /* ── Animated counter ── */
    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();
        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    }

    /* ── Intersection Observer for reveals ── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate skill bars
                const bars = entry.target.querySelectorAll('.skill-fill');
                bars.forEach(bar => bar.classList.add('animated'));
                // Animate counters
                const counters = entry.target.querySelectorAll('[data-target]');
                counters.forEach(c => { if (!c.dataset.animated) { c.dataset.animated = 'true'; animateCounter(c); } });
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    // Add reveal class to cards and sections
    const revealEls = document.querySelectorAll(
        '.highlight-card, .expertise-card, .edu-card, .cert-item, .cert-featured, .contact-card, .about-text, .about-highlights'
    );
    revealEls.forEach((el, i) => {
        el.classList.add('reveal');
        if (i % 4 === 1) el.classList.add('reveal-delay-1');
        if (i % 4 === 2) el.classList.add('reveal-delay-2');
        if (i % 4 === 3) el.classList.add('reveal-delay-3');
        revealObserver.observe(el);
    });

    // Hero stats counter
    const heroSection = document.getElementById('hero');
    const heroObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('[data-target]').forEach(c => {
                    if (!c.dataset.animated) { c.dataset.animated = 'true'; animateCounter(c); }
                });
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    if (heroSection) heroObserver.observe(heroSection);

    // Timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    const tlObserver = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 100);
                tlObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    timelineItems.forEach(item => tlObserver.observe(item));

    // Skill bars
    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.skill-fill').forEach(b => b.classList.add('animated'));
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.expertise-card').forEach(c => skillObserver.observe(c));

    /* ── Floating particles ── */
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-duration: ${8 + Math.random() * 15}s;
                animation-delay: ${Math.random() * 10}s;
                opacity: ${0.2 + Math.random() * 0.6};
                width: ${1 + Math.random() * 3}px;
                height: ${1 + Math.random() * 3}px;
            `;
            container.appendChild(p);
        }
    }
    createParticles();

    /* ── Smooth scroll for anchor links ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ── Mouse parallax on hero portrait ── */
    const hero = document.getElementById('hero');
    const portrait = document.querySelector('.hero-portrait');
    if (hero && portrait) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / rect.width;
            const dy = (e.clientY - cy) / rect.height;
            portrait.style.transform = `translate(${dx * 12}px, ${dy * 12}px)`;
        });
        hero.addEventListener('mouseleave', () => {
            portrait.style.transform = 'translate(0, 0)';
            portrait.style.transition = 'transform 0.8s ease';
        });
        hero.addEventListener('mouseenter', () => {
            portrait.style.transition = 'transform 0.1s ease';
        });
    }

    /* ── Expertise card tilt ── */
    document.querySelectorAll('.expertise-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = (e.clientY - cy) / (rect.height / 2) * -6;
            const ry = (e.clientX - cx) / (rect.width / 2) * 6;
            card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ── Typed subtitle effect ── */
    const subtitles = [
        'Chief Financial Officer',
        'US Certified Public Accountant',
        'Chartered Financial Analyst',
        'DipIFRS Specialist',
        'Corporate Finance Expert'
    ];
    const chip = document.querySelector('.title-chip:first-child');
    if (chip) {
        let si = 0, ci = 0, deleting = false;
        function typeLoop() {
            const current = subtitles[si];
            if (!deleting) {
                chip.textContent = current.slice(0, ++ci);
                if (ci === current.length) { deleting = true; setTimeout(typeLoop, 2000); return; }
            } else {
                chip.textContent = current.slice(0, --ci);
                if (ci === 0) { deleting = false; si = (si + 1) % subtitles.length; }
            }
            setTimeout(typeLoop, deleting ? 40 : 80);
        }
        setTimeout(typeLoop, 1500);
    }

    /* ── Gold cursor trail (desktop only) ── */
    if (window.innerWidth > 768) {
        const trail = [];
        const TRAIL_LEN = 8;
        for (let i = 0; i < TRAIL_LEN; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                position: fixed; pointer-events: none; z-index: 9999; border-radius: 50%;
                width: ${4 - i * 0.3}px; height: ${4 - i * 0.3}px;
                background: rgba(201,168,76,${0.5 - i * 0.05});
                transition: transform 0.05s ease; transform: translate(-50%,-50%);
            `;
            document.body.appendChild(dot);
            trail.push({ el: dot, x: 0, y: 0 });
        }
        let mx = 0, my = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        function animTrail() {
            let px = mx, py = my;
            trail.forEach((t, i) => {
                t.x += (px - t.x) * 0.35;
                t.y += (py - t.y) * 0.35;
                t.el.style.left = t.x + 'px';
                t.el.style.top = t.y + 'px';
                px = t.x; py = t.y;
            });
            requestAnimationFrame(animTrail);
        }
        animTrail();
    }

    console.log('%c💼 Mahesh Garg – Finance Portfolio', 'color:#c9a84c;font-size:1.2rem;font-weight:bold;');
    console.log('%cBuilt with premium design by Antigravity AI', 'color:#4a9fd9;font-size:0.85rem;');
})();
