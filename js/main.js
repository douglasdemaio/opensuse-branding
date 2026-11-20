// ============================================
// openSUSE Adaptive Branding — Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // --- openSUSE universe toolbar panel ---
  const uniBtn   = document.getElementById('uni-btn');
  const uniPanel = document.getElementById('uni-panel');

  if (uniBtn && uniPanel) {
    const setOpen = open => {
      uniPanel.classList.toggle('open', open);
      uniBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    uniBtn.addEventListener('click', () => {
      setOpen(!uniPanel.classList.contains('open'));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && uniPanel.classList.contains('open')) {
        setOpen(false);
        uniBtn.focus();
      }
    });

    document.addEventListener('click', event => {
      if (!uniPanel.classList.contains('open')) return;
      if (uniPanel.contains(event.target) || uniBtn.contains(event.target)) return;
      setOpen(false);
    });
  }

  // --- Active page-section link highlight on scroll ---
  const pageAnchors = Array.from(document.querySelectorAll('.page-links a'));
  const anchorTargets = pageAnchors
    .map(link => ({ link, target: document.getElementById(link.hash.slice(1)) }))
    .filter(({ target }) => target);

  const markActive = () => {
    const scrollY = window.scrollY + 100;
    let activeHash = '';

    anchorTargets.forEach(({ link, target }) => {
      const top = target.offsetTop;
      const bottom = top + target.offsetHeight;
      if (scrollY >= top && scrollY < bottom) activeHash = link.hash;
    });

    pageAnchors.forEach(link => {
      link.classList.toggle('active', link.hash === activeHash);
    });
  };
  window.addEventListener('scroll', markActive, { passive: true });
  markActive();

  // --- Copy hex on swatch click (product DNA + project brand) ---
  document.querySelectorAll('.color-swatch, .pb-swatch').forEach(swatch => {
    swatch.style.cursor = 'pointer';
    swatch.title = 'Click to copy hex';
    swatch.addEventListener('click', () => {
      const code = swatch.querySelector('code');
      if (!code) return;
      const hex = code.textContent.trim();
      navigator.clipboard.writeText(hex).then(() => {
        const original = code.textContent;
        code.textContent = 'Copied!';
        swatch.classList.add('copied');
        setTimeout(() => {
          code.textContent = original;
          swatch.classList.remove('copied');
        }, 1200);
      });
    });
  });

  // --- Copy logo image on gallery click ---
  const pngFromSvg = async (src) => {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    if (!('createImageBitmap' in window)) throw new Error('createImageBitmap unavailable');

    const bitmap = await createImageBitmap(blob);
    const width = Math.max(bitmap.width, 1);
    const height = Math.max(bitmap.height, 1);
    const scale = Math.min(256 / width, 256 / height, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (typeof bitmap.close === 'function') bitmap.close();

    return new Promise((resolve, reject) => {
      canvas.toBlob(result => {
        if (result) resolve(result);
        else reject(new Error('PNG conversion failed'));
      }, 'image/png');
    });
  };

  document.querySelectorAll('[data-copy-image]').forEach(button => {
    const status = button.querySelector('.logo-copy-status');
    let resetTimer;

    const showStatus = message => {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('visible', Boolean(message));
      clearTimeout(resetTimer);
      if (message) {
        resetTimer = setTimeout(() => {
          status.textContent = '';
          status.classList.remove('visible');
        }, 1600);
      }
    };

    button.addEventListener('click', async () => {
      const src = button.dataset.copyImage;
      if (!src) return;

      try {
        if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
          throw new Error('Clipboard unavailable');
        }
        const png = await pngFromSvg(src);
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
        showStatus('Copied image');
      } catch (imageError) {
        try {
          const absoluteUrl = new URL(src, window.location.href).href;
          await navigator.clipboard.writeText(absoluteUrl);
          showStatus('Copied link');
        } catch (textError) {
          showStatus('Copy failed');
        }
      }
    });
  });

  // --- Subtle entrance animation (Intersection Observer) ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .color-swatch').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(el);
  });
});
