// ══════════════════════════════════════════════════════════════════════════
// CIRCUIT COMPONENT
// Left-side frosted pill · Section zones (hover highlight + label + click)
// Scroll-synced progress rider
// ══════════════════════════════════════════════════════════════════════════

(function CircuitComponent() {
    'use strict';

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[Circuit] missing GSAP'); return;
    }

    // ── SECTION ZONES: divide track into segments mapped to DOM sections ───
    const ZONES = [
        { id: 'hero',    target: 'hero',      start: 0.00, end: 0.22, label: 'HOME',      scrollTo: 'hero' },
        { id: 'work',    target: 'project-1', start: 0.22, end: 0.65, label: 'WORK',    scrollTo: 'project-1' },
        { id: 'about',   target: 'about',     start: 0.65, end: 0.85, label: 'ABOUT',   scrollTo: 'about' },
        { id: 'contact', target: 'contact',   start: 0.85, end: 1.00, label: 'CONTACT', scrollTo: 'contact' },
    ];

    // ── DOM refs ───────────────────────────────────────────────────────────
    let pillEl, innerEl, rootEl, tiltEl, svgEl;
    let trackProgressPath, animPath;
    let riderCircle;

    let pathLength     = 0;
    let targetProgress = 0;
    let easedProgress  = 0;
    let activeZone     = '';

    // ── Completion state machine ─────────────────────────────────────
    // Prevents effects from re-firing on every tick once triggered
    let completionFired  = false; // true once we've crossed 98.5%
    let sweepPath        = null;  // the SVG shimmer element
    let milestones     = []; // Stores exact scroll mappings

    const NS = 'http://www.w3.org/2000/svg';

    // ── 1. BUILD SHELL ─────────────────────────────────────────────────────
    function buildShell() {
        const old = document.getElementById('circuit-pill');
        if (old) old.remove();

        pillEl = document.createElement('div');
        pillEl.id = 'circuit-pill';

        innerEl = document.createElement('div');
        innerEl.id = 'circuit-inner';
        pillEl.appendChild(innerEl);

        rootEl = document.createElement('div');
        rootEl.id = 'circuit-root';
        rootEl.setAttribute('aria-hidden', 'true');
        innerEl.appendChild(rootEl);

        tiltEl = document.createElement('div');
        tiltEl.id = 'circuit-tilt';
        rootEl.appendChild(tiltEl);

        document.body.appendChild(pillEl);
    }

    // ── 2. LOAD SVG ────────────────────────────────────────────────────────
    async function loadSVG() {
        const res  = await fetch('sections/circuit/assets/Trackfig.svg');
        const text = await res.text();
        const doc  = new DOMParser().parseFromString(text, 'image/svg+xml');
        svgEl      = doc.querySelector('svg');
        if (!svgEl) { console.error('[Circuit] SVG failed'); return; }

        svgEl.id = 'circuit-svg';
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.setAttribute('viewBox', '480 30 860 1040');
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        trackProgressPath = svgEl.querySelector('#track-progress');
        animPath          = svgEl.querySelector('#track-path') || trackProgressPath;
        if (!animPath) { console.error('[Circuit] #track-progress not found'); return; }

        // ── PRE-HIDE BEFORE DOM INSERTION ───────────────────────────────
        // Setting opacity on the parsed SVG document (still off-screen) guarantees
        // ZERO flash window between insertion and hide. No frame can slip through.
        const _trackBase  = svgEl.querySelector('#track-base');
        const _trackDepth = svgEl.querySelector('#track-depth');
        if (_trackDepth) _trackDepth.style.opacity = '0';
        // trackBase: use opacity for now; we'll swap to dashoffset after pathLength is known
        if (_trackBase)  _trackBase.style.opacity  = '0';
        // Hide rider elements pre-insertion
        // NOTE: rider elements are built dynamically by buildRider() and do NOT
        // exist in the SVG file, so we only pre-hide the static track layers here.

        // Insert into DOM (all elements already invisible)
        tiltEl.appendChild(svgEl);
        pathLength = animPath.getTotalLength(); // requires DOM presence

        // Bootstrap progress stroke (in SVG user units via setAttribute)
        trackProgressPath.setAttribute('stroke-dasharray',  pathLength);
        trackProgressPath.setAttribute('stroke-dashoffset', pathLength);

        // Keep trackBase HIDDEN via opacity:0 — belt-and-suspenders with dashoffset.
        // introAnimation() will cross-fade it to opacity:1 in Stage 3 only.
        if (_trackBase) {
            _trackBase.setAttribute('stroke-dasharray',  pathLength);
            _trackBase.setAttribute('stroke-dashoffset', 0); // fully drawn but opacity hides it
            _trackBase.style.opacity = '0'; // stay hidden — introAnimation reveals it
        }

        // Inject overlays
        buildFilters();
        buildSectionZones();
        buildRider();
        // Hide ALL rider elements (dynamically created by buildRider — must hide after it runs)
        const _riderIds = ['rider-bg', 'rider-ring-1', 'rider-ring-2', 'rider-glow-blob', 'rider-core'];
        const _riderEls = [..._riderIds.map(id => svgEl.getElementById(id)).filter(Boolean),
                           riderCircle].filter(Boolean);
        _riderEls.forEach(el => gsap.set(el, { opacity: 0 }));

        computeMilestones();
        window.addEventListener('resize', computeMilestones);

        initScroll();
        initTicker();
        update(0);

        // Sync luminance state immediately now that pill exists in DOM 
        // (Fixes hover styles not working before first scroll)
        if (window._senseNavBg) window._senseNavBg();

        // ── Deferred intro: loader calls window.__circuitIntro() after curtain drops.
        // Fallback: if no loader present (dev/direct access), play after 300ms.
        window.__circuitIntro = function () {
            window.__circuitIntro = null; // prevent double-call
            introAnimation();
        };
        if (!document.getElementById('site-loader')) {
            setTimeout(() => { if (window.__circuitIntro) window.__circuitIntro(); }, 300);
        }
    }

    // ── 2b. INTRO ANIMATION ───────────────────────────────────────────────
    //
    //  STAGE 1 ──  Track is truly invisible (opacity:0 on #track-base).
    //              Nothing renders. Zero flash on any background color.
    //
    //  STAGE 2 ──  A CLONE of the track (same grey color) is painted from
    //              scratch using stroke-dashoffset going from pathLength → 0.
    //              The tracer dot rides the leading edge of the paint.
    //              Physics: slow creep → energy pulse at 1% → full sprint.
    //
    //  STAGE 3 ──  Clone is 100% painted. Tracer implodes. Clone cross-fades
    //              to real #track-base. Rider dot bursts in.
    //
    function introAnimation() {
        const trackBase  = svgEl.querySelector('#track-base');
        const trackDepth = svgEl.querySelector('#track-depth');
        const riderIds   = ['rider-bg','rider-ring-1','rider-ring-2','rider-glow-blob','rider-core'];
        const riderEls   = [...riderIds.map(id => svgEl.getElementById(id)).filter(Boolean),
                             riderCircle].filter(Boolean);

        // ── ENSURE #track-base stays hidden throughout stages 1 & 2 ───────
        // loadSVG already set dashoffset=pathLength, but re-enforce via opacity
        // as a belt-and-suspenders guarantee (no browser can leak it through).
        if (trackBase) {
            trackBase.style.opacity = '0';
        }
        if (trackDepth) {
            trackDepth.style.opacity = '0';
        }

        // ── PAINT PATH (clone of track-base, same geometry + color) ───────
        // Starts with stroke-dashoffset = pathLength (fully hidden).
        // Animating dashoffset → 0 "paints" it from start to end.
        const paintPath = document.createElementNS(NS, 'path');
        paintPath.setAttribute('d', animPath.getAttribute('d'));
        paintPath.setAttribute('fill', 'none');
        // Match exact track-base visual style
        paintPath.setAttribute('stroke', 'rgba(200, 200, 200, 0.85)');
        paintPath.setAttribute('stroke-width', '20');
        paintPath.setAttribute('stroke-linecap', 'round');
        paintPath.setAttribute('stroke-linejoin', 'round');
        paintPath.style.filter = 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.30))';
        // Fully hidden at start
        paintPath.setAttribute('stroke-dasharray',  pathLength);
        paintPath.setAttribute('stroke-dashoffset', pathLength); // hidden
        paintPath.style.pointerEvents = 'none';
        // Insert just above track-base (before trackProgressPath which is after it)
        if (trackBase && trackBase.parentNode) {
            trackBase.parentNode.insertBefore(paintPath, trackBase.nextSibling);
        } else {
            svgEl.appendChild(paintPath);
        }

        // ── PROXY: animates the dashoffset to reveal the paint path ────────
        // p = 0 → nothing painted
        // p = 1 → fully painted
        // dashoffset = pathLength * (1 - p)
        const proxy = { p: 0 };

        function onProxyUpdate() {
            const len = pathLength * proxy.p;
            // Reveal painted track up to current p
            paintPath.setAttribute('stroke-dashoffset', pathLength - len);
        }

        // ── MASTER TIMELINE ───────────────────────────────────────────────
        const tl = gsap.timeline();

        // ═══ STAGE 2: Continuous sweep to 100% ═══════════════════════════
        // Smooth reveal in one go from start to end
        tl.to(proxy, {
            p: 1.0,
            duration: 2.0,
            ease: 'power2.inOut',
            onUpdate: onProxyUpdate
        }, 0); // start instantly

        // ═══ STAGE 3: Real track crossfades, rider bursts in ══════════════
        tl.add(() => {

            // 3b. Swap paintPath for real trackBase seamlessly without a dip
            // The blink happens because dual 50% opacities combine to 75% opacity (bleeding bg).
            // Fix: Keep paintPath solid (100%), fade trackBase in ON TOP, then delete paintPath.
            if (trackBase) {
                gsap.to(trackBase, {
                    opacity: 1,
                    duration: 0.35,
                    ease: 'power1.out',
                    onComplete: () => paintPath.remove() // Safely delete once trackBase is 100% visible
                });
            } else {
                paintPath.remove(); // Fallback
            }
            // Depth (3D side/extrusion) reveals with the real track — same timing
            if (trackDepth) {
                gsap.to(trackDepth, {
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.inOut'
                });
            }

            // 3c. Rider bursts in — staggered for premium feel
            gsap.to(riderEls, {
                opacity: 1,
                duration: 0.5,
                delay: 0.18,
                stagger: 0.05,
                ease: 'power2.out'
            });

            // 3d. Rider glow "birth" burst
            const glowBlob = svgEl.getElementById('rider-glow-blob');
            if (glowBlob) {
                gsap.fromTo(glowBlob,
                    { attr: { r: 0, 'fill-opacity': 0.85 } },
                    {
                        attr: { r: 100, 'fill-opacity': 0.55 },
                        delay: 0.18,
                        duration: 0.4,
                        ease: 'power2.out',
                        onComplete: () => gsap.to(glowBlob, {
                            attr: { r: 55, 'fill-opacity': 0.28 },
                            duration: 0.9,
                            ease: 'power3.inOut'
                        })
                    }
                );
            }
        });
    }



    // ── 3. FILTERS ─────────────────────────────────────────────────────────
    function buildFilters() {
        const defs = document.createElementNS(NS, 'defs');
        defs.innerHTML = `
            <filter id="rider-glow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="10" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        `;
        svgEl.insertBefore(defs, svgEl.firstChild);
    }

    // ── 4. SECTION ZONES ───────────────────────────────────────────────────
    // Each zone = 2 paths sharing the same d:
    //   (a) Visual segment: thin coloured stroke, pointer-events:none
    //   (b) Hit zone: thick transparent stroke, pointer-events:stroke
    // Plus a label at the midpoint
    function buildSectionZones() {
        const trackD = animPath.getAttribute('d');
        const allSegs = []; // Store all visual segments for cross-dimming

        ZONES.forEach(zone => {
            const segLen    = (zone.end  - zone.start) * pathLength;
            const segOff    = -(zone.start * pathLength); // negative offset reveals from start
            const dashArray = `${segLen} ${pathLength + 10}`;

            // ── Visual segment (highlights white for uncompleted on hover) 
            const segPath = document.createElementNS(NS, 'path');
            segPath.setAttribute('d', trackD);
            segPath.setAttribute('class', 'section-seg');
            segPath.setAttribute('stroke-dasharray', dashArray);
            segPath.setAttribute('stroke-dashoffset', segOff);
            segPath.id = `seg-${zone.id}`;
            
            // ── Visual segment (highlights orange for completed on hover)
            const segOrange = document.createElementNS(NS, 'path');
            segOrange.setAttribute('d', trackD);
            segOrange.setAttribute('class', 'section-seg-orange');
            segOrange.setAttribute('stroke-dasharray', dashArray);
            segOrange.setAttribute('stroke-dashoffset', segOff);
            segOrange.id = `seg-${zone.id}-orange`;

            // IMPORTANT: Insert visual hover behind the orange progress track so progress isn't hidden
            if (trackProgressPath && trackProgressPath.parentNode) {
                trackProgressPath.parentNode.insertBefore(segPath, trackProgressPath);
                trackProgressPath.parentNode.insertBefore(segOrange, trackProgressPath);
            } else {
                svgEl.appendChild(segPath);
                svgEl.appendChild(segOrange);
            }
            allSegs.push(segPath);

            // ── Hit zone (invisible fat stroke for easy hovering) ──────
            const hitPath = document.createElementNS(NS, 'path');
            hitPath.setAttribute('d', trackD);
            hitPath.setAttribute('class', 'section-zone');
            hitPath.setAttribute('stroke', 'rgba(255,255,255,0.01)'); // Safe transparent 
            hitPath.setAttribute('stroke-width', '70'); // Ultra wide for effortless hovering
            hitPath.setAttribute('fill', 'none'); // CRITICAL FIX: Stops implicit path fills spanning across curves and hijacking mouse movements
            hitPath.setAttribute('stroke-dasharray', dashArray);
            hitPath.setAttribute('stroke-dashoffset', segOff);
            hitPath.setAttribute('pointer-events', 'stroke'); // Guarantee it catches hovers even if transparent
            hitPath.style.cursor = 'pointer';
            svgEl.appendChild(hitPath);

            // ── Label (foreignObject at midpoint) ─────────────────────────
            let labelEl = null;
            let labelFO = null;
            if (zone.label) {
                const midT  = (zone.start + (zone.end - zone.start) / 2) * pathLength;
                const midPt = animPath.getPointAtLength(midT);

                labelFO = document.createElementNS(NS, 'foreignObject');
                labelFO.setAttribute('x', midPt.x + 40); 
                labelFO.setAttribute('y', midPt.y - 48); // Re-centered for the 96px tall pill to prevent bottom crop
                labelFO.setAttribute('width', '500'); // Immense width safety
                labelFO.setAttribute('height', '180'); // Immense height safety
                labelFO.style.pointerEvents = 'none';

                labelEl = document.createElement('div');
                labelEl.className = 'section-label';
                labelEl.textContent = zone.label;
                labelFO.appendChild(labelEl);
                svgEl.appendChild(labelFO);
            }

            // ── Hover events ────────────────────────────────────────────────
            function moveLabel(e) {
                if (!labelFO || !svgEl) return;
                const pt = svgEl.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                const ctm = svgEl.getScreenCTM();
                if (!ctm) return;
                const svgP = pt.matrixTransform(ctm.inverse());
                
                // Set the exact cursor position with a wider floating offset
                // (Compensating for SVG scale-down factor to achieve ~40px visual gap)
                labelFO.setAttribute('x', svgP.x + 120);
                labelFO.setAttribute('y', svgP.y - 100);
            }

            hitPath.addEventListener('mouseenter', (e) => {
                // Highlight this segment
                segPath.classList.add('hovered');
                segPath.classList.remove('dimmed');
                segOrange.classList.add('hovered');
                
                // Dim siblings
                allSegs.forEach(s => {
                    if (s !== segPath) {
                        s.classList.add('dimmed');
                        s.classList.remove('hovered');
                    }
                });
                if (labelEl) {
                    // Smart Layering: Temporarily rip the label out of order and slap it 
                    // at the very end of the SVG array so it overlays on absolute top of everything
                    if (labelFO && labelFO.parentNode) {
                        labelFO.parentNode.appendChild(labelFO);
                    }
                    labelEl.classList.add('visible');
                }

                moveLabel(e); // Snap directly to entry point
            });

            // Bind the label to fluidly follow cursor scrub over the track
            hitPath.addEventListener('mousemove', moveLabel);

            hitPath.addEventListener('mouseleave', () => {
                // Restore all segments
                segPath.classList.remove('hovered');
                segOrange.classList.remove('hovered');
                allSegs.forEach(s => s.classList.remove('dimmed'));
                
                if (labelEl) labelEl.classList.remove('visible');
            });

            // ── Click → context-aware scroll ─────────────────────────────────
            if (zone.scrollTo) {
                hitPath.addEventListener('click', e => {
                    e.stopPropagation();
                    const lenis = window.__lenisInstance;

                    // ── TAP FEEDBACK: brief expanding pulse at tap point ───────
                    const pt = svgEl.createSVGPoint();
                    pt.x = e.clientX; pt.y = e.clientY;
                    const ctm = svgEl.getScreenCTM();
                    if (ctm) {
                        const svgP = pt.matrixTransform(ctm.inverse());
                        const pulse = document.createElementNS(NS, 'circle');
                        pulse.setAttribute('cx', svgP.x);
                        pulse.setAttribute('cy', svgP.y);
                        pulse.setAttribute('r', '20');
                        pulse.setAttribute('fill', 'none');
                        pulse.setAttribute('stroke', '#FF5509');
                        pulse.setAttribute('stroke-width', '3');
                        pulse.style.pointerEvents = 'none';
                        pulse.innerHTML = `
                            <animate attributeName="r" from="20" to="80" dur="0.6s" fill="freeze"/>
                            <animate attributeName="stroke-opacity" from="0.9" to="0" dur="0.6s" fill="freeze"/>
                        `;
                        svgEl.appendChild(pulse);
                        setTimeout(() => pulse.remove(), 700);
                    }

                    // ── CASE A: Tapping the CURRENTLY ACTIVE section ──────────
                    // Scrub to the exact proportional position within the section
                    if (zone.id === activeZone) {
                        // Project cursor to SVG canvas coords
                        const tapPt = svgEl.createSVGPoint();
                        tapPt.x = e.clientX; tapPt.y = e.clientY;
                        const tapCTM = svgEl.getScreenCTM();
                        if (!tapCTM) return;
                        const tapSVG = tapPt.matrixTransform(tapCTM.inverse());

                        // Binary search: find nearest point on this zone segment to the tap
                        const segStart = zone.start * pathLength;
                        const segEnd   = zone.end   * pathLength;
                        const segLen   = segEnd - segStart;
                        
                        let lo = 0, hi = 1, bestT = 0.5, bestDist = Infinity;
                        for (let iter = 0; iter < 20; iter++) {
                            const mid = (lo + hi) / 2;
                            const testPt = animPath.getPointAtLength(segStart + mid * segLen);
                            const dist = Math.hypot(testPt.x - tapSVG.x, testPt.y - tapSVG.y);
                            if (dist < bestDist) { bestDist = dist; bestT = mid; }
                            const loPt = animPath.getPointAtLength(segStart + (lo + mid) / 2 * segLen);
                            const hiPt = animPath.getPointAtLength(segStart + (mid + hi) / 2 * segLen);
                            if (Math.hypot(loPt.x - tapSVG.x, loPt.y - tapSVG.y) <
                                Math.hypot(hiPt.x - tapSVG.x, hiPt.y - tapSVG.y)) {
                                hi = mid;
                            } else {
                                lo = mid;
                            }
                        }

                        // Convert bestT (0–1 within zone) → global progress → scroll Y
                        // Using the SAME milestone interpolation as the scroll sensor
                        // so rider and scroll are guaranteed in sync.
                        const globalP  = zone.start + bestT * (zone.end - zone.start);
                        const scrollY  = progressToScroll(globalP);

                        // Do NOT set targetProgress manually — the scroll sensor will
                        // update it from window.scrollY on the next frame automatically.
                        if (lenis) {
                            lenis.scrollTo(scrollY, {
                                duration: 1.0,
                                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                            });
                        } else {
                            window.scrollTo({ top: scrollY, behavior: 'smooth' });
                        }
                        return;
                    }

                    // ── CASE B: Tapping a DIFFERENT section ────────────────
                    // Jump to the start of that section.
                    // Special case: contact scrolls to page bottom so the track
                    // progress reaches 1.0 and the lap fully completes.
                    const target = document.getElementById(zone.scrollTo);
                    if (!target) return;

                    // Contact: scroll to absolute bottom so rider reaches 100%
                    const isContact = zone.id === 'contact';
                    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                    const scrollDest = zone.id === 'hero' ? 0 : isContact ? maxScroll : target;
                    const scrollOff  = (zone.id === 'hero' || isContact) ? 0 : -(window.innerHeight * 0.15);

                    if (lenis) {
                        lenis.scrollTo(scrollDest, {
                            duration: 1.4,
                            // If scrollDest is a number (hero=0 or contact=maxScroll) use it directly
                            ...(typeof scrollDest === 'number'
                                ? {}
                                : { offset: scrollOff }),
                            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                        });
                    } else {
                        if (zone.id === 'hero') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (isContact) {
                            window.scrollTo({ top: maxScroll, behavior: 'smooth' });
                        } else {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                });
            }
        });
    }

    // ── 5. RIDER ───────────────────────────────────────────────────────────
    function buildRider() {
        // Dark background plate (creates a visual 'moat' blocking the glowing track)
        const riderBg = document.createElementNS(NS, 'circle');
        riderBg.id = 'rider-bg';
        riderBg.setAttribute('cx', '0'); riderBg.setAttribute('cy', '0'); 
        riderBg.setAttribute('r', '26');
        riderBg.setAttribute('fill', '#1d1d1d');
        riderBg.style.pointerEvents = 'none';

        // Pulse ring 1
        const ring1 = document.createElementNS(NS, 'circle');
        ring1.id = 'rider-ring-1';
        ring1.setAttribute('cx', '0'); ring1.setAttribute('cy', '0'); ring1.setAttribute('r', '26');
        ring1.setAttribute('fill', 'none');
        ring1.setAttribute('stroke', '#FF5509'); ring1.setAttribute('stroke-width', '4');
        ring1.style.pointerEvents = 'none'; // Prevent massive ring from blocking hovers
        ring1.innerHTML = `
            <animate attributeName="r" from="26" to="130" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite"/>
        `;

        // Pulse ring 2
        const ring2 = document.createElementNS(NS, 'circle');
        ring2.id = 'rider-ring-2';
        ring2.setAttribute('cx', '0'); ring2.setAttribute('cy', '0'); ring2.setAttribute('r', '26');
        ring2.setAttribute('fill', 'none');
        ring2.setAttribute('stroke', '#FF5509'); ring2.setAttribute('stroke-width', '2');
        ring2.style.pointerEvents = 'none'; // Prevent massive ring from blocking hovers
        ring2.innerHTML = `
            <animate attributeName="r" from="26" to="180" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" from="0.7" to="0" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
        `;

        // Glow blob
        const glow = document.createElementNS(NS, 'circle');
        glow.id = 'rider-glow-blob';
        glow.setAttribute('cx', '0'); glow.setAttribute('cy', '0'); glow.setAttribute('r', '55');
        glow.setAttribute('fill', 'rgba(255,85,9,0.28)');
        glow.style.pointerEvents = 'none';

        // Main dot
        riderCircle = document.createElementNS(NS, 'circle');
        riderCircle.setAttribute('cx', '0'); riderCircle.setAttribute('cy', '0');
        riderCircle.setAttribute('r', '18');
        riderCircle.setAttribute('fill', '#FF5509');
        riderCircle.setAttribute('filter', 'url(#rider-glow)');
        riderCircle.style.pointerEvents = 'none';

        // White core
        const core = document.createElementNS(NS, 'circle');
        core.id = 'rider-core';
        core.setAttribute('cx', '0'); core.setAttribute('cy', '0'); core.setAttribute('r', '6');
        core.setAttribute('fill', '#ffffff'); core.style.pointerEvents = 'none';

        svgEl.appendChild(riderBg);
        svgEl.appendChild(ring1);
        svgEl.appendChild(ring2);
        svgEl.appendChild(glow);
        svgEl.appendChild(riderCircle);
        svgEl.appendChild(core);
    }

    // ── 6. SCROLL MAPPING ──────────────────────────────────────────────────

    // Accurately map DOM sections to track progress markers
    function computeMilestones() {
        milestones = [];

        // maxScroll computed FIRST — contact zone needs it to clamp its trigger
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        ZONES.forEach((z, i) => {
            const el = document.getElementById(z.target);
            if (!el) return;

            const rect        = el.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;

            // ── Contact is special: its offsetTop is near the page bottom, so its
            //    trigger (offsetTop - 20vh) often EXCEEDS maxScroll, which breaks the
            //    milestone order and prevents the track from ever reaching 1.0.
            //    Fix: clamp contact trigger below maxScroll, then add 1.0 at maxScroll.
            if (z.id === 'contact') {
                let contactTrigger = absoluteTop - (window.innerHeight * 0.2);
                contactTrigger = Math.min(contactTrigger, maxScroll - 200); // always reachable
                contactTrigger = Math.max(0, contactTrigger);
                milestones.push({ scroll: contactTrigger, progress: z.start });
                milestones.push({ scroll: maxScroll,       progress: 1.0 });
                return;
            }

            // All other zones: trigger at 20% from top of viewport
            let triggerScroll = absoluteTop - (window.innerHeight * 0.2);
            if (i === 0) triggerScroll = 0;
            milestones.push({ scroll: Math.max(0, triggerScroll), progress: z.start });
        });

        // Safety: ensure milestones are strictly ascending
        for (let i = 1; i < milestones.length; i++) {
            if (milestones[i].scroll <= milestones[i - 1].scroll) {
                milestones[i].scroll = milestones[i - 1].scroll + 10;
            }
        }
    }


    // Interpolate exact progress percentage based on current scrollY
    function getInterpolatedProgress(s) {
        if (!milestones.length) return 0;
        if (s <= milestones[0].scroll) return milestones[0].progress;
        if (s >= milestones[milestones.length - 1].scroll) return 1.0;
        
        for (let i = 0; i < milestones.length - 1; i++) {
            const m1 = milestones[i];
            const m2 = milestones[i+1];
            if (s >= m1.scroll && s <= m2.scroll) {
                const ratio = (s - m1.scroll) / (m2.scroll - m1.scroll);
                return m1.progress + ratio * (m2.progress - m1.progress);
            }
        }
        return 1.0;
    }

    // Inverse: given a track progress value (0–1), find the scroll position
    // that would produce it — used by click-scrub in Case A.
    function progressToScroll(p) {
        if (!milestones.length) return 0;
        if (p <= milestones[0].progress) return milestones[0].scroll;
        if (p >= milestones[milestones.length - 1].progress) return milestones[milestones.length - 1].scroll;
        for (let i = 0; i < milestones.length - 1; i++) {
            const m1 = milestones[i];
            const m2 = milestones[i + 1];
            if (p >= m1.progress && p <= m2.progress) {
                const ratio = (p - m1.progress) / (m2.progress - m1.progress);
                return m1.scroll + ratio * (m2.scroll - m1.scroll);
            }
        }
        return milestones[milestones.length - 1].scroll;
    }

    function initScroll() {
        ScrollTrigger.create({
            trigger: document.documentElement,
            start: 'top top', end: 'bottom bottom',
            onUpdate() { 
                targetProgress = getInterpolatedProgress(window.scrollY);
            }
        });
    }

    // ── 7. TICKER ──────────────────────────────────────────────────────────
    function initTicker() {
        gsap.ticker.add(() => {
            easedProgress += (targetProgress - easedProgress) * 0.08;
            update(easedProgress);
        });
    }

    // ── 8. UPDATE ──────────────────────────────────────────────────────────
    function update(prog) {
        if (!animPath || pathLength === 0) return;

        // Progress stroke fill
        trackProgressPath.style.strokeDashoffset = pathLength * (1 - prog);

        // Rider position
        const pt = animPath.getPointAtLength(prog * pathLength);
        ['rider-bg', 'rider-ring-1','rider-ring-2','rider-glow-blob','rider-core'].forEach(id => {
            const el = svgEl.getElementById(id);
            if (el) { el.setAttribute('cx', pt.x); el.setAttribute('cy', pt.y); }
        });
        if (riderCircle) { riderCircle.setAttribute('cx', pt.x); riderCircle.setAttribute('cy', pt.y); }

        // Active zone detection + Dynamic Hover Clipping
        let newActive = ZONES[0].id;
        ZONES.forEach(z => { 
            if (prog >= z.start) newActive = z.id; 
            
            // Dynamically shrink the glowing white hover segment (future paths)
            const segEl = svgEl.getElementById(`seg-${z.id}`);
            if (segEl) {
                let drawStartWhite = Math.max(z.start, prog);
                if (drawStartWhite >= z.end) {
                    segEl.style.display = 'none'; // Fully progressed
                } else {
                    segEl.style.display = 'inline';
                    let drawLenWhite = (z.end - drawStartWhite) * pathLength;
                    let drawOffWhite = -(drawStartWhite * pathLength);
                    segEl.setAttribute('stroke-dasharray', `${drawLenWhite} ${pathLength + 10}`);
                    segEl.setAttribute('stroke-dashoffset', drawOffWhite);
                }
            }

            // Dynamically shrink the glowing orange hover segment (past paths)
            const segOrangeEl = svgEl.getElementById(`seg-${z.id}-orange`);
            if (segOrangeEl) {
                let drawEndOrange = Math.min(z.end, prog);
                if (drawEndOrange <= z.start) {
                    segOrangeEl.style.display = 'none'; // Not reached yet
                } else {
                    segOrangeEl.style.display = 'inline';
                    let drawLenOrange = (drawEndOrange - z.start) * pathLength;
                    let drawOffOrange = -(z.start * pathLength);
                    segOrangeEl.setAttribute('stroke-dasharray', `${drawLenOrange} ${pathLength + 10}`);
                    segOrangeEl.setAttribute('stroke-dashoffset', drawOffOrange);
                }
            }
        });
        activeZone = newActive;

        // ── COMPLETION EFFECTS ────────────────────────────────────────
        const COMPLETE_THRESHOLD = 0.985;
        const REVERT_THRESHOLD   = 0.97;

        if (prog >= COMPLETE_THRESHOLD && !completionFired) {
            completionFired = true;
            triggerCompletionEffects();
        } else if (prog < REVERT_THRESHOLD && completionFired) {
            completionFired = false;
            revertCompletionEffects();
        }
    }

    // ── COMPLETION: Energy Settle + Track Sweep ────────────────────────────
    function triggerCompletionEffects() {
        const glowBlob = svgEl && svgEl.getElementById('rider-glow-blob');
        const riderBgEl = svgEl && svgEl.getElementById('rider-bg');

        // 1. ENERGY SETTLE: glow intensifies, then breathes down to a calm stable
        if (glowBlob) {
            gsap.killTweensOf(glowBlob);
            // Quick intensity burst
            gsap.to(glowBlob, {
                attr: { r: 90, 'fill-opacity': 0.55 },
                duration: 0.35,
                ease: 'power2.out',
                onComplete: () => {
                    // Settle to enhanced-but-calm stable state
                    gsap.to(glowBlob, {
                        attr: { r: 65, 'fill-opacity': 0.35 },
                        duration: 0.9,
                        ease: 'power3.inOut'
                    });
                }
            });
        }
        if (riderBgEl) {
            gsap.to(riderBgEl, { attr: { r: 30 }, duration: 0.35, ease: 'power2.out',
                onComplete: () => gsap.to(riderBgEl, { attr: { r: 28 }, duration: 0.7, ease: 'power3.inOut' })
            });
        }

        // 2. TRACK COMPLETION SWEEP: single soft shimmer from 85% to 100%
        if (sweepPath) { sweepPath.remove(); sweepPath = null; }
        sweepPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        sweepPath.setAttribute('d', animPath.getAttribute('d'));
        sweepPath.setAttribute('fill', 'none');
        sweepPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.55)');
        sweepPath.setAttribute('stroke-width', '22');
        sweepPath.setAttribute('stroke-linecap', 'round');
        sweepPath.style.pointerEvents = 'none';
        sweepPath.style.willChange = 'stroke-dashoffset, opacity';

        // Sweep covers the ENTIRE track (100%) — full circuit shimmer on completion
        const sweepStart = 0;
        const sweepLen   = pathLength;
        sweepPath.setAttribute('stroke-dasharray',  `${sweepLen} ${pathLength + sweepLen}`);
        sweepPath.setAttribute('stroke-dashoffset', `${-sweepStart}`); // starts collapsed
        svgEl.appendChild(sweepPath);

        // Animate the sweep trailing through the full track
        gsap.fromTo(sweepPath,
            { 'stroke-dashoffset': -pathLength, opacity: 0 },
            {
                'stroke-dashoffset': 0,
                opacity: 0.7,
                duration: 1.2,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Fade out softly after it arrives
                    gsap.to(sweepPath, { opacity: 0, duration: 0.5, ease: 'power2.out',
                        onComplete: () => { if (sweepPath) { sweepPath.remove(); sweepPath = null; } }
                    });
                }
            }
        );
    }

    function revertCompletionEffects() {
        const glowBlob  = svgEl && svgEl.getElementById('rider-glow-blob');
        const riderBgEl = svgEl && svgEl.getElementById('rider-bg');

        // Restore rider glow to default size
        if (glowBlob) {
            gsap.killTweensOf(glowBlob);
            gsap.to(glowBlob, { attr: { r: 55, 'fill-opacity': 0.28 }, duration: 0.6, ease: 'power2.out' });
        }
        if (riderBgEl) {
            gsap.killTweensOf(riderBgEl);
            gsap.to(riderBgEl, { attr: { r: 26 }, duration: 0.4, ease: 'power2.out' });
        }

        // Clean up sweep if somehow still running
        if (sweepPath) { gsap.killTweensOf(sweepPath); sweepPath.remove(); sweepPath = null; }
    }

    // ── 9. INIT ────────────────────────────────────────────────────────────
    function init() {
        buildShell();
        loadSVG();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        requestAnimationFrame(() => requestAnimationFrame(init));
    }

})();
