const XMB = (() => {
    let currentCat = 0;
    let categories = [];
    let panels = [];
    let soundEnabled = true;
    let audioCtx = null;
    let clockInterval = null;
    let carouselSlide = 0;
    let carouselTotal = 2;

    function init() {
        categories = Array.from(document.querySelectorAll('.xmb-cat'));
        panels = Array.from(document.querySelectorAll('.xmb-panel'));
        carouselTotal = document.querySelectorAll('.carousel-slide').length;

        initTheme();
        initClock();
        bindEvents();
        updateUI();
    }

    function initTheme() {
        const saved = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
    }

    function initClock() {
        const el = document.getElementById('xmbClock');
        if (!el) return;
        function tick() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            el.textContent = h + ':' + m;
        }
        tick();
        clockInterval = setInterval(tick, 10000);
    }

    function updateThemeIcon(theme) {
        const icon = document.getElementById('themeIcon');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }

    function toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
        playSound('select');
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        const icon = document.getElementById('soundIcon');
        if (icon) {
            icon.className = soundEnabled ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill';
        }
        if (soundEnabled) playSound('nav');
    }

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();

            if (type === 'nav') {
                playTone(ctx, 880, 0.06, 'sine', 0.08);
            } else if (type === 'category') {
                playTone(ctx, 660, 0.08, 'sine', 0.1);
                setTimeout(() => playTone(ctx, 880, 0.05, 'sine', 0.07), 60);
            } else if (type === 'select') {
                playTone(ctx, 1046, 0.05, 'sine', 0.1);
                setTimeout(() => playTone(ctx, 1318, 0.06, 'sine', 0.08), 50);
            }
        } catch (e) {
            // Audio not supported
        }
    }

    function playTone(ctx, freq, duration, type, vol) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.06);
    }

    function setCategory(index) {
        if (index < 0 || index >= categories.length) return;
        if (index === currentCat) return;

        const oldPanel = panels[currentCat];
        const newPanel = panels[index];

        oldPanel.classList.remove('active');
        oldPanel.classList.add('exiting');

        currentCat = index;

        setTimeout(() => {
            oldPanel.classList.remove('exiting');
            oldPanel.style.display = 'none';
            newPanel.style.display = 'block';
            newPanel.classList.add('entering');
            newPanel.classList.add('active');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    newPanel.classList.remove('entering');
                });
            });
        }, 200);

        categories.forEach((cat, i) => {
            cat.classList.toggle('active', i === index);
        });

        scrollCategoryIntoView();
        playSound('category');
    }

    function scrollCategoryIntoView() {
        const active = categories[currentCat];
        if (active) {
            active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    function updateUI() {
        categories.forEach((cat, i) => {
            cat.classList.toggle('active', i === currentCat);
        });
        panels.forEach((panel, i) => {
            if (i === currentCat) {
                panel.classList.add('active');
                panel.style.display = 'block';
            } else {
                panel.classList.remove('active');
                panel.style.display = 'none';
            }
        });
        scrollCategoryIntoView();
        updateCarousel();
    }

    function bindEvents() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentCat > 0) setCategory(currentCat - 1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentCat < categories.length - 1) setCategory(currentCat + 1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    focusNextItem();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    focusPrevItem();
                    break;
            }
        });

        // Category click
        categories.forEach((cat, i) => {
            cat.addEventListener('click', () => {
                setCategory(i);
            });
        });

        // Theme toggle
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

        // Sound toggle
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) soundBtn.addEventListener('click', toggleSound);

        // Navigation links (data-nav)
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-nav');
                const idx = categories.findIndex(c => c.dataset.id === target);
                if (idx >= 0) setCategory(idx);
            });
        });

        // Carousel controls
        const prevBtn = document.getElementById('certPrev');
        const nextBtn = document.getElementById('certNext');
        if (prevBtn) prevBtn.addEventListener('click', () => carouselNav(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => carouselNav(1));

        // Carousel dots
        const dots = document.querySelectorAll('#certDots .dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                carouselSlide = parseInt(dot.dataset.slide);
                updateCarousel();
                playSound('nav');
            });
        });

        // Touch swipe for categories
        let touchStartX = 0;
        let touchEndX = 0;
        const catBar = document.getElementById('xmbCategories');
        if (catBar) {
            catBar.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            catBar.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0 && currentCat < categories.length - 1) {
                        setCategory(currentCat + 1);
                    } else if (diff < 0 && currentCat > 0) {
                        setCategory(currentCat - 1);
                    }
                }
            }, { passive: true });
        }
    }

    function focusNextItem() {
        const panel = panels[currentCat];
        if (!panel) return;
        const items = panel.querySelectorAll('.xmb-item');
        const focused = panel.querySelector('.xmb-item.focused');
        if (!focused) {
            if (items.length > 0) {
                items[0].classList.add('focused');
                items[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                playSound('nav');
            }
        } else {
            const idx = Array.from(items).indexOf(focused);
            if (idx < items.length - 1) {
                focused.classList.remove('focused');
                items[idx + 1].classList.add('focused');
                items[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                playSound('nav');
            }
        }
    }

    function focusPrevItem() {
        const panel = panels[currentCat];
        if (!panel) return;
        const items = panel.querySelectorAll('.xmb-item');
        const focused = panel.querySelector('.xmb-item.focused');
        if (focused) {
            const idx = Array.from(items).indexOf(focused);
            if (idx > 0) {
                focused.classList.remove('focused');
                items[idx - 1].classList.add('focused');
                items[idx - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                playSound('nav');
            } else {
                focused.classList.remove('focused');
            }
        }
    }

    function carouselNav(dir) {
        carouselSlide += dir;
        if (carouselSlide < 0) carouselSlide = carouselTotal - 1;
        if (carouselSlide >= carouselTotal) carouselSlide = 0;
        updateCarousel();
        playSound('nav');
    }

    function updateCarousel() {
        const track = document.getElementById('certTrack');
        if (track) {
            track.style.transform = `translateX(-${carouselSlide * 100}%)`;
        }
        const dots = document.querySelectorAll('#certDots .dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === carouselSlide);
        });
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === carouselSlide);
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', XMB.init);