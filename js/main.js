const init = () => {
  const prefersReducedMotion = Boolean(window.prefersReducedMotion);
  const body = document.body;
  body.style.opacity = '0';
  body.style.transition = 'opacity 0.5s ease-in-out';

  const safeTrack = (payload) => {
    if (window.trackEvent) {
      window.trackEvent(payload);
    }
  };
  const initReveal = (selectors) => {
    const items = document.querySelectorAll(selectors);
    items.forEach((item) => item.classList.add('reveal-on-scroll'));
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    items.forEach((item) => observer.observe(item));
  };

  const reveal = () => {
    body.style.opacity = '1';
  };

  const createLoader = () => {
    const loader = document.createElement('div');
    loader.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
      background: #fff; display: flex; justify-content: center; align-items: center; z-index: 9999;
      opacity: 1; transition: opacity 0.5s ease-out;
    `;
    loader.innerHTML = '<div style="border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div><style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>';
    return loader;
  };

  if (prefersReducedMotion) {
    reveal();
  } else {
    const loader = createLoader();
    body.prepend(loader);
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        reveal();
        setTimeout(() => loader.remove(), 500);
      }, 800);
    });
  }

  const megaLink = document.querySelector('.main-nav li a[data-track-action="mega-menu"]');
  const megaMenu = document.querySelector('.mega-menu');
  if (megaLink && megaMenu) {
    const toggleMega = () => {
      const expanded = megaLink.getAttribute('aria-expanded') === 'true';
      megaMenu.classList.toggle('open');
      megaLink.setAttribute('aria-expanded', String(!expanded));
      safeTrack({ category: 'navigation', action: 'mega-menu', label: expanded ? 'close' : 'open' });
    };
    megaLink.addEventListener('click', (event) => {
      event.preventDefault();
      toggleMega();
    });
    document.addEventListener('click', (event) => {
      if (!megaMenu.contains(event.target) && !megaLink.contains(event.target)) {
        megaMenu.classList.remove('open');
        megaLink.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        megaMenu.classList.remove('open');
        megaLink.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const getNextCountdownTarget = () => {
    const now = new Date();
    const year = now.getFullYear();
    const target = new Date(year, 11, 31, 23, 59, 59);
    return target.getTime() > now.getTime() ? target.getTime() : new Date(year + 1, 11, 31, 23, 59, 59).getTime();
  };

  let countDownDate = getNextCountdownTarget();
  const updateCountdown = () => {
    const dateNow = Date.now();
    let dateDiff = countDownDate - dateNow;
    if (dateDiff < 0) {
      countDownDate = getNextCountdownTarget();
      dateDiff = countDownDate - dateNow;
    }
    const days = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((dateDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((dateDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((dateDiff % (1000 * 60)) / 1000);
    const format = (value) => (value < 10 ? `0${value}` : value);
    document.querySelector('.days').textContent = format(days);
    document.querySelector('.hours').textContent = format(hours);
    document.querySelector('.minutes').textContent = format(minutes);
    document.querySelector('.seconds').textContent = format(seconds);
  };

  updateCountdown();
  if (!prefersReducedMotion) {
    setInterval(updateCountdown, 1000);
  }

  const startCount = (el) => {
    const goal = parseInt(el.dataset.goal, 10) || 0;
    let current = 0;
    const step = Math.max(1, Math.round(goal / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= goal) {
        el.textContent = goal;
        clearInterval(timer);
      } else {
        el.textContent = current;
      }
    }, prefersReducedMotion ? 200 : 50);
  };

  const statsSection = document.querySelector('.stats');
  const statsNumbers = document.querySelectorAll('.stats .number');
  if ('IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statsNumbers.forEach((num) => startCount(num));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    if (statsSection) {
      statsObserver.observe(statsSection);
    }
  } else {
    statsNumbers.forEach((num) => startCount(num));
  }

  const skillsSection = document.querySelector('.our-skills');
  const progressSpans = document.querySelectorAll('.the-progress span');
  const animateSkills = () => {
    progressSpans.forEach((span) => {
      span.style.width = span.dataset.width;
      span.setAttribute('aria-valuenow', span.dataset.width.replace('%', ''));
    });
  };
  if ('IntersectionObserver' in window) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSkills();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    if (skillsSection) {
      skillsObserver.observe(skillsSection);
    }
  } else {
    animateSkills();
  }

  initReveal('.articles .box, .gallery .box, .features .box, .testimonials .box, .team .box, .services .box, .work-steps .box, .pricing .box, .videos .holder');
};

document.addEventListener('DOMContentLoaded', init);

