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
        // Crop viewBox to actual track area
        svgEl.setAttribute('viewBox', '480 30 860 1040');
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        trackProgressPath = svgEl.querySelector('#track-progress');
        animPath          = svgEl.querySelector('#track-path') || trackProgressPath;
        if (!animPath) { console.error('[Circuit] #track-progress not found'); return; }

        tiltEl.appendChild(svgEl);
        pathLength = animPath.getTotalLength();

        // Bootstrap progress stroke
        trackProgressPath.style.strokeDasharray  = pathLength;
        trackProgressPath.style.strokeDashoffset = pathLength;

        // Inject overlays
        buildFilters();
        buildSectionZones();
        buildRider();

        computeMilestones();
        window.addEventListener('resize', computeMilestones);

        initScroll();
        initTicker();
        update(0);
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

            // ── Click → smooth scroll ────────────────────────────────────
            if (zone.scrollTo) {
                hitPath.addEventListener('click', e => {
                    e.stopPropagation();
                    const target = document.getElementById(zone.scrollTo);
                    if (!target) return;
                    
                    // Immediately snap rider logic to the exact start of this track segment
                    targetProgress = zone.start;
                    
                    const lenis = window.__lenisInstance;
                    
                    // If it's the hero/first section, we want to scroll to the absolute top of the webpage
                    const scrollDest = zone.id === 'hero' ? 0 : target;
                    const scrollOff  = zone.id === 'hero' ? 0 : -(window.innerHeight * 0.15);

                    if (lenis) {
                        lenis.scrollTo(scrollDest, {
                            duration: 1.4,
                            offset: scrollOff,
                            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                        });
                    } else {
                        if (zone.id === 'hero') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <animate attributeName="r" from="26" to="70" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" from="0.8" to="0" dur="1.8s" repeatCount="indefinite"/>
        `;

        // Pulse ring 2
        const ring2 = document.createElementNS(NS, 'circle');
        ring2.id = 'rider-ring-2';
        ring2.setAttribute('cx', '0'); ring2.setAttribute('cy', '0'); ring2.setAttribute('r', '26');
        ring2.setAttribute('fill', 'none');
        ring2.setAttribute('stroke', '#FF5509'); ring2.setAttribute('stroke-width', '2');
        ring2.style.pointerEvents = 'none'; // Prevent massive ring from blocking hovers
        ring2.innerHTML = `
            <animate attributeName="r" from="26" to="95" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" from="0.6" to="0" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
        `;

        // Glow blob
        const glow = document.createElementNS(NS, 'circle');
        glow.id = 'rider-glow-blob';
        glow.setAttribute('cx', '0'); glow.setAttribute('cy', '0'); glow.setAttribute('r', '36');
        glow.setAttribute('fill', 'rgba(255,85,9,0.25)');
        glow.style.pointerEvents = 'none'; // Prevent massive glow from blocking hovers

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
        ZONES.forEach((z, i) => {
            const el = document.getElementById(z.target);
            if (el) {
                const rect = el.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                // Trigger transition when section hits 20% from the top of the viewport
                let triggerScroll = absoluteTop - (window.innerHeight * 0.2);
                if (i === 0) triggerScroll = 0; // Hero starts exactly at 0
                
                milestones.push({ scroll: Math.max(0, triggerScroll), progress: z.start });
            }
        });
        
        // Final milestone: literal bottom of the page
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        milestones.push({ scroll: maxScroll, progress: 1.0 });

        // Ensure milestones are strictly ascending
        for (let i = 1; i < milestones.length; i++) {
            if (milestones[i].scroll <= milestones[i-1].scroll) {
                milestones[i].scroll = milestones[i-1].scroll + 10;
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
