// ─────────────────────────────────────────────────────────────────────────────
// shared.js — Cross-section shared logic
// Includes: Safari Viewport Fix, Lenis Smooth Scroll, Custom Cursor, and Smart Nav
// ─────────────────────────────────────────────────────────────────────────────

import { initMouseTrail } from './mouse-trail.js';

export function initShared() {
    // ── Detect touch/mobile for disabling heavy effects ───────────────────────
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    window.isTouchDevice = isTouchDevice; // Expose globally for other modules

    // ── F1 / MotoGP Inspired Mouse Telemetry Trail ───────────────────────────
    initMouseTrail();

    // ── Safari Viewport Bands Fix ────────────────────────────────────────────
    (function setSafariViewportFix() {
        function updateAppHeight() {
            const h = window.innerHeight;
            document.documentElement.style.setProperty('--app-height', h + 'px');
        }
        updateAppHeight();
        window.addEventListener('resize', updateAppHeight, { passive: true });
        window.addEventListener('orientationchange', () => setTimeout(updateAppHeight, 100), { passive: true });
    }());

    // ── Hamburger / Mobile Nav ────────────────────────────────────────────────
    (function initMobileNav() {
        const hamburger = document.getElementById('hamburger');
        const mobileNav = document.getElementById('mobile-nav');
        if (!hamburger || !mobileNav) return;
        const mobileLinks = mobileNav.querySelectorAll('a');

        function openMenu() {
            hamburger.classList.add('open');
            hamburger.setAttribute('aria-expanded', 'true');
            mobileNav.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', () => {
            hamburger.classList.contains('open') ? closeMenu() : openMenu();
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#') && targetId !== '#') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        setTimeout(() => {
                            if (window.__lenisInstance) {
                                window.__lenisInstance.scrollTo(target, { duration: 1.0 });
                            } else {
                                target.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 350);
                    }
                }
            });
        });
    }());

    // ── Scroll-aware Nav State (transparent hero → frosted glass) ─────────────
    (function initNavState() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        function updateNav() {
            const heroHeight = window.innerHeight;
            if (window.scrollY < heroHeight * 0.6) {
                nav.classList.add('at-hero');
                nav.classList.remove('scrolled');
            } else {
                nav.classList.remove('at-hero');
                nav.classList.add('scrolled');
            }
        }
        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });
    }());

    // ── Progressive Blur Stack ────────────────────
    (function initNavBlur() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const stack = document.createElement('div');
        stack.id = 'nav-blur-stack';
        const blurLevels = [0.078125, 0.15625, 0.3125, 0.625, 1.25, 2.5, 5, 10];
        const slice = 100 / blurLevels.length;
        blurLevels.forEach((blur, i) => {
            const layer = document.createElement('div');
            const t0 = (i * slice).toFixed(4);
            const t1 = ((i + 1) * slice).toFixed(4);
            const t2 = ((i + 2) * slice).toFixed(4);
            const t3 = ((i + 3) * slice).toFixed(4);
            const mask = `linear-gradient(to top, rgba(0,0,0,0) ${t0}%, rgb(0,0,0) ${t1}%, rgb(0,0,0) ${t2}%, rgba(0,0,0,0) ${t3}%)`;
            layer.style.cssText = `position:absolute;inset:0;backdrop-filter:blur(${blur}px);-webkit-backdrop-filter:blur(${blur}px);-webkit-mask-image:${mask};mask-image:${mask};pointer-events:none`;
            stack.appendChild(layer);
        });
        nav.appendChild(stack);
        function syncBlurStack() {
            nav.classList.contains('scrolled') ? stack.classList.add('visible') : stack.classList.remove('visible');
        }
        new MutationObserver(syncBlurStack).observe(nav, { attributes: true, attributeFilter: ['class'] });
        syncBlurStack();
    }());

    // ── Smart Nav Colour Sensing ───────────────────────────────────────────────
    (function initSmartNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        let rafId = null;
        function luminance(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
        
        // Expose globally for cursor pill lock checks etc.
        window.mouseX = window.mouseX || 0;
        window.mouseY = window.mouseY || 0;

        function senseBackground() {
            const navH = nav.offsetHeight;
            const sampleY = navH * 0.35;
            const xs = [window.innerWidth * 0.08, window.innerWidth * 0.50, window.innerWidth * 0.92];
            let totalLum = 0; let count = 0;
            xs.forEach(x => {
                const stack = document.elementsFromPoint(x, sampleY);
                for (let i = 0; i < stack.length; i++) {
                    const el = stack[i];
                    if (nav.contains(el) || el === nav) continue;
                    const bg = window.getComputedStyle(el).backgroundColor;
                    if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
                        if (el === document.body || el === document.documentElement) {
                            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                            const m = bodyBg.match(/\d+/g);
                            if (m && m.length >= 3) { totalLum += luminance(+m[0], +m[1], +m[2]); count++; }
                            break;
                        }
                        continue;
                    }
                    const m = bg.match(/\d+\.?\d*/g);
                    if (m && m.length >= 3) {
                        const alpha = m.length >= 4 ? parseFloat(m[3]) : 1;
                        if (alpha < 0.2) continue;
                        totalLum += luminance(+m[0], +m[1], +m[2]); 
                        count++; 
                    }
                    break;
                }
            });
            const avgLum = count > 0 ? totalLum / count : 0;
            const pill = document.getElementById('circuit-pill');
            const soundToggle = document.getElementById('sound-toggle');
            if (avgLum > 140) {
                nav.classList.add('nav-on-light');
                if (pill) pill.classList.add('track-on-light');
            } else {
                nav.classList.remove('nav-on-light');
                if (pill) pill.classList.remove('track-on-light');
            }
            if (pill) {
                const isLight = avgLum > 140;
                pill.style.setProperty('--rider-plate', isLight ? 'rgb(229, 228, 224)' : 'rgb(29, 29, 29)');
                pill.style.setProperty('--rider-ring-color', 'rgba(255, 85, 9, 0.7)');
            }
            if (soundToggle) {
                const stX = window.innerWidth * 0.08;
                const stY = window.innerHeight - (window.innerHeight * 0.08);
                const stStack = document.elementsFromPoint(stX, stY);
                let stLum = 0;
                for (let i = 0; i < stStack.length; i++) {
                    const el = stStack[i];
                    if (soundToggle.contains(el) || el === soundToggle) continue;
                    const bg = window.getComputedStyle(el).backgroundColor;
                    if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
                        if (el === document.body || el === document.documentElement) {
                            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                            const m = bodyBg.match(/\d+/g);
                            if (m && m.length >= 3) stLum = luminance(+m[0], +m[1], +m[2]);
                            break;
                        }
                        continue;
                    }
                    const m = bg.match(/\d+\.?\d*/g);
                    if (m && m.length >= 3) {
                        const alpha = m.length >= 4 ? parseFloat(m[3]) : 1;
                        if (alpha < 0.2) continue;
                        stLum = luminance(+m[0], +m[1], +m[2]);
                    }
                    break;
                }
                if (stLum > 140) soundToggle.classList.add('sound-on-light');
                else soundToggle.classList.remove('sound-on-light');
            }
            rafId = null;
        }
        function onScroll() { if (!rafId) rafId = requestAnimationFrame(senseBackground); }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('load', senseBackground);
        senseBackground();
        window._senseNavBg = senseBackground;
    }());

    // ── Scroll Restoration Fix ──
    if (history.scrollRestoration) history.scrollRestoration = 'manual';

    function restoreScroll() {
        const savedScroll = sessionStorage.getItem('portfolio_scroll_pos');
        if (savedScroll !== null) {
            const pos = parseFloat(savedScroll);
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            if (window.__lenisInstance) {
                window.__lenisInstance.scrollTo(pos, { immediate: true });
            } else {
                window.scrollTo(0, pos);
            }
            sessionStorage.removeItem('portfolio_scroll_pos');
        } else {
            window.scrollTo(0, 0);
            if (window.__lenisInstance) window.__lenisInstance.scrollTo(0, { immediate: true });
        }
    }

    if (sessionStorage.getItem('portfolio_scroll_pos') === null) {
        window.scrollTo(0, 0);
    }

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) restoreScroll();
    });
    window.__restorePortfolioScroll = restoreScroll;

    // ── Lenis & GSAP Setup ──
    gsap.registerPlugin(ScrollTrigger);
    if (isTouchDevice) ScrollTrigger.normalizeScroll(true);
    const lenis = !isTouchDevice ? new Lenis({
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        mouseMultiplier: 1,
    }) : null;
    window.__lenisInstance = lenis;
    if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0, 0);
    }

    // ── Magnetic UI Elements ──
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const bounds = el.getBoundingClientRect();
                const x = e.clientX - bounds.left - bounds.width / 2;
                const y = e.clientY - bounds.top - bounds.height / 2;
                const strength = el.dataset.strength || 20;
                gsap.to(el, { x: (x / bounds.width) * strength, y: (y / bounds.height) * strength, duration: 0.2, ease: "power2.out" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
            });
        });
    }

    // ── Navigation Smooth Scrolling ──
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;
            e.preventDefault();
            
            if (targetId === '#') {
                if (window.__lenisInstance) window.__lenisInstance.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    if (window.__lenisInstance) window.__lenisInstance.scrollTo(targetElement, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), offset: 0 });
                    else targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ── Custom Cursor ──
    if (!isTouchDevice) {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        const cursorLabel = document.querySelector('.cursor-label');
        let outlineX = 0, outlineY = 0;
        let activePill = false, currentPillOffset = 72;
        const _measure = document.createElement('span');
        Object.assign(_measure.style, { position: 'fixed', top: '-999px', left: '-999px', visibility: 'hidden', pointerEvents: 'none', fontFamily: 'system-ui', fontSize: '13px', fontWeight: '500', letterSpacing: '0.04em', whiteSpace: 'nowrap' });
        document.body.appendChild(_measure);

        function calcPill(label) {
            _measure.textContent = label;
            const pillW = Math.ceil(_measure.getBoundingClientRect().width) + 32;
            return { pillW, offset: pillW / 2 + 9 };
        }

        let _firstMoveCursor = true;
        // Ensure outline is hidden at start
        gsap.set(cursorOutline, { scale: 0, opacity: 0 });

        window.addEventListener('mousemove', (e) => {
            if (e._isAutoPan) return;
            window.mouseX = e.clientX;
            window.mouseY = e.clientY;
            if (_firstMoveCursor) {
                outlineX = window.mouseX; outlineY = window.mouseY;
                cursorDot.classList.add('visible'); cursorOutline.classList.add('visible');
                _firstMoveCursor = false;
            }
            gsap.set(cursorDot, { x: window.mouseX, y: window.mouseY });
        });

        gsap.ticker.add(() => {
            const targetX = activePill ? window.mouseX + currentPillOffset : window.mouseX;
            const targetY = window.mouseY;
            if (activePill) {
                const dt = 1.0 - Math.pow(1.0 - 0.20, gsap.ticker.deltaRatio());
                outlineX += (targetX - outlineX) * dt;
                outlineY += (targetY - outlineY) * dt;
            } else {
                outlineX = targetX;
                outlineY = targetY;
            }
            gsap.set(cursorOutline, { x: outlineX, y: outlineY });
        });

        window._cursorEnterPill = (label) => {
            activePill = true;
            const { pillW, offset } = calcPill(label);
            currentPillOffset = offset;
            cursorOutline.style.setProperty('--pill-w', pillW + 'px');
            cursorLabel.textContent = label;
            cursorOutline.classList.remove('hover-state');
            cursorOutline.classList.add('pill-state');
            gsap.to(cursorDot, { scale: 0, opacity: 0, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(cursorOutline, { scale: 1, opacity: 1, duration: 0.32, ease: 'back.out(1.2)', overwrite: 'auto' });
        };
        window._cursorLeavePill = () => {
            activePill = false;
            cursorOutline.classList.remove('pill-state');
            cursorOutline.style.removeProperty('--pill-w');
            cursorLabel.textContent = '';
            currentPillOffset = 72;
            gsap.to(cursorDot, { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(cursorOutline, { scale: 0, opacity: 0, duration: 0.22, ease: 'power2.in', overwrite: 'auto' });
        };

        let isHoveringInteractive = false;

        const enterHover = () => {
            if (activePill) return;
            cursorOutline.classList.add('hover-state');
            gsap.to(cursorDot, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(cursorOutline, { scale: 1.08, opacity: 1, duration: 0.25, ease: 'back.out(1.4)', overwrite: 'auto' });
        };

        const leaveHover = () => {
            if (activePill) return;
            cursorOutline.classList.remove('hover-state');
            gsap.to(cursorDot, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(cursorOutline, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
        };

        const INTERACTIVE_SELECTOR = 'a, button, .hover-trigger, .view-btn, .magnetic, .exp-row, .timeline-card, .timeline-node, .work-card, .work-item, .project-card, .case-study-card, .cta-button, .btn, .nav-link, input, textarea, select, label, [role="button"], [data-cursor], [onclick]';

        document.addEventListener('mouseover', (e) => {
            if (activePill) return;
            const target = e.target.closest(INTERACTIVE_SELECTOR) ||
                           (e.target && getComputedStyle(e.target).cursor === 'pointer' ? e.target : null);
            if (target) {
                if (!isHoveringInteractive) {
                    isHoveringInteractive = true;
                    enterHover();
                }
            } else {
                if (isHoveringInteractive) {
                    isHoveringInteractive = false;
                    leaveHover();
                }
            }
        }, { passive: true });

        document.querySelectorAll('[data-cursor="pill"]').forEach(el => {
            const label = el.dataset.cursorLabel || '';
            const isHeroCanvas = el.classList.contains('unicorn-canvas');
            el.addEventListener('mouseenter', () => {
                if (isHeroCanvas && window._cursorPillLocked) return;
                window._cursorEnterPill(label);
            });
            el.addEventListener('mouseleave', window._cursorLeavePill);
        });

        let _senseRaf = false;
        function _senseBg() {
            _senseRaf = false;
            const stack = document.elementsFromPoint(window.mouseX, window.mouseY);
            let lum = null;
            for (let i = 0; i < stack.length; i++) {
                const el = stack[i];
                if (el === cursorDot || el === cursorOutline) continue;
                let bg = getComputedStyle(el).backgroundColor;
                if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
                const m = bg.match(/\d+\.?\d*/g);
                if (m && m.length >= 3) {
                    const alpha = m.length >= 4 ? parseFloat(m[3]) : 1;
                    if (alpha < 0.2) continue;
                    lum = 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]; 
                    break; 
                }
            }
            if (lum === null) {
                const m = getComputedStyle(document.body).backgroundColor.match(/\d+\.?\d*/g);
                lum = m && m.length >= 3 ? 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2] : 0;
            }
            cursorOutline.classList.toggle('cursor-on-light', lum > 140);
        }
        window.addEventListener('mousemove', () => { if (!_senseRaf) { _senseRaf = true; requestAnimationFrame(_senseBg); } }, { passive: true });
        window.addEventListener('scroll', () => { if (!_senseRaf) { _senseRaf = true; requestAnimationFrame(_senseBg); } }, { passive: true });
        _senseBg();
    }
}
