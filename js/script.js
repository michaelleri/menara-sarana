// /* =========================================================
//    PT. Menara Sarana Tama — site interactions & animations
//    Scroll reveal, animated counters, parallax hero, 3D tilt.
//    All motion is skipped automatically if the visitor has
//    "prefers-reduced-motion: reduce" set in their OS/browser.
//    ========================================================= */

  document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
      0. Humburger menu toggle
     --------------------------------------------------------- */
  //   document.addEventListener('DOMContentLoaded', function(){
  //   const header = document.getElementById('siteHeader');
  //   const toggle = document.getElementById('navToggle');
  //   const backdrop = document.getElementById('navBackdrop');
  //   const navClose = document.getElementById('navClose');
  //   const links = document.querySelectorAll('#navLinks a');
  
  //   if(!header || !toggle || !backdrop){
  //     console.error('Menu error: cek apakah id="siteHeader", id="navToggle", id="navBackdrop" sudah ada di HTML.');
  //     return;
  //   }
  
  //   function closeMenu(){
  //     header.classList.remove('open');
  //     toggle.setAttribute('aria-expanded', 'false');
  //     toggle.setAttribute('aria-label', 'Buka menu');
  //   }
  //   function toggleMenu(){
  //     const isOpen = header.classList.toggle('open');
  //     toggle.setAttribute('aria-expanded', String(isOpen));
  //     toggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
  //   }
  
  //   toggle.addEventListener('click', toggleMenu);
  //   if(navClose) navClose.addEventListener('click', closeMenu);
  //   backdrop.addEventListener('click', closeMenu);
  //   links.forEach(a => a.addEventListener('click', closeMenu));
  //   window.addEventListener('resize', () => { if (window.innerWidth > 840) closeMenu(); });
  // });
 
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

  /* ---------------------------------------------------------
     6. Service detail modal (Layanan section demo cards)
     --------------------------------------------------------- */
  const serviceData = {
    1: {
      idx: '01. INSTALASI',
      title: 'Genset & Panel',
      desc: 'Pemasangan power house, unit genset, panel, kabel, sistem kontrol, exhaust dan fuel piping — dikerjakan sesuai spesifikasi dan standar keselamatan proyek.',
      images: ['images/svc1.jpg', 'images/svc1-b.jpg', 'images/svc1-c.jpg'],
    },
    2: {
      idx: '02. CONTROL',
      title: 'Panel ATS/AMF',
      desc: 'Instalasi panel ATS/AMF dan Auto Synchrone untuk kebutuhan paralel unit, lengkap dengan wiring dan pengujian sistem kontrol.',
      images: ['images/svc2.jpg', 'images/svc2-b.jpg', 'images/svc2-c.jpg'],
    },
    3: {
      idx: '03. REPAIR',
      title: 'Overhaul',
      desc: 'Perbaikan engine, generator, panel dan instalasi kabel sesuai spesifikasi unit — dikerjakan tenaga terlatih dari pembongkaran sampai pengujian ulang.',
      images: ['images/svc3.jpg', 'images/svc3-b.jpg', 'images/svc3-c.jpg'],
    },
    4: {
      idx: '04. MAINTENANCE',
      title: 'Preventive Check',
      desc: 'Service rutin, setting & adjusting, dan deteksi dini gejala kerusakan unit sebelum berkembang jadi breakdown.',
      images: ['images/svc4.jpg', 'images/svc4-b.jpg', 'images/svc4-c.jpg'],
    },
    5: {
      idx: '05. SUPPLIER',
      title: 'Spare Part & Consumable',
      desc: 'Pengadaan spare part asli, unit pengganti sementara, engine oil dan consumable goods lainnya.',
      images: ['images/svc5.jpg', 'images/svc5-b.jpg', 'images/svc5-c.jpg'],
    },
  };

  const modal = document.getElementById('serviceModal');
  if (modal) {
    const heroImg = document.getElementById('modalHeroImg');
    const thumbsWrap = document.getElementById('modalThumbs');
    const idxEl = document.getElementById('modalIdx');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDesc');
    const closeBtn = document.getElementById('modalClose');
    let lastFocused = null;

    function openModal(serviceId) {
      const data = serviceData[serviceId];
      if (!data) return;
      idxEl.textContent = data.idx;
      titleEl.textContent = data.title;
      descEl.textContent = data.desc;
      heroImg.src = data.images[0];
      heroImg.alt = data.title;

      thumbsWrap.innerHTML = '';
      data.images.forEach((src, i) => {
        const t = document.createElement('img');
        t.src = src;
        t.alt = data.title + ' - foto ' + (i + 1);
        if (i === 0) t.classList.add('active');
        t.addEventListener('click', () => {
          heroImg.src = src;
          thumbsWrap.querySelectorAll('img').forEach((el) => el.classList.remove('active'));
          t.classList.add('active');
        });
        thumbsWrap.appendChild(t);
      });

      lastFocused = document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.demo-card[data-service]').forEach((card) => {
      card.addEventListener('click', () => openModal(card.dataset.service));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card.dataset.service);
        }
      });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }
}};

// Partners
  // gandakan isi track supaya scroll infinite mulus
  const track = document.getElementById('track');
  track.innerHTML += track.innerHTML;
// Partners

// Layanan
const backdrop = document.getElementById('modalBackdrop');
  const heroImg = document.getElementById('modalHeroImg');
  const thumbsWrap = document.getElementById('modalThumbs');
  const idxEl = document.getElementById('modalIdx');
  const titleEl = document.getElementById('modalTitle');
  const descEl = document.getElementById('modalDesc');
 
  function openModal(card){
    const images = card.dataset.images.split(',').map(s => s.trim());
    idxEl.textContent = card.dataset.idx;
    titleEl.innerHTML = card.dataset.title;
    descEl.textContent = card.dataset.desc;
 
    heroImg.src = images[0];
    heroImg.alt = card.dataset.title;
 
    thumbsWrap.innerHTML = '';
    images.forEach((src, i) => {
      const t = document.createElement('img');
      t.src = src;
      t.className = i === 0 ? 'active' : '';
      t.addEventListener('click', () => {
        heroImg.src = src;
        thumbsWrap.querySelectorAll('img').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      });
      thumbsWrap.appendChild(t);
    });
 
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
 
  function closeModal(){
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
 
  document.querySelectorAll('.demo-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });
 
  document.getElementById('modalClose').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Layanan