const PSPWaves = (() => {
    const canvas = document.getElementById('pspBg');
    if (!canvas) return { start: () => {}, stop: () => {}, resize: () => {}, setTheme: () => {} };

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let animId = null;
    let time = 0;
    let currentTheme = 'dark';

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const THEMES = {
        dark: {
            bg1: '#000a1a',
            bg2: '#001845',
            bg3: '#001233',
            ribbons: [
                { h: 195, s: 100, l: 45, a: 0.14 },
                { h: 210, s: 90, l: 50, a: 0.12 },
                { h: 225, s: 85, l: 42, a: 0.10 },
                { h: 200, s: 95, l: 48, a: 0.13 },
                { h: 260, s: 70, l: 50, a: 0.09 },
                { h: 185, s: 100, l: 40, a: 0.11 },
                { h: 240, s: 65, l: 45, a: 0.08 },
                { h: 170, s: 90, l: 38, a: 0.10 },
                { h: 220, s: 80, l: 52, a: 0.07 },
                { h: 250, s: 75, l: 55, a: 0.06 },
            ]
        },
        light: {
            bg1: '#c8ddf5',
            bg2: '#dce8fb',
            bg3: '#e4eeff',
            ribbons: [
                { h: 210, s: 80, l: 65, a: 0.12 },
                { h: 200, s: 75, l: 70, a: 0.10 },
                { h: 220, s: 70, l: 60, a: 0.08 },
                { h: 195, s: 85, l: 68, a: 0.11 },
                { h: 240, s: 60, l: 72, a: 0.07 },
                { h: 180, s: 80, l: 62, a: 0.09 },
                { h: 230, s: 55, l: 65, a: 0.06 },
                { h: 170, s: 75, l: 58, a: 0.08 },
                { h: 205, s: 70, l: 72, a: 0.05 },
                { h: 250, s: 60, l: 70, a: 0.04 },
            ]
        }
    };

    const ribbons = [];
    const NUM_RIBBONS = 10;

    function initRibbons() {
        ribbons.length = 0;
        for (let i = 0; i < NUM_RIBBONS; i++) {
            ribbons.push({
                yBase: 0.06 + (i / NUM_RIBBONS) * 0.88 + (Math.random() - 0.5) * 0.04,
                amplitude1: 0.02 + Math.random() * 0.05,
                amplitude2: 0.01 + Math.random() * 0.03,
                amplitude3: 0.005 + Math.random() * 0.015,
                freq1: 0.3 + Math.random() * 0.6,
                freq2: 0.8 + Math.random() * 1.2,
                freq3: 1.5 + Math.random() * 2.0,
                speed1: 0.15 + Math.random() * 0.25,
                speed2: 0.08 + Math.random() * 0.15,
                speed3: 0.03 + Math.random() * 0.08,
                phase1: Math.random() * Math.PI * 2,
                phase2: Math.random() * Math.PI * 2,
                phase3: Math.random() * Math.PI * 2,
                thickness: 0.03 + Math.random() * 0.06,
                hueShift: Math.random() * 30 - 15,
                hueDrift: 0.02 + Math.random() * 0.04,
            });
        }
    }

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function drawBackground(theme) {
        const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
        grad.addColorStop(0, theme.bg1);
        grad.addColorStop(0.5, theme.bg2);
        grad.addColorStop(1, theme.bg3);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    function getSineY(x, t, ribbon) {
        const nx = x / W;
        return ribbon.yBase * H
            + Math.sin(nx * Math.PI * 2 * ribbon.freq1 + t * ribbon.speed1 + ribbon.phase1) * ribbon.amplitude1 * H
            + Math.sin(nx * Math.PI * 2 * ribbon.freq2 + t * ribbon.speed2 + ribbon.phase2) * ribbon.amplitude2 * H
            + Math.sin(nx * Math.PI * 2 * ribbon.freq3 + t * ribbon.speed3 + ribbon.phase3) * ribbon.amplitude3 * H;
    }

    function drawRibbon(ribbon, idx, t, theme) {
        const themeRibbon = theme.ribbons[idx] || theme.ribbons[0];
        const baseH = themeRibbon.h + ribbon.hueShift + Math.sin(t * ribbon.hueDrift + idx) * 12;
        const baseS = themeRibbon.s;
        const baseL = themeRibbon.l;
        const baseA = themeRibbon.a;

        const step = 3;
        const topPoints = [];
        const botPoints = [];

        for (let x = -step; x <= W + step; x += step) {
            const cy = getSineY(x, t, ribbon);
            const thick = ribbon.thickness * H * (0.8 + 0.2 * Math.sin(x / W * Math.PI * 3 + t * 0.1 + idx));
            topPoints.push({ x, y: cy - thick / 2 });
            botPoints.push({ x, y: cy + thick / 2 });
        }

        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length - 1; i++) {
            const xc = (topPoints[i].x + topPoints[i + 1].x) / 2;
            const yc = (topPoints[i].y + topPoints[i + 1].y) / 2;
            ctx.quadraticCurveTo(topPoints[i].x, topPoints[i].y, xc, yc);
        }
        ctx.lineTo(topPoints[topPoints.length - 1].x, topPoints[topPoints.length - 1].y);

        for (let i = botPoints.length - 1; i >= 0; i--) {
            if (i === botPoints.length - 1) {
                ctx.lineTo(botPoints[i].x, botPoints[i].y);
            } else {
                const xc = (botPoints[i].x + botPoints[i + 1].x) / 2;
                const yc = (botPoints[i].y + botPoints[i + 1].y) / 2;
                ctx.quadraticCurveTo(botPoints[i + 1].x, botPoints[i + 1].y, xc, yc);
            }
        }
        ctx.closePath();

        const centerX = W * 0.5;
        const centerY = getSineY(centerX, t, ribbon);
        const thick = ribbon.thickness * H;
        const grad = ctx.createLinearGradient(0, centerY - thick, 0, centerY + thick);
        const c1 = `hsla(${baseH}, ${baseS}%, ${baseL + 15}%, ${baseA})`;
        const c2 = `hsla(${baseH}, ${baseS}%, ${baseL}%, ${baseA * 0.6})`;
        const c3 = `hsla(${baseH + 15}, ${baseS}%, ${baseL + 10}%, ${baseA * 0.3})`;
        grad.addColorStop(0, c3);
        grad.addColorStop(0.3, c1);
        grad.addColorStop(0.5, c1);
        grad.addColorStop(0.7, c2);
        grad.addColorStop(1, c3);

        ctx.fillStyle = grad;
        ctx.fill();
    }

    function drawGlowPass(ribbons, t, theme) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < ribbons.length; i++) {
            const themeRibbon = theme.ribbons[i] || theme.ribbons[0];
            const baseH = themeRibbon.h + ribbons[i].hueShift + Math.sin(t * ribbons[i].hueDrift + i) * 12;
            const cy = getSineY(W * 0.5, t, ribbons[i]);
            const thick = ribbons[i].thickness * H * 2.5;

            const glow = ctx.createRadialGradient(W * 0.5, cy, 0, W * 0.5, cy, Math.max(1, thick));
            glow.addColorStop(0, `hsla(${baseH}, ${themeRibbon.s}%, ${themeRibbon.l + 20}%, ${themeRibbon.a * 0.5})`);
            glow.addColorStop(0.5, `hsla(${baseH}, ${themeRibbon.s}%, ${themeRibbon.l}%, ${themeRibbon.a * 0.2})`);
            glow.addColorStop(1, `hsla(${baseH}, ${themeRibbon.s}%, ${themeRibbon.l}%, 0)`);

            ctx.fillStyle = glow;
            ctx.fillRect(0, cy - thick, W, thick * 2);
        }
        ctx.restore();
    }

    function frame(ts) {
        time = ts * 0.001;

        const theme = THEMES[currentTheme] || THEMES.dark;

        ctx.clearRect(0, 0, W, H);
        drawBackground(theme);

        drawGlowPass(ribbons, time, theme);

        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < ribbons.length; i++) {
            drawRibbon(ribbons[i], i, time, theme);
        }
        ctx.globalCompositeOperation = 'source-over';

        animId = requestAnimationFrame(frame);
    }

    function start() {
        if (animId) cancelAnimationFrame(animId);
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            const theme = THEMES[currentTheme] || THEMES.dark;
            drawBackground(theme);
            return;
        }
        animId = requestAnimationFrame(frame);
    }

    function stop() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    function setTheme(theme) {
        currentTheme = theme;
    }

    initRibbons();
    resize();
    window.addEventListener('resize', () => {
        resize();
    });

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', (e) => {
        if (e.matches) {
            stop();
        } else {
            start();
        }
    });

    return { start, stop, resize, setTheme };
})();


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
        PSPWaves.start();
    }

    function initTheme() {
        const saved = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
        PSPWaves.setTheme(saved);
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
        PSPWaves.setTheme(next);
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
        } catch (e) {}
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

        categories.forEach((cat, i) => {
            cat.addEventListener('click', () => {
                setCategory(i);
            });
        });

        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) soundBtn.addEventListener('click', toggleSound);

        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-nav');
                const idx = categories.findIndex(c => c.dataset.id === target);
                if (idx >= 0) setCategory(idx);
            });
        });

        const prevBtn = document.getElementById('certPrev');
        const nextBtn = document.getElementById('certNext');
        if (prevBtn) prevBtn.addEventListener('click', () => carouselNav(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => carouselNav(1));

        const dots = document.querySelectorAll('#certDots .dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                carouselSlide = parseInt(dot.dataset.slide);
                updateCarousel();
                playSound('nav');
            });
        });

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