(() => {
  const root = document.documentElement;
  const prefersMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setReducedMotion = () => {
    const reduced = Boolean(prefersMotionQuery.matches);
    window.prefersReducedMotion = reduced;
    root.dataset.prefersReducedMotion = reduced;
  };
  setReducedMotion();
  if (prefersMotionQuery.addEventListener) {
    prefersMotionQuery.addEventListener('change', setReducedMotion);
  } else if (prefersMotionQuery.addListener) {
    prefersMotionQuery.addListener(setReducedMotion);
  }

  const debounce = (fn, delay = 200) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const throttle = (fn, limit = 200) => {
    let waiting = false;
    return (...args) => {
      if (waiting) return;
      waiting = true;
      fn(...args);
      setTimeout(() => {
        waiting = false;
      }, limit);
    };
  };

  const applyViewportHelpers = () => {
    root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    const width = window.innerWidth;
    const bp = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
    root.dataset.viewport = bp;
  };
  applyViewportHelpers();
  window.addEventListener('resize', debounce(applyViewportHelpers, 170));

  root.classList.add('js-ready');

  document.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });

  const trackEvent = (details = {}) => {
    const payload = {
      event: 'track',
      category: details.category || 'unknown',
      action: details.action || 'unknown',
      label: details.label || '',
      value: details.value || '',
      timestamp: Date.now(),
    };
    if (details.url) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(details.url, JSON.stringify(payload));
      } else if (window.fetch) {
        fetch(details.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => console.warn('Tracking failed', details.url));
      }
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  };
  window.trackEvent = trackEvent;

  document.querySelectorAll('[data-track-category]').forEach((el) => {
    const eventType = el.dataset.trackEvent || 'click';
    const handler = () => {
      trackEvent({
        category: el.dataset.trackCategory,
        action: el.dataset.trackAction || eventType,
        label: el.dataset.trackLabel || el.textContent.trim(),
        value: el.dataset.trackValue,
        url: el.dataset.trackUrl,
      });
    };
    el.addEventListener(eventType, handler);
  });

  document.querySelectorAll('[data-toggle-accessibility]').forEach((toggle) => {
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    if (!toggle.hasAttribute('aria-expanded')) {
      toggle.setAttribute('aria-expanded', 'false');
    }
    const manager = (event) => {
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) {
        return;
      }
      if (event.type === 'keydown') {
        event.preventDefault();
      }
      toggle.click();
    };
    toggle.addEventListener('keydown', manager);
  });

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '') {
      event.preventDefault();
    }
  });

  const updateResponsiveState = () => {
    applyViewportHelpers();
  };
  window.addEventListener('resize', throttle(updateResponsiveState, 250));
})();
