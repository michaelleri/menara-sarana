/* =========================================================
   PT. Menara Sarana Tama — site interactions & animations
   Scroll reveal, animated counters, parallax hero, 3D tilt,
   hamburger menu, partners marquee, layanan modal.
   All motion is skipped automatically if the visitor has
   "prefers-reduced-motion: reduce" set in their OS/browser.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
      0. Hamburger menu toggle
     --------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const navBackdrop = document.getElementById('navBackdrop');
  const navClose = document.getElementById('navClose');
  const navLinks = document.querySelectorAll('#navLinks a');

  if (header && toggle && navBackdrop) {
    function closeMenu() {
      header.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu');
    }
    function toggleMenu() {
      const isOpen = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
    }

    toggle.addEventListener('click', toggleMenu);
    if (navClose) navClose.addEventListener('click', closeMenu);
    navBackdrop.addEventListener('click', closeMenu);
    navLinks.forEach((a) => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 840) closeMenu();
    });
  } else {
    console.warn('Menu hamburger tidak aktif: cek id="siteHeader", id="navToggle", id="navBackdrop" di HTML.');
  }

  /* ---------------------------------------------------------
     1. Scroll reveal — fade + rise, staggered inside groups
     --------------------------------------------------------- */
  document.querySelectorAll('.reveal-group').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = (i * 90) + 'ms';
    });
  });

  const revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     2. Animated number counters (stat bar in the hero area)
     --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (reduceMotion) {
      counters.forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || '')));
    } else if ('IntersectionObserver' in window) {
      const countIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => countIo.observe(el));
    } else {
      counters.forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || '')));
    }
  }

  /* ---------------------------------------------------------
     3. Parallax on the hero photo (scroll-linked translate)
     --------------------------------------------------------- */
  const parallaxImg = document.querySelector('.parallax-img');
  if (!reduceMotion && parallaxImg) {
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      parallaxImg.style.transform = `translateY(${y * 0.12}px) scale(1.06)`;
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     4. 3D tilt — hero photo + service/project cards
        Card tilts toward the cursor, resets on mouse leave.
     --------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt-3d').forEach((el) => {
      const maxTilt = el.classList.contains('hero-photo') ? 6 : 9;

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg) translateY(-2px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)';
      });
    });
  }

  /* ---------------------------------------------------------
     5. Partners marquee — duplicate track content for
        seamless infinite scroll
     --------------------------------------------------------- */
  const track = document.getElementById('track');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ---------------------------------------------------------
     6. Layanan modal — gallery + description
        (matches demo-card[data-images] markup in index.html)
     --------------------------------------------------------- */
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop) {
    const heroImg = document.getElementById('modalHeroImg');
    const thumbsWrap = document.getElementById('modalThumbs');
    const idxEl = document.getElementById('modalIdx');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDesc');
    const modalCloseBtn = document.getElementById('modalClose');

    function openServiceModal(card) {
      const images = (card.dataset.images || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (idxEl) idxEl.textContent = card.dataset.idx || '';
      if (titleEl) titleEl.innerHTML = card.dataset.title || '';
      if (descEl) descEl.textContent = card.dataset.desc || '';

      if (heroImg && images.length) {
        heroImg.src = images[0];
        heroImg.alt = card.dataset.title || '';
      }

      if (thumbsWrap) {
        thumbsWrap.innerHTML = '';
        images.forEach((src, i) => {
          const t = document.createElement('img');
          t.src = src;
          t.alt = (card.dataset.title || '') + ' - foto ' + (i + 1);
          if (i === 0) t.classList.add('active');
          t.addEventListener('click', () => {
            heroImg.src = src;
            thumbsWrap.querySelectorAll('img').forEach((x) => x.classList.remove('active'));
            t.classList.add('active');
          });
          thumbsWrap.appendChild(t);
        });
      }

      modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeServiceModal() {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.demo-card[data-images]').forEach((card) => {
      card.addEventListener('click', () => openServiceModal(card));
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeServiceModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeServiceModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeServiceModal();
    });
  }
}); 