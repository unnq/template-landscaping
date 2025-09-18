/* =========================================================
   Essentials
   - Sticky nav shrink at 50vh
   - Smooth scroll w/ offset
   - Mobile menu toggle
   - Basic form validation + conversion console.log
   - Click-to-call logging
   - Mobile bottom bar behavior
   - Current year injection
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.nav');
  const mobileToggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const links = document.querySelectorAll('a[href^="#"]');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('quote');

  // Current year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky nav shrink after 50vh
  const threshold = window.innerHeight * 0.5;
  const onScroll = () => {
    if (window.scrollY > threshold) {
      header.classList.add('nav--shrink');
    } else {
      header.classList.remove('nav--shrink');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    // Recompute threshold on orientation/size changes
    // (simple version: use new window height)
  }, { passive: true });

  // Mobile menu toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });

    // Close menu when selecting a link
    mobileMenu.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
    });
  }

  // Smooth scroll for in-page anchors
  const smoothScroll = (targetId) => {
    const el = document.querySelector(targetId);
    if (!el) return;
    const navHeight = header.getBoundingClientRect().height;
    const y = el.getBoundingClientRect().top + window.pageYOffset - (navHeight + 8);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target && target.startsWith('#') && target.length > 1) {
        e.preventDefault();
        smoothScroll(target);
      }
    });
  });

  // Click-to-call logging
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => {
      console.log('tap-to-call', { source: a.dataset.cta || 'unknown' });
    });
  });

  // Basic form validation
  if (form) {
    const fields = {
      name: form.querySelector('#name'),
      phone: form.querySelector('#phone'),
      email: form.querySelector('#email'),
      service: form.querySelector('#service'),
      message: form.querySelector('#message'),
    };
    const errs = {
      name: form.querySelector('#err-name'),
      phone: form.querySelector('#err-phone'),
      email: form.querySelector('#err-email'),
      service: form.querySelector('#err-service'),
      message: form.querySelector('#err-message'),
    };
    const successEl = document.getElementById('formSuccess');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[0-9+().\-\s]{7,}$/; // basic permissive check

    const setError = (key, msg) => {
      if (errs[key]) errs[key].textContent = msg;
      fields[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) fields[key].setAttribute('aria-describedby', errs[key].id);
      else fields[key].removeAttribute('aria-describedby');
    };

    const validateField = (key) => {
      const v = fields[key].value.trim();
      switch (key) {
        case 'name':
          setError(key, v ? '' : 'Please enter your name.');
          return !!v;
        case 'phone':
          setError(key, phoneRe.test(v) ? '' : 'Please enter a valid phone.');
          return phoneRe.test(v);
        case 'email':
          setError(key, emailRe.test(v) ? '' : 'Please enter a valid email.');
          return emailRe.test(v);
        case 'service':
          setError(key, v ? '' : 'Please select a service.');
          return !!v;
        case 'message':
          setError(key, v ? '' : 'Please add a short message.');
          return !!v;
        default:
          return true;
      }
    };

    Object.keys(fields).forEach(key => {
      fields[key].addEventListener('blur', () => validateField(key));
      fields[key].addEventListener('input', () => setError(key, ''));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      Object.keys(fields).forEach(key => { if (!validateField(key)) ok = false; });
      if (!ok) return;

      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        service: fields.service.value,
        message: fields.message.value.trim(),
        source: 'website-form',
        ts: new Date().toISOString()
      };

      console.log('conversion', payload); // <-- conversion log
      if (successEl) {
        successEl.hidden = false;
        form.reset();
        // Scroll to success message for visibility
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Optional: hide mobile bottom bar when close to footer (to avoid overlap)
  const mobileBar = document.querySelector('.mobile-cta');
  const footer = document.querySelector('.footer');
  if (mobileBar && footer && window.matchMedia('(max-width: 768px)').matches) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If footer visible, hide bottom bar
        mobileBar.style.transform = entry.isIntersecting ? 'translateY(120%)' : 'translateY(0)';
      });
    }, { rootMargin: '0px 0px -40% 0px' });
    obs.observe(footer);
  }
});
