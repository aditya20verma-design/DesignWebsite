// ─────────────────────────────────────────────────────────────────────────────
// footer.js — Footer Section Animations and Logic
// Includes: Footer Reveal (Icomat style), Footer Headline Repel, Hover Sounds, Deck Reveal
// ─────────────────────────────────────────────────────────────────────────────

export function initFooter() {

    // ── Footer Reveal (Perfect Icomat Match) ──
    const footerEl = document.getElementById('contact');
    const innerEl = document.querySelector('.footer-inner');
    if (footerEl && innerEl) {
        gsap.fromTo(innerEl, 
            { yPercent: -70 }, 
            { yPercent: 0, ease: 'none', scrollTrigger: { trigger: footerEl, start: 'top bottom', end: 'bottom bottom', scrub: true } }
        );
    }

    // ── Footer Headline Per-Letter Cursor Repel ──
    const heading = document.querySelector('.footer-heading');
    if (heading && !window.matchMedia('(hover: none)').matches) {
        const RADIUS = 200, MAX_PX = 25, SLACK = 250;
        function wordSplit(text) {
            const frag = document.createDocumentFragment(), words = text.split(' ');
            words.forEach((word, wi) => {
                if (word.length === 0) { frag.appendChild(document.createTextNode(' ')); return; }
                const wordEl = document.createElement('span');
                wordEl.style.cssText = 'display:inline-block;white-space:nowrap;';
                Array.from(word).forEach(ch => {
                    const s = document.createElement('span'); s.textContent = ch; s.dataset.repel = '';
                    s.style.cssText = 'display:inline-block;will-change:transform;vertical-align:baseline;';
                    wordEl.appendChild(s);
                });
                frag.appendChild(wordEl);
                if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
            });
            return frag;
        }
        (function walk(node) {
            Array.from(node.childNodes).forEach(kid => {
                if (kid.nodeType === Node.ELEMENT_NODE) {
                    if (kid.id !== 'email-copy-btn' && kid.tagName !== 'BR') walk(kid);
                } else if (kid.nodeType === Node.TEXT_NODE && kid.textContent.trim()) {
                    kid.parentNode.replaceChild(wordSplit(kid.textContent), kid);
                }
            });
        }(heading));

        const chars = Array.from(heading.querySelectorAll('[data-repel]'));
        if (chars.length) {
            const proxies = chars.map(el => ({
                el: el,
                pushX: gsap.quickTo(el, 'x', { duration: 0.35, ease: 'expo.out', overwrite: true }),
                pushY: gsap.quickTo(el, 'y', { duration: 0.35, ease: 'expo.out', overwrite: true }),
                returnX: gsap.quickTo(el, 'x', { duration: 0.75, ease: 'power2.out', overwrite: true }),
                returnY: gsap.quickTo(el, 'y', { duration: 0.75, ease: 'power2.out', overwrite: true }),
                inRange: false
            }));

            let mx = -9999, my = -9999, hRect = heading.getBoundingClientRect();
            window.addEventListener('mousemove', (e) => { if (e._isAutoPan) return; mx = e.clientX; my = e.clientY; }, { passive: true });
            function refreshRect() { hRect = heading.getBoundingClientRect(); }
            window.addEventListener('scroll', refreshRect, { passive: true });
            window.addEventListener('resize', refreshRect);

            gsap.ticker.add(() => {
                if (mx < hRect.left - SLACK || mx > hRect.right + SLACK || my < hRect.top - SLACK || my > hRect.bottom + SLACK) {
                    proxies.forEach(p => { if (p.inRange) { p.returnX(0); p.returnY(0); p.inRange = false; } }); return;
                }
                proxies.forEach(p => {
                    const r = p.el.getBoundingClientRect(), cx = r.left + r.width * 0.5, cy = r.top + r.height * 0.5;
                    const dx = cx - mx, dy = cy - my, d = Math.sqrt(dx * dx + dy * dy);
                    if (d < RADIUS && d > 0) {
                        const f = (1 - d / RADIUS) * (1 - d / RADIUS);
                        p.pushX((dx / d) * f * MAX_PX); p.pushY((dy / d) * f * MAX_PX); p.inRange = true;
                    } else if (p.inRange) { p.returnX(0); p.returnY(0); p.inRange = false; }
                });
            });
        }
    }

    // ── Email Copy CTA Interaction ──
    const emailCopyBtn = document.getElementById('email-copy-btn');
    if (emailCopyBtn) {
        const emailText = emailCopyBtn.querySelector('.email-text'), copiedText = emailCopyBtn.querySelector('.copied-text');
        const copyIcon1 = emailCopyBtn.querySelector('.copy-icon-1'), copyIcon2 = emailCopyBtn.querySelector('.copy-icon-2');
        const checkIcon = emailCopyBtn.querySelector('.check-icon-1');
        
        emailCopyBtn.addEventListener('mouseenter', () => { gsap.to(copyIcon1, { y: '-100%', duration: 0.4, ease: "power2.inOut" }); gsap.to(copyIcon2, { y: '0%', duration: 0.4, ease: "power2.inOut" }); });
        emailCopyBtn.addEventListener('mouseleave', () => { gsap.to(copyIcon1, { y: '0%', duration: 0.4, ease: "power2.inOut" }); gsap.to(copyIcon2, { y: '100%', duration: 0.4, ease: "power2.inOut" }); });

        emailCopyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await navigator.clipboard.writeText('aditya20verma@gmail.com');
                if (emailText) emailText.style.opacity = '0';
                if (copiedText) copiedText.style.opacity = '1';
                if (copyIcon1) copyIcon1.style.display = 'none';
                if (copyIcon2) copyIcon2.style.display = 'none';
                if (checkIcon) checkIcon.style.display = 'inline-flex';
                setTimeout(() => {
                    if (emailText) emailText.style.opacity = '1';
                    if (copiedText) copiedText.style.opacity = '0';
                    if (copyIcon1) { copyIcon1.style.display = 'inline-flex'; gsap.set(copyIcon1, { y: '0%' }); }
                    if (copyIcon2) { copyIcon2.style.display = 'inline-flex'; gsap.set(copyIcon2, { y: '100%' }); }
                    if (checkIcon) checkIcon.style.display = 'none';
                }, 1500);
            } catch (err) { console.error('Failed to copy email: ', err); }
        });
    }

    // ── HOVER SOUND SYSTEM ──
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let soundEnabled = false;
        const toggleBtn = document.getElementById('sound-toggle');
        const SRC = 'assets/sounds/hover.mp3', POOL_SIZE = 4;
        const pool = Array.from({ length: POOL_SIZE }, () => {
            const a = new Audio(SRC); a.volume = 0.3; a.playbackRate = 0.5; a.preload = 'auto'; return a;
        });
        let poolIndex = 0;

        function playTick() {
            if (!soundEnabled) return;
            const audio = pool[poolIndex % POOL_SIZE]; poolIndex++;
            audio.currentTime = 0; audio.play().catch(() => {});
        }
        window.__playHoverSound = playTick;

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                soundEnabled = !soundEnabled;
                if (soundEnabled) {
                    toggleBtn.classList.add('sound-on');
                    const label = toggleBtn.querySelector('.sound-label'); if (label) label.textContent = 'SOUND ON';
                    pool.forEach(a => { a.load(); a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {}); });
                } else {
                    toggleBtn.classList.remove('sound-on');
                    const label = toggleBtn.querySelector('.sound-label'); if (label) label.textContent = 'SOUND OFF';
                }
            });
        }
        function bindSoundSelectors() {
            document.querySelectorAll('[data-sound], .view-btn, #email-copy-btn, nav a, .nav-link, #sound-toggle').forEach(el => {
                if (el.dataset.soundBound) return; el.dataset.soundBound = 'true';
                el.addEventListener('mouseenter', playTick, { passive: true });
            });
        }
        bindSoundSelectors(); window.addEventListener('load', bindSoundSelectors);

        const RESTART_SFX = new Audio('assets/audio/restartv2.mp3'); RESTART_SFX.volume = 0.85;
        const logoBtn = document.getElementById('logo-link');
        if (logoBtn) {
            logoBtn.addEventListener('click', () => { if (soundEnabled) { RESTART_SFX.currentTime = 0; RESTART_SFX.play().catch(() => {}); } });
        }
    }

    // ── Journey Deck Reveal ──
    const initJourneyDeck = (stageSelector = '.journey-stage') => {
        const stage = document.querySelector(stageSelector);
        const cards = stage ? gsap.utils.toArray(stage.querySelectorAll('.exp-card')) : [];
        if (!stage || !cards.length) return;

        const vw = window.innerWidth;
        const isTouch = window.matchMedia('(pointer: coarse)').matches || vw < 600;
        const STD = 'cubic-bezier(0.2,0,0,1)', DEC = 'cubic-bezier(0,0,0.2,1)';
        const Math_round = Math.round;

        const fanScale = isTouch ? 0.15 : Math.min(1, vw / 1100);
        const fanSpread = (base) => Math_round(base * (isTouch ? 0.15 : fanScale));
        const fan = [
            { x: fanSpread(-450), y: -40, r: isTouch ? -4 : -12, z: 4 },
            { x: fanSpread(-150), y: -5,  r: isTouch ? -2 : -4,  z: 3 },
            { x: fanSpread( 150), y: -55, r: isTouch ? 2 : 4,    z: 2 },
            { x: fanSpread( 450), y: 15,  r: isTouch ? 4 : 12,   z: 1 },
        ];
        const scatterShift = isTouch ? 0 : Math_round(70 * fanScale);
        const maxH = Math.max(...cards.map(c => c.offsetHeight));

        cards.forEach((c, i) => gsap.set(c, {
            height: isTouch ? 'auto' : maxH, position: 'absolute', opacity: 0, x: 0, y: 140,
            rotation: i % 2 === 0 ? 0.55 : -0.55, scale: 0.88, zIndex: fan[i].z, transformPerspective: 1200,
        }));
        stage.style.height = (maxH + (vw < 600 ? 50 : 80)) + 'px';

        let activeIndex = -1, zCounter = 10, collapseTimer = null;
        const qSetters = cards.map(card => ({
            x: gsap.quickTo(card, 'x', { duration: 0.38, ease: STD }),
            y: gsap.quickTo(card, 'y', { duration: 0.38, ease: STD }),
            rx: gsap.quickTo(card, 'rotationX', { duration: 0.18, ease: STD }),
            ry: gsap.quickTo(card, 'rotationY', { duration: 0.18, ease: STD }),
            rz: gsap.quickTo(card, 'rotationZ', { duration: 0.28, ease: STD }),
            sc: gsap.quickTo(card, 'scale', { duration: 0.35, ease: STD }),
        }));

        const scatterSiblings = (fromIndex) => {
            cards.forEach((_, j) => {
                if (j === fromIndex) return;
                qSetters[j].x(fan[j].x + (j < fromIndex ? -scatterShift : scatterShift));
                qSetters[j].y(fan[j].y);
            });
        };

        const collapseFan = () => {
            cards.forEach((card, j) => {
                qSetters[j].x(fan[j].x); qSetters[j].y(fan[j].y); qSetters[j].rz(fan[j].r);
                qSetters[j].rx(0); qSetters[j].ry(0); qSetters[j].sc(1);
                gsap.to(card, { scale: 1, duration: 0.45, ease: DEC, overwrite: 'auto' });
                const rEl = card.querySelector('.exp-role'), dEl = card.querySelector('.exp-date'), mEl = card.querySelector('.role-meta');
                if (rEl) gsap.to(rEl, { color: 'rgba(255,255,255,0.9)', duration: 0.3, ease: DEC });
                if (mEl) gsap.to(mEl, { color: 'rgba(255,255,255,0.9)', duration: 0.3, ease: DEC });
                if (dEl) gsap.to(dEl, { color: 'rgba(255,255,255,0.25)', duration: 0.3, ease: DEC });
            });
        };

        if (!isTouch) {
            cards.forEach((card, i) => {
                const f = fan[i], qs = qSetters[i];
                card.addEventListener('mouseenter', () => {
                    clearTimeout(collapseTimer); activeIndex = i; gsap.set(card, { zIndex: ++zCounter }); scatterSiblings(i);
                    gsap.to(card, { scale: 1.05, duration: 0.3, ease: 'back.out(1.2)', overwrite: 'auto' });
                    qs.y(f.y - 24); qs.rz(f.r);
                    const rEl = card.querySelector('.exp-role'), dEl = card.querySelector('.exp-date'), mEl = card.querySelector('.role-meta');
                    if (rEl) gsap.to(rEl, { color: 'var(--accent)', duration: 0.2, ease: STD, overwrite: 'auto' });
                    if (mEl) gsap.to(mEl, { color: 'var(--accent)', duration: 0.2, ease: STD, overwrite: 'auto' });
                    if (dEl) gsap.to(dEl, { color: 'rgba(255,255,255,0.5)', duration: 0.2, ease: STD, overwrite: 'auto' });
                    if (typeof window.__playHoverSound === 'function') window.__playHoverSound();
                });
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect(), nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2), ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
                    const d = Math.sqrt(nx * nx + ny * ny);
                    qs.x(f.x + nx * 10); qs.y(f.y + ny * 6 - 24); qs.rx(-ny * 5); qs.ry(nx * 5); qs.rz(f.r + nx * 1.5); qs.sc(1.08 - d * 0.015);
                    card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                    card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
                });
                card.addEventListener('mouseleave', () => {
                    activeIndex = -1; collapseTimer = setTimeout(() => { if (activeIndex === -1) collapseFan(); }, 240);
                    qSetters[i].x(f.x); qSetters[i].y(f.y); qSetters[i].rx(0); qSetters[i].ry(0); qSetters[i].rz(f.r);
                    gsap.to(card, { scale: 1, duration: 0.38, ease: DEC, overwrite: 'auto' });
                    const rEl = card.querySelector('.exp-role'), dEl = card.querySelector('.exp-date'), mEl = card.querySelector('.role-meta');
                    if (rEl) gsap.to(rEl, { color: 'rgba(255,255,255,0.9)', duration: 0.25, ease: DEC, overwrite: 'auto' });
                    if (mEl) gsap.to(mEl, { color: 'rgba(255,255,255,0.9)', duration: 0.25, ease: DEC, overwrite: 'auto' });
                    if (dEl) gsap.to(dEl, { color: 'rgba(255,255,255,0.25)', duration: 0.25, ease: DEC, overwrite: 'auto' });
                });
            });
        } else {
            cards.forEach((card) => {
                card.addEventListener('click', () => {
                    gsap.set(card, { zIndex: ++zCounter });
                    if (typeof window.__playHoverSound === 'function') window.__playHoverSound();
                    gsap.fromTo(card, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(1.5)' });
                });
            });
        }

        if (!isTouch) {
            const cursorRing = document.querySelector('.cursor-outline');
            stage.addEventListener('mouseleave', () => {
                if (stage.classList.contains('deck-animating')) return;
                clearTimeout(collapseTimer); activeIndex = -1; collapseFan();
                if (cursorRing) cursorRing.classList.remove('hover-state');
            });
        }

        const scatterTl = gsap.timeline({
            onComplete: () => {
                stage.classList.remove('deck-animating');
                stage.classList.add('deck-settling');
                setTimeout(() => stage.classList.remove('deck-settling'), 600);
                cards.forEach((_, j) => {
                    qSetters[j].x(fan[j].x);
                    qSetters[j].y(fan[j].y);
                    qSetters[j].rz(fan[j].r);
                });
            },
            scrollTrigger: {
                trigger: stageSelector,
                start: "top 80%",
                toggleActions: "play none none reverse",
                onEnter: () => {
                    stage.classList.add('deck-animating');
                },
                onLeaveBack: () => {
                    stage.classList.remove('deck-animating');
                    stage.classList.remove('deck-settling');
                }
            }
        });

        cards.forEach((card, i) => {
            const isLeft = i < 2; const m = isLeft ? -1 : 1;
            const throwX = fan[i].x + (150 * m); const throwY = fan[i].y + 100; const throwR = fan[i].r + (10 * m);
            
            scatterTl.fromTo(card,
                { x: 0, y: 140, rotationZ: i % 2 === 0 ? 0.55 : -0.55, scale: 0.88, opacity: 0, rotationX: 0, rotationY: 0 },
                { x: throwX, y: throwY, rotationZ: throwR, scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
                0
            ).to(card, {
                x: fan[i].x, y: fan[i].y, rotationZ: fan[i].r, duration: 0.8, ease: "back.out(1.2)"
            }, 0.2);
        });
    };

    initJourneyDeck();

    // Expose it globally if needed
    window.initJourneyDeck = initJourneyDeck;
}
