// ─────────────────────────────────────────────────────────────────────────────
// hero.js — Hero Section Animations and Logic
// Includes: Lottie Signature, Hero Collapse (Lando Norris style), Subtitle, Preloader
// ─────────────────────────────────────────────────────────────────────────────

import { HERO_CONFIG } from './hero.config.js';

export function initHero() {
    // ── Preloader & Logo Logic ──
    const panel = document.getElementById('loader-panel');
    const maskSvg = document.getElementById('loader-mask-svg');
    const twoPath = document.getElementById('two-mask-path');
    const navEl = document.querySelector('nav');
    const logoWrap = document.querySelector('.loader-logo-fill-wrap');
    const solidLogo = document.getElementById('loader-logo-fill');

    if (panel && maskSvg) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const pw = 138.06 / 2;
        const ph = 136.72 / 2;
        const MASK_OFFSET_X = 0, MASK_OFFSET_Y = -2;

        function twoT(s) { return `translate(${cx + MASK_OFFSET_X},${cy + MASK_OFFSET_Y}) scale(${s}) translate(${-pw},${-ph})`; }
        gsap.set(twoPath, { attr: { transform: twoT(0.007) } });
        gsap.set(maskSvg, { opacity: 1 });
        gsap.set(panel, { zIndex: 3 });
        if (logoWrap) gsap.set(logoWrap, { opacity: 0, scale: 0.4 });

        function _blockScroll(e) { e.preventDefault(); }
        window.addEventListener('wheel', _blockScroll, { passive: false });
        window.addEventListener('touchmove', _blockScroll, { passive: false });
        if (window.__lenisInstance) window.__lenisInstance.stop();

        window.loaderProgress = 0;
        let _targetProgress = window.__loaderProgressNow || 0;
        let _smoothProgress = _targetProgress;
        let _animRaf, _animStop = false;

        window.__onLoaderProgress = p => _targetProgress = p;

        function _animLoop() {
            if (_animStop) return;
            if (_targetProgress < 48) _targetProgress += 0.04;
            else if (_targetProgress >= 50 && _targetProgress < 98) _targetProgress += 0.03;
            _smoothProgress += (_targetProgress - _smoothProgress) * 0.08;
            if (Math.abs(_targetProgress - _smoothProgress) < 0.05) _smoothProgress = _targetProgress;
            window.loaderProgress = _smoothProgress;
            const p = Math.min(100, Math.max(0, _smoothProgress));

            if (solidLogo) {
                solidLogo.style.clipPath = `inset(${100 - p}% 0 0 0)`;
                if (p >= 99.5 && !solidLogo.dataset.shimmered) {
                    solidLogo.dataset.shimmered = "true";
                    solidLogo.classList.add('is-loaded');
                    setTimeout(startReveal, 700);
                }
            } else if (p >= 99.5 && !_animStop) startReveal();
            _animRaf = requestAnimationFrame(_animLoop);
        }
        _animRaf = requestAnimationFrame(_animLoop);

        let _breathTween = null;
        if (logoWrap) {
            gsap.to(logoWrap, {
                opacity: 1, scale: 1.00, duration: 0.55, delay: 0.2, ease: 'power3.out',
                onComplete() {
                    _breathTween = gsap.to(logoWrap, { scale: 0.94, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true });
                    if (_targetProgress < 6) _targetProgress = 6;
                }
            });
        }

        (window.__preloaderReady || Promise.resolve()).then(() => {
            if (_breathTween) _breathTween.kill();
            if (logoWrap) gsap.to(logoWrap, { scale: 1, duration: 0.3, ease: 'power2.out' });
            _targetProgress = 100;
            setTimeout(() => { if (!_animStop) startReveal(); }, 1500);
        });

        function startReveal() {
            _animStop = true;
            cancelAnimationFrame(_animRaf);
            const tl = gsap.timeline();
            tl.set({}, {}, 0.1)
              .to(panel, { opacity: 0, zIndex: -1, duration: 0.05, ease: 'none' })
              .to(twoPath, {
                  duration: 2.8, ease: 'power3.inOut', attr: { transform: twoT(2400) },
                  onComplete: () => {
                      const loaderEl = document.getElementById('site-loader');
                      if (loaderEl) { loaderEl.style.opacity = '0'; loaderEl.style.visibility = 'hidden'; loaderEl.style.display = 'none'; }
                  }
              }, '-=0.2')
              .to(logoWrap, { opacity: 0, duration: 0.25, ease: 'power3.in' }, '<')
              .call(() => {
                  const el = document.getElementById('site-loader');
                  if (el) el.style.pointerEvents = 'none';
                  if (window._senseNavBg) window._senseNavBg();
                  if (navEl) { void navEl.offsetHeight; navEl.classList.add('nav-color-ready'); }
                  window.removeEventListener('wheel', _blockScroll);
                  window.removeEventListener('touchmove', _blockScroll);
                  if (window.__lenisInstance) { window.__lenisInstance.scrollTo(0, { immediate: true }); window.__lenisInstance.start(); }
                  gsap.to([navEl, '#sound-toggle'].filter(Boolean), {
                      opacity: 1, duration: 0.4, ease: 'power2.out',
                      onStart: () => {
                          const st = document.getElementById('sound-toggle'); if (st) st.style.pointerEvents = 'auto';
                          const sh = document.getElementById('scroll-hint'); if (sh) sh.style.pointerEvents = 'auto';
                      }
                  });
                  if (window.__circuitIntro) window.__circuitIntro();
                  if (window.__startHeroAutoPan) window.__startHeroAutoPan();
              }, null, '-=2.2')
              .call(() => {
                  const el = document.getElementById('site-loader');
                  if (el) el.style.display = 'none';
                  ScrollTrigger.refresh();
                  setTimeout(() => ScrollTrigger.refresh(), 500);
              });
        }
    }

    // Initial AV Logo Reveal (Single Wipe Masking)
    gsap.set('.av-shape', { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.to('.av-shape', { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, delay: 1.5, ease: "power2.inOut" });

    // Hide persistent AV logo when entering content section
    ScrollTrigger.create({
        trigger: ".content-wrapper",
        start: "top 60%", 
        onEnter: () => gsap.to('.av-shape', { clipPath: "inset(0% 0% 100% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" }),
        onLeaveBack: () => gsap.to('.av-shape', { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" })
    });

    // ── Master Scroll-Driven Unified Hero & Manifesto Experience ──
    gsap.set('.unicorn-canvas', { transformOrigin: '58% 0%' });
    gsap.set('.hero', { transformOrigin: 'center center' });

    // Video Lifecycle Handler
    const bgVideo = document.getElementById('hero-video-bg');
    if (bgVideo) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { bgVideo.pause(); } else { bgVideo.play().catch(() => {}); }
        });
    }

    // ── Shared RAF Geometry Cache for Hero Interactions ──
    const HeroPointer = {
        x: 0, y: 0,
        isVirtual: false,
        rafScheduled: false,
        rect: null, // latest getBoundingClientRect() of .hero
        callbacks: []
    };
    
    // We bind exactly ONE pointermove listener to coalesce all pointer reads
    window.addEventListener('mousemove', (e) => {
        HeroPointer.x = e.clientX;
        HeroPointer.y = e.clientY;
        HeroPointer.isVirtual = !!e._isVirtual;
        if (!HeroPointer.rafScheduled) {
            HeroPointer.rafScheduled = true;
            requestAnimationFrame(() => {
                HeroPointer.rafScheduled = false;
                const heroEl = document.getElementById('hero');
                if (heroEl) {
                    // Maximum ONE DOM read per animation frame for all interactions
                    HeroPointer.rect = heroEl.getBoundingClientRect();
                    HeroPointer.callbacks.forEach(cb => cb(HeroPointer));
                }
            });
        }
    }, { passive: true });

    // ── Lottie Signature ──
    (function initLottieSignature() {
        const container = document.getElementById('sig-lottie');
        if (!container || typeof lottie === 'undefined') return;
        const SIG_CONFIG = HERO_CONFIG.signature;
        const O_CONFIG = HERO_CONFIG.overlay;
        const overlay = document.getElementById('hero-visual-overlay');
        
        if (overlay && O_CONFIG && O_CONFIG.enabled) {
            overlay.style.backgroundColor = O_CONFIG.color;
            overlay.style.opacity = O_CONFIG.startOpacity;
        }

        document.documentElement.style.setProperty('--sig-stroke-color', SIG_CONFIG.strokeColor);
        const anim = lottie.loadAnimation({ container, renderer: 'svg', loop: SIG_CONFIG.loop, autoplay: false, path: SIG_CONFIG.file });
        
        anim.addEventListener('DOMLoaded', () => {
            const totalFrames = anim.totalFrames, tailFrames = SIG_CONFIG.tailFrames, mainFrames = totalFrames - 1 - tailFrames, tailPx = SIG_CONFIG.tailPx;
            const heroScrollPx = Math.round(window.innerHeight * 0.7);
            const totalScrollPx = heroScrollPx + tailPx;
            const heroProgress = heroScrollPx / totalScrollPx;
            const isMobile = window.innerWidth <= 600;
            const delay = isMobile ? 0.30 : SIG_CONFIG.revealDelay;

            ScrollTrigger.create({
                trigger: '.hero-track', start: 'top top', end: () => '+=' + totalScrollPx, scrub: true,
                onUpdate: (self) => {
                    const p = self.progress;

                    // 1. Overlay opacity sync
                    if (overlay && O_CONFIG && O_CONFIG.enabled) {
                        if (p < O_CONFIG.fadeStart) {
                            overlay.style.opacity = O_CONFIG.startOpacity;
                        } else if (p > O_CONFIG.fadeEnd) {
                            overlay.style.opacity = O_CONFIG.endOpacity;
                        } else {
                            const overlayProgress = (p - O_CONFIG.fadeStart) / (O_CONFIG.fadeEnd - O_CONFIG.fadeStart);
                            overlay.style.opacity = O_CONFIG.startOpacity + (O_CONFIG.endOpacity - O_CONFIG.startOpacity) * overlayProgress;
                        }
                    }

                    // 2. Signature animation sync
                    if (p < delay) {
                        anim.goToAndStop(0, true);
                        if (window._cursorPillLocked) {
                            window._cursorPillLocked = false;
                            const heroCanvas = document.querySelector('.unicorn-canvas');
                            if (heroCanvas && window._cursorEnterPill) {
                                const r = heroCanvas.getBoundingClientRect();
                                if (window.mouseX >= r.left && window.mouseX <= r.right && window.mouseY >= r.top && window.mouseY <= r.bottom) window._cursorEnterPill(heroCanvas.dataset.cursorLabel || '');
                            }
                        }
                    } else if (p <= heroProgress) {
                        if (!window._cursorPillLocked) { window._cursorPillLocked = true; if (window._cursorLeavePill) window._cursorLeavePill(); }
                        const phase1Progress = (p - delay) / (heroProgress - delay);
                        anim.goToAndStop(Math.min(Math.round(phase1Progress * mainFrames), mainFrames), true);
                    } else {
                        if (!window._cursorPillLocked) { window._cursorPillLocked = true; if (window._cursorLeavePill) window._cursorLeavePill(); }
                        const phase2Progress = (p - heroProgress) / (1 - heroProgress);
                        anim.goToAndStop(Math.min(mainFrames + Math.round(phase2Progress * tailFrames), totalFrames - 1), true);
                    }
                }
            });
        });
        anim.addEventListener('data_failed', () => { console.warn('[Lottie] Failed to load signature'); container.style.display = 'none'; });
    }());

    // ── Hero Subtitle ──
    (function initHeroSubtitle() {
        const wrap = document.getElementById('hero-subtitle');
        const line1 = document.getElementById('subtitle-line-1');
        const line2 = document.getElementById('subtitle-line-2');
        if (!wrap || !line1 || !line2) return;
        let current = 0, interval = null, isActive = false, isFirstShow = true, firstReveal = false;
        
        function cycle() {
            const outEl = [line1, line2][current];
            current = (current + 1) % 2;
            const inEl = [line1, line2][current];
            gsap.to(outEl, { opacity: 0, y: -5, duration: 0.55, ease: 'power2.inOut' });
            gsap.fromTo(inEl, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.inOut', delay: 0.165 });
        }
        function start() {
            if (isActive) return;
            isActive = true;
            gsap.killTweensOf([line1, line2, wrap]);
            current = 0; gsap.set(line1, { opacity: 1, y: 0 }); gsap.set(line2, { opacity: 0, y: 5 });
            const dur = isFirstShow ? 0.5 : 0.15; isFirstShow = false;
            gsap.to(wrap, { opacity: 1, duration: dur, ease: 'power2.out', onComplete: () => { interval = setInterval(cycle, 2800); } });
        }
        function stop() {
            if (!isActive) return;
            isActive = false;
            if (interval) { clearInterval(interval); interval = null; }
            gsap.killTweensOf([line1, line2, wrap]);
            gsap.to(wrap, { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
        }
        function doFirstReveal() {
            if (firstReveal) return;
            firstReveal = true;
            if (window.scrollY < window.innerHeight * 0.5) setTimeout(start, 300);
        }
        if (navEl) {
            const obs = new MutationObserver(() => { if (parseFloat(navEl.style.opacity) > 0) { obs.disconnect(); doFirstReveal(); } });
            obs.observe(navEl, { attributes: true, attributeFilter: ['style'] });
        }
        ScrollTrigger.create({ trigger: '.hero-track', start: 'top top', end: 'bottom top', onToggle(self) { if (self.isActive) { if (firstReveal) start(); } else { stop(); } }, onRefresh(self) { if (self.isActive && firstReveal && !isActive) start(); } });
        const logoBtn = document.getElementById('logo-link');
        if (logoBtn) logoBtn.addEventListener('click', () => setTimeout(() => { if (firstReveal && !isActive) start(); }, 80));
        window.addEventListener('scroll', () => { if (window.scrollY < 5 && firstReveal && !isActive) start(); }, { passive: true });
        setTimeout(() => { if (!firstReveal && window.scrollY < 100) doFirstReveal(); }, 900);
    }());

    // ── Hero Tilt & AutoPan ──
    (function initHeroTilt() {
        const hero = document.getElementById('hero');
        const target = document.querySelector('.unicorn-canvas');
        if (!hero || !target) return;
        const m = gsap.matchMedia();
        m.add("(min-width: 1024px)", () => {
            let isHovering = false;
            HeroPointer.callbacks.push((ptr) => {
                const { x, y, rect, isVirtual } = ptr;
                if (!rect) return;
                const inBounds = (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
                
                if (inBounds || isVirtual) {
                    isHovering = true;
                    const mx = ((x - rect.left) / rect.width) * 2 - 1;
                    const my = ((y - rect.top) / rect.height) * 2 - 1;
                    gsap.to(target, { x: 40 + mx * -3, yPercent: 8, y: my * -3, rotateX: my * -2.4, rotateY: mx * 2.4, transformPerspective: 1000, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
                } else if (isHovering && !isVirtual) {
                    isHovering = false;
                    reset();
                }
            });
            function reset() { gsap.to(target, { x: 40, yPercent: 8, y: 0, rotateX: 0, rotateY: 0, duration: 1.5, ease: 'power3.out' }); }
            hero.addEventListener('mouseleave', (e) => { if (!e._isVirtual) reset(); });
            
            let proxyMode = 'auto', virtualX = 0, virtualY = 0, realTargetX = 0, realTargetY = 0, autoPanTime = 0, proxyRaf, lastRealTarget = null;
            function proxyLoop() {
                if (proxyMode === 'off') return;
                let evTarget = target;
                const r = HeroPointer.rect || hero.getBoundingClientRect(); // fallback if RAF hasn't fired yet
                if (!r) return;
                const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                if (proxyMode === 'auto') {
                    autoPanTime += 0.015; virtualX = cx + Math.sin(autoPanTime) * (r.width * 0.25); virtualY = cy;
                    if (autoPanTime >= Math.PI * 2) { proxyMode = 'off'; hero.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true })); window.removeEventListener('mousemove', interceptRealMouse, true); return; }
                } else if (proxyMode === 'catchup') {
                    virtualX += (realTargetX - virtualX) * 0.12; virtualY += (realTargetY - virtualY) * 0.12;
                    if (lastRealTarget) evTarget = lastRealTarget;
                    if (Math.abs(realTargetX - virtualX) < 1 && Math.abs(realTargetY - virtualY) < 1) { proxyMode = 'off'; window.removeEventListener('mousemove', interceptRealMouse, true); return; }
                }
                const ev = new MouseEvent('mousemove', { clientX: virtualX, clientY: virtualY, bubbles: true, cancelable: true });
                ev._isVirtual = true; ev._isAutoPan = (proxyMode === 'auto');
                if (evTarget && evTarget.dispatchEvent) evTarget.dispatchEvent(ev); else window.dispatchEvent(ev);
                proxyRaf = requestAnimationFrame(proxyLoop);
            }
            window.__startHeroAutoPan = function () { proxyMode = 'auto'; autoPanTime = 0; proxyLoop(); };
            function interceptRealMouse(e) {
                if (e._isVirtual) return;
                realTargetX = e.clientX; realTargetY = e.clientY; lastRealTarget = e.target;
                if (proxyMode === 'auto') proxyMode = 'catchup';
            }
            window.addEventListener('mousemove', interceptRealMouse, true);
        });
    }());

    // ── Interactive Background Ripple Grid ──
    (function initRippleGrid() {
        const R = HERO_CONFIG.ripple;
        if (!R || !R.enabled) return;

        const gridEl  = document.getElementById('rippleGrid');
        const heroInner = document.querySelector('.hero-inner');
        if (!gridEl || !heroInner) return;

        let cells = [];
        let numCols = 0;
        let numRows = 0;

        // ── Build grid cells ──────────────────────────────────────────────────
        function buildGrid() {
            gridEl.innerHTML = '';
            cells = [];

            const parentRect = gridEl.parentElement.getBoundingClientRect();
            numCols = Math.ceil(parentRect.width  / R.cellSize) + 1;
            numRows = Math.ceil(parentRect.height / R.cellSize) + 1;

            // Set CSS grid geometry & color variables at the grid level
            gridEl.style.gridTemplateColumns = `repeat(${numCols}, ${R.cellSize}px)`;
            gridEl.style.gridTemplateRows    = `repeat(${numRows}, ${R.cellSize}px)`;
            gridEl.style.width  = numCols * R.cellSize + 'px';
            gridEl.style.height = numRows * R.cellSize + 'px';
            gridEl.style.setProperty('--cell-shadow-rest', R.shadowRest);
            gridEl.style.setProperty('--cell-shadow-hover', R.shadowHover);
            gridEl.style.setProperty('--cell-shadow-ripple', R.shadowRipple);
            gridEl.style.setProperty('--ripple-base-opacity', R.baseOpacity);
            gridEl.style.setProperty('--ripple-peak-opacity', R.peakOpacity);

            // Build cells in one fragment pass (no reflows during construction)
            const frag = document.createDocumentFragment();
            for (let r = 0; r < numRows; r++) {
                for (let c = 0; c < numCols; c++) {
                    const el = document.createElement('div');
                    el.className = 'ripple-cell';
                    el.style.borderColor = R.borderColor;
                    // Box shadow is handled by CSS using the grid-level variables

                    frag.appendChild(el);
                    cells.push({ el, row: r, col: c });
                }
            }
            gridEl.appendChild(frag);
            // Reset hover reference on grid rebuild
            lastHoveredCell = null;
        }

        // ── Trigger ripple wave from origin cell ──────────────────────────────
        function triggerRipple(originRow, originCol) {
            // Phase 1: strip all animation classes + set per-cell timing properties
            cells.forEach(({ el, row, col }) => {
                const dist     = Math.hypot(originRow - row, originCol - col);
                const delay    = Math.max(0, dist * R.waveSpeed);
                const duration = R.pulseDuration + dist * R.pulseDistanceScale;
                el.classList.remove('is-rippling');
                el.style.setProperty('--ripple-delay',    delay    + 'ms');
                el.style.setProperty('--ripple-duration', duration + 'ms');
            });

            // Phase 2: single forced reflow so browser registers class removal
            void gridEl.offsetWidth;

            // Phase 3: re-apply animation class to all cells simultaneously
            cells.forEach(({ el }) => el.classList.add('is-rippling'));
        }

        // ── Click delegation on .hero-inner ───────────────────────────────────
        // Clicks on the Unicorn canvas (z-index 4) bubble up through .hero-inner.
        heroInner.addEventListener('click', (e) => {
            const gridRect = gridEl.getBoundingClientRect();
            if (!gridRect.width || !gridRect.height) return;
            
            const normX = (e.clientX - gridRect.left) / gridRect.width;
            const normY = (e.clientY - gridRect.top) / gridRect.height;
            
            let col = Math.floor(normX * numCols);
            let row = Math.floor(normY * numRows);
            if (col >= numCols) col = numCols - 1;
            if (row >= numRows) row = numRows - 1;
            
            if (col >= 0 && col < numCols && row >= 0 && row < numRows) {
                triggerRipple(row, col);
            }
        });

        // ── Hover delegation on .hero-inner ───────────────────────────────────
        let lastHoveredCell = null;
        HeroPointer.callbacks.push((ptr) => {
            if (ptr.isVirtual) return; // Ripple grid doesn't respond to proxy virtual events
            
            const { x, y } = ptr;
            const gridRect = gridEl.getBoundingClientRect();
            if (!gridRect.width || !gridRect.height) return;
            
            if (x >= gridRect.left && x <= gridRect.right && y >= gridRect.top && y <= gridRect.bottom) {
                const normX = (x - gridRect.left) / gridRect.width;
                const normY = (y - gridRect.top) / gridRect.height;
                
                let col = Math.floor(normX * numCols);
                let row = Math.floor(normY * numRows);
                if (col >= numCols) col = numCols - 1;
                if (row >= numRows) row = numRows - 1;
                
                if (col >= 0 && col < numCols && row >= 0 && row < numRows) {
                    const targetIdx = row * numCols + col;
                    const targetCell = cells[targetIdx];
                    if (targetCell !== lastHoveredCell) {
                        if (lastHoveredCell) lastHoveredCell.el.classList.remove('is-hovered');
                        targetCell.el.classList.add('is-hovered');
                        lastHoveredCell = targetCell;
                    }
                }
            } else if (lastHoveredCell) {
                lastHoveredCell.el.classList.remove('is-hovered');
                lastHoveredCell = null;
            }
        });

        heroInner.addEventListener('mouseleave', () => {
            if (lastHoveredCell) {
                lastHoveredCell.el.classList.remove('is-hovered');
                lastHoveredCell = null;
            }
        });

        // ── Initial build + responsive rebuild ───────────────────────────────
        buildGrid();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildGrid, 200);
        });
    }());


    // ── Phase 3A — New Editorial Manifesto Scrub Engine ──
    (function initMasterHeroScroll() {
        const manifesto = document.getElementById('hero-manifesto');
        if (!manifesto) return;

        const navEl = document.querySelector('.nav');

        // Reduced-motion: snap manifesto into place
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set('#hero-manifesto', { y: 0 });
            return;
        }

        let isLogoHidden = false;
        if (navEl) navEl.classList.add('nav--hero');

        // ── GEOMETRY CONTRACT: Hero → Manifesto handoff ──
        // The Manifesto sits outside the sticky container and flows normally.
        // We pull it upward so it smoothly scrolls into the viewport exactly
        // as the Hero finishes scaling down (progress 0.22).
        const trackEl = document.querySelector('.hero-track');
        const manifestoEl = document.getElementById('hero-manifesto');
        if (trackEl && manifestoEl) {
            const scrollDistance = trackEl.offsetHeight - window.innerHeight;
            const startEnterScroll = scrollDistance * 0.22;
            const targetTop = startEnterScroll + window.innerHeight;
            const pullUp = trackEl.offsetHeight - targetTop;
            manifestoEl.style.marginTop = `-${pullUp}px`;
        }
        
        // Remove margin from #work to restore its natural flow after Manifesto
        const workEl = document.getElementById('work');
        if (workEl) workEl.style.marginTop = '0px';

        // ── masterTl: single ScrollTrigger, scrubbed ──────────────
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.hero-track',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                onUpdate: (self) => {
                    const p = self.progress;
                    if (p > 0.03 && p < 0.88) {
                        if (!isLogoHidden) { gsap.to('.av-shape', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' }); isLogoHidden = true; }
                    } else {
                        if (isLogoHidden) { gsap.to('.av-shape', { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.inOut', overwrite: 'auto' }); isLogoHidden = false; }
                    }
                }
            }
        });

        // ── Initial state ─────────────────────────────────────────
        gsap.set('.hero',                { clipPath: 'inset(0vh calc(0vw - 0vh) 0vh calc(0vw - 0vh) round 0px)', opacity: 1, y: 0, scale: 1 });
        gsap.set('.signature-container', { opacity: 1, y: 0, scale: 1 });
        gsap.set('#hero-video-wrap',     { opacity: 0 });
        gsap.set('#white-takeover',      { opacity: 0, pointerEvents: 'none' });

        const isVideoEnabled   = HERO_CONFIG.video && HERO_CONFIG.video.enabled !== false;
        const maxVideoOpacity  = isVideoEnabled ? (HERO_CONFIG.video.maxOpacity || 0.85) : 0;

        // ── Phase 1: Hero card scale down (0.00 → 0.22) ──────────
        masterTl.to('.hero', { scale: 0.42, clipPath: 'inset(12vh calc(50vw - 44vh) 0vh calc(50vw - 44vh) round 0px)', opacity: 1, ease: 'power2.inOut', duration: 0.22 }, 0);
        masterTl.fromTo('#scroll-hint', { opacity: 1, pointerEvents: 'auto' }, { opacity: 0, pointerEvents: 'none', duration: 0.12, ease: 'power1.out' }, 0);
        masterTl.to('.unicorn-canvas', { scale: 1.19, ease: 'power2.inOut', duration: 0.22 }, 0);
        masterTl.to('#hero-video-wrap', { opacity: maxVideoOpacity, ease: 'power1.inOut', duration: 0.22 }, 0);

        // ── Phase 2: Hero card + Signature scroll UP (0.22 → 0.595) synced to natural scroll ──
        masterTl.to('.hero',                { y: '-105vh', pointerEvents: 'none', ease: 'none', duration: 0.375 }, 0.22);
        masterTl.to('.signature-container', { y: '-105vh', pointerEvents: 'none', ease: 'none', duration: 0.375 }, 0.22);

        // ── Phase 3: Manifesto remains static (0.44 → 0.80) ───────
        // Zero sub-element animations (No stagger, no scale, no fade-in)

        // ── Phase 4: Cinematic lift — Hero → Work handoff (0.80 → 0.86) ──
        // GEOMETRY CONTRACT: Must remain at 0.80 start, 0.06 duration, yPercent -110.
        masterTl.to('.hero-sticky-container', {
            yPercent: -110,
            duration: 0.06,
            ease: 'power2.in'
        }, 0.80);

    }());
}

