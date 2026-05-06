/* Organic Surf — site interactions
   Header scroll state, mobile nav, reveal-on-scroll,
   sticky inquiry bar, gallery lightbox, contact form, carousel. */

(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', open);
    });
    document.querySelectorAll('nav.primary a').forEach((a) => {
      a.addEventListener('click', () => {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: '0px 0px -16px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Image-break parallax ---------- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ibImages = document.querySelectorAll('.image-break img');
    if (ibImages.length) {
      const onParallax = () => {
        ibImages.forEach((img) => {
          const wrap = img.closest('.image-break');
          const rect = wrap.getBoundingClientRect();
          const pct = (rect.top + rect.height * 0.5) / window.innerHeight;
          const offset = (pct - 0.5) * 70;
          img.style.transform = `translateY(${offset}px) scale(1.14)`;
        });
      };
      onParallax();
      window.addEventListener('scroll', onParallax, { passive: true });
    }
  }

  /* ---------- Sticky inquiry bar ---------- */
  const sticky = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  if (sticky) {
    const onScrollSticky = () => {
      const past = hero
        ? window.scrollY > hero.offsetHeight - 120
        : window.scrollY > 320;
      const nearBottom =
        window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight - 240;
      sticky.classList.toggle('show', past && !nearBottom);
    };
    onScrollSticky();
    window.addEventListener('scroll', onScrollSticky, { passive: true });
    window.addEventListener('resize', onScrollSticky);
  }

  /* ---------- Gallery lightbox ---------- */
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    const links = [...gallery.querySelectorAll('a')];
    const sources = links.map((a) => a.getAttribute('href'));
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.setAttribute('aria-hidden', 'true');
      lb.innerHTML = `
        <button class="lightbox-close" aria-label="Close">×</button>
        <button class="lightbox-prev"  aria-label="Previous">‹</button>
        <button class="lightbox-next"  aria-label="Next">›</button>
        <img alt="" />
      `;
      document.body.appendChild(lb);
    }
    const img = lb.querySelector('img');
    const closeBtn = lb.querySelector('.lightbox-close');
    const prevBtn = lb.querySelector('.lightbox-prev');
    const nextBtn = lb.querySelector('.lightbox-next');
    let idx = 0;

    const open = (i) => {
      idx = i;
      img.src = sources[idx];
      lb.classList.add('show');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    };
    const close = () => {
      lb.classList.remove('show');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };
    const step = (d) => {
      idx = (idx + d + sources.length) % sources.length;
      img.src = sources[idx];
    };

    links.forEach((a, i) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        open(i);
      })
    );
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById('lead-form');
  if (form) {
    const statusEl = document.getElementById('form-status');
    const popup = document.getElementById('thankyou-popup');
    const closePopup = document.getElementById('close-popup');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (statusEl) statusEl.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          if (popup) {
            document.body.classList.add('no-scroll');
            popup.classList.add('show');
            popup.setAttribute('aria-hidden', 'false');
          }
          if (statusEl) statusEl.textContent = '';
          form.reset();
        } else {
          if (statusEl)
            statusEl.textContent =
              'Something went wrong. Please WhatsApp us instead.';
        }
      } catch {
        if (statusEl)
          statusEl.textContent =
            'Network error. Please WhatsApp us at +506 8509 4439.';
      }
    });
    if (closePopup && popup) {
      closePopup.addEventListener('click', () => {
        popup.classList.remove('show');
        popup.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
      });
    }
  }

  /* ---------- Carousel (legacy, used on first-project) ---------- */
  document.querySelectorAll('.carousel').forEach((root) => {
    const track = root.querySelector('.car-track');
    if (!track) return;
    const slides = [...root.querySelectorAll('.car-slide')];
    const prev = root.querySelector('.car-btn.prev');
    const next = root.querySelector('.car-btn.next');
    const dotsWrap = root.querySelector('.car-dots');
    let i = 0;

    if (dotsWrap) {
      slides.forEach((_, k) => {
        const b = document.createElement('button');
        b.addEventListener('click', () => go(k));
        dotsWrap.appendChild(b);
      });
    }
    const dots = dotsWrap ? [...dotsWrap.children] : [];

    const update = () => {
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
      if (prev) prev.style.visibility = i === 0 ? 'hidden' : 'visible';
      if (next)
        next.style.visibility = i === slides.length - 1 ? 'hidden' : 'visible';
    };
    const go = (k) => {
      i = Math.max(0, Math.min(slides.length - 1, k));
      update();
    };
    const step = (d) => go(i + d);

    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));

    let x0 = null;
    track.addEventListener(
      'touchstart',
      (e) => (x0 = e.touches[0].clientX),
      { passive: true }
    );
    track.addEventListener(
      'touchmove',
      (e) => {
        if (x0 === null) return;
        const dx = e.touches[0].clientX - x0;
        if (Math.abs(dx) > 50) {
          step(dx < 0 ? 1 : -1);
          x0 = null;
        }
      },
      { passive: true }
    );
    track.addEventListener('touchend', () => (x0 = null));

    update();
  });
})();
