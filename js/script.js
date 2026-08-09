/* =========================================================
   PT. Menara Sarana Tama — site interactions & animations
   Scroll reveal, animated counters, parallax hero, 3D tilt.
   All motion is skipped automatically if the visitor has
   "prefers-reduced-motion: reduce" set in their OS/browser.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     5. Sticky header — subtle shrink + shadow after scrolling
     --------------------------------------------------------- */
  const header = document.querySelector('header');
  if (header) {
    const toggleHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
    toggleHeader();
    window.addEventListener('scroll', toggleHeader, { passive: true });
  }
});
