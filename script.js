// ══════════════════════════════════════════════════════════════════════════════
// ASSET CONFIG — swap any asset by updating this block only.
// ★ Source of truth: sections/{section}/{section}.config.js
// Phase 2: replace with ES module imports from each section config.
// ══════════════════════════════════════════════════════════════════════════════
const ASSETS = {
    hero: {
        unicornProjectId: 'kt5EwBtAEDtnn2IDefYL', // ← sections/hero/hero.config.js
    },
    work: {
        // Project-first: sections/work/assets/{slug}/cover.*
        // Full config including tags, links, gallery: sections/work/work.config.js
        covers: {
            unishare:   'sections/work/assets/unishare/cover.jpg',
            dmrc:       'sections/work/assets/dmrc/cover.png',
            nutribuddy: 'sections/work/assets/nutribuddy/cover.png',
            mfine:      'sections/work/assets/mfine/cover.jpg',
        },
        thumbnails: {
            unishare:   'sections/work/assets/unishare/thumbnail.png',
            dmrc:       'sections/work/assets/dmrc/thumbnail.png',
            nutribuddy: 'sections/work/assets/nutribuddy/thumbnail.png',
            mfine:       null,  // add when ready
        },
    },
    about:  {},  // → sections/about/about.config.js
    footer: {},  // → sections/footer/footer.config.js
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION SCRIPTS LIVE IN /scripts/ — see stubs there for migration guide:
//   scripts/hero/animation.js   → hero GSAP collapse + signature reveal
//   scripts/hero/canvas.js      → dot matrix repel canvas
//   scripts/work/animation.js   → project section scroll reveals
//   scripts/shared/cursor.js    → magnetic cursor
//   scripts/shared/scroll.js    → Lenis + ScrollTrigger init
// ══════════════════════════════════════════════════════════════════════════════

// ── Safari Viewport Bands Fix ────────────────────────────────────────────
// Safari's 100vh = max viewport (toolbar hidden). When toolbar shows,
// content overflows by ~80px creating white/grey bands.
// Solution: Set --app-height to window.innerHeight (always the TRUE
// visible area) so 100dvh CSS has a reliable JS fallback.
(function setSafariViewportFix() {
    function updateAppHeight() {
        const h = window.innerHeight;
        document.documentElement.style.setProperty('--app-height', h + 'px');
    }
    updateAppHeight(); // Set immediately on parse
    window.addEventListener('resize', updateAppHeight, { passive: true });
    // Also update on orientation change (crucial for iOS)
    window.addEventListener('orientationchange', () => {
        setTimeout(updateAppHeight, 100); // brief timeout lets Safari settle
    }, { passive: true });
}());

// ── Hamburger / Mobile Nav ────────────────────────────────────────────────

(function () {
    const hamburger   = document.getElementById('hamburger');
    const mobileNav   = document.getElementById('mobile-nav');
    const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

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

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.contains('open') ? closeMenu() : openMenu();
        });
    }

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
                    }, 350); // wait for overlay to close
                }
            }
        });
    });
})();

// ── Scroll-aware Nav State (transparent hero → frosted glass) ─────────────
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    function updateNav() {
        const heroHeight = window.innerHeight; // hero is 100vh
        const scrollY = window.scrollY;

        if (scrollY < heroHeight * 0.6) {
            // Over the light hero — go transparent with dark text
            nav.classList.add('at-hero');
            nav.classList.remove('scrolled');
        } else {
            // Past hero — frosted glass on dark background
            nav.classList.remove('at-hero');
            nav.classList.add('scrolled');
        }
    }

    updateNav(); // run on load
    window.addEventListener('scroll', updateNav, { passive: true });
})();

// ── Progressive Blur Stack — exact Heat Bureau values ────────────────────
// Source: computed CSS extracted directly from heatbureau.com/about
// 8 layers, each doubles the blur. 'to top' = bottom is dissolve, top is glass.
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const stack = document.createElement('div');
    stack.id = 'nav-blur-stack';

    // Exact blur values from heatbureau — each doubles (0.078125 × 2^n → 10)
    const blurLevels = [0.078125, 0.15625, 0.3125, 0.625, 1.25, 2.5, 5, 10];
    const n     = blurLevels.length; // 8
    const slice = 100 / n;           // 12.5% per slice

    blurLevels.forEach(function (blur, i) {
        const layer = document.createElement('div');

        // Exact heatbureau mask pattern (direction: to top)
        // Each layer: transparent → opaque → transparent, spanning 3 slices (37.5%)
        // Adjacent layers share their fade zones → seamless, no gaps
        const t0 = (i * slice).toFixed(4);           // fade starts
        const t1 = ((i + 1) * slice).toFixed(4);     // fully opaque start
        const t2 = ((i + 2) * slice).toFixed(4);     // fully opaque end
        const t3 = ((i + 3) * slice).toFixed(4);     // fade ends

        const mask = 'linear-gradient(to top,'
            + ' rgba(0,0,0,0) '  + t0 + '%,'
            + ' rgb(0,0,0) '     + t1 + '%,'
            + ' rgb(0,0,0) '     + t2 + '%,'
            + ' rgba(0,0,0,0) '  + t3 + '%)';

        layer.style.cssText = [
            'position:absolute',
            'inset:0',
            'backdrop-filter:blur(' + blur + 'px)',
            '-webkit-backdrop-filter:blur(' + blur + 'px)',
            '-webkit-mask-image:' + mask,
            'mask-image:' + mask,
            'pointer-events:none'
        ].join(';');

        stack.appendChild(layer);
    });

    nav.appendChild(stack);

    // Show/hide in sync with scrolled class
    function syncBlurStack () {
        if (nav.classList.contains('scrolled')) {
            stack.classList.add('visible');
        } else {
            stack.classList.remove('visible');
        }
    }

    new MutationObserver(syncBlurStack).observe(nav, {
        attributes: true, attributeFilter: ['class']
    });
    syncBlurStack();
})();

// ── Smart Nav Colour Sensing ───────────────────────────────────────────────
// Reads the luminance of whatever is behind the nav at runtime.
// Adds .nav-on-light when over a light section → text flips dark.
// Works with ANY section colour, not just the hero.
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let rafId = null;

    // Perceived luminance (0-255)
    function luminance(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    function senseBackground() {
        const navH   = nav.offsetHeight;
        const sampleY = navH * 0.35; // sample near nav top — where text lives

        // Three horizontal sample points for nav: left, centre, right
        const xs = [
            window.innerWidth * 0.08,
            window.innerWidth * 0.50,
            window.innerWidth * 0.92
        ];

        let totalLum = 0;
        let count    = 0;

        xs.forEach(function (x) {
            const stack = document.elementsFromPoint(x, sampleY);
            for (let i = 0; i < stack.length; i++) {
                const el = stack[i];
                if (nav.contains(el) || el === nav) continue;
                const bg = window.getComputedStyle(el).backgroundColor;
                if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
                    if (el === document.body || el === document.documentElement) {
                        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                        const m = bodyBg.match(/\d+/g);
                        if (m && m.length >= 3) {
                            totalLum += luminance(+m[0], +m[1], +m[2]);
                            count++;
                        }
                        break;
                    }
                    continue;
                }
                const m = bg.match(/\d+/g);
                if (m && m.length >= 3) {
                    totalLum += luminance(+m[0], +m[1], +m[2]);
                    count++;
                }
                break;
            }
        });

        const avgLum = count > 0 ? totalLum / count : 0;
        const pill = document.getElementById('circuit-pill');
        const soundToggle = document.getElementById('sound-toggle');

        // Nav threshold at 140
        if (avgLum > 140) {
            nav.classList.add('nav-on-light');
            if (pill) pill.classList.add('track-on-light');
        } else {
            nav.classList.remove('nav-on-light');
            if (pill) pill.classList.remove('track-on-light');
        }

        // ── Rider plate + moat ring: driven by avgLum already computed above ──────────
        // avgLum > 140 → light section (hero / about-me) → plate = page light bg, rings = dark
        // avgLum ≤ 140 → dark section (experience / footer) → plate = dark bg, rings = orange
        // Using avgLum directly is more reliable than extra pixel-sampling, which was
        // being confused by the body's dark bg-base after skipping hero/canvas elements.
        if (pill) {
            const isLight    = avgLum > 140;
            const plateColor = isLight ? 'rgb(229, 228, 224)' : 'rgb(29, 29, 29)';
            // Ripples/rings must always be orange at 70% opacity per request
            const ringColor  = 'rgba(255, 85, 9, 0.7)';
            pill.style.setProperty('--rider-plate',      plateColor);
            pill.style.setProperty('--rider-ring-color', ringColor);
        }


        // ── Sound Toggle Sensing (Bottom Left) ──────────────────────────────────
        if (soundToggle) {
            const stX = window.innerWidth * 0.08;
            const stY = window.innerHeight - (window.innerHeight * 0.08); // Sample near bottom left
            
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
                const m = bg.match(/\d+/g);
                if (m && m.length >= 3) {
                    stLum = luminance(+m[0], +m[1], +m[2]);
                }
                break;
            }
            // Fallback for extreme bottom sensing
            if (stLum > 140) {
                soundToggle.classList.add('sound-on-light');
            } else {
                soundToggle.classList.remove('sound-on-light');
            }
        }

        // Scroll hint visibility is managed exclusively by .scroll-visible class
        // (added by loader, removed by ScrollTrigger on hero exit). No luminance
        // sensing needed — that was causing it to appear on light sections.

        rafId = null;
    }

    function onScroll() {
        if (!rafId) rafId = requestAnimationFrame(senseBackground);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Also re-sense after fonts/images load in case layout shifts
    window.addEventListener('load', senseBackground);
    senseBackground(); // run immediately on page load
    // Expose so the loader can force a re-sense after it finishes
    window._senseNavBg = senseBackground;


}());


// ── Footer Headline Per-Letter Cursor Repel ────────────────────────────────
// Mirrors gabrielveres.com technique: div.word wrappers prevent space collapse,
// div.char inside each word handles the per-letter repel transform.
// Values calibrated to match the reference: 200px radius, 25px max push.
(function () {
    var heading = document.querySelector('.footer-heading');
    if (!heading || window.matchMedia('(hover: none)').matches) return;

    var RADIUS  = 200;   // px — influence zone (matches reference ~200px)
    var MAX_PX  = 25;    // px — max displacement (reference is ~20-30px)
    var SLACK   = 250;   // extra px for coarse bounding-box early-exit

    // ── 1. Build word-aware char split ────────────────────────────────────────
    // Strategy: split text by words → wrap each word in an inline-block span
    // (keeps chars tight) → put plain text-node " " between word spans
    // → only letter spans get data-repel + inline-block
    function wordSplit(text) {
        var frag  = document.createDocumentFragment();
        var words = text.split(' ');
        words.forEach(function (word, wi) {
            if (word.length === 0) {
                // Handle multiple consecutive spaces (rare but safe)
                frag.appendChild(document.createTextNode(' '));
                return;
            }
            // Word wrapper: inline-block + nowrap keeps letters from wrapping mid-word
            var wordEl = document.createElement('span');
            wordEl.style.cssText = 'display:inline-block;white-space:nowrap;';

            Array.from(word).forEach(function (ch) {
                var s = document.createElement('span');
                s.textContent = ch;
                s.dataset.repel = '';
                s.style.cssText = 'display:inline-block;will-change:transform;vertical-align:baseline;';
                wordEl.appendChild(s);
            });

            frag.appendChild(wordEl);
            // Natural text-node space between words — renders exactly as original
            if (wi < words.length - 1) {
                frag.appendChild(document.createTextNode(' '));
            }
        });
        return frag;
    }

    // Walk DOM: split TEXT NODES only — skip the email button and <br> tags
    (function walk(node) {
        Array.from(node.childNodes).forEach(function (kid) {
            if (kid.nodeType === Node.ELEMENT_NODE) {
                if (kid.id !== 'email-copy-btn' && kid.tagName !== 'BR') {
                    walk(kid);
                }
            } else if (kid.nodeType === Node.TEXT_NODE && kid.textContent.trim()) {
                kid.parentNode.replaceChild(wordSplit(kid.textContent), kid);
            }
        });
    }(heading));

    // ── 2. Build quickTo proxies — one per axis, per character ────────────────
    // IMPORTANT: single quickTo per axis. No gsap.to calls anywhere in the loop.
    // Dual-animation (quickTo + gsap.to) causes tween conflicts → letters freeze.
    // We use TWO quickTo instances per axis: fast for push, slow for return.
    var chars = Array.from(heading.querySelectorAll('[data-repel]'));
    if (!chars.length) return;

    var proxies = chars.map(function (el) {
        return {
            el:       el,
            // Fast snap away from cursor (expo.out)
            pushX:    gsap.quickTo(el, 'x', { duration: 0.35, ease: 'expo.out',   overwrite: true }),
            pushY:    gsap.quickTo(el, 'y', { duration: 0.35, ease: 'expo.out',   overwrite: true }),
            // Slow floaty drift back to origin (power2.out — decelerates like settling)
            returnX:  gsap.quickTo(el, 'x', { duration: 0.75, ease: 'power2.out', overwrite: true }),
            returnY:  gsap.quickTo(el, 'y', { duration: 0.75, ease: 'power2.out', overwrite: true }),
            inRange:  false
        };
    });

    // ── 3. Cursor tracking + cached bounding rect ─────────────────────────────
    var mx = -9999, my = -9999;
    var hRect = heading.getBoundingClientRect();

    window.addEventListener('mousemove', function (e) {
        if (e._isAutoPan) return;
        mx = e.clientX;
        my = e.clientY;
    }, { passive: true });

    function refreshRect() { hRect = heading.getBoundingClientRect(); }
    window.addEventListener('scroll', refreshRect, { passive: true });
    window.addEventListener('resize', refreshRect);

    // ── 4. GSAP ticker — continuous, no competing tweens ──────────────────────
    gsap.ticker.add(function () {
        // Coarse bounding-box exit — zero cost when cursor is far from footer
        if (mx < hRect.left   - SLACK || mx > hRect.right  + SLACK ||
            my < hRect.top    - SLACK || my > hRect.bottom + SLACK) {
            // Cursor left the whole zone — smoothly return any pushed letters
            proxies.forEach(function (p) {
                if (p.inRange) {
                    p.returnX(0);
                    p.returnY(0);
                    p.inRange = false;
                }
            });
            return;
        }

        proxies.forEach(function (p) {
            var r  = p.el.getBoundingClientRect();
            var cx = r.left + r.width  * 0.5;
            var cy = r.top  + r.height * 0.5;
            var dx = cx - mx;
            var dy = cy - my;
            var d  = Math.sqrt(dx * dx + dy * dy);

            if (d < RADIUS && d > 0) {
                // In range — fast expo push away
                var f = (1 - d / RADIUS) * (1 - d / RADIUS);
                p.pushX((dx / d) * f * MAX_PX);
                p.pushY((dy / d) * f * MAX_PX);
                p.inRange = true;
            } else if (p.inRange) {
                // Just left range — slow power2 drift back (no competing tween)
                p.returnX(0);
                p.returnY(0);
                p.inRange = false;
            }
            // else: never been in range — do nothing (no redundant calls)
        });
    });
})();


// Force scroll to top on refresh/load
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// bfcache fix: when user navigates back/forward, browser may
// restore a page from memory with a non-zero scroll position.
// pageshow fires AFTER the page is visible — reset scroll here too.
window.addEventListener('pageshow', function(event) {
    // event.persisted = true means loaded from bfcache
    window.scrollTo(0, 0);
    if (window.__lenisInstance) {
        window.__lenisInstance.scrollTo(0, { immediate: true });
    }
});

// ── Detect touch/mobile for disabling heavy effects ───────────────────────
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
// isMobile breakpoint — used by gsap.matchMedia() contexts below

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
// On touch/mobile: normalise scroll so iOS Safari batched events fire correctly for scrub
// (only safe when Lenis is NOT active — they conflict)
if (isTouchDevice) { ScrollTrigger.normalizeScroll(true); }

// 1. Initialize Lenis Smooth Scroll (desktop/mouse only)
// On touch devices, Lenis intercepts touchmove and creates a virtual scroll position
// that desynchronises from GSAP ScrollTrigger's scrub — animations never fire.
// Native scroll drives ScrollTrigger perfectly on its own for touch devices.
const lenis = !isTouchDevice ? new Lenis({
    duration: 0.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
}) : null;

// Expose Lenis globally so the circuit component can call scrollTo
// without being part of this file (circuit.js is self-contained).
window.__lenisInstance = lenis;

// Reset Lenis virtual scroll position to 0 — prevents it inheriting
// any position the browser partially restored before our manual override fired.
if (lenis) {
    lenis.scrollTo(0, { immediate: true });
}

// ════════════════════════════════════════════════════════════════════════════
// CINEMATIC SCROLL SYSTEM — Clean Curtain (v3)
// ════════════════════════════════════════════════════════════════════════════
//
// DOM Architecture:
//   #work           (position:sticky; top:0; z:2; bg:beige)
//                   → stays pinned at top while #rest-of-content rises over it
//                   → JS drives: scale 1→0.88, opacity 1→0.60, clip via overflow
//   #rest-of-content (position:relative; z:10)
//                   → rises naturally over sticky #work as user scrolls
//     → #about-sequence (height:300vh; normal flow)
//         → #sequence-canvas-wrap (sticky; top:0; 100vh)
//             → canvas (83-frame scrub, always full viewport)
//             → #sequence-smoke (opacity 0→1, JS-driven)
//
// Work dimming trigger:
//   Starts when #about-sequence top edge enters the viewport bottom.
//   Ends (fully dimmed) when #about-sequence top reaches viewport top.
//   Uses getBoundingClientRect directly on #about-sequence — reliable because
//   #about-sequence is in normal flow (no sticky on its container).
// ════════════════════════════════════════════════════════════════════════════

// Work section dimming is handled inside sections/about/sequence.js → applyWorkDim()





// ── Cinematic Footer Reveal (Icomat / Connor Love Style) ────────────────
// Footer is position:sticky bottom:0 — it ONLY reveals as #about section scrolls away.
// DO NOT use blur or partial opacity here — it bleeds through as grey band during bike sequence.
// Simple opacity 0→1 + scale is sufficient and clean.
gsap.from('#contact', {
    scale: 0.97,
    opacity: 0,          // fully hidden until trigger fires
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '#about',   // trigger off #about section, not #contact itself
        start: 'bottom 80%',
        end: 'bottom 20%',
        scrub: true,
    }
});

// Initial AV Logo Reveal (Single Wipe Masking)
gsap.set('.av-shape', { clipPath: "inset(100% 0% 0% 0%)" });

gsap.to('.av-shape', {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: 1.2,
    delay: 1.5,
    ease: "power2.inOut"
});

// ── Hero Scale & Signature Reveal — desktop + mobile via matchMedia ──────
// Desktop: dramatic horizontal collapse (Lando Norris style)
// Mobile:  card-style scale-down with rounded corners (same feel, portrait-safe)

// pin canvas transform-origin to TOP so GSAP scale grows downward (matches CSS)
gsap.set('.unicorn-canvas', { transformOrigin: '58% 0%' });

// ── Cinematic UI Suppression ──────────────────────────────────────────
// Hides circuit nav + nav header during the bike sequence for full immersion.
// BUG #4 FIX: Nav header (wordmark) also fades during sequence.
ScrollTrigger.create({
    trigger: '#about-sequence',
    start: 'top 80%',
    onEnter: () => {
        gsap.to('#circuit-pill', { opacity: 0, duration: 0.4, pointerEvents: 'none' });
        gsap.to('nav', { opacity: 0, duration: 0.5, pointerEvents: 'none' }); // BUG #4
    },
    onEnterBack: () => {
        gsap.to('#circuit-pill', { opacity: 0, duration: 0.4, pointerEvents: 'none' });
        gsap.to('nav', { opacity: 0, duration: 0.3, pointerEvents: 'none' });
    },
});

ScrollTrigger.create({
    trigger: '#about',
    start: 'top 80%',
    onEnter: () => {
        gsap.to('#circuit-pill', { opacity: 1, duration: 0.6, pointerEvents: 'auto' });
        gsap.to('nav', { opacity: 1, duration: 0.6, pointerEvents: 'auto' }); // BUG #4
    },
    onLeaveBack: () => {
        gsap.to('#circuit-pill', { opacity: 1, duration: 0.6, pointerEvents: 'auto' });
        gsap.to('nav', { opacity: 1, duration: 0.4, pointerEvents: 'auto' });
    }
});

// pin hero transform-origin so card collapses toward upper viewport (matches CSS)
gsap.set('.hero', { transformOrigin: 'center center' }); // collapse toward viewport centre

const mm = gsap.matchMedia();

mm.add("(min-width: 601px)", () => {
    let isLogoHidden  = false;
    let isNavHero     = true;   // tracks current nav--hero state
    const navEl       = document.querySelector('nav');

    // ── Nav hero state: fixed size, no scale-down on scroll ─────────────
    // Logo stays same size at all times. Class kept for other hero-state rules.
    navEl.classList.add('nav--hero');

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-track",
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 0.7),
            scrub: true, // Removed 1s delay
            onUpdate: (self) => {
                const p = self.progress;

                // ── Nav hero size: locked — no toggle on scroll ───────────

                // ── AV shape (kept for future use, element removed from DOM) ─
                if (p > 0.05 && p < 0.95) {
                    if (!isLogoHidden) {
                        gsap.to('.av-shape', { clipPath: "inset(0% 0% 100% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" });
                        isLogoHidden = true;
                    }
                } else {
                    if (isLogoHidden) {
                        gsap.to('.av-shape', { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
                        isLogoHidden = false;
                    }
                }
            }
        }
    });

    gsap.set('.hero', { clipPath: "inset(0vh calc(0vw - 0vh) 0vh calc(0vw - 0vh) round 0px)" });

    tl.to('.hero', {
        scale:    0.42,
        // Square end state (1:1)
        //   top clip 12vh → visible height = 88vh
        //   side clip calc(50vw-44vh) → visible width = 2×44vh = 88vh
        //   → 88×88vh = perfect square at any viewport
        clipPath: "inset(12vh calc(50vw - 44vh) 0vh calc(50vw - 44vh) round 0px)",
        opacity:  0.55,
        ease: "power2.inOut"
    }, 0);

    // Parallax: container collapses to golden ratio portrait, image holds at 50%
    // hero: 1.0→0.42 (+ clips)  |  canvas: 1.0→1.19  |  effective image: 0.42×1.19 = 0.50
    // Scroll Hint: fade out early as hero start to collapse
    tl.fromTo('#scroll-hint', 
        { opacity: 1, pointerEvents: 'auto' },
        { opacity: 0, pointerEvents: 'none', duration: 0.3, ease: 'power1.out' }, 
        0
    );
    tl.to('.unicorn-canvas', { scale: 1.19, ease: "power2.inOut" }, 0);

    // Signature tracks the hero automatically — it's a child of .hero now
});


mm.add("(max-width: 600px)", () => {
    // Mobile: same pin-then-rise pattern as Lando Norris — just scale + opacity, no clipPath rounding
    // With 170vh track: sticky pins for exactly 70vh (animation range), then releases immediately
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-track",
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 0.7), // same 70vh end on mobile
            scrub: true, // matches Lando Norris desktop feel
        }
    });

    // NO clipPath on mobile — Lando Norris uses sharp edges, rounding feels out of place
    tl.to('.hero', {
        scale: 0.70,                  // signature extends visually beyond the compact card
        opacity: 0.55,
        ease: "power2.inOut"
    }, 0);

    // Scroll Hint: fade out on mobile as hero collapses
    tl.fromTo('#scroll-hint', 
        { opacity: 1, pointerEvents: 'auto' },
        { opacity: 0, pointerEvents: 'none', duration: 0.3, ease: 'power1.out' }, 
        0
    );

    // parallax depth on mobile (gentler — 1.08 within 0.70 hero = effective 0.756)
    tl.to('.unicorn-canvas', { scale: 1.08, ease: "power2.inOut" }, 0);

    // Signature tracks the hero automatically — it's a child of .hero now
});

// ── Hero Subtitle: cycling text below ADITYA VERMA ────────────────────────────
// Visible ONLY during the Hero section phase.
// Typography: Sentence case, 13px, letter-spacing 0.04em
// Color: DYNAMIC — light ghost on dark bg, dark on light bg via CSS class.
// Animation: GSAP on wrapper (instant re-show) + GSAP drift on lines.
// Trigger: 300ms after loader; INSTANT on Restart Lap / scroll-to-top.
// ──────────────────────────────────────────────────────────────────────────────
function initHeroSubtitle() {
    const wrap  = document.getElementById('hero-subtitle');
    const line1 = document.getElementById('subtitle-line-1');
    const line2 = document.getElementById('subtitle-line-2');
    if (!wrap || !line1 || !line2) return;

    const HOLD_MS       = 2800;
    const DUR           = 0.55;
    const EASE          = 'power2.inOut';
    const DRIFT         = 5;
    const FADE_IN_FIRST = 0.5;   // gentle entrance on first load
    const FADE_IN_FAST  = 0.15;  // near-instant for return visits

    let current     = 0;
    const lines     = [line1, line2];
    let interval    = null;
    let isActive    = false;
    let isFirstShow = true;

    function resetLines() {
        gsap.killTweensOf([line1, line2]);
        current = 0;
        gsap.set(line1, { opacity: 1, y: 0 });
        gsap.set(line2, { opacity: 0, y: DRIFT });
    }

    function cycle() {
        const outEl = lines[current];
        current     = (current + 1) % 2;
        const inEl  = lines[current];
        gsap.to(outEl, { opacity: 0, y: -DRIFT, duration: DUR, ease: EASE });
        gsap.fromTo(inEl,
            { opacity: 0, y: DRIFT },
            { opacity: 1, y: 0, duration: DUR, ease: EASE, delay: DUR * 0.3 }
        );
    }

    // start() — GSAP wrapper fade, slow on first load, instant on returns
    function start() {
        if (isActive) return;
        isActive = true;
        resetLines();
        const dur = isFirstShow ? FADE_IN_FIRST : FADE_IN_FAST;
        isFirstShow = false;
        gsap.killTweensOf(wrap);
        gsap.to(wrap, {
            opacity: 1, duration: dur, ease: 'power2.out',
            onComplete: () => { interval = setInterval(cycle, HOLD_MS); }
        });
    }

    // stop() — smooth fade-out wrapper, matching premium feel of start()
    function stop() {
        if (!isActive) return;
        isActive = false;
        if (interval) { clearInterval(interval); interval = null; }
        gsap.killTweensOf(wrap);
        gsap.killTweensOf([line1, line2]);
        gsap.to(wrap, { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
    }

    // Loader: first-time reveal 300ms after loader makes nav visible
    const navEl     = document.querySelector('nav');
    let firstReveal = false;

    function doFirstReveal() {
        if (firstReveal) return;
        firstReveal = true;
        if (window.scrollY < window.innerHeight * 0.5) {
            setTimeout(start, 300);
        }
    }

    const obs = new MutationObserver(() => {
        if (parseFloat(navEl.style.opacity) > 0) {
            obs.disconnect();
            doFirstReveal();
        }
    });
    obs.observe(navEl, { attributes: true, attributeFilter: ['style'] });

    // ScrollTrigger: covers normal scroll-down exit, scroll-up return
    ScrollTrigger.create({
        trigger: '.hero-track',
        start: 'top top',
        end: 'bottom top',
        onToggle(self) {
            if (self.isActive) { if (firstReveal) start(); }
            else { stop(); }
        },
        onRefresh(self) {
            if (self.isActive && firstReveal && !isActive) start();
        }
    });

    // Logo click: instant response, bypasses ScrollTrigger debounce
    const logoBtn = document.getElementById('logo-link');
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            setTimeout(() => { if (firstReveal && !isActive) start(); }, 80);
        });
    }

    // Scroll listener: fires before ScrollTrigger batching for zero delay
    window.addEventListener('scroll', () => {
        if (window.scrollY < 5 && firstReveal && !isActive) start();
    }, { passive: true });

    // Fallback: for direct page access with no loader
    setTimeout(() => { if (!firstReveal && window.scrollY < 100) doFirstReveal(); }, 900);
}
initHeroSubtitle();



// ─────────────────────────────────────────────────────────────────────────────
// LOTTIE SIGNATURE — scroll-scrubbed draw-on animation
// File:   sections/hero/assets/AV sign Lotie v4.json  (150 frames @ 30fps)
// ─────────────────────────────────────────────────────────────────────────────
// TWO-PHASE TIMING MODEL
//
//  Phase 1 │ frames 0 → (total - tailFrames - 1)
//           │ draws while hero is COLLAPSING
//           │ controlled by revealDelay (when first stroke appears)
//           │
//  Phase 2  │ final tailFrames frames
//           │ draws over exactly tailPx of hero RISE (after collapse is done)
//           │ tailPx makes it visually obvious the card has started moving up
//
// Tune:
//   revealDelay — when first stroke appears (0=immediate, 0.46=30% collapse)
//   tailFrames  — how many frames spill into the rise phase (default 10)
//   tailPx      — px of hero rise over which those frames draw (default 80)
// ─────────────────────────────────────────────────────────────────────────────

const SIG_CONFIG = {
    file:        'sections/hero/assets/AV sign Lotie v4.json',
    strokeColor: '#FF5509',   // ← hex color for signature stroke
    strokeWidth: null,        // ← px override, null = use Lottie default
    //
    // ── PHASE 1 TIMING ────────────────────────────────────────────────────
    // Fraction of scroll before first stroke appears (0.0 – 1.0).
    // Cheat sheet: 0.30 = 20% collapse | 0.46 = 30% ← current | 0.62 = 40%
    revealDelay: 0.46,
    //
    // ── PHASE 2 TIMING (final strokes during hero rise) ───────────────────
    tailFrames:  50,   // ← last N frames of Lottie that draw AFTER hero collapses
    tailPx:      150,  // ← px of hero rising over which those N frames complete
};

function initLottieSignature() {
    const container = document.getElementById('sig-lottie');
    if (!container || typeof lottie === 'undefined') return;

    document.documentElement.style.setProperty('--sig-stroke-color', SIG_CONFIG.strokeColor);
    if (SIG_CONFIG.strokeWidth) {
        document.documentElement.style.setProperty('--sig-stroke-width', SIG_CONFIG.strokeWidth + 'px');
    }

    const anim = lottie.loadAnimation({
        container:  container,
        renderer:   'svg',
        loop:       false,
        autoplay:   false,
        path:       SIG_CONFIG.file,
    });

    anim.addEventListener('DOMLoaded', () => {
        const totalFrames = anim.totalFrames;                    // 150
        const tailFrames  = SIG_CONFIG.tailFrames;               // 10
        const mainFrames  = totalFrames - 1 - tailFrames;        // 139 (frames 0–139 in phase 1)
        const tailPx      = SIG_CONFIG.tailPx;                   // 80

        // Scroll distance where hero finishes collapsing (matches hero ScrollTrigger end)
        const heroScrollPx  = Math.round(window.innerHeight * 0.7);
        // Extended end so phase 2 can play (hero rise range)
        const totalScrollPx = heroScrollPx + tailPx;
        // Fraction of total sig range where hero collapse ends
        const heroProgress  = heroScrollPx / totalScrollPx;

        // Responsive: mobile hero collapses less (0.70 not 0.35) — earlier delay
        const isMobile = window.innerWidth <= 600;
        const delay    = isMobile ? 0.30 : SIG_CONFIG.revealDelay;

        // ── TWO-PHASE SCROLL → LOTTIE SCRUB ─────────────────────────────────
        // Phase 1: frames 0 → mainFrames  while hero is collapsing
        // Phase 2: frames mainFrames → totalFrames-1  while hero is rising
        // Both phases scrub bidirectionally with the same speed
        // ─────────────────────────────────────────────────────────────────────
        ScrollTrigger.create({
            trigger: '.hero-track',
            start:   'top top',
            end:     () => '+=' + totalScrollPx,
            scrub:   true,
            onUpdate: (self) => {
                const p = self.progress;

                if (p < delay) {
                    // Pre-signature: hero scaling only, hold at frame 0
                    anim.goToAndStop(0, true);
                    // Unlock canvas pill. If cursor is still inside canvas, re-trigger pill
                    // (mouseenter won't re-fire because cursor never left)
                    if (window._cursorPillLocked) {
                        window._cursorPillLocked = false;
                        const heroCanvas = document.querySelector('.unicorn-canvas');
                        if (heroCanvas && typeof window._cursorEnterPill === 'function') {
                            const r = heroCanvas.getBoundingClientRect();
                            if (mouseX >= r.left && mouseX <= r.right &&
                                mouseY >= r.top  && mouseY <= r.bottom) {
                                window._cursorEnterPill(heroCanvas.dataset.cursorLabel || '');
                            }
                        }
                    }

                } else if (p <= heroProgress) {
                    // Phase 1: draw frames 0 → mainFrames as hero collapses
                    // Signature is drawing — lock/dismiss the canvas pill cursor
                    if (!window._cursorPillLocked) {
                        window._cursorPillLocked = true;
                        if (typeof window._cursorLeavePill === 'function') window._cursorLeavePill();
                    }
                    const phase1Progress = (p - delay) / (heroProgress - delay);
                    const frame = Math.min(
                        Math.round(phase1Progress * mainFrames),
                        mainFrames
                    );
                    anim.goToAndStop(frame, true);

                } else {
                    // Phase 2: draw final tailFrames as hero rises (keep pill locked)
                    if (!window._cursorPillLocked) {
                        window._cursorPillLocked = true;
                        if (typeof window._cursorLeavePill === 'function') window._cursorLeavePill();
                    }
                    const phase2Progress = (p - heroProgress) / (1 - heroProgress);
                    const frame = Math.min(
                        mainFrames + Math.round(phase2Progress * tailFrames),
                        totalFrames - 1
                    );
                    anim.goToAndStop(frame, true);
                }
            }
        });
    });

    anim.addEventListener('data_failed', () => {
        console.warn('[Lottie] Failed to load signature — check SIG_CONFIG.file path');
        container.style.display = 'none';
    });
}
initLottieSignature();



// Hide persistent AV logo when entering content section
ScrollTrigger.create({
    trigger: ".content-wrapper",
    start: "top 60%", // Triggers right as the dark background comes up over the scaled hero
    onEnter: () => gsap.to('.av-shape', { clipPath: "inset(0% 0% 100% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" }),
    onLeaveBack: () => gsap.to('.av-shape', { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" })
});

// Drive Lenis via GSAP ticker (desktop only — null on touch devices)
if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);
}

// ── Shared: mouse + cursor ring tracking (used by cursor system AND particle system)
let mouseX = 0; let mouseY = 0;
let outlineX = 0; let outlineY = 0;  // lerped ring/pill center — also read by particle ticker
let activePill = false;               // true when pill-state is active
let currentPillW = 40;               // cached pill width in px (40 = ring diameter)

// ── Custom Cursor — Three-State System ───────────────────────────────────────
// States (priority order):
//   1. pill-state  — elements with data-cursor="pill" (canvas, project cards)
//   2. hover-state — .hover-trigger, a, .view-btn (orange ring, existing)
//   3. default     — everything else (off-white ring)
//
// SCALABLE: To add a new pill trigger, just add to HTML:
//   data-cursor="pill" data-cursor-label="your text"
// No JS changes needed.
// ─────────────────────────────────────────────────────────────────────────────
if (!isTouchDevice) {
    const cursorDot     = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const cursorLabel   = document.querySelector('.cursor-label');
    const hoverTriggers = document.querySelectorAll('.hover-trigger, .view-btn, a, .magnetic');
    const pillTriggers  = document.querySelectorAll('[data-cursor="pill"]');

    // ── Text measurement utility ─────────────────────────────
    // Measures actual rendered text width so the pill is always tight
    // around the label — no fixed width, no wasted space.
    const PILL_H_PAD = 16;
    const DOT_RADIUS = 4;
    const PILL_GAP   = 5;  // px gap between dot right edge and pill left edge
    let currentPillOffset = 72; // updated per label; drives rightward slide animation

    const _measure = document.createElement('span');
    Object.assign(_measure.style, {
        position: 'fixed', top: '-999px', left: '-999px',
        visibility: 'hidden', pointerEvents: 'none',
        fontFamily: 'system-ui', fontSize: '13px',
        fontWeight: '500', letterSpacing: '0.04em',
        whiteSpace: 'nowrap'
        // No text-transform — sentence case matches HTML
    });
    document.body.appendChild(_measure);

    function calcPill(label) {
        _measure.textContent = label;
        const textW  = _measure.getBoundingClientRect().width;
        const pillW  = Math.ceil(textW) + PILL_H_PAD * 2;
        const offset = pillW / 2 + DOT_RADIUS + PILL_GAP;
        return { pillW, offset };
    }

    // ── Cursor tracking ───────────────────────────────────────
    let _firstMoveCursor = true;
    window.addEventListener('mousemove', (e) => {
        if (e._isAutoPan) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Prevent lerping from (0,0) (top-left) to user pointer on their first actual movement
        // which creates an unsightly "flying ghost streak" across the entire screen.
        if (_firstMoveCursor) {
            outlineX = mouseX;
            outlineY = mouseY;
            // Fade ring in beautifully only when the user touches it
            cursorDot.classList.add('visible');
            cursorOutline.classList.add('visible');
            _firstMoveCursor = false;
        }

        gsap.set(cursorDot, { x: mouseX, y: mouseY });
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });

    gsap.ticker.add(() => {
        const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
        // In pill state: offset center right so pill extends FROM the dot with a clean gap
        const targetX = activePill ? mouseX + currentPillOffset : mouseX;
        outlineX += (targetX - outlineX) * dt;
        outlineY += (mouseY   - outlineY) * dt;
        gsap.set(cursorOutline, { x: outlineX, y: outlineY });
    });

    // ── State helpers ──────────────────────────────────────────
    function enterPill(label) {
        activePill = true;
        const { pillW, offset } = calcPill(label);
        currentPillOffset = offset;
        currentPillW = pillW;   // cache for particle system (avoids getComputedStyle in ticker)
        // Set exact width via CSS var — transitions smoothly from 40px
        cursorOutline.style.setProperty('--pill-w', pillW + 'px');
        cursorLabel.textContent = label;
        cursorOutline.classList.remove('hover-state');
        cursorOutline.classList.add('pill-state');
    }

    function leavePill() {
        activePill = false;
        currentPillW = 40;
        cursorOutline.classList.remove('pill-state');
        cursorOutline.style.removeProperty('--pill-w');
        cursorLabel.textContent = '';
        currentPillOffset = 72;
    }
    // Export for cross-scope access (e.g. lottie scrub dismissing/restoring pill)
    window._cursorLeavePill  = leavePill;
    window._cursorEnterPill  = enterPill;

    function enterHover() {
        if (activePill) return; // pill wins
        cursorOutline.classList.add('hover-state');
    }

    function leaveHover() {
        if (activePill) return;
        cursorOutline.classList.remove('hover-state');
    }

    // ── Smart per-element cursor color sensing ─────────────────────────────────
    // Samples the actual pixel under the cursor on every mousemove (RAF-throttled).
    // Resolves the first non-transparent background by walking the element stack,
    // computes Rec.601 perceived luminance, and toggles 'cursor-on-light' at L>140.
    // This makes the ring react to individual elements (e.g. dark card on light bg)
    // not just the coarse section background — the truest per-pixel contrast sensing.
    let _senseRaf = false;
    function _senseBg() {
        _senseRaf = false;
        const stack = document.elementsFromPoint(mouseX, mouseY);
        let lum = null;
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            // Skip cursor elements — they're pointer-events:none but appear in stack
            if (el === cursorDot || el === cursorOutline) continue;
            let bg = getComputedStyle(el).backgroundColor;
            if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
            const m = bg.match(/\d+\.?\d*/g);
            if (m && m.length >= 3) {
                lum = 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2];
                break;
            }
        }
        if (lum === null) {
            // Fallback: body background
            const m = getComputedStyle(document.body).backgroundColor.match(/\d+\.?\d*/g);
            lum = m && m.length >= 3 ? 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2] : 0;
        }
        // Threshold 140 — same as nav sensing. >140 = light bg, ring darkens
        cursorOutline.classList.toggle('cursor-on-light', lum > 140);
    }
    window.addEventListener('mousemove', () => {
        if (!_senseRaf) { _senseRaf = true; requestAnimationFrame(_senseBg); }
    }, { passive: true });
    // Also re-sense on scroll — content shifts under cursor without mousemove events
    window.addEventListener('scroll',    () => {
        if (!_senseRaf) { _senseRaf = true; requestAnimationFrame(_senseBg); }
    }, { passive: true });
    _senseBg(); // initial check

    // ── Bind pill triggers ─────────────────────────────────────
    pillTriggers.forEach(el => {
        const label = el.dataset.cursorLabel || '';
        // Only the hero canvas respects the signature-drawing lock.
        // Project cards ("View project") are always interactive.
        const isHeroCanvas = el.classList.contains('unicorn-canvas');
        el.addEventListener('mouseenter', () => {
            if (isHeroCanvas && window._cursorPillLocked) return;
            enterPill(label);
        });
        el.addEventListener('mouseleave', () => leavePill());
    });

    // ── Bind hover triggers (scale only — no color change) ─────
    hoverTriggers.forEach(el => {
        el.addEventListener('mouseenter', enterHover);
        el.addEventListener('mouseleave', leaveHover);
    });

} // end !isTouchDevice

// 3. Magnetic UI Elements (M3 Physics - No Elastic)
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
        const bounds = el.getBoundingClientRect();
        const x = e.clientX - bounds.left - bounds.width / 2;
        const y = e.clientY - bounds.top - bounds.height / 2;
        const strength = el.dataset.strength || 20;
        gsap.to(el, { 
            x: (x / bounds.width) * strength, 
            y: (y / bounds.height) * strength, 
            duration: 0.2, // Short duration tracking
            ease: "power2.out" 
        });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { 
            x: 0, y: 0, 
            duration: 0.4, // M3 Standard Decelerate exit 
            ease: "power2.out" 
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// 4. LOADER — AV breathe + 130px progress bar → "2" Reveal
// ═══════════════════════════════════════════════════════════════
//
// TUNABLE VALUES:
//   BREATHE_SCALE_MIN  0.97   exhale (very subtle)
//   BREATHE_CYCLE_DUR  2.2s   full in+out breath
//   LOGO_IN_DUR        0.55s  logo entrance
//   PROG_IN_DELAY      0.4s   bar fade-in delay after logo
//   IDLE_PROGRESS      6      % shown immediately (alive indicator)
//   READY_HOLD_MS      260ms  pause at 100% before reveal
//   TRACK_W            130    must match CSS .loader-prog-track width (px)
// ═══════════════════════════════════════════════════════════════

(function initLoader() {

    /* ── DOM refs ── */
    const panel      = document.getElementById('loader-panel');
    const logoImg    = document.getElementById('loader-logo-img');
    const maskSvg    = document.getElementById('loader-mask-svg');
    const twoPath    = document.getElementById('two-mask-path');
    const navEl      = document.querySelector('nav');
    const progWrapEl = document.getElementById('loader-prog-wrap');
    const fillEl     = document.getElementById('loader-prog-fill');
    const numEl      = document.getElementById('loader-prog-num');

    /* ── Geometry — "2" path in 0 0 139 137 space ── */
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const pw = 139 / 2;
    const ph = 137 / 2;
    function twoT(s) {
        return `translate(${cx},${cy}) scale(${s}) translate(${-pw},${-ph})`;
    }

    /* ── Initial states ── */
    gsap.set(twoPath,    { attr: { transform: twoT(0.007) } });
    gsap.set(maskSvg,    { opacity: 1 });
    gsap.set(panel,      { zIndex: 3 });
    gsap.set(logoImg,    { opacity: 0, scale: 0.4 });
    if (progWrapEl) gsap.set(progWrapEl, { opacity: 0 });

    /* ── Lock scroll ── */
    function _blockScroll(e) { e.preventDefault(); }
    window.addEventListener('wheel',     _blockScroll, { passive: false });
    window.addEventListener('touchmove', _blockScroll, { passive: false });
    if (window.__lenisInstance) window.__lenisInstance.stop();

    /* ── TUNABLE ── */
    const BREATHE_SCALE_MIN = 0.97;
    const BREATHE_CYCLE_DUR = 2.2;
    const LOGO_IN_DUR       = 0.55;
    const PROG_IN_DELAY     = 0.4;
    const IDLE_PROGRESS     = 6;
    const READY_HOLD_MS     = 260;
    const TRACK_W           = 130;   // must match CSS .loader-prog-track width

    /* ── Progress: rAF loop reads window.loaderProgress ──────────
       _targetProgress is set by gate signals (__onLoaderProgress).
       _smoothProgress lerps toward it — smooth counter motion.
       DOM updates happen every frame: fill as px, num as % + transform.
       No CSS transitions on fill — direct style writes per spec.        */
    window.loaderProgress = 0;
    let _targetProgress   = window.__loaderProgressNow || 0;
    let _smoothProgress   = _targetProgress;
    let _animRaf;
    let _animStop = false;

    /* Register callback — gate calls this when each asset loads */
    window.__onLoaderProgress = function(p) { _targetProgress = p; };

    function _animLoop() {
        if (_animStop) return;

        // ── Artificial Creep ──────────────────────────────────────
        // Prevents the bar from feeling "stuck" between discrete signals.
        // Capped handles: stays below 48 while waiting for signal A (50),
        // and below 98 while waiting for signal B (100).
        if (_targetProgress < 48) {
            _targetProgress += 0.04;
        } else if (_targetProgress >= 50 && _targetProgress < 98) {
            _targetProgress += 0.03;
        }

        // Lerp toward target for smooth motion
        _smoothProgress += (_targetProgress - _smoothProgress) * 0.08;
        if (Math.abs(_targetProgress - _smoothProgress) < 0.05) {
            _smoothProgress = _targetProgress;
        }

        window.loaderProgress = _smoothProgress;

        const p = Math.min(100, Math.max(0, _smoothProgress));
        const n = Math.round(p);

        // Fill width as px — no CSS transition, direct write per spec
        if (fillEl) fillEl.style.width = (p / 100 * TRACK_W) + 'px';

        // Number: always to the RIGHT of the fill tip.
        // Only at n=100 flips left so the wider "100" string doesn't overflow the bleed zone.
        if (numEl) {
            numEl.textContent = n;
            numEl.style.left  = p + '%';
            if (n >= 100) {
                numEl.style.transform = 'translate(-100%, -50%)'; // anchor "100" before right edge
            } else {
                numEl.style.transform = 'translate(0%, -50%)';    // to the right of fill tip
            }
        }

        _animRaf = requestAnimationFrame(_animLoop);
    }
    _animRaf = requestAnimationFrame(_animLoop);

    /* ── Phase A: Logo entrance + progress bar fade in ── */
    let _breathTween = null;

    gsap.to(logoImg, {
        opacity:  1,
        scale:    1.00,
        duration: LOGO_IN_DUR,
        delay:    0.2,
        ease:     'power3.out',
        onComplete() {
            _breathTween = gsap.to(logoImg, {
                scale:    BREATHE_SCALE_MIN,
                duration: BREATHE_CYCLE_DUR / 2,
                ease:     'sine.inOut',
                repeat:   -1,
                yoyo:     true,
            });
        }
    });

    gsap.to(progWrapEl, {
        opacity:  1,
        duration: 0.5,
        delay:    PROG_IN_DELAY,
        ease:     'power2.out',
        onComplete() {
            // Nudge to idle so bar shows life immediately
            if (_targetProgress < IDLE_PROGRESS) _targetProgress = IDLE_PROGRESS;
        }
    });

    /* ── Phase B: Gate resolves — all assets ready ── */
    (window.__preloaderReady || Promise.resolve()).then(function () {
        if (_breathTween) _breathTween.kill();
        gsap.to(logoImg, { scale: 1, duration: 0.3, ease: 'power2.out' });
        _targetProgress = 100; // will lerp to 100 in the rAF loop
        setTimeout(startReveal, READY_HOLD_MS);
    });

    /* ── Phase C: "2" mask reveal ── */
    function startReveal() {
        _animStop = true;
        cancelAnimationFrame(_animRaf);

        const tl = gsap.timeline();

        tl
            .set({}, {}, 0.1)

            /* Swap solid panel → SVG mask (blink-free) */
            .to(panel, { opacity: 0, zIndex: -1, duration: 0.05, ease: 'none' })

            /* Logo + progress bar fade together */
            .to([logoImg, progWrapEl].filter(Boolean), {
                opacity:  0,
                duration: 0.4,
                ease:     'power2.inOut',
            })

            /* "2" explodes */
            .to(twoPath, {
                duration: 2.8,
                ease:     'power3.inOut',
                attr:     { transform: twoT(2400) }
            }, '-=0.2')

            /* Unlock scroll + reveal nav/sound corners */
            .call(() => {
                const el = document.getElementById('site-loader');
                if (el) el.style.pointerEvents = 'none';

                if (window._senseNavBg) window._senseNavBg();

                if (navEl) {
                    void navEl.offsetHeight;
                    navEl.classList.add('nav-color-ready');
                }

                window.removeEventListener('wheel',     _blockScroll);
                window.removeEventListener('touchmove', _blockScroll);
                if (window.__lenisInstance) {
                    window.__lenisInstance.scrollTo(0, { immediate: true });
                    window.__lenisInstance.start();
                }

                gsap.to([navEl, '#sound-toggle'].filter(Boolean), {
                    opacity:  1,
                    duration: 0.4,
                    ease:     'power2.out',
                    onStart: () => {
                        const st = document.getElementById('sound-toggle');
                        if (st) st.style.pointerEvents = 'auto';
                        const sh = document.getElementById('scroll-hint');
                        if (sh) sh.style.pointerEvents = 'auto';
                    }
                });

                if (window.__circuitIntro) window.__circuitIntro();
                if (window.__startHeroAutoPan) window.__startHeroAutoPan();
            }, null, '-=2.2')

            /* Remove loader from layout, refresh ST pin spacers */
            .call(() => {
                const el = document.getElementById('site-loader');
                if (el) el.style.display = 'none';
                ScrollTrigger.refresh();
                setTimeout(() => ScrollTrigger.refresh(), 500);
            });
    }

}());





/**
 * 4b. HERO TILT — Subtle high-end mouse-tracking parallax.
 * Reacts to the cursor within the #hero container by gently tilting 
 * the Unicorn Studio canvas using math-based coordinate mapping.
 */
(function initHeroTilt() {
    const hero = document.getElementById('hero');
    const target = document.querySelector('.unicorn-canvas');
    if (!hero || !target) return;

    // We only want this interactive physics on desktop where there's a mouse
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
        let rafId;
        
        function onMouseMove(e) {
            const { width, height, left, top } = hero.getBoundingClientRect();
            
            // Normalize cursor position from -1 to 1 relative to center
            const mouseX = ((e.clientX - left) / width) * 2 - 1;
            const mouseY = ((e.clientY - top) / height) * 2 - 1;

            // Super-Subtle High-End Physics 
            const moveX = mouseX * -3;    
            const moveY = mouseY * -3;    
            
            // Ultra-minimal tilt for a high-end "whisper" of depth
            const tiltX = mouseY * -2.4;   
            const tiltY = mouseX * 2.4;    

            // Use GSAP to interpolate from current state to target 
            gsap.to(target, {
                x: 40 + moveX,   
                yPercent: 8,     
                y: moveY,       
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1000,
                duration: 1.2,   // Balanced "premium" weight
                ease: 'power2.out',
                overwrite: 'auto'
            });
        }

        function reset() {
            gsap.to(target, {
                x: 40,
                yPercent: 8,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                duration: 1.5,
                ease: 'power3.out'
            });
        }

        hero.addEventListener('mousemove', onMouseMove);
        hero.addEventListener('mouseleave', reset);

        // --- Ghost Parallax & Proxy Smoothing Tracker ---
        let proxyMode = 'auto'; // 'auto' | 'catchup' | 'off'
        let virtualX = 0, virtualY = 0;
        let realTargetX = 0, realTargetY = 0;
        let autoPanTime = 0;
        let proxyRaf;
        let lastRealTarget = null;

        function proxyLoop() {
            if (proxyMode === 'off') return;

            let evTarget = target; 
            const r = hero.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;

            if (proxyMode === 'auto') {
                autoPanTime += 0.015;
                virtualX = cx + Math.sin(autoPanTime) * (r.width * 0.25);
                virtualY = cy; 

                if (autoPanTime >= Math.PI * 2) {
                    proxyMode = 'off';
                    hero.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                    window.removeEventListener('mousemove', interceptRealMouse, true);
                    return;
                }
            } else if (proxyMode === 'catchup') {
                virtualX += (realTargetX - virtualX) * 0.12; 
                virtualY += (realTargetY - virtualY) * 0.12;
                if (lastRealTarget) evTarget = lastRealTarget;

                // When the virtual pointer catches up to the real cursor mathematically:
                if (Math.abs(realTargetX - virtualX) < 1 && Math.abs(realTargetY - virtualY) < 1) {
                    proxyMode = 'off';
                    window.removeEventListener('mousemove', interceptRealMouse, true);
                    return; // Handoff completed! Real events flow naturally now.
                }
            }

            const ev = new MouseEvent('mousemove', {
                clientX: virtualX,
                clientY: virtualY,
                bubbles: true,
                cancelable: true
            });
            
            // Flags for cursor logic and interceptor
            ev._isVirtual = true;
            ev._isAutoPan = (proxyMode === 'auto'); // Cursor dot ignores this
            
            if (evTarget && evTarget.dispatchEvent) {
                evTarget.dispatchEvent(ev);
            } else {
                window.dispatchEvent(ev);
            }

            proxyRaf = requestAnimationFrame(proxyLoop);
        }

        // Expose trigger — called by startReveal so the auto-pan runs on the visible hero.
        // Always resets proxyMode to 'auto' so Case 2 (user moved during preloader) also gets
        // the auto-pan. If user moves the real mouse, interceptRealMouse naturally exits to catchup.
        window.__startHeroAutoPan = function () {
            proxyMode = 'auto';
            autoPanTime = 0;  // restart the sinusoidal pan from beginning
            proxyLoop();
        };

        function interceptRealMouse(e) {
            if (e._isVirtual) return; // Ignore our own fake loop events

            realTargetX = e.clientX;
            realTargetY = e.clientY;
            lastRealTarget = e.target;

            if (proxyMode === 'auto') {
                proxyMode = 'catchup'; // Switch from auto-pan to catch-up smoothly
            }

            // NOTE: Do NOT stopPropagation here — we must let the event reach the
            // cursor JS listener (which runs in bubble phase on window) so the custom
            // cursor ring stays visible and positioned correctly.
            // The hero tilt (onMouseMove) is on hero element in bubble phase, but
            // virtual events continue to drive it during catchup.
        }
        
        // Use capturing phase to intercept event before ANY components receive it
        window.addEventListener('mousemove', interceptRealMouse, true);
        
        function killProxy(e) {
            if (e && e._isVirtual) return;
            proxyMode = 'off';
            cancelAnimationFrame(proxyRaf);
            window.removeEventListener('mousemove', interceptRealMouse, true);
            window.removeEventListener('touchstart', killProxy);
            window.removeEventListener('wheel', killProxy);
            
            // Safety reset if interaction occurs outside hero boundaries
            if (e && e.target && !hero.contains(e.target)) {
                hero.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            }
        }
        
        window.addEventListener('touchstart', killProxy, { passive: true });
        window.addEventListener('wheel', killProxy, { passive: true });

        return () => {
            hero.removeEventListener('mousemove', onMouseMove);
            hero.removeEventListener('mouseleave', reset);
        };
    });
})();

// 5. ScrollTrigger Animations
gsap.to('#hero-bg-text', {
    xPercent: -30,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

document.querySelectorAll('.project').forEach((section) => {
    const marquee = section.querySelector('.project-bg-text');
    if (marquee) {
        const dir = marquee.classList.contains('marquee-left') ? -30 : 30;
        gsap.to(marquee, { xPercent: dir, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } });
    }

    const parallaxImage = section.querySelector('.parallax-image');
    if (parallaxImage) {
        gsap.to(parallaxImage, { 
            yPercent: 20, 
            ease: "none", 
            scrollTrigger: {
                trigger: section.querySelector('.project-image-wrapper'),
                start: "top bottom",
                end: "bottom top",
                scrub: true
            } 
        });

        // M3 Scale Reveal
        gsap.fromTo(section.querySelector('.project-image-wrapper'), 
            { scale: 0.9, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", scrollTrigger: {
                trigger: section,
                start: "top 80%", 
            }}
        );
    }

    // Parallax mapping for text content
    const content = section.querySelector('.project-content');
    if (content) {
        gsap.fromTo(content, 
            { y: 50 }, 
            { y: -50, ease: "none", scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }}
        );
    }

    // M3 Text Stagger Reveal
    const texts = section.querySelectorAll('.reveal-text-scroll');
    if (texts.length > 0) {
        gsap.fromTo(texts, 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", scrollTrigger: {
                trigger: section,
                start: "top 70%", 
            }}
        );
    }
});

// 5.5. Minimal Scroll Fade (For About Section typography)
const minimalFades = document.querySelectorAll('.fade-up-minimal');
if (minimalFades.length > 0) {
    gsap.to(minimalFades, { 
        y: 0, 
        opacity: 1, 
        duration: 0.7, 
        stagger: 0.1, 
        ease: "power2.out", 
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 75%", 
        }
    });
}

// 6. Advanced Text Reveal (Character Staggering mapped to M3 Short tokens)
document.querySelectorAll('.split-type').forEach((text) => {
    const words = text.innerText.split(" ");
    text.innerHTML = words.map(word => `<span style="display:inline-block; overflow:hidden;"><span style="display:inline-block;">${word}&nbsp;</span></span>`).join("");

    const innerSpans = text.querySelectorAll('span > span');

    gsap.from(innerSpans, {
        scrollTrigger: {
            trigger: text,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: "100%",
        duration: 0.5, // M3 Long 2
        stagger: 0.03, // M3 Short Micro
        ease: "expo.out" // M3 Emphasized
    });
});

// 7. Project Image "Tilt" Effect (M3 Rational Motion)
document.querySelectorAll('.project-image-wrapper').forEach((img) => {
    img.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = img.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;

        gsap.to(img, {
            rotationY: x * 10,
            rotationX: -y * 10,
            transformPerspective: 1000,
            duration: 0.3, // M3 Medium 2
            ease: "power2.out"
        });
    });

    img.addEventListener('mouseleave', () => {
        // Return without elastic bounce physics
        gsap.to(img, { rotationY: 0, rotationX: 0, duration: 0.5, ease: "power2.out" }); 
    });
});

// 8. Kinetic Text Hover (OffBrand Style Character Roll)
document.querySelectorAll('.hover-stagger').forEach(link => {
    const text = link.innerText;
    link.innerHTML = ''; // Clear existing
    
    const wrapperUp = document.createElement('div');
    const wrapperDown = document.createElement('div');
    wrapperUp.classList.add('stagger-up');
    wrapperDown.classList.add('stagger-down');
    
    text.split('').forEach((char, i) => {
        const spanUp = document.createElement('span');
        const spanDown = document.createElement('span');
        
        const content = char === ' ' ? '&nbsp;' : char;
        spanUp.innerHTML = content;
        spanDown.innerHTML = content;
        
        const delay = `${i * 0.02}s`;
        spanUp.style.transitionDelay = delay;
        spanDown.style.transitionDelay = delay;
        
        wrapperUp.appendChild(spanUp);
        wrapperDown.appendChild(spanDown);
    });
    
    link.appendChild(wrapperUp);
    link.appendChild(wrapperDown);
});

// 9. Kinetic Dual-Arrow Swap Wipe (hover physics)
document.querySelectorAll('.cta-arrow, .nav-arrow').forEach((arrow) => {
    const rawHTML = arrow.innerHTML;
    const rawText = arrow.textContent.trim();
    
    const isDiag = rawHTML.includes('nearr') || rawText === '↗';
    const isDown = rawHTML.includes('darr') || rawText === '↓';

    const char = rawText || '→'; 
    arrow.innerHTML = '';
    
    arrow.style.position = 'relative';
    arrow.style.display = 'inline-flex';
    arrow.style.width = '1em'; /* Reverted to tight 1em bound for exact wipe matching */
    arrow.style.height = '1em';
    arrow.style.alignItems = 'center';
    arrow.style.justifyContent = 'center';
    arrow.style.overflow = 'hidden'; 
    
    const arr1 = document.createElement('span');
    arr1.textContent = char;
    arr1.style.position = 'absolute';
    
    const arr2 = document.createElement('span');
    arr2.textContent = char;
    arr2.style.position = 'absolute';

    // Use exact 100% boundaries to match the text stagger translate Y distance exactly.
    let outX = '100%', outY = '0%'; 
    let inX = '-100%', inY = '0%';  

    if (isDiag) {
        outX = '100%'; outY = '-100%'; 
        inX = '-100%'; inY = '100%';   
    } else if (isDown) {
        outX = '0%'; outY = '100%'; 
        inX = '0%'; inY = '-100%';  
    }

    gsap.set(arr2, { x: inX, y: inY });

    arrow.appendChild(arr1);
    arrow.appendChild(arr2);

    const parentLink = arrow.closest('a');
    if (parentLink) {
        /* Synced precisely to transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1) */
        parentLink.addEventListener('mouseenter', () => {
            gsap.to(arr1, { x: outX, y: outY, duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
            gsap.to(arr2, { x: "0%", y: "0%", duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
        });
        parentLink.addEventListener('mouseleave', () => {
            gsap.to(arr1, { x: "0%", y: "0%", duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
            gsap.to(arr2, { x: inX, y: inY, duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
        });
    }
});

// 9b. Copy Icon Wipe (same kinetic dual-span pattern as arrows)
const emailPill = document.getElementById('email-copy-btn');
if (emailPill) {
    const icon1 = emailPill.querySelector('.copy-icon-1');
    const icon2 = emailPill.querySelector('.copy-icon-2');
    emailPill.addEventListener('mouseenter', () => {
        gsap.to(icon1, { y: '-100%', duration: 0.4, ease: "power2.inOut" });
        gsap.to(icon2, { y: '0%',    duration: 0.4, ease: "power2.inOut" });
    });
    emailPill.addEventListener('mouseleave', () => {
        gsap.to(icon1, { y: '0%',    duration: 0.4, ease: "power2.inOut" });
        gsap.to(icon2, { y: '100%',  duration: 0.4, ease: "power2.inOut" });
    });
}


if (typeof UnicornStudio !== 'undefined') {
    UnicornStudio.init();
}

// 11. Interactive Independent Particle System Overlay
const dotCanvas = document.getElementById('dotsCanvas');
if (dotCanvas) {
    const ctx = dotCanvas.getContext('2d');
    const dotSpacing = 24;
    const repelRadius = 220;
    const maxDisplacement = 20; // Controls how far points mathematically glitch away
    let dots = [];

    function initDots() {
        const parentRect = dotCanvas.parentElement.getBoundingClientRect();
        dotCanvas.width = parentRect.width;
        dotCanvas.height = parentRect.height;
        dots = [];
        
        for (let x = 0; x <= dotCanvas.width; x += dotSpacing) {
            for (let y = 0; y <= dotCanvas.height; y += dotSpacing) {
                dots.push({
                    ox: x, oy: y, // Immutable mathematical origin
                    x: x, y: y,   // Fluid current position
                    vx: 0, vy: 0  // Spring physics velocity vectors
                });
            }
        }
    }

    initDots();
    window.addEventListener('resize', initDots);

    // ── Pill cursor state (shared from cursor system) ─────────────────────────
    // outlineX / outlineY: tracked ring/pill center (lerped, updated by cursor ticker)
    // activePill / currentPillOffset / --pill-w: set by cursor system
    // We read outlineX & outlineY from the outer cursor scope via closure.
    // Capsule distance: distance from point P to nearest point on segment A→B.
    // This matches the exact physical shape of the pill cursor.
    function distToCapsule(px, py, ax, ay, bx, by) {
        const abx = bx - ax, aby = by - ay;
        const len2 = abx * abx + aby * aby;
        if (len2 === 0) {
            const dx = px - ax, dy = py - ay;
            return Math.sqrt(dx * dx + dy * dy);
        }
        // Project P onto segment, clamped 0…1
        const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
        const cx = ax + t * abx;
        const cy = ay + t * aby;
        const dx = px - cx, dy = py - cy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    gsap.ticker.add(() => {
        ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);

        const parentRect = dotCanvas.getBoundingClientRect();
        const localMouseX = mouseX - parentRect.left;
        const localMouseY = mouseY - parentRect.top;

        // Pill geometry in local canvas space
        // outlineX / outlineY are viewport coords (GSAP-set on cursor-outline)
        const localOutlineX = outlineX - parentRect.left;
        const localOutlineY = outlineY - parentRect.top;

        // Current pill width from cursor system — already cached, zero cost
        const pillWAttr = currentPillW;  // 40 when circular, pillW when morphed
        const pillH = 40; // matches CSS height
        const pillR = pillH / 2; // capsule end-cap radius

        // Capsule axis: from left end-cap centre to right end-cap centre
        const capsuleAx = localOutlineX - (pillWAttr / 2 - pillR);
        const capsuleBx = localOutlineX + (pillWAttr / 2 - pillR);
        const capsuleY  = localOutlineY;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];

            // Combined repulsion: dot circle UNION pill capsule
            // Both shapes are treated as a single unit — repel from whichever is closest.
            if (activePill && pillWAttr > 42) {
                // Dot distance (circle at mouse position)
                const dxDot = localMouseX - dot.ox;
                const dyDot = localMouseY - dot.oy;
                const distDot = Math.sqrt(dxDot * dxDot + dyDot * dyDot);

                // Capsule distance
                const distCap = distToCapsule(dot.ox, dot.oy, capsuleAx, capsuleY, capsuleBx, capsuleY);

                // Use whichever shape the dot is closer to
                if (distDot <= distCap) {
                    dist = distDot;
                    dx = dxDot; dy = dyDot;
                } else {
                    dist = distCap;
                    // Repulsion direction: from nearest point on capsule axis
                    const t2 = Math.max(0, Math.min(1,
                        ((dot.ox - capsuleAx) * (capsuleBx - capsuleAx)) /
                        ((capsuleBx - capsuleAx) * (capsuleBx - capsuleAx) || 1)
                    ));
                    dx = (capsuleAx + t2 * (capsuleBx - capsuleAx)) - dot.ox;
                    dy = capsuleY - dot.oy;
                }
            } else {
                // Default: circular repulsion from dot center
                dx = localMouseX - dot.ox;
                dy = localMouseY - dot.oy;
                dist = Math.sqrt(dx * dx + dy * dy);
            }

            let targetX = dot.ox;
            let targetY = dot.oy;

            if (dist < repelRadius && dist > 1) {
                const force = Math.pow((repelRadius - dist) / repelRadius, 2);
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                targetX = dot.ox - (dx / len) * force * maxDisplacement;
                targetY = dot.oy - (dy / len) * force * maxDisplacement;
            }

            dot.vx += (targetX - dot.x) * 0.08;
            dot.vy += (targetY - dot.y) * 0.08;
            dot.vx *= 0.82;
            dot.vy *= 0.82;
            dot.x += dot.vx;
            dot.y += dot.vy;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1.25, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// 12. Navigation Smooth Scrolling
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        
        if (!targetId || !targetId.startsWith('#')) return;
        
        e.preventDefault();
        
        if (targetId === '#') {
            // Scroll to top
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Scroll to target section
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (lenis) {
                    lenis.scrollTo(targetElement, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), offset: 0 });
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });
});

// 13. Email Copy CTA Interaction
const emailCopyBtn = document.getElementById('email-copy-btn');
if (emailCopyBtn) {
    emailCopyBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const emailText   = emailCopyBtn.querySelector('.email-text');
        const copiedText  = emailCopyBtn.querySelector('.copied-text');
        const copyIcon1   = emailCopyBtn.querySelector('.copy-icon-1');
        const copyIcon2   = emailCopyBtn.querySelector('.copy-icon-2');
        const checkIcon   = emailCopyBtn.querySelector('.check-icon-1');
        // iconStack reserved for future icon animation
        const originalEmail = 'aditya20verma@gmail.com';

        try {
            await navigator.clipboard.writeText(originalEmail);

            // Crossfade text
            if (emailText)  emailText.style.opacity  = '0';
            if (copiedText) copiedText.style.opacity  = '1';

            // Swap icon: hide copy wipe, show check
            if (copyIcon1) copyIcon1.style.display = 'none';
            if (copyIcon2) copyIcon2.style.display = 'none';
            if (checkIcon) { checkIcon.style.display = 'inline-flex'; }

            // Revert after 1.5s
            setTimeout(() => {
                if (emailText)  emailText.style.opacity  = '1';
                if (copiedText) copiedText.style.opacity  = '0';
                // Restore copy icons, reset wipe positions
                if (copyIcon1) { copyIcon1.style.display = 'inline-flex'; gsap.set(copyIcon1, { y: '0%' }); }
                if (copyIcon2) { copyIcon2.style.display = 'inline-flex'; gsap.set(copyIcon2, { y: '100%' }); }
                if (checkIcon) checkIcon.style.display = 'none';
            }, 1500);

        } catch (err) {
            console.error('Failed to copy email: ', err);
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// 14. HOVER SOUND SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
// Technique: HTMLAudioElement — same approach as gabrielveres.com
// Key insight: reset currentTime = 0 before every play so rapid hovers
// each produce a distinct tick instead of blocking on the previous one.
//
// Selectors that get hover sound (add data-sound to any new element):
//   [data-sound]     — explicit opt-in
//   .view-btn        — project CTA buttons
//   #email-copy-btn  — email pill
//   nav a            — navigation links
// ══════════════════════════════════════════════════════════════════════════════

(function initHoverSound() {

    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ── Sound enabled state — OFF by default ──────────────────────────────────
    // User must click the toggle to enable. This also satisfies the browser's
    // autoplay policy (requires a genuine user gesture before any audio plays).
    let soundEnabled = false;

    const toggleBtn = document.getElementById('sound-toggle');

    function enableSound() {
        soundEnabled = true;
        if (toggleBtn) {
            toggleBtn.classList.add('sound-on');
            const label = toggleBtn.querySelector('.sound-label');
            if (label) label.textContent = 'SOUND ON';
        }
        // Prime all pool instances on the user gesture that enabled sound
        pool.forEach(a => {
            a.load();
            a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
        });
    }

    function disableSound() {
        soundEnabled = false;
        if (toggleBtn) {
            toggleBtn.classList.remove('sound-on');
            const label = toggleBtn.querySelector('.sound-label');
            if (label) label.textContent = 'SOUND OFF';
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            soundEnabled ? disableSound() : enableSound();
        });
    }

    const SRC    = 'assets/sounds/hover.mp3';
    const VOLUME = 0.3;

    // ── Audio pool: 4 instances rotated so rapid hovers each get a fresh slot ──
    const POOL_SIZE = 4;
    const pool = Array.from({ length: POOL_SIZE }, () => {
        const a = new Audio(SRC);
        a.volume = VOLUME;
        a.playbackRate = 0.5; // Half speed = one octave lower — deep, warm click
        a.preload = 'auto';
        return a;
    });
    let poolIndex = 0;

    // ── Play function ──────────────────────────────────────────────────────────
    // No unlock gate — just play() directly. .catch() absorbs all autoplay blocks.
    // Browsers allow audio triggered from ANY user pointer event (click, mouseenter,
    // touchstart) after the first such event on the page. The loader click is
    // enough. For edge cases where the user goes straight to hovering before
    // anything else, the first hover attempt may be silent — subsequent ones work.
    function playTick() {
        if (!soundEnabled) return; // No-op when muted
        const audio = pool[poolIndex % POOL_SIZE];
        poolIndex++;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    // Expose globally — circuit.js calls this via window.__playHoverSound
    window.__playHoverSound = playTick;

    // ── Bind to standard CTA elements ─────────────────────────────────────────
    function bindSoundSelectors() {
        const selectors = [
            '[data-sound]',
            '.view-btn',
            '#email-copy-btn',
            'nav a',
            '.nav-link',
            '#sound-toggle',
        ].join(', ');

        document.querySelectorAll(selectors).forEach(el => {
            if (el.dataset.soundBound) return;
            el.dataset.soundBound = 'true';
            el.addEventListener('mouseenter', playTick, { passive: true });
        });
    }

    bindSoundSelectors();
    window.addEventListener('load', bindSoundSelectors);

    // ── Restart SFX (v2 refined) ──────────────────────────────────────────
    const RESTART_SFX = new Audio('assets/audio/restartv2.mp3');
    RESTART_SFX.volume = 0.85;

    const logoBtn = document.getElementById('logo-link');
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            // Play only if sound is toggled ON in the UI
            if (soundEnabled) {
                RESTART_SFX.currentTime = 0;
                RESTART_SFX.play().catch(() => {});
            }
        });
    }

    // ── Journey Deck ────────────────────────────────────────────────────
    const initJourneyDeck = (stageSelector = '.journey-stage') => {
        const stage  = document.querySelector(stageSelector);
        const cards  = stage ? gsap.utils.toArray(stage.querySelectorAll('.exp-card')) : [];
        if (!stage || !cards.length) return;

        // Material Design easing
        const vw = window.innerWidth;
        const isTouch = window.matchMedia('(pointer: coarse)').matches || vw < 600;
        const STD = 'cubic-bezier(0.2,0,0,1)';  // Standard — spatial motion
        const DEC = 'cubic-bezier(0,0,0.2,1)';  // Decelerate — settle to rest

        // ── Responsive fan spread — scales to viewport so cards never overflow ──
        // On mobile, we use narrow 260px cards (CSS), allowing us a slightly
        // wider spread (0.15x) for visibility without clipping.
        const fanScale = isTouch ? 0.15 : Math.min(1, vw / 1100);
        const fanSpread = (base) => Math.round(base * (isTouch ? 0.15 : fanScale));



        const fan = [
            { x: fanSpread(-450), y: -40, r: isTouch ? -4 : -12, z: 4 },
            { x: fanSpread(-150), y: -5,  r: isTouch ? -2 : -4,  z: 3 },
            { x: fanSpread( 150), y: -55, r: isTouch ? 2 : 4,    z: 2 },
            { x: fanSpread( 450), y: 15,  r: isTouch ? 4 : 12,   z: 1 },
        ];
        // Sibling scatter distance also scales with viewport
        const scatterShift = isTouch ? 0 : Math.round(70 * fanScale);

        // ── Equalize heights ──────────────────────────────────────────
        const maxH = Math.max(...cards.map(c => c.offsetHeight));
        // Equalize on desktop. On mobile, keep natural heights.
        // ALL cards start STACKED at center (x:0, y:0, r:0) — hidden.
        // The scroll reveal will deal them out to fan positions.
        cards.forEach((c, i) => gsap.set(c, {
            height: isTouch ? 'auto' : maxH,
            position: 'absolute',
            opacity: 0,
            x: 0, y: 140,         // ↑ Adjusted: 140px travel distance
            rotation: i % 2 === 0 ? 0.55 : -0.55,
            scale: 0.88,          // ← Apple: grow into place (0.88→1.0), not shrink
            zIndex: fan[i].z,
            transformPerspective: 1200,
        }));
        const stageMargin = vw < 600 ? 50 : 80;
        stage.style.height = (maxH + stageMargin) + 'px';

        // ── Shared hover state ────────────────────────────────────────
        let activeIndex  = -1;
        let zCounter     = 10;  // Last Touch Wins — monotonically incrementing
        let collapseTimer = null; // Hover-Intent debounce timer

        // ── Per-card quickTo setters (persistent, no conflicts) ───────
        // These are the ONLY way we animate X/Y/rotations — avoids competing gsap.to() tweens
        const qSetters = cards.map(card => ({
            x:   gsap.quickTo(card, 'x',         { duration: 0.38, ease: STD }),
            y:   gsap.quickTo(card, 'y',         { duration: 0.38, ease: STD }),
            rx:  gsap.quickTo(card, 'rotationX', { duration: 0.18, ease: STD }), // Short → reactive 'surface' feel
            ry:  gsap.quickTo(card, 'rotationY', { duration: 0.18, ease: STD }), // Short → reactive 'surface' feel
            rz:  gsap.quickTo(card, 'rotationZ', { duration: 0.28, ease: STD }),
            sc:  gsap.quickTo(card, 'scale',     { duration: 0.35, ease: STD }),
        }));

        // Set per-card perspective only — position is handled by scroll reveal
        // Cards start at x:0, y:0, rotation:0 (stacked) — set above during equalize.

        // ── Scatter helper — drives ALL sibling positions via quickTo ─
        // This is the single source of truth for sibling X positions.
        // Because quickTo is a persistent tween, calling it again just
        // redirects the current animation — zero conflict, zero jerk.
        const scatterSiblings = (fromIndex) => {
            cards.forEach((_, j) => {
                if (j === fromIndex) return;
                const targetX = fan[j].x + (j < fromIndex ? -scatterShift : scatterShift);
                qSetters[j].x(targetX);
                // Siblings slightly compress vertically toward fan Y
                qSetters[j].y(fan[j].y);
            });
        };

        // ── Collapse helper — return ALL cards to fan POSITIONS ───────
        // NOTE: z-order is NOT reset here — it's persistent.
        // The last-touched card stays on top even after the deck collapses.
        // Only fan X/Y/rotation/scale are restored. Z is owned by zCounter.
        const collapseFan = () => {
            cards.forEach((card, j) => {
                qSetters[j].x(fan[j].x);
                qSetters[j].y(fan[j].y);
                qSetters[j].rz(fan[j].r);
                qSetters[j].rx(0);
                qSetters[j].ry(0);
                qSetters[j].sc(1);
                gsap.to(card, { scale: 1, duration: 0.45, ease: DEC, overwrite: 'auto' });

                const roleEl = card.querySelector('.exp-role');
                const dateEl = card.querySelector('.exp-date');
                const metaEl = card.querySelector('.role-meta');
                if (roleEl) gsap.to(roleEl, { color: 'rgba(255,255,255,0.9)', duration: 0.3, ease: DEC });
                if (metaEl) gsap.to(metaEl, { color: 'rgba(255,255,255,0.9)', duration: 0.3, ease: DEC });
                if (dateEl) gsap.to(dateEl, { color: 'rgba(255,255,255,0.25)', duration: 0.3, ease: DEC });
            });
        };

        // ── Wire up per-card events ── (DESKTOP ONLY) ───────────────────
        if (!isTouch) {
            cards.forEach((card, i) => {
                const f = fan[i];
                const qs = qSetters[i];

                // ENTER ───────────────────────────────────────────────────
                card.addEventListener('mouseenter', () => {
                // Cancel any pending collapse (cursor slid from one card to another)
                clearTimeout(collapseTimer);
                activeIndex = i;

                // ── Last Touch Wins — dynamic z-index via counter ─────
                // Increment shared counter and assign to this card.
                // Previously hovered cards keep their counter values below.
                // Result: most recently touched card always sits on top.
                // No resets needed mid-interaction — mathematically clean.
                gsap.set(card, { zIndex: ++zCounter });

                scatterSiblings(i);

                // Spring pop — back.out gives a subtle elastic overshoot
                gsap.to(card, { scale: 1.05, duration: 0.3, ease: 'back.out(1.2)', overwrite: 'auto' });
                qs.y(f.y - 24);  // ← Apple: 16–24px lift max
                qs.rz(f.r);

                // Color highlights
                const roleEl = card.querySelector('.exp-role');
                const dateEl = card.querySelector('.exp-date');
                const metaEl = card.querySelector('.role-meta');
                if (roleEl) gsap.to(roleEl, { color: 'var(--accent)', duration: 0.2, ease: STD, overwrite: 'auto' });
                if (metaEl) gsap.to(metaEl, { color: 'var(--accent)', duration: 0.2, ease: STD, overwrite: 'auto' });
                if (dateEl) gsap.to(dateEl, { color: 'rgba(255,255,255,0.5)', duration: 0.2, ease: STD, overwrite: 'auto' });

                if (typeof window.__playHoverSound === 'function') window.__playHoverSound();
            });

            // MOVE — physics-reactive surface ─────────────────────────
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                // Normalised cursor: -1…+1 from card centre
                const nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
                const ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);

                // Radial distance from card centre (0=centre, ~1.4=corner)
                // Used to model surface resistance — further from centre,
                // cursor 'presses' harder, subtly dampening the lift scale.
                const d = Math.sqrt(nx * nx + ny * ny);

                // ── Translate (parallax follow) ────────────────────────
                qs.x(f.x + nx * 10); // ← Apple: <12px subtle parallax
                qs.y(f.y + ny * 6 - 24);

                // ── 3D Tilt (surface pressure) ─────────────────────────
                qs.rx(-ny * 5);     // ← Apple/Material: ≤5° tilt
                qs.ry( nx * 5);
                qs.rz(f.r + nx * 1.5); // ← Tight wobble, not cartoonish

                // ── Surface Resistance: scale dampening ───────────────
                // As cursor moves toward card edges (d increases),
                // scale compresses very slightly — card 'pushes back'.
                // Δscale is tiny (max ~0.018 at corners) — subtle but physical.
                const resistScale = 1.08 - d * 0.015;
                qs.sc(resistScale);

                // ── Cursor Spotlight glow position ────────────────────
                const pctX = ((e.clientX - rect.left) / rect.width)  * 100;
                const pctY = ((e.clientY - rect.top)  / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${pctX}%`);
                card.style.setProperty('--mouse-y', `${pctY}%`);
            });

            // LEAVE ─────────────────────────────────────────────────────
            card.addEventListener('mouseleave', () => {
                activeIndex = -1;

                // Hover-Intent debounce: give the cursor 60ms to reach the
                // next card. If it does, mouseenter clears this timer.
                // If it lands in empty stage-space, collapse fires.
                collapseTimer = setTimeout(() => {
                    if (activeIndex === -1) collapseFan();
                }, 240);

                // Return this card to fan position
                qSetters[i].x(f.x);
                qSetters[i].y(f.y);
                qSetters[i].rx(0);
                qSetters[i].ry(0);
                qSetters[i].rz(f.r);
                gsap.to(card, { scale: 1, duration: 0.38, ease: DEC, overwrite: 'auto' });

                // Reset colors for this card only
                const roleEl = card.querySelector('.exp-role');
                const dateEl = card.querySelector('.exp-date');
                const metaEl = card.querySelector('.role-meta');
                if (roleEl) gsap.to(roleEl, { color: 'rgba(255,255,255,0.9)', duration: 0.25, ease: DEC, overwrite: 'auto' });
                if (metaEl) gsap.to(metaEl, { color: 'rgba(255,255,255,0.9)', duration: 0.25, ease: DEC, overwrite: 'auto' });
                if (dateEl) gsap.to(dateEl, { color: 'rgba(255,255,255,0.25)', duration: 0.25, ease: DEC, overwrite: 'auto' });
            });
        });
    } else {
        // MOBILE / TOUCH: Simple Tap to Front
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                // Bring to front
                gsap.set(card, { zIndex: ++zCounter });
                // Provide audio feedback if enabled
                if (typeof window.__playHoverSound === 'function') window.__playHoverSound();
                // Visual feedback: brief pop
                gsap.fromTo(card, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(1.5)' });
            });
        });
    }

        // ── Stage events — only on non-touch ──
        if (!isTouch) {
            const cursorRing = document.querySelector('.cursor-outline');

            stage.addEventListener('mouseleave', () => {
                // Guard: don't interfere during reveal animation
                if (stage.classList.contains('deck-animating')) return;
                clearTimeout(collapseTimer);
                activeIndex = -1;
                collapseFan();
                // Use class-based cursor system
                if (cursorRing) cursorRing.classList.remove('hover-state');
            });

            stage.addEventListener('mouseenter', () => {
                if (stage.classList.contains('deck-animating')) return;
                // Use class-based cursor system
                if (cursorRing) cursorRing.classList.add('hover-state');
            });
        }

        // ── 4-PHASE COLOR-DRIVEN REVEAL ───────────────────────────────────────────────
        // The CSS class 'deck-animating' on the stage drives everything:
        //   Phase 1: Cards appear — instantly in FULL COLOR (class active)
        //   Phase 2: Pile Up     — remains in FULL COLOR during climb
        //   Phase 3: Fan Open    — remains in FULL COLOR while spreading
        //   Phase 4: Cards land  — class removed → CSS transitions to GRAYSCALE default
        //
        // pointer-events: none on .deck-animating prevents hover from interfering.
        ScrollTrigger.create({
            trigger: stage,
            start: 'top 75%',
            once: true,
            onEnter: () => {
                // Lock the stage: forces colored state + disables mouse on all cards
                stage.classList.add('deck-animating');
                // NOTE: opacity managed per-card in onStart—each card appears
                // solid only the moment it begins climbing, preventing ghost cards
                // from being visible at y:200 while waiting their turn.

                // ── Phase 1 + 2: Pile Up — DUAL STAGGER (premium rebuild) ───────
                // Two synchronized native-stagger tweens fired in parallel.
                // Same stagger schedule = GSAP's internal engine handles both.
                // No per-card forEach, no onStart rotation snap = zero jerk.

                // [A] Opacity: emerge — matches widened movement stagger
                gsap.to(cards, {
                    opacity: 1,
                    duration: 0.25,
                    stagger: { each: 0.28, from: 'end' }, // ← Wide gap = each card is an event
                    ease: 'none',
                    force3D: true,
                    overwrite: 'auto',
                });

                // [B] Movement: Physics-correct gravity model (No Bounce)
                // expo.out = exponential deceleration. The card accelerates through
                // the climb and decelerates SHARPLY at the end for a premium 'snap'.
                // Total sequence: ~2.54s for 4 cards
                gsap.to(cards, {
                    y: 0,
                    scale: 1.0,  
                    rotation: 0,
                    duration: 1.7,
                    ease: 'expo.out',
                    stagger: { each: 0.28, from: 'end' }, // 280ms gap — each card is distinct
                    force3D: true,
                    overwrite: 'auto',
                    onComplete: function() {
                        // Guard: only fire fan-out when the LAST card (index 0) lands
                        if (this.targets()[0] !== cards[0]) return;

                        // ── Phase 3: Fan Open ─────────────────────────────
                        gsap.to(cards, {
                            x: (idx) => fan[idx].x,
                            y: (idx) => fan[idx].y,
                            rotation: (idx) => fan[idx].r,
                            scale: 1,
                            stagger: { each: 0.08, from: 'end' },
                            duration: 0.7,    // was 0.55 — touch more grace
                            ease: 'back.out(1.4)',
                            delay: 0,         // was 0.02 — no pause between pile-up and fan-out
                            onComplete: () => {
                                // Hard-snap for pixel-perfect hover registration
                                cards.forEach((c, idx) => {
                                    gsap.set(c, {
                                        x: fan[idx].x,
                                        y: fan[idx].y,
                                        rotation: fan[idx].r,
                                        scale: 1,
                                        transformPerspective: 1200,
                                    });
                                });

                                // Phase 4: colour→grayscale settle (0.65s, Apple HIG)
                                stage.classList.add('deck-settling');
                                requestAnimationFrame(() => {
                                    stage.classList.remove('deck-animating');
                                });
                                setTimeout(() => {
                                    stage.classList.remove('deck-settling');
                                }, 750); // 650ms transition + small buffer
                            }
                        });
                    }
                });
            }
        });
        // NOTE: Draggable intentionally disabled.
        // It uses its own x,y engine which conflicts with quickTo hover setters,
        // causing snap-back on drag release. Cards can be clicked/tapped to front.
    };

    // Instant init: two rAF frames ensures DOM is fully painted and
    // offsetHeight measurements are accurate — no artificial 500ms delay.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        initJourneyDeck('#journey .journey-stage');       // Experience deck
        initJourneyDeck('#testimonials .testimonial-stage'); // Testimonials deck
    }));

    // ── Auto-Activation ───────────────────────────────────────
    // Enable sound on first interaction anywhere
    window.addEventListener('click', () => {
        if (!soundEnabled) enableSound();
    }, { once: true });

}());
// ── About Section Cinematic Unmasking (Lando Norris Style) ───────────────────
if (document.querySelector('.mask-text')) {
    gsap.to('.mask-text', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        ease: 'power4.out',
        duration: 1.5,
        stagger: 0.12, 
        scrollTrigger: {
            trigger: '#about-me', 
            start: 'top 85%', 
        }
    });
}

if (document.querySelector('.rule-anim')) {
    gsap.to('.rule-anim', {
        scaleX: 1, 
        ease: 'power3.inOut',
        duration: 1.4,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '#about-me',
            start: 'top 80%',
        }
    });
}
