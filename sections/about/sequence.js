/**
 * About Sequence — Sticky-Canvas Scroll Engine v21 (Full Preload / Zero Black Gaps)
 *
 * ════════════════════════════════════════════════════════════════════════════
 *  THE ICOMAT MOTION LAW (why this works, why previous versions didn't):
 *
 *  WRONG approach (v1–v19):
 *    position:fixed canvas + display:none/block toggle
 *    → Hard cut when canvas activates — the "jerk" the user sees
 *    → Dead zone (black body bg) while waiting for activation threshold
 *
 *  CORRECT approach (this version):
 *    Canvas lives inside a position:sticky wrapper inside the section.
 *    As user scrolls INTO the section, the sticky wrapper physically
 *    RISES FROM BELOW like a card being pushed upward.
 *    When it reaches top:0, it locks and the frame scrub begins.
 *    ZERO display toggling. ZERO black gap. ZERO jerk.
 *
 *  DOM structure:
 *    #about-sequence   [height: 520vh, position:relative]   ← scroll budget
 *      #sequence-canvas-wrap  [position:sticky, top:0, height:100vh]  ← locks
 *        #sequence-canvas   [position:absolute, inset:0]   ← fills wrap
 *        #sequence-smoke    [position:absolute, inset:0]   ← fades over canvas
 *          #seq-about-intro                                 ← text in smoke
 *
 *  Scroll progress formula (the ONLY correct one for sticky-in-container):
 *    p = clamp01( -section.getBCR().top / (section.offsetHeight - VH) )
 *
 *    When section.BCR.top = 0      → wrap just locked at top → p = 0
 *    When section.BCR.top = -(4VH) → section end → p = 1
 *    When section.BCR.top = +VH    → section just entering from below → p < 0 (clamped to 0)
 *
 *  Work section dimming (curtain depth effect):
 *    Triggered when section.BCR.top goes from +VH → 0 (canvas RISING into view)
 *    p_dim = (VH - section.BCR.top) / VH
 *    p_dim = 0 when canvas is 1 screen away. p_dim = 1 when canvas covers screen.
 *
 *  UX Motion Laws applied:
 *    - Ease-in cubic for smoke (mist feels heavy, natural)
 *    - No CSS transitions on JS-driven properties (lag at fast scroll)
 *    - Frame nearest-neighbour fallback (no black flash during load)
 *    - Full preload (ALL 83 frames) before releasing preloader gate
 *      → Zero black gaps at ANY scroll speed
 * ════════════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    // Premium timing — smoke starts in second half of sequence for clean white exit
    var SMOKE_START  = 0.65;
    var SMOKE_END    = 0.88;
    var TEXT_START   = 0.80;
    var TEXT_END     = 0.96;
    var BG_THRESHOLD = 0.68;



    var TOTAL      = 83;
    var PATH       = 'sections/about/assets/sequence_6/frame';
    // BATCH_SIZE 12: 7 network round-trips for 83 frames (vs 11 at batch=8).
    // Keeps the decode pipeline full without overloading the ~6-conn-per-host limit.
    var BATCH_SIZE = 12;

    // ── DOM refs ─────────────────────────────────────────────────────────────
    var section     = document.getElementById('about-sequence');
    var wrap        = document.getElementById('sequence-canvas-wrap');
    var canvas      = document.getElementById('sequence-canvas');
    var smoke       = document.getElementById('sequence-smoke');
    var loader      = document.getElementById('sequence-loader');
    var aboutIntro  = document.getElementById('seq-about-intro');



    if (!section || !canvas) return;

    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // ── State ──────────────────────────────────────────────────────────────
    var imgs        = new Array(TOTAL);
    var targetIdx   = 0;
    var drawnIdx    = -1;
    var lastSmoke   = -1;
    var lastText    = -1;
    var rafPending  = false;
    var ready       = false;
    var isBeigeMode = false;
    var loadedCount = 0;   // decoded frames counter (for progress reporting)

    // riseP: 0 = canvas just entering viewport bottom, 1 = canvas fully locked at top
    // Drives the Ken Burns zoom-out in doDraw()
    var riseP     = 0;
    var lastRiseP = -1;

    // Velocity micro-zoom: tracks scroll speed to breathe zoom during scrub phase
    // Gives the feeling of a cinema camera physically tracking the bike's motion
    var lastScrollY = 0;
    var velZoom     = 1.0;  // lerped toward targetVelZoom each tick

    // ── Canvas sizing ──────────────────────────────────────────────────────
    // Set pixel buffer = viewport size. Position is handled by CSS (absolute, inset:0).
    function resize() {
        var W = window.innerWidth;
        var H = window.innerHeight;
        if (canvas.width !== W || canvas.height !== H) {
            canvas.width        = W;
            canvas.height       = H;
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            drawnIdx = -1; // force redraw at new size
            schedDraw();
        }
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // ── Easing ────────────────────────────────────────────────────────────
    function easeIn3(t)  { return t * t * t; }
    function easeOut3(t) { return 1 - (1-t)*(1-t)*(1-t); }  // snappy spring-like settle
    function easeInOut3(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }  // smooth S-curve
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

    // ── CORE: Scroll Tick ─────────────────────────────────────────────────
    //
    // The sticky-in-container progress formula:
    //   section.BCR.top = viewport Y of the section's top edge
    //   = +VH when section just entered at bottom (canvas-wrap at bottom of screen)
    //   =   0 when canvas-wrap hits top:0 and LOCKS (p=0, scrub starts)
    //   = -(section.offsetHeight - VH) at section bottom (p=1, scrub ends)
    //
    function tick() {
        var VH      = window.innerHeight;
        var rect    = section.getBoundingClientRect();
        var total   = section.offsetHeight - VH;  // scroll range in px
        if (total <= 0) return;

        // p < 0: section still below viewport (canvas rising from below, locked at frame 0)
        // p = 0: canvas wrap just reached top — pinned, scrub begins
        // p = 1: section bottom just exited — scrub complete
        var rawP = -rect.top / total;
        var p    = clamp(rawP, 0, 1);

        // ── Work dimming (curtain entry depth) ────────────────────────────
        // section.rect.top goes from +VH (canvas at screen bottom) → 0 (canvas locked)
        // We want dimming to begin when canvas is 1 screen away and finish at lock.
        // p_dim = (VH - rect.top) / VH  → 0 at +1VH, 1 at rect.top=0
        var pDim = clamp((VH - rect.top) / VH, 0, 1);
        applyWorkDim(pDim);

        // ── Background class swap (dark → beige) ─────────────────────────
        if (p >= BG_THRESHOLD && !isBeigeMode) {
            isBeigeMode = true;
            section.classList.add('seq-beige');
        } else if (p < BG_THRESHOLD && isBeigeMode) {
            isBeigeMode = false;
            section.classList.remove('seq-beige');
        }

        // ── Smoke overlay & Vignette exit ────────────────────────────────
        if (smoke) {
            // easeOut3: fast initial wisp, decelerates — smoke feels heavy, atmospheric
            var sOp = easeOut3(clamp((p - SMOKE_START) / (SMOKE_END - SMOKE_START), 0, 1));
            if (Math.abs(sOp - lastSmoke) > 0.002) {
                lastSmoke = sOp;
                smoke.style.opacity = sOp.toFixed(3);
            }

            if (p >= SMOKE_END) {
                wrap.classList.add('vignette-exit');
            } else {
                wrap.classList.remove('vignette-exit');
            }
        }

        // ── About-intro text (legacy — element removed, ref is null) ─────
        if (aboutIntro) {
            var tOp = easeIn3(clamp((p - TEXT_START) / (TEXT_END - TEXT_START), 0, 1));
            if (Math.abs(tOp - lastText) > 0.002) {
                lastText = tOp;
                aboutIntro.style.opacity = tOp.toFixed(3);
            }
        }


        // ── Rise progress ───────────────────────────────────────────────────
        // rect.top: +VH (canvas at screen bottom) → 0 (canvas locked at top)
        // riseP:    0 (full zoom-in)              → 1 (pure cover)
        var newRiseP = clamp((VH - rect.top) / VH, 0, 1);
        if (Math.abs(newRiseP - riseP) > 0.004) {
            riseP = newRiseP;
            schedDraw();
        }

        // ── Velocity micro-zoom (only during locked scrub phase) ─────────────
        // Tracks scroll delta and applies a tiny zoom pulse to the canvas draw.
        // Simulates a cinema camera physically following the bike's acceleration.
        // At rest: velZoom = 1.0. Fast scroll: velZoom up to 1.025 (2.5% extra).
        if (riseP >= 0.99) {  // only during scrub, not during rise
            var sy = window.scrollY;
            var rawVel = Math.abs(sy - lastScrollY);
            lastScrollY = sy;
            var targetVZ = 1.0 + Math.min(rawVel / 120, 1) * 0.025;
            velZoom += (targetVZ - velZoom) * 0.12;  // lerp: fast attack, slow decay
            if (Math.abs(velZoom - lastRiseP) > 0.0005) schedDraw();
        } else {
            velZoom += (1.0 - velZoom) * 0.15;  // decay to 1.0 during rise
        }

        // ── Frame index (bike sequence scrubbed over p = 0.0 -> 0.50) ─────────
        // Frame 0-77:  scrubbed over p = 0.00 -> 0.30 (rider riding & braking)
        // Frame 78-83: scrubbed over p = 0.30 -> 0.50 (last 6 smoke frames play WHILE text glides!)
        var bikeP;
        if (p < 0.30) {
            bikeP = (p / 0.30) * (77 / 83);
        } else if (p <= 0.50) {
            bikeP = (77 / 83) + ((p - 0.30) / 0.20) * (6 / 83);
        } else {
            bikeP = 1.0;
        }

        var idx = Math.min(TOTAL - 1, Math.floor(bikeP * (TOTAL - 1)));
        if (idx !== targetIdx) {
            targetIdx = idx;
            schedDraw();
        }
    }

    // ── Work section dark scrim (ICOMAT pattern) ──────────────────────────
    // WHY SCRIM OVERLAY instead of filter:brightness():
    //   filter creates a GPU compositing layer/stacking context on #work.
    //   #about-sequence (margin-top:-100vh) visually overlaps #work's compositing region.
    //   GPU compositor applied the brightness filter to that overlap → grey band.
    //
    //   #work-scrim is position:absolute inside #work. Opacity 0→0.88.
    //   No filter = no stacking context = no bleed. #work has overflow:hidden so
    //   the scrim is perfectly clipped to the section bounds.
    //
    // Tune values:
    //   scale:  1.0 → 0.82   (content shrinks toward center)
    //   scrim:  0   → 0.88   (black overlay opacity — near-black at peak)
    //   radius: 0   → 24px
    var workEl    = document.getElementById('more-work'); // Target more-work instead of work-inner to avoid breaking GSAP pin!
    var workScrim = document.getElementById('work-scrim'); // dark overlay opacity target
    var curScale  = 1.0, curScrim = 0.0, curRadius = 0.0;
    var lastDim   = -1;

    function applyWorkDim(p) {
        if (!workEl || !workScrim) return;
        if (Math.abs(p - lastDim) < 0.001) return;
        lastDim = p;

        var curScale  = 1 - p * 0.18;   // 1.0 → 0.82  (content scales down)
        var curScrim  = p * 0.88;        // 0   → 0.88  (black overlay covers section)
        var curRadius = p * 24;          // 0   → 24px

        // Scale + corner rounding on content only (clear transform when 1.0 so position:fixed works for children)
        if (curScale > 0.999) {
            workEl.style.transform = 'none';
            workEl.style.borderRadius = '0px';
        } else {
            workEl.style.transform = 'scale(' + curScale.toFixed(4) + ')';
            workEl.style.borderRadius = curRadius.toFixed(1) + 'px';
        }

        // Black scrim covers full #work (content + beige background) — clipped by overflow:hidden
        workScrim.style.opacity = curScrim.toFixed(3);
    }

    // ── Draw pipeline ─────────────────────────────────────────────────────
    function schedDraw() {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(doDraw);
        }
    }

    function findNearest(t) {
        if (imgs[t]) return t;
        for (var i = 1; i < TOTAL; i++) {
            if (t - i >= 0    && imgs[t - i]) return t - i;
            if (t + i < TOTAL && imgs[t + i]) return t + i;
        }
        return -1;
    }

    function doDraw() {
        rafPending = false;
        if (!ready) return;
        var idx = findNearest(targetIdx);
        if (idx < 0) return;
        var img = imgs[idx];
        if (!img || !img.naturalWidth) return;

        // Skip if nothing changed (frame AND rise progress both unchanged)
        if (idx === drawnIdx && Math.abs(riseP - lastRiseP) < 0.005) return;
        drawnIdx  = idx;
        lastRiseP = riseP;

        var W  = canvas.width,  H  = canvas.height;
        var iW = img.naturalWidth, iH = img.naturalHeight;

        // ── Base cover scale (always fills canvas — zero bands guaranteed) ────────
        var scCover = Math.max(W / iW, H / iH);

        // ── Ken Burns Zoom-Out (cubic ease-out — snappier spring-like settle) ─────
        // ZOOM_IN=1.30: 30% oversized at entry. zoom >= 1.0 always → ZERO bands.
        var ZOOM_IN = 1.30;
        var zoom    = ZOOM_IN + (1.0 - ZOOM_IN) * easeOut3(riseP); // 1.30 → 1.00

        // ── Velocity micro-zoom (camera-tracking breathe during scrub) ────────────
        // velZoom: 1.0 at rest → 1.025 at fast scroll. Camera follows bike energy.
        var activeVelZoom = (riseP >= 0.99) ? velZoom : 1.0;

        var sc = scCover * zoom * activeVelZoom;

        // ── Parallax vertical drift (4% — eased, deeper unveiled-from-above pull) ─
        var parallaxY = easeOut3(1 - riseP) * H * 0.04;

        var dx = (W - iW * sc) / 2;
        var dy = (H - iH * sc) / 2 + parallaxY;

        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, dx, dy, iW * sc, iH * sc);
    }

    // ── Full Preload Engine ────────────────────────────────────────────────
    //
    // THE FIX: Gate releases ONLY when ALL 83 frames are in memory.
    // Previous version released after just 30 frames → user scrolling fast
    // into frames 31–83 saw a black canvas + frame jumps.
    //
    // Progress reporting:
    //   The gate owns 50%→100% of the loader bar (UnicornStudio owns 0%→50%).
    //   Each decoded frame calls __onLoaderProgress → bar moves in real time.
    //
    // BATCH_SIZE=12: 7 round-trips for 83 frames (vs 11 at batch=8).
    // Larger batches = fewer sequential waits = faster wall-clock load time.
    // ──────────────────────────────────────────────────────────────────────

    function _reportFrameProgress() {
        // Map loadedCount (0→TOTAL) onto preloader range 50%→100%
        var pct = 50 + Math.round((loadedCount / TOTAL) * 50);
        if (window.__onLoaderProgress) window.__onLoaderProgress(pct);
    }

    function loadOne(n, cb) {
        if (imgs[n]) { if (cb) cb(); return; }
        var im = new Image();
        im.onload = function () {
            imgs[n] = im;
            loadedCount++;
            _reportFrameProgress();           // live progress tick per frame
            if (n === targetIdx) schedDraw(); // redraw if this is the visible frame
            if (cb) cb();
        };
        im.onerror = function () {
            loadedCount++;                    // count errors too — don't stall progress
            _reportFrameProgress();
            if (cb) cb();
        };
        im.src = PATH + (n + 1) + '.webp';
    }

    function loadBatch(list, done) {
        if (!list.length) { if (done) done(); return; }
        var chunk = list.splice(0, BATCH_SIZE);
        var rem = chunk.length;
        chunk.forEach(function (n) {
            loadOne(n, function () { if (--rem === 0) loadBatch(list, done); });
        });
    }

    function bindScroll() {
        // Support both native scroll and Lenis smooth scroll
        var lenis = window.__lenisInstance;
        if (lenis && typeof lenis.on === 'function') lenis.on('scroll', tick);
        window.addEventListener('scroll', tick, { passive: true });
        tick();      // immediate first paint
        schedDraw();
    }

    function preload() {
        // Step 1: Load frame 0 first — canvas becomes drawable immediately.
        loadOne(0, function () {
            ready = true;
            if (loader) loader.style.display = 'none';
            bindScroll();

            // Step 2: Load priority frames (every 10th frame) to ensure rough scrub is ready
            var priority = [];
            var background = [];
            for (var i = 1; i < TOTAL; i++) {
                if (i % 10 === 0 || i === TOTAL - 1) priority.push(i);
                else background.push(i);
            }

            loadBatch(priority, function () {
                // Priority frames decoded — safe to open the preloader curtain!
                // This drastically reduces time-to-interactive.
                if (window.__gateSeqReady) window.__gateSeqReady();

                // Step 3: Lazy load the remaining frames in the background
                loadBatch(background);
            });
        });
    }

    preload();

}());
