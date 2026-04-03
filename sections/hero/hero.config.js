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

    // ── Assets ─────────────────────────────────────────────────────────────────
    assets: {
        signature: 'sections/hero/assets/av-signature.json',  // ← swap file to replace signature
    },

    // ── Signature (Lottie draw-on animation) ──────────────────────────────────
    // Change these without touching any animation or JS code.
    signature: {
        file:          'sections/hero/assets/av-signature.json', // ← swap to replace signature
        strokeColor:   '#FF5509',   // ← change to retheme stroke colour (any hex)
        strokeWidth:   null,        // ← set e.g. 3 to override width, null = use Lottie default
        speedMultiplier: 1.0,       // ← 1.0 = normal, 0.5 = slower, 2.0 = faster draw
        loop:          false,       // ← true = signature loops after drawing
    },

    // ── Animation Settings ────────────────────────────────────────────────────
    // Adjust scroll-driven collapse feel without touching animation code
    anim: {
        // Hero card collapse
        heroScale:   0.35,          // Final scale of hero card
        heroOpacity: 0.35,          // Final opacity
        // Canvas parallax (within collapsing card)
        canvasScaleDesktop: 1.2,    // Counter-scale at end (desktop)
        canvasScaleMobile:  1.08,   // Counter-scale at end (mobile)
        canvasInitialScale: 1.1,    // Initial CSS scale
        canvasTranslateY:   '8%',   // Initial translateY push-down
        // Signature
        signatureScale: 0.6,        // Final signature container scale
    },

};
