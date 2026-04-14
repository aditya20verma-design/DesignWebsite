/**
 * ── Helmet Scroll Interaction ─────────────────────────────────────────────
 * Lando Norris-inspired: helmet enters from right off-screen, rotates
 * through 3 sprite frames, scales down, and lands on portrait head.
 *
 * Layout:
 *   [Portrait — LEFT]   [About text — RIGHT]
 *   Helmet starts: far right, oversize, off-screen
 *   Helmet ends:   over portrait head, scaled down
 *
 * Requires: GSAP + ScrollTrigger (already loaded globally)
 * ─────────────────────────────────────────────────────────────────────────
 */

(function initHelmetScroll() {
    const section  = document.querySelector('#about-helmet');
    const helmet   = document.querySelector('#helmet-img');
    const portrait = document.querySelector('#about-portrait');
    const headMark = document.querySelector('#helmet-target');
    if (!section || !helmet || !portrait || !headMark) return;

    // ── Sprite frames: right → quarter → front ──────────────────────────
    // Sequence plays as scroll progresses 0% → 100%
    const FRAMES = [
        'sections/about/assets/helmet/helmet-side-righ.png',  // start (right side view)
        'sections/about/assets/helmet/helmet-quarter-right.png', // mid
        'sections/about/assets/helmet/helmet-front.png',       // end (facing portrait)
    ];

    // Preload all frames so no flicker on swap
    FRAMES.forEach(src => { const img = new Image(); img.src = src; });

    let currentFrame = 0;

    function setFrame(index) {
        if (index === currentFrame) return;
        currentFrame = index;
        // Cross-fade swap via opacity
        gsap.to(helmet, {
            opacity: 0,
            duration: 0.12,
            ease: 'none',
            onComplete: () => {
                helmet.src = FRAMES[index];
                gsap.to(helmet, { opacity: 1, duration: 0.15, ease: 'none' });
            }
        });
    }

    // ── Get target head position (where helmet lands) ─────────────────────
    // headMark is an invisible div positioned over the portrait head
    function getTargetOffset() {
        const helmetRect  = helmet.parentElement.getBoundingClientRect();
        const targetRect  = headMark.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();

        // Offset of headMark relative to helmet's initial parent center
        return {
            x: (targetRect.left + targetRect.width  / 2)
             - (helmetRect.left + helmetRect.width  / 2),
            y: (targetRect.top  + targetRect.height / 2)
             - (helmetRect.top  + helmetRect.height / 2),
        };
    }

    // ── Main timeline ─────────────────────────────────────────────────────
    function buildTimeline() {
        const target = getTargetOffset();
        const vw     = window.innerWidth;

        // Helmet starts: large, fully off-screen right
        const startX   = vw * 0.72;   // 72vw = fully off right edge
        const startScale = 1.8;
        const endScale   = 0.48;      // tune per screen

        gsap.set(helmet, { x: startX, y: -30, scale: startScale, opacity: 1 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=220%',           // 2.2x viewport of scroll for this section
                pin: true,
                scrub: 1.4,             // weighted drag — heavier = more cinematic
                anticipatePin: 1,
                onUpdate: (self) => {
                    const p = self.progress;
                    // Swap sprite frames at thresholds
                    if      (p < 0.35) setFrame(0);  // side-right view
                    else if (p < 0.72) setFrame(1);  // quarter-right view
                    else               setFrame(2);  // front view (landing)
                }
            }
        });

        tl
            // ── Phase 1 (0→50%): Slide in from right + scale down ──────────
            .to(helmet, {
                x: target.x * 0.15,    // move most of the way across
                y: target.y * 0.1,
                scale: startScale * 0.65,
                ease: 'power2.inOut',
                duration: 1,
            })
            // ── Phase 2 (50→85%): Continue travel, rotate toward face ──────
            .to(helmet, {
                x: target.x * 0.7,
                y: target.y * 0.55,
                scale: endScale * 1.25,
                ease: 'power1.inOut',
                duration: 0.8,
            })
            // ── Phase 3 (85→100%): Snap/settle onto head ─────────────────
            .to(helmet, {
                x: target.x,
                y: target.y,
                scale: endScale,
                ease: 'back.out(1.8)',  // spring settle — the "click" feeling
                duration: 0.5,
            });

        return tl;
    }

    let tl = buildTimeline();

    // ── Rebuild on resize ─────────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (tl) { tl.scrollTrigger.kill(); tl.kill(); }
            tl = buildTimeline();
        }, 300);
    });

}());
