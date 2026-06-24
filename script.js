
document.addEventListener('DOMContentLoaded', () => {

  //THEME TOGGLE (light / dark)//
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Load saved preference, then system preference
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('saffron-theme', theme);
  };

  const savedTheme = localStorage.getItem('saffron-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });


  // MOBILE NAVIGATION//
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  const closeNav = () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  };
  const openNav = () => {
    navLinks.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  hamburger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', closeNav)
  );

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeNav();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });


  // NAVBAR SCROLL STATE//
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });


  //BACK TO TOP//
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  //SCROLL REVEAL (Intersection Observer)//
  const revealEls = document.querySelectorAll(
    '.section-head, .menu-card, .about-text, .about-image, ' +
    '.hero-text, .hero-image-wrap, .contact-info, .contact-form, ' +
    '.bento-item, .why-card, .testimonial-card, .counter-card'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  // ANIMATED COUNTERS//
  const formatNumber = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return n.toString();
  };

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));


  // MENU FILTER//
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      menuCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('hidden');
          // Re-trigger reveal if not yet visible
          if (!card.classList.contains('visible')) {
            setTimeout(() => card.classList.add('visible'), 50);
          }
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  // LIGHTBOX//
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear src after transition to avoid flicker
    setTimeout(() => { lightboxImg.src = ''; }, 400);
  };

  // Zoom buttons inside gallery
  document.querySelectorAll('.bento-zoom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(btn.dataset.src, btn.dataset.alt);
    });
  });

  // Click on bento item itself (not the button)
  document.querySelectorAll('.bento-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const btn = item.querySelector('.bento-zoom');
      if (img) openLightbox(btn ? btn.dataset.src : img.src, img.alt);
    });
    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = item.querySelector('img');
        const btn = item.querySelector('.bento-zoom');
        if (img) openLightbox(btn ? btn.dataset.src : img.src, img.alt);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });


  // CONTACT FORM//
  const contactForm = document.getElementById('contactForm');
  const formNote    = document.getElementById('formNote');
  const submitBtn   = document.getElementById('submitBtn');

  const getVal = (id) => document.getElementById(id)?.value.trim() ?? '';
  const setError = (fieldId, errId, msg) => {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById(errId);
    if (field) field.classList.toggle('invalid', !!msg);
    if (err)   err.textContent = msg;
  };
  const clearErrors = () => {
    ['name', 'email'].forEach(id => {
      document.getElementById(id)?.classList.remove('invalid');
    });
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  };

  const validateForm = () => {
    let valid = true;
    const name  = getVal('name');
    const email = getVal('email');

    if (!name) {
      setError('name', 'nameError', 'Please enter your name.');
      valid = false;
    } else {
      setError('name', 'nameError', '');
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email) {
      setError('email', 'emailError', 'Please enter your email address.');
      valid = false;
    } else if (!emailOk) {
      setError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      setError('email', 'emailError', '');
    }

    return valid;
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      if (!validateForm()) return;

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      formNote.textContent = '';
      formNote.className = 'form-note';

      try {
        const data = new FormData(contactForm);
        const res  = await fetch(contactForm.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          formNote.textContent = `Thank you, ${getVal('name')}! Your reservation request was received. We'll be in touch shortly.`;
          formNote.className = 'form-note success';
          contactForm.reset();
          setTimeout(() => { formNote.textContent = ''; formNote.className = 'form-note'; }, 7000);
        } else {
          throw new Error('Server error');
        }
      } catch {
        formNote.textContent = 'Something went wrong. Please try again or call us directly.';
        formNote.className = 'form-note error';
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    // Live validation on blur
    ['name', 'email'].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', validateForm);
    });
  }


  // NEWSLETTER FORM//
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput?.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        emailInput?.focus();
        return;
      }
      // Optimistic success (swap to your ESP endpoint as needed)
      if (emailInput) emailInput.value = '';
      const btn = newsletterForm.querySelector('button');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Subscribed!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 4000);
      }
    });
  }


  //DYNAMIC FOOTER YEAR//
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  //ACTIVE NAV LINK ON SCROLL (highlight current section)//
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color = '';
          a.style.background = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--accent)';
            a.style.background = 'var(--accent-soft)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

}); 
