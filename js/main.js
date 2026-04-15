// ============================================
// openSUSE Adaptive Branding — Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile nav toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // --- Active nav link highlight on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const markActive = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < bottom) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  };
  window.addEventListener('scroll', markActive, { passive: true });
  markActive();

  // --- Copy hex on swatch click ---
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.style.cursor = 'pointer';
    swatch.title = 'Click to copy hex';
    swatch.addEventListener('click', () => {
      const code = swatch.querySelector('code');
      if (!code) return;
      const hex = code.textContent.trim();
      navigator.clipboard.writeText(hex).then(() => {
        const original = code.textContent;
        code.textContent = 'Copied!';
        setTimeout(() => { code.textContent = original; }, 1200);
      });
    });
  });

  // --- Subtle entrance animation (Intersection Observer) ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .color-swatch, .tree-node, .guideline-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(el);
  });
});
