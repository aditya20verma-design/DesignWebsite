// ══════════════════════════════════════════════════════════════════════════════
// ASSET CONFIG — swap any asset by updating this block only.
// Animations and layout are decoupled from these paths/IDs.
// Full config with import syntax: assets/config.js
// ══════════════════════════════════════════════════════════════════════════════
const ASSETS = {
    hero: {
        unicornProjectId: 'VUmB8Ym97iye9ZS9hDbi', // ← swap WebGL visual here
    },
    work: {
        images: {
            unishare:  'assets/work/images/unishare.jpg',
            dmrc:      'assets/work/images/dmrc.png',
            mfine:     'assets/work/images/mfine.jpg',
        },
        thumbnails: {
            project1:  'assets/work/thumbnails/project1.png',
            project2:  'assets/work/thumbnails/project2.png',
            project3:  'assets/work/thumbnails/project3.png',
        },
    },
    about:  {},  // add portrait, resume PDF, etc. when built
    footer: {},  // add footer icons/assets when built
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION SCRIPTS LIVE IN /scripts/ — see stubs there for migration guide:
//   scripts/hero/animation.js   → hero GSAP collapse + signature reveal
//   scripts/hero/canvas.js      → dot matrix repel canvas
//   scripts/work/animation.js   → project section scroll reveals
//   scripts/shared/cursor.js    → magnetic cursor
//   scripts/shared/scroll.js    → Lenis + ScrollTrigger init
// ══════════════════════════════════════════════════════════════════════════════

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
                        target.scrollIntoView({ behavior: 'smooth' });
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

    // Walk up the DOM tree to find the first element with a non-transparent background
    function getEffectiveBg(el) {
        let node = el;
        while (node && node !== document.documentElement) {
            const bg = window.getComputedStyle(node).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
            node = node.parentElement;
        }
        return window.getComputedStyle(document.body).backgroundColor;
    }

    // Perceived luminance (0-255)
    function luminance(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    function senseBackground() {
        const navH   = nav.offsetHeight;
        const sampleY = navH * 0.35; // sample near nav top — where text lives

        // Three horizontal sample points: left, centre, right
        const xs = [
            window.innerWidth * 0.08,
            window.innerWidth * 0.50,
            window.innerWidth * 0.92
        ];

        let totalLum = 0;
        let count    = 0;

        xs.forEach(function (x) {
            // elementsFromPoint returns ALL elements at that point (z-sorted)
            const stack = document.elementsFromPoint(x, sampleY);
            for (let i = 0; i < stack.length; i++) {
                // Skip the nav itself and its descendants
                if (!nav.contains(stack[i]) && stack[i] !== nav) {
                    const bg = getEffectiveBg(stack[i]);
                    const m  = bg.match(/\d+/g);
                    if (m && m.length >= 3) {
                        totalLum += luminance(+m[0], +m[1], +m[2]);
                        count++;
                    }
                    break;
                }
            }
        });

        const avgLum = count > 0 ? totalLum / count : 0;

        // Threshold at 140 — gives comfortable headroom for off-white and light-grey
        if (avgLum > 140) {
            nav.classList.add('nav-on-light');
        } else {
            nav.classList.remove('nav-on-light');
        }

        rafId = null;
    }

    function onScroll() {
        if (!rafId) rafId = requestAnimationFrame(senseBackground);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Also re-sense after fonts/images load in case layout shifts
    window.addEventListener('load', senseBackground);
    senseBackground(); // run immediately on page load
})();


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
const mm = gsap.matchMedia();

mm.add("(min-width: 601px)", () => {
    let isLogoHidden = false;
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-track",
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 0.7), // ends at 70vh scroll — 30vh hold, then sticky releases + content enters
            scrub: 1,
            onUpdate: (self) => {
                const p = self.progress;
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
        scale: 0.35,                  // original — elegant wide block (initial commit values)
        clipPath: "inset(0vh calc(50vw - 80vh) 0vh calc(50vw - 80vh) round 0px)",
        opacity: 0.35,
        ease: "power2.inOut"
    }, 0);

    tl.to('.unicorn-canvas', {
        scale: 1.6,
        yPercent: 10,
        ease: "power2.inOut"
    }, 0);

    tl.to('.signature-container', {
        scale: 0.6,
        ease: "power2.inOut"
    }, 0);

    tl.to('.av-signature path', {
        strokeDashoffset: 0,
        ease: "power2.inOut"
    }, 0);
});

mm.add("(max-width: 600px)", () => {
    // Mobile: same pin-then-rise pattern as Lando Norris — just scale + opacity, no clipPath rounding
    // With 200vh track: 100vh of sticky animation travel, then hero rises naturally
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-track",
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 0.7), // same 70vh end on mobile
            scrub: 1, // matches Lando Norris desktop feel
        }
    });

    // NO clipPath on mobile — Lando Norris uses sharp edges, rounding feels out of place
    tl.to('.hero', {
        scale: 0.70,                  // signature extends visually beyond the compact card
        opacity: 0.55,
        ease: "power2.inOut"
    }, 0);

    tl.to('.unicorn-canvas', {
        scale: 1.3,
        yPercent: 5,
        ease: "power2.inOut"
    }, 0);

    tl.to('.signature-container', {
        scale: 0.75,
        ease: "power2.inOut"
    }, 0);

    tl.to('.av-signature path', {
        strokeDashoffset: 0,
        ease: "power2.inOut"
    }, 0);
});

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

// Shared mouse coordinates (used by cursor + particle system)
let mouseX = 0; let mouseY = 0;

// 2. Custom Cursor Implementation (desktop only)
if (!isTouchDevice) {
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const hoverTriggers = document.querySelectorAll('.hover-trigger, .view-btn, a, .magnetic');

let outlineX = 0; let outlineY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
    
    // Bind cursor coordinates to global CSS runtime layout (for mask tracking)
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
    outlineX += (mouseX - outlineX) * dt;
    outlineY += (mouseY - outlineY) * dt;
    gsap.set(cursorOutline, { x: outlineX, y: outlineY });
});

hoverTriggers.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover-state'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover-state'));
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

// 4. Initial Loader Sequence (Disabled visually in CSS, keeping timeline for entrance reveals only)
const tlLoader = gsap.timeline();

tlLoader.fromTo('.loader-text', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" } // M3 Emphasized
    )
    .to('.loader-text', { y: -50, opacity: 0, duration: 0.5, ease: "power4.in", delay: 0.3 })
    .to('.loader', { yPercent: -100, duration: 0.6, ease: "power2.inOut", onComplete: () => { if (lenis) lenis.start(); } }) // M3 Long 4
    .fromTo('.reveal-text', 
        { y: 100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "expo.out" }, // Fast staggers
        "-=0.2"
    )
    .fromTo('.reveal-text-delay', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 
        "-=0.4"
    );

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
        gsap.to(marquee, { xPercent: dir, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 } });
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
                scrub: 1
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
    const repelRadius = 150;
    const maxDisplacement = 12; // Controls how far points mathematically glitch away
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

    // Run custom rendering loop synchronously with GSAP ticker
    gsap.ticker.add(() => {
        // Completely clear the canvas for the next memory frame
        ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
        
        const parentRect = dotCanvas.getBoundingClientRect();
        const localMouseX = mouseX - parentRect.left;
        const localMouseY = mouseY - parentRect.top;

        // Increased opacity for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            
            // Step 1: Independently calculate distance of this specific dot to the cursor
            const dx = localMouseX - dot.ox;
            const dy = localMouseY - dot.oy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetX = dot.ox;
            let targetY = dot.oy;

            // Step 2: If the dot is within the cursor blast radius, calculate its explicit repulsion coordinate
            if (dist < repelRadius && dist > 1) {
                // Force gets exponentially stronger the closer the cursor is to the dot
                const force = Math.pow((repelRadius - dist) / repelRadius, 2);
                targetX = dot.ox - (dx / dist) * force * maxDisplacement;
                targetY = dot.oy - (dy / dist) * force * maxDisplacement;
            }

            // Step 3: Fast, tight spring physics pulling the particle toward its calculated target
            dot.vx += (targetX - dot.x) * 0.3; // Spring strength (tight)
            dot.vy += (targetY - dot.y) * 0.3;
            
            // Friction damping stops any continuous wave "blob" physics by absorbing the kinetic energy instantly
            dot.vx *= 0.6; 
            dot.vy *= 0.6;
            
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Step 4: Draw the discrete particle element into memory
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