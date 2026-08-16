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

    // ── Lottie Signature ──
    (function initLottieSignature() {
        const container = document.getElementById('sig-lottie');
        if (!container || typeof lottie === 'undefined') return;
        const SIG_CONFIG = HERO_CONFIG.signature;
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
            function onMouseMove(e) {
                const { width, height, left, top } = hero.getBoundingClientRect();
                const mx = ((e.clientX - left) / width) * 2 - 1;
                const my = ((e.clientY - top) / height) * 2 - 1;
                gsap.to(target, { x: 40 + mx * -3, yPercent: 8, y: my * -3, rotateX: my * -2.4, rotateY: mx * 2.4, transformPerspective: 1000, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
            }
            function reset() { gsap.to(target, { x: 40, yPercent: 8, y: 0, rotateX: 0, rotateY: 0, duration: 1.5, ease: 'power3.out' }); }
            hero.addEventListener('mousemove', onMouseMove);
            hero.addEventListener('mouseleave', reset);
            
            let proxyMode = 'auto', virtualX = 0, virtualY = 0, realTargetX = 0, realTargetY = 0, autoPanTime = 0, proxyRaf, lastRealTarget = null;
            function proxyLoop() {
                if (proxyMode === 'off') return;
                let evTarget = target;
                const r = hero.getBoundingClientRect();
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

    // ── Interactive Independent Particle System Overlay ──
    (function initDotsCanvas() {
        const dotCanvas = document.getElementById('dotsCanvas');
        if (!dotCanvas) return;
        const ctx = dotCanvas.getContext('2d');
        const dotSpacing = 24;
        const repelRadius = 220;
        const maxDisplacement = 20; 
        let dots = [];

        function initDots() {
            const parentRect = dotCanvas.parentElement.getBoundingClientRect();
            dotCanvas.width = parentRect.width;
            dotCanvas.height = parentRect.height;
            dots = [];
            for (let x = 0; x <= dotCanvas.width; x += dotSpacing) {
                for (let y = 0; y <= dotCanvas.height; y += dotSpacing) {
                    dots.push({ ox: x, oy: y, x: x, y: y, vx: 0, vy: 0 });
                }
            }
        }

        initDots();
        window.addEventListener('resize', initDots);

        function distToCapsule(px, py, ax, ay, bx, by) {
            const abx = bx - ax, aby = by - ay;
            const len2 = abx * abx + aby * aby;
            if (len2 === 0) return Math.sqrt((px - ax) * (px - ax) + (py - ay) * (py - ay));
            const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
            const cx = ax + t * abx, cy = ay + t * aby;
            return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
        }

        gsap.ticker.add(() => {
            ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
            const parentRect = dotCanvas.getBoundingClientRect();
            const localMouseX = (window.mouseX || 0) - parentRect.left;
            const localMouseY = (window.mouseY || 0) - parentRect.top;
            
            const cursorOutline = document.querySelector('.cursor-outline');
            const activePill = cursorOutline ? cursorOutline.classList.contains('pill-state') : false;
            const pillWAttr = activePill && cursorOutline ? parseFloat(getComputedStyle(cursorOutline).getPropertyValue('--pill-w')) || 40 : 40;
            const outlineRect = cursorOutline ? cursorOutline.getBoundingClientRect() : { left: window.mouseX, top: window.mouseY, width: 40, height: 40 };
            
            const localOutlineX = outlineRect.left + outlineRect.width / 2 - parentRect.left;
            const localOutlineY = outlineRect.top + outlineRect.height / 2 - parentRect.top;

            const pillH = 40; 
            const pillR = pillH / 2;
            const capsuleAx = localOutlineX - (pillWAttr / 2 - pillR);
            const capsuleBx = localOutlineX + (pillWAttr / 2 - pillR);
            const capsuleY  = localOutlineY;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                let dist = 0, dx = 0, dy = 0;

                if (activePill && pillWAttr > 42) {
                    const dxDot = localMouseX - dot.ox, dyDot = localMouseY - dot.oy;
                    const distDot = Math.sqrt(dxDot * dxDot + dyDot * dyDot);
                    const distCap = distToCapsule(dot.ox, dot.oy, capsuleAx, capsuleY, capsuleBx, capsuleY);

                    if (distDot <= distCap) {
                        dist = distDot; dx = dxDot; dy = dyDot;
                    } else {
                        dist = distCap;
                        const t2 = Math.max(0, Math.min(1, ((dot.ox - capsuleAx) * (capsuleBx - capsuleAx)) / ((capsuleBx - capsuleAx) * (capsuleBx - capsuleAx) || 1)));
                        dx = (capsuleAx + t2 * (capsuleBx - capsuleAx)) - dot.ox;
                        dy = capsuleY - dot.oy;
                    }
                } else {
                    dx = localMouseX - dot.ox; dy = localMouseY - dot.oy;
                    dist = Math.sqrt(dx * dx + dy * dy);
                }

                let targetX = dot.ox, targetY = dot.oy;

                if (dist < repelRadius && dist > 1) {
                    const force = Math.pow((repelRadius - dist) / repelRadius, 2);
                    const len = Math.sqrt(dx * dx + dy * dy) || 1;
                    targetX = dot.ox - (dx / len) * force * maxDisplacement;
                    targetY = dot.oy - (dy / len) * force * maxDisplacement;
                }

                dot.vx += (targetX - dot.x) * 0.08; dot.vy += (targetY - dot.y) * 0.08;
                dot.vx *= 0.82; dot.vy *= 0.82;
                dot.x += dot.vx; dot.y += dot.vy;

                ctx.beginPath(); ctx.arc(dot.x, dot.y, 1.25, 0, Math.PI * 2); ctx.fill();
            }
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

