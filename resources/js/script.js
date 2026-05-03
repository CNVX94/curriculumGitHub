/* ==============================================
   PERSPECTIVE SYNTHWAVE GRID - CANVAS ANIMATION
   ============================================== */
(function() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let time = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const vanishingX = width / 2;
    const vanishingY = height * 0.35 + Math.sin(time * 0.0003) * 15;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const strokeColor = isLight ? 'rgba(128, 80, 176, 0.45)' : 'rgba(184, 41, 232, 0.5)';

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;

    // Vertical radiating lines
    const totalVerts = 28;
    for (let i = -totalVerts / 2; i <= totalVerts / 2; i++) {
      const baseX = vanishingX + ((i / totalVerts) * width * 2.5);
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(baseX, height);
      ctx.stroke();
    }

    // Horizontal horizon lines (get closer near vanishing point)
    const horizonLines = 42;
    for (let i = 0; i < horizonLines; i++) {
      const t = i / (horizonLines - 1);
      const y = vanishingY + Math.pow(t, 1.6) * (height - vanishingY);
      const alpha = 0.15 + t * 0.35;

      const hColor = isLight
        ? `rgba(176, 140, 210, ${alpha.toFixed(2)})`
        : `rgba(0, 240, 255, ${alpha.toFixed(2)})`;

      ctx.strokeStyle = hColor;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center glow
    const gradient = ctx.createRadialGradient(vanishingX, vanishingY, 0, vanishingX, vanishingY, height * 0.6);
    const glowColor = isLight ? 'rgba(224, 96, 160, 0.06)' : 'rgba(255, 45, 149, 0.08)';
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    time++;
    requestAnimationFrame(draw);
  }

  draw();
})();

/* ==============================================
   SCROLL REVEAL - INTERSECTION OBSERVER
   ============================================== */
(function() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    observer.observe(el);
  });
})();

/* ==============================================
   CURSOR GLOW TRAIL
   ============================================== */
(function() {
  const glow = document.createElement('div');
  glow.classList.add('cursor-glow');
  document.body.appendChild(glow);

  let mouseX = -1000;
  let mouseY = -1000;
  let currentX = mouseX;
  let currentY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  }

  animate();
})();

/* ==============================================
   CERTIFICATE CAROUSEL
   ============================================== */
const certificateImages = [
  './resources/files/certificados/UC-GitHub.jpg',
  './resources/files/certificados/UCScrum.jpg',
];

document.addEventListener('DOMContentLoaded', function() {
  const carouselItems = document.querySelector('.carousel-inner');

  if (!carouselItems) {
    console.error('Carousel container not found');
    return;
  }

  certificateImages.forEach((image, index) => {
    const item = document.createElement('div');
    item.classList.add('carousel-item');

    if (index === 0) {
      item.classList.add('active');
    }

    const img = document.createElement('img');
    img.src = image;
    img.classList.add('d-block', 'w-100');
    img.alt = `Certificado ${index + 1}`;
    img.style.maxHeight = '400px';
    img.style.objectFit = 'contain';

    item.appendChild(img);
    carouselItems.appendChild(item);
  });

  const carouselElement = document.getElementById('carouselExample');
  if (carouselElement && typeof bootstrap !== 'undefined') {
    new bootstrap.Carousel(carouselElement);
  }
});

/* ==============================================
   THEME TOGGLE
   ============================================== */
(function() {
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    updateIcon(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
      });
    }

    function updateIcon(theme) {
      if (themeIcon) {
        if (theme === 'light') {
          themeIcon.classList.remove('bi-moon-fill');
          themeIcon.classList.add('bi-sun-fill');
        } else {
          themeIcon.classList.remove('bi-sun-fill');
          themeIcon.classList.add('bi-moon-fill');
        }
      }
    }
  });
})();
