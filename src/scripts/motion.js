import Lenis from 'lenis';

const win = window;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = () => window.matchMedia('(pointer: fine)').matches;

let lenisInstance = null;
let rafId = null;
let revealObserver = null;

function initLenis() {
  if (!isFinePointer() || reducedMotion()) {
    document.documentElement.classList.remove('lenis-smooth');
    if (lenisInstance) {
      lenisInstance.destroy();
      lenisInstance = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    return;
  }

  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95
    });

    const raf = (time) => {
      if (lenisInstance) {
        lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      }
    };
    rafId = requestAnimationFrame(raf);
  }

  document.documentElement.classList.add('lenis-smooth');
  lenisInstance.resize();

  if (!win.__k3AnchorBound) {
    win.__k3AnchorBound = true;
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const dest = document.querySelector(hash);
      if (!dest) return;

      e.preventDefault();
      if (lenisInstance && !reducedMotion()) {
        lenisInstance.scrollTo(dest, { offset: -84 });
      } else {
        dest.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    });
  }
}

function injectMidCTA() {
  const pathname = window.location.pathname;
  if (
    /^\/(kontak|kebijakan-privasi|syarat-ketentuan|downloads)(\/|$)/.test(pathname) ||
    /^\/(404|410)(\.html)?$/.test(pathname) ||
    /^\/artikel\/?$/.test(pathname)
  ) {
    return;
  }

  const main = document.getElementById('site-main');
  const tpl = document.getElementById('mid-cta-template');
  if (!main || !(tpl instanceof HTMLTemplateElement)) return;
  if (main.querySelector('[data-mid-cta]')) return;

  const clone = tpl.content.firstElementChild?.cloneNode(true);
  if (!(clone instanceof HTMLElement)) return;

  // 1. Article / Pillar pages (article.prose)
  const prose = main.querySelector('article.prose');
  if (prose) {
    const h2s = Array.from(prose.querySelectorAll('h2'));
    if (h2s.length >= 2) {
      clone.classList.add('my-10');
      const targetH2 = h2s[Math.floor(h2s.length / 2)];
      targetH2.parentNode?.insertBefore(clone, targetH2);
      return;
    }
    const ps = Array.from(prose.querySelectorAll('p'));
    if (ps.length >= 3) {
      clone.classList.add('my-10');
      const targetP = ps[Math.floor(ps.length / 2)];
      targetP.insertAdjacentElement('afterend', clone);
      return;
    }
  }

  // 2. Service / Landing pages with >= 4 sections in primary content container
  const containers = [
    main.querySelector('main'),
    main.querySelector('article'),
    ...Array.from(main.querySelectorAll('div')).filter((el) => !el.closest('header')),
    main
  ].filter(Boolean);

  for (const container of containers) {
    const sections = Array.from(container.querySelectorAll(':scope > section'));
    if (sections.length >= 4) {
      const midIndex = Math.floor(sections.length / 2) - 1;
      const anchorSection = sections[Math.max(0, midIndex)];

      if (container === main) {
        const wrapper = document.createElement('div');
        wrapper.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-slate-50';
        wrapper.appendChild(clone);
        anchorSection.insertAdjacentElement('afterend', wrapper);
      } else {
        clone.classList.add('my-2');
        anchorSection.insertAdjacentElement('afterend', clone);
      }
      return;
    }
  }
}

function initReveals() {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('reveal-ready');
    return;
  }

  const main = document.getElementById('site-main');
  if (!main) return;

  document.documentElement.classList.add('reveal-ready');

  const heroRoot = main.querySelector(':scope > header, :scope > section:first-of-type');

  // Soft entrance for secondary hero badges/copy/buttons (never hide H1 or LCP image)
  if (heroRoot) {
    const heroTargets = heroRoot.querySelectorAll('.inline-flex, p.text-base, p.text-lg, .backdrop-blur-md');
    let delay = 40;
    heroTargets.forEach((el) => {
      if (el.closest('picture') || el.querySelector('h1')) return;
      if (!el.classList.contains('reveal-hero-item')) {
        el.style.setProperty('--hero-delay', `${Math.min(delay, 220)}ms`);
        el.classList.add('reveal-hero-item');
        delay += 60;
      }
    });
  }

  // Gather below-hero reveal candidates
  const candidateSelectors = [
    '[data-mid-cta]',
    '#site-main .grid > div',
    '#site-main .grid > a',
    '#site-main details',
    '#site-main section h2',
    '#site-main article.prose > h2',
    '#site-main article.prose > blockquote',
    '#site-main article.prose > table'
  ];

  const seen = new Set();
  const candidates = [];
  for (const sel of candidateSelectors) {
    document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return;
      if (heroRoot && heroRoot.contains(el)) return;
      if (el.closest('[data-mid-cta]') && !el.hasAttribute('data-mid-cta')) return;
      seen.add(el);
      candidates.push(el);
    });
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
  );

  const vh = window.innerHeight || 800;
  candidates.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.94) {
      el.classList.add('is-visible');
      return;
    }

    // Stagger sibling cards in grids
    const parent = el.parentElement;
    if (parent && parent.classList.contains('grid')) {
      const idx = Array.from(parent.children).indexOf(el);
      if (idx > 0) {
        el.style.setProperty('--reveal-delay', `${(idx % 4) * 65}ms`);
      }
    }

    el.classList.add('reveal-item');
    revealObserver.observe(el);
  });
}

function initScrollUI() {
  const supportsScrollTimeline =
    typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline', 'scroll()');

  const update = () => {
    const header = document.getElementById('site-header');
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    if (!supportsScrollTimeline && !reducedMotion()) {
      const bar = document.getElementById('scroll-progress');
      if (bar) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        bar.style.transform = `scaleX(${pct})`;
      }
    }
  };

  update();

  if (!win.__k3MotionScrollBound) {
    win.__k3MotionScrollBound = true;
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }
}

function initMagnetic() {
  if (!isFinePointer() || reducedMotion()) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    if (!(el instanceof HTMLElement) || el.dataset.magneticBound) return;
    el.dataset.magneticBound = '1';

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(1.05)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

function initMotion() {
  initLenis();
  injectMidCTA();
  initReveals();
  initScrollUI();
  initMagnetic();
}

document.addEventListener('astro:page-load', initMotion);
