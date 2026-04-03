// ══════════════════════════════════════════════════════════════════════════
// CIRCUIT COMPONENT  —  canvas-based isometric renderer
// /sections/circuit/circuit.js
//
// Rendering pipeline:
//   1. Raw waypoints → Catmull-Rom spline → dense point array
//   2. Each point projected through isometric transform
//   3. Canvas draws: extrusion side walls → base track → progress → rider → nodes
//   4. ScrollTrigger drives progress (0–1)
//   5. Mouse tilt via GSAP on container
// ══════════════════════════════════════════════════════════════════════════

(function CircuitComponent() {
    'use strict';

    const CFG = window.CIRCUIT_CONFIG;
    if (!CFG || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[Circuit] missing dependencies'); return;
    }

    // ── State ─────────────────────────────────────────────────────────────
    let canvas, ctx, tiltEl, rootEl;
    let canvasW = 0, canvasH = 0;

    // Smooth path — dense array of {x,y} in CANVAS space (post-iso)
    let flatPoints  = [];   // pre-iso, canvas-scaled
    let isoPoints   = [];   // post-iso screen positions
    let segLengths  = [];   // cumulative arc lengths for fast lookup
    let totalLength = 0;

    let scrollProgress = 0;  // 0–1 from ScrollTrigger
    let riderT         = 0;  // smoothed rider position (0–1)

    // Section node screen positions
    let nodePositions = [];  // [{x, y, cfg, labelEl, active, hover}]

    // Tilt
    let tiltTargX = 0, tiltTargY = 0;
    let tiltCurrX = 0, tiltCurrY = 0;
    const isMobile = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

    // Hover
    let hoveredNodeIdx = -1;
    let isTrackHover   = false;

    // ── 1. BUILD DOM ──────────────────────────────────────────────────────
    function buildDOM() {
        rootEl = document.createElement('div');
        rootEl.id = 'circuit-root';
        rootEl.setAttribute('aria-hidden', 'true');

        tiltEl = document.createElement('div');
        tiltEl.id = 'circuit-tilt';

        canvas = document.createElement('canvas');
        canvas.id = 'circuit-canvas';

        tiltEl.appendChild(canvas);
        rootEl.appendChild(tiltEl);
        document.body.appendChild(rootEl);

        ctx = canvas.getContext('2d');
    }

    // ── 2. CATMULL-ROM SPLINE ─────────────────────────────────────────────
    // Converts waypoints → dense smooth point array
    function catmullRom(pts, steps) {
        const N = pts.length;
        const out = [];
        for (let i = 0; i < N; i++) {
            const p0 = pts[(i - 1 + N) % N];
            const p1 = pts[i];
            const p2 = pts[(i + 1) % N];
            const p3 = pts[(i + 2) % N];
            for (let t = 0; t < steps; t++) {
                const u = t / steps;
                const u2 = u * u, u3 = u2 * u;
                const x = 0.5 * (
                    (2 * p1[0]) +
                    (-p0[0] + p2[0]) * u +
                    (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0]) * u2 +
                    (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0]) * u3
                );
                const y = 0.5 * (
                    (2 * p1[1]) +
                    (-p0[1] + p2[1]) * u +
                    (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1]) * u2 +
                    (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1]) * u3
                );
                out.push([x, y]);
            }
        }
        return out;
    }

    // ── 3. ISOMETRIC PROJECTION ───────────────────────────────────────────
    // Takes a flat [x,y] (canvas-scaled) and returns screen {sx, sy}
    // We apply a 2D affine that simulates isometric view:
    //   rotate by angleZ then skew/scale to simulate pitch angleX
    function iso(x, y, z) {
        z = z || 0;
        const rad  = CFG.ISO.angleZ * Math.PI / 180;
        const rx   = x * Math.cos(rad) - y * Math.sin(rad);
        const ry   = x * Math.sin(rad) + y * Math.cos(rad);
        const xRad = CFG.ISO.angleX * Math.PI / 180;
        // Perspective compress Y
        const sx = rx * CFG.ISO.scale;
        const sy = (ry * Math.cos(xRad) - z * Math.sin(xRad)) * CFG.ISO.scale;
        return { sx, sy };
    }

    // ── 4. BUILD PATH ─────────────────────────────────────────────────────
    function buildPath() {
        const { width: tw, smoothSteps } = CFG.TRACK;
        const PAD = 30; // padding inside canvas

        // Scale waypoints to canvas
        const usableW = canvasW - PAD * 2;
        const usableH = canvasH - PAD * 2;

        // Find bbox of waypoints
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        CFG.WAYPOINTS.forEach(([x, y]) => {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
        });
        const rangeX = maxX - minX, rangeY = maxY - minY;
        const scale  = Math.min(usableW / rangeX, usableH / rangeY);

        // Normalized → canvas flat coords (centered)
        const flatRaw = CFG.WAYPOINTS.map(([x, y]) => [
            PAD + (x - minX) * scale + (usableW - rangeX * scale) / 2,
            PAD + (y - minY) * scale + (usableH - rangeY * scale) / 2,
        ]);

        // Catmull-Rom interpolation
        const spline = catmullRom(flatRaw, smoothSteps);

        // Project to iso screen coords
        // First compute center of bounding box for iso pivot
        let cxFlat = 0, cyFlat = 0;
        spline.forEach(([x, y]) => { cxFlat += x; cyFlat += y; });
        cxFlat /= spline.length; cyFlat /= spline.length;

        flatPoints = spline;
        isoPoints  = spline.map(([x, y]) => {
            const p = iso(x - cxFlat, y - cyFlat, 0);
            return { x: p.sx + canvasW / 2, y: p.sy + canvasH / 2 };
        });

        // Build cumulative arc-length table for precise t → point mapping
        segLengths  = [0];
        totalLength = 0;
        for (let i = 1; i < isoPoints.length; i++) {
            const dx = isoPoints[i].x - isoPoints[i-1].x;
            const dy = isoPoints[i].y - isoPoints[i-1].y;
            totalLength += Math.sqrt(dx*dx + dy*dy);
            segLengths.push(totalLength);
        }

        // Section nodes: find closest point for each section progress
        nodePositions = [];
        CFG.SECTIONS.forEach(sec => {
            const target = sec.progress * totalLength;
            let best = 0;
            for (let i = 1; i < segLengths.length; i++) {
                if (Math.abs(segLengths[i] - target) < Math.abs(segLengths[best] - target)) best = i;
            }
            const pt = isoPoints[best];

            // Label element
            let labelEl = null;
            if (sec.label) {
                labelEl = document.createElement('div');
                labelEl.className = 'c-label';
                labelEl.textContent = sec.label;
                tiltEl.appendChild(labelEl);
                // Position label to the LEFT of the point
                labelEl.style.top  = (pt.y - 10) + 'px';
                labelEl.style.right = (canvasW - pt.x + 10) + 'px';
            }

            nodePositions.push({ x: pt.x, y: pt.y, idx: best, cfg: sec, labelEl, active: false, hover: false });
        });
    }

    // ── 5. POINT AT T ─────────────────────────────────────────────────────
    // Binary search in segLengths for precise pixel-accurate position
    function pointAtT(t) {
        const target = t * totalLength;
        let lo = 0, hi = segLengths.length - 1;
        while (lo < hi - 1) {
            const mid = (lo + hi) >> 1;
            if (segLengths[mid] < target) lo = mid; else hi = mid;
        }
        const frac = (segLengths[hi] - segLengths[lo]) > 0
            ? (target - segLengths[lo]) / (segLengths[hi] - segLengths[lo])
            : 0;
        const a = isoPoints[lo], b = isoPoints[hi];
        return {
            x: a.x + (b.x - a.x) * frac,
            y: a.y + (b.y - a.y) * frac,
        };
    }

    // ── 6. DRAW ───────────────────────────────────────────────────────────
    function draw() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        if (!isoPoints.length) return;

        const tw = CFG.TRACK.width;
        const eh = CFG.TRACK.extrudeHeight;
        const N  = isoPoints.length;

        // Helper: draw a poly-line
        function polyline(pts) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[0].x, pts[0].y);
        }

        // ── Layer 0: Drop shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur  = 18;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 6;
        // Draw the top path outline as shadow source
        polyline(isoPoints);
        ctx.strokeStyle = 'rgba(0,0,0,0.01)';
        ctx.lineWidth   = tw + eh * 2;
        ctx.stroke();
        ctx.restore();

        // ── Layer 1: Extrusion side walls
        // For every segment, draw a quadrilateral connecting top-edge to bottom-edge
        // "bottom" = same point offset by (+4px X, +eh px Y) to simulate 3D side
        ctx.save();
        for (let i = 0; i < N; i++) {
            const a  = isoPoints[i];
            const b  = isoPoints[(i + 1) % N];
            const aB = { x: a.x + 3, y: a.y + eh };
            const bB = { x: b.x + 3, y: b.y + eh };

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(bB.x, bB.y);
            ctx.lineTo(aB.x, aB.y);
            ctx.closePath();

            // Only draw the bottom-facing sides (where normal faces down-right)
            const cross = (b.x - a.x) * (aB.y - a.y) - (b.y - a.y) * (aB.x - a.x);
            if (cross > 0) {
                ctx.fillStyle = '#111111';
                ctx.fill();
            }
        }
        ctx.restore();

        // ── Layer 2: Base track surface
        ctx.save();
        polyline(isoPoints);
        ctx.strokeStyle = isTrackHover ? CFG.COLOR.trackTopHover : CFG.COLOR.trackTop;
        ctx.lineWidth   = tw;
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        ctx.stroke();
        ctx.restore();

        // ── Layer 3: Progress track (orange, up to riderT for smoothness)
        const progressIdx = Math.floor(scrollProgress * (N - 1));
        if (progressIdx > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(isoPoints[0].x, isoPoints[0].y);
            for (let i = 1; i <= progressIdx && i < N; i++) {
                ctx.lineTo(isoPoints[i].x, isoPoints[i].y);
            }
            // Glow
            ctx.shadowColor = CFG.COLOR.progressGlow;
            ctx.shadowBlur  = 12;
            ctx.strokeStyle = CFG.COLOR.progress;
            ctx.lineWidth   = 3;
            ctx.lineJoin    = 'round';
            ctx.lineCap     = 'round';
            ctx.stroke();
            ctx.restore();
        }

        // ── Layer 4: Rider dot (smoothed position)
        const rPt = pointAtT(riderT);
        ctx.save();
        ctx.beginPath();
        ctx.arc(rPt.x, rPt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = CFG.COLOR.rider;
        ctx.shadowColor = CFG.COLOR.progressGlow;
        ctx.shadowBlur  = 14;
        ctx.fill();
        // Inner bright core
        ctx.beginPath();
        ctx.arc(rPt.x, rPt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();

        // ── Layer 5: Section nodes
        nodePositions.forEach((n, ni) => {
            if (!n.cfg.label) return; // skip hero node
            const r = n.active ? CFG.NODE.radiusActive
                    : n.hover  ? CFG.NODE.radiusHover
                    :            CFG.NODE.radius;

            ctx.save();
            // Outer ring
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2);
            ctx.strokeStyle = n.active ? 'rgba(255,85,9,0.3)' : 'rgba(255,255,255,0.12)';
            ctx.lineWidth   = 1.5;
            ctx.stroke();

            // Fill
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle   = n.active ? CFG.COLOR.nodeActive
                             : n.hover  ? CFG.COLOR.nodeHover
                             :            CFG.COLOR.nodeDefault;
            if (n.active) {
                ctx.shadowColor = CFG.COLOR.progressGlow;
                ctx.shadowBlur  = 12;
            }
            ctx.fill();
            ctx.restore();
        });
    }

    // ── 7. RESIZE ─────────────────────────────────────────────────────────
    function resize() {
        const rect = rootEl.getBoundingClientRect();
        const dpr  = window.devicePixelRatio || 1;
        canvasW = rect.width;
        canvasH = rect.height; // use actual height, not forced square
        canvas.width  = canvasW * dpr;
        canvas.height = canvasH * dpr;
        canvas.style.width  = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        ctx.scale(dpr, dpr);
        buildPath();
        repositionLabels();
        draw();
    }

    function repositionLabels() {
        nodePositions.forEach(n => {
            if (!n.labelEl) return;
            n.labelEl.style.top   = (n.y - 10) + 'px';
            n.labelEl.style.right = (canvasW - n.x + 12) + 'px';
        });
    }

    // ── 8. SCROLL TRIGGER ─────────────────────────────────────────────────
    function initScroll() {
        ScrollTrigger.create({
            trigger: document.documentElement,
            start:   'top top',
            end:     'bottom bottom',
            scrub:   CFG.SCROLL.scrub,
            onUpdate(self) {
                scrollProgress = self.progress;
                detectActive(scrollProgress);
            }
        });
    }

    // ── 9. TICK — rider interpolation + redraw ────────────────────────────
    function initTicker() {
        gsap.ticker.add(() => {
            riderT += (scrollProgress - riderT) * 0.07;
            draw();

            // 3D tilt interpolation
            tiltCurrX += (tiltTargX - tiltCurrX) * CFG.TILT.lerp;
            tiltCurrY += (tiltTargY - tiltCurrY) * CFG.TILT.lerp;
            gsap.set(tiltEl, {
                rotationX: tiltCurrX,
                rotationY: tiltCurrY,
                transformPerspective: 1000,
            });
        });
    }

    // ── 10. ACTIVE SECTION ────────────────────────────────────────────────
    function detectActive(p) {
        let activeIdx = 0;
        CFG.SECTIONS.forEach((s, i) => { if (p >= s.progress) activeIdx = i; });
        nodePositions.forEach((n, i) => { n.active = (i === activeIdx); });
    }

    // ── 11. TILT (mouse) ─────────────────────────────────────────────────
    function initTilt() {
        if (isMobile) return;
        window.addEventListener('mousemove', e => {
            const nx = (e.clientX / window.innerWidth  - 0.5);
            const ny = (e.clientY / window.innerHeight - 0.5);
            tiltTargX = -ny * CFG.TILT.maxDeg * 2;
            tiltTargY =  nx * CFG.TILT.maxDeg * 2;
        }, { passive: true });
    }

    // ── 12. HOVER + CLICK ─────────────────────────────────────────────────
    function initInteraction() {
        canvas.addEventListener('mousemove', e => {
            if (isMobile) return;
            const rect = canvas.getBoundingClientRect();
            const mx   = e.clientX - rect.left;
            const my   = e.clientY - rect.top;

            // Track hover — nearest iso point
            let minD = Infinity;
            isoPoints.forEach(p => {
                const d = Math.hypot(p.x - mx, p.y - my);
                if (d < minD) minD = d;
            });
            isTrackHover = minD < CFG.HOVER_RADIUS;

            // Node hover
            let newHov = -1;
            nodePositions.forEach((n, i) => {
                if (!n.cfg.label) return;
                const d = Math.hypot(n.x - mx, n.y - my);
                if (d < CFG.NODE.radiusHover + 12) newHov = i;
            });

            if (newHov !== hoveredNodeIdx) {
                if (hoveredNodeIdx >= 0) {
                    nodePositions[hoveredNodeIdx].hover = false;
                    if (nodePositions[hoveredNodeIdx].labelEl)
                        nodePositions[hoveredNodeIdx].labelEl.classList.remove('visible');
                }
                hoveredNodeIdx = newHov;
                if (hoveredNodeIdx >= 0) {
                    nodePositions[hoveredNodeIdx].hover = true;
                    if (nodePositions[hoveredNodeIdx].labelEl)
                        nodePositions[hoveredNodeIdx].labelEl.classList.add('visible');
                }
            }
        }, { passive: true });

        canvas.addEventListener('mouseleave', () => {
            isTrackHover = false;
            if (hoveredNodeIdx >= 0) {
                nodePositions[hoveredNodeIdx].hover = false;
                if (nodePositions[hoveredNodeIdx].labelEl)
                    nodePositions[hoveredNodeIdx].labelEl.classList.remove('visible');
                hoveredNodeIdx = -1;
            }
        });

        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const mx   = e.clientX - rect.left;
            const my   = e.clientY - rect.top;

            nodePositions.forEach(n => {
                if (!n.cfg.label) return;
                const d = Math.hypot(n.x - mx, n.y - my);
                if (d < CFG.NODE.radiusActive + 14) scrollToSection(n.cfg);
            });
        });
    }

    function scrollToSection(sec) {
        const target = document.getElementById(sec.scrollTo);
        if (!target) return;
        const lenis = window.__lenisInstance;
        if (lenis) {
            lenis.scrollTo(target, {
                duration: 1.4,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // ── 13. INIT ──────────────────────────────────────────────────────────
    function init() {
        buildDOM();
        resize();
        initScroll();
        initTicker();
        initTilt();
        initInteraction();
        window.addEventListener('resize', resize, { passive: true });
    }

    // Defer until GSAP + ScrollTrigger are registered by script.js
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        requestAnimationFrame(() => requestAnimationFrame(init));
    }

})();
