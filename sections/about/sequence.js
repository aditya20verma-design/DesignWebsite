/**
 * About Sequence — 3-Phase Cinematic Scroll  (v13)
 *
 * Phase 1 (  0–90%): inner canvas scales 0.4 → 1.0  (dark mat shows)
 * Phase 2 ( 90–99%): #e5e4e0 smoke fades in over full canvas
 * Phase 3 (99–100%): hold white → seamlessly flows into About section
 *
 * 168 frames · CSS sticky (canvas-wrap) + inner transform (canvas-inner)
 * Scroll progress via getBoundingClientRect() — always accurate
 */
(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────────────────────
    var TOTAL = 166;
    var PATH  = 'sections/about/assets/sequence_5/frame'; // Optimized 720p

    // ── Preload/Search Logic ───────────────────────────────────────────────
    function findNearestFrame(target) {
        if (imgs[target]) return target;
        // Search outwards from target
        for (var i = 1; i < TOTAL; i++) {
            var prev = target - i;
            var next = target + i;
            if (prev >= 0 && imgs[prev]) return prev;
            if (next < TOTAL && imgs[next]) return next;
        }
        return -1;
    }

    function doDraw() {
        rafPending = false;
        if (!ready) return;

        var idx = findNearestFrame(targetIdx);
        if (idx === -1) return;
        var img = imgs[idx];
        if (!img || !img.naturalWidth) return;
        if (idx === drawnIdx) return;
        drawnIdx = idx;

        // Blend contain→cover based on CSS scale progress (0.7→1.0)
        var t         = Math.max(0, Math.min(1, (currentCssScale - 0.7) / 0.3));
        var scContain = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        var scCover   = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        var sc        = scContain + (scCover - scContain) * t;
        var dx        = (canvas.width  - img.naturalWidth  * sc) / 2;
        var dy        = (canvas.height - img.naturalHeight * sc) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, dx, dy, img.naturalWidth * sc, img.naturalHeight * sc);
    }

    var LABELS = [
        { from: 1,   to: 60,  title: 'Designer.<br><em>Systems</em> thinker.',    sub: 'About Me' },
        { from: 105, to: 168, title: 'Product Designer<br>& <em>Architect</em>.', sub: '3+ years · Healthcare · Fintech' },
    ];

    // Phase boundaries (fraction of total scroll 0–1)
    var P1_END = 0.85;   // frames + scale finish at 85%
    var P2_END = 0.96;   // smoke fully in at 96% (11% of section = ~35vh of dedicated smoke scroll)

    // ── DOM ───────────────────────────────────────────────────────────────────
    var section = document.getElementById('about-sequence');
    var inner   = document.getElementById('sequence-canvas-inner'); // ← gets the transform
    var canvas  = document.getElementById('sequence-canvas');
    var smoke   = document.getElementById('sequence-smoke');
    var loader  = document.getElementById('sequence-loader');
    var bar     = document.querySelector('.seq-loader-bar-fill');
    var pctEl   = document.querySelector('.seq-loader-label');
    var overlay = document.querySelector('.seq-overlay');
    var titleEl = overlay && overlay.querySelector('.seq-title');
    var subEl   = overlay && overlay.querySelector('.seq-subtitle');

    if (!section || !inner || !canvas) { console.warn('[Seq] Missing DOM elements'); return; }

    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // ── Canvas sizing — always full viewport ─────────────────────────────────────────
    var scrollRange  = 0;
    var currentCssScale = 0.7; // tracks live CSS scale — drives contain→cover blend

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width  = '';
        canvas.style.height = '';
        canvas.style.left   = '';
        canvas.style.top    = '';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // Improved performance during scrub
        scrollRange = section.offsetHeight - window.innerHeight;
        schedDraw();
    }
    window.addEventListener('resize', resize);
    resize();

    // ── Frame state ───────────────────────────────────────────────────────────
    var imgs       = new Array(TOTAL);
    var loadedCt   = 0;
    var targetIdx  = 0;
    var drawnIdx   = -1;
    var ready      = false;
    var rafPending = false;

    // ── RAF draw ──────────────────────────────────────────────────────────────
    function schedDraw() {
        if (!rafPending) { rafPending = true; requestAnimationFrame(doDraw); }
    }

    // ── Overlay label ─────────────────────────────────────────────────────────
    var lastLabelIdx = -1;
    function updateLabel(idx) {
        if (!overlay || idx === lastLabelIdx) return;
        lastLabelIdx = idx;
        var n = idx + 1, win = null;
        for (var i = 0; i < LABELS.length; i++) {
            if (n >= LABELS[i].from && n <= LABELS[i].to) { win = LABELS[i]; break; }
        }
        if (win) {
            if (titleEl && titleEl.innerHTML !== win.title) titleEl.innerHTML = win.title;
            if (subEl) subEl.textContent = win.sub;
            overlay.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
        }
    }

    // ── Easing ────────────────────────────────────────────────────────────────
    function easeOutCubic(t)   { return 1 - Math.pow(1 - t, 3); }
    function easeInCubic(t)    { return t * t * t; }  // smoke: slow start, accelerates in

    // ── Main scroll handler ───────────────────────────────────────────────────
    // Uses getBoundingClientRect() for scroll progress — always accurate,
    // works regardless of offset-parent chain or layout shifts.
    var lastScale = -1;
    var lastSmoke = -1;

    function tick() {
        if (scrollRange <= 0) return;

        // p = 0 when section top hits viewport top, p = 1 at section bottom
        var rectTop = section.getBoundingClientRect().top;
        var p = Math.max(0, Math.min(1, -rectTop / scrollRange));

        // ── Phase 1: scale 0.4 → 1.0 + cinematic tilt (0 to P1_END) ─────────────
        var sp1   = easeOutCubic(Math.min(p / P1_END, 1));
        var scale = 0.7 + 0.3 * sp1;   // 0.7 → 1.0
        currentCssScale = scale;        // keep draw blend in sync
        
        if (Math.abs(scale - lastScale) > 0.0003) {
            lastScale = scale;
            inner.style.transform = 'scale(' + scale.toFixed(4) + ')';
        }

        // ── Phase 2: smoke opacity 0 → 1 (P1_END to P2_END) ─────────────────
        if (smoke) {
            var sp2 = easeInCubic(Math.max(0, Math.min(1, (p - P1_END) / (P2_END - P1_END))));
            if (Math.abs(sp2 - lastSmoke) > 0.002) {
                lastSmoke = sp2;
                smoke.style.opacity = sp2.toFixed(3);
            }
        }

        // ── Frame index ───────────────────────────────────────────────────────
        var idx = Math.round(p * (TOTAL - 1));
        if (idx !== targetIdx) { targetIdx = idx; schedDraw(); }
    }

    // ── Bind scroll ───────────────────────────────────────────────────────────
    function bindScroll() {
        var lenis = window.__lenisInstance;
        if (lenis && typeof lenis.on === 'function') {
            lenis.on('scroll', tick);
        }
        window.addEventListener('scroll', tick, { passive: true });
        tick(); // seed initial state
    }

    // ── Dismiss loader ────────────────────────────────────────────────────────
    function hideLoader() {
        if (!loader) return;
        loader.style.transition = 'opacity 0.4s';
        loader.style.opacity    = '0';
        setTimeout(function () { loader.style.display = 'none'; }, 450);
    }

    // ── 3-Tier Smart Preload ──────────────────────────────────────────────────
    // Tier 1: Frame 0 immediately → unlock scroll binding (<1 frame lag)
    // Tier 2: Frames 1-39 at speed 6 right after load → ready before user scrolls
    // Tier 3: Frames 40+ at speed 4, boosted to 8 when section enters view
    var BATCH_SIZE = 6;

    function preload() {
        console.log('[Seq] Starting 3-tier preload…');

        // Tier 1: Frame 0 ASAP — unlock scroll engine
        loadFrame(0, function () {
            ready = true;
            if (loader) loader.style.display = 'none';
            bindScroll();
            schedDraw();

            // Tier 2: Frames 1–39 at full speed (cover first scroll zone)
            var tier2 = [];
            for (var i = 1; i < Math.min(40, TOTAL); i++) tier2.push(i);
            loadBatch(tier2, function () {
                console.log('[Seq] Tier 2 done — first 40 frames ready');

                // Tier 3: Rest in background at moderate speed
                var tier3 = [];
                for (var i = 40; i < TOTAL; i++) tier3.push(i);
                BATCH_SIZE = 4;
                loadBatch(tier3);
            });
        });
    }

    // Boost load speed when user gets close to the section
    if ('IntersectionObserver' in window) {
        var seqObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                console.log('[Seq] Section approaching — boosting to batch 8');
                BATCH_SIZE = 8; // Full throttle
                seqObserver.disconnect();
            }
        }, { rootMargin: '150% 0px' }); // Fire when 150vh above viewport
        if (section) seqObserver.observe(section);
    }

    function loadFrame(n, callback) {
        if (imgs[n]) { if (callback) callback(); return; }
        var img = new Image();
        img.onload = function () {
            imgs[n] = img;
            loadedCt++;
            updateProgress();
            if (n === targetIdx) schedDraw();
            if (callback) callback();
        };
        img.onerror = function () {
            loadedCt++;
            console.error('[Seq] 404: ' + PATH + (n + 1) + '.webp');
            if (callback) callback();
        };
        img.src = PATH + (n + 1) + '.webp';
    }

    // loadBatch now accepts an optional completion callback
    function loadBatch(indices, onComplete) {
        if (indices.length === 0) { if (onComplete) onComplete(); return; }
        var current = indices.splice(0, BATCH_SIZE);
        var completed = 0;
        current.forEach(function (idx) {
            loadFrame(idx, function () {
                completed++;
                if (completed === current.length) {
                    if (indices.length === 0 && onComplete) {
                        onComplete();
                    } else {
                        setTimeout(function () { loadBatch(indices, onComplete); }, 8);
                    }
                }
            });
        });
    }

    function updateProgress() {
        var pct = loadedCt / TOTAL;
        if (bar)   bar.style.right   = ((1 - pct) * 100).toFixed(1) + '%';
        if (pctEl) pctEl.textContent = Math.round(pct * 100) + '%';
    }

    // Start immediately on window.load — no artificial delay
    window.addEventListener('load', preload);
}());
