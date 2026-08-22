/**
 * HERO SECTION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all Hero section settings.
 *
 * HOW TO UPDATE:
 *   • Swap WebGL visual  → change unicornProjectId
 *   • Swap signature SVG → change assets.signature path
 *   • Tune animation     → change anim.* values
 *
 * Used by: sections/hero/hero.js  (Phase 2)
 *          script.js ASSETS block (Phase 1 — inline copy)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const HERO_CONFIG = {

    // ── WebGL Background (Unicorn Studio) ─────────────────────────────────────
    // Replace projectId to swap the entire background visual with zero code change.
    unicorn: {
        projectId: 'kt5EwBtAEDtnn2IDefYL',   // ← update this to change WebGL scene
        sdkVersion: 'v2.1.6',
        lazyLoad: false,
        fps: 60,
    },

    // ── Video Background ──────────────────────────────────────────────────────
    video: {
        enabled: false,
        file: 'sections/hero/assets/stage2_background_video-desktop.mp4',
        maxOpacity: 0.85,
    },

    // ── Assets ─────────────────────────────────────────────────────────────────
    assets: {
        signature: 'sections/hero/assets/ebv3.json',
        video: 'sections/hero/assets/stage2_background_video-desktop.mp4',
    },

    // ── Signature (Lottie draw-on animation) ──────────────────────────────────
    // Change these without touching any animation or JS code.
    signature: {
        file: 'sections/hero/assets/ebv3.json', // ← active signature (eddy-bull-sign.json + AV sign Lotie v4.json kept as backups)
        strokeColor: '#FF5509',   // ← change to retheme stroke colour (any hex)
        strokeWidth: null,        // ← set e.g. 3 to override width, null = use Lottie default
        speedMultiplier: 1.0,       // ← 1.0 = normal, 0.5 = slower, 2.0 = faster draw
        loop: false,       // ← true = signature loops after drawing
        revealDelay: 0.38,        // ← eddy bull: shorter delay gives longer script more scroll room
        tailFrames: 28,          // ← eddy bull: frames 122–150 are hold frames (nothing new draws after 121)
        tailPx: 150,
    },

    // ── Hero Visual Overlay (Progressive darkening) ───────────────────────────
    overlay: {
        enabled: true,
        color: '#000000',
        startOpacity: 0,
        endOpacity: 0.70,
        fadeStart: 0.38,        // Matches signature.revealDelay
        fadeEnd: 0.83,        // Matches when signature finishes main draw phase
    },

    // ── Background Ripple Grid ────────────────────────────────────────────────
    // Replaces the old particle dot system.
    // Grid lives at z-index 2 (below Unicorn canvas at 3) — Unicorn sits on top.
    // Clicks on the hero bubble up and trigger the ripple wave via event delegation.
    ripple: {
        enabled: true,
        cellSize: 56,                          // ← px per square cell
        borderColor: 'rgba(0,0,0,0.05)',          // ← Apple-style ultra-thin, ambient grey line
        shadowRest: 'none',                      // ← Clear when resting
        shadowHover: 'inset 0 0 20px rgba(0, 0, 0, 0.08)', // ← Very soft, ambient grey depth on hover
        shadowRipple: 'inset 0 0 40px rgba(0,0,0,0.08)', // ← Elegant, muted grey pulse on click
        baseOpacity: 1.0,                         // ← Base opacity is 1
        peakOpacity: 1.0,                         // ← Peak opacity is 1
        waveSpeed: 55,                          // ← ms per Euclidean distance unit
        pulseDuration: 200,                         // ← base animation ms per cell
        pulseDistanceScale: 80,                          // ← extra ms added per distance unit
    },


    // Adjust scroll-driven collapse feel without touching animation code
    anim: {
        // Hero card collapse
        heroScale: 0.35,          // Final scale of hero card
        heroOpacity: 0.35,          // Final opacity
        // Canvas parallax (within collapsing card)
        canvasScaleDesktop: 1.2,    // Counter-scale at end (desktop)
        canvasScaleMobile: 1.08,   // Counter-scale at end (mobile)
        canvasInitialScale: 1.1,    // Initial CSS scale
        canvasTranslateY: '8%',   // Initial translateY push-down
        // Signature
        signatureScale: 0.6,        // Final signature container scale
    },

};
