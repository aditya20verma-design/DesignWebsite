/**
 * ASSET CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all project assets.
 * To replace any asset: update the path here — animations and layout untouched.
 *
 * Usage in script.js:
 *   import { ASSETS } from './assets/config.js';
 *   document.querySelector('.unicorn-canvas').dataset.usProject = ASSETS.hero.unicornProjectId;
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ASSETS = {

    // ── Hero Section ──────────────────────────────────────────────────────────
    hero: {
        // UnicornStudio WebGL visual — replace project ID to swap background
        unicornProjectId: 'VUmB8Ym97iye9ZS9hDbi',

        // Signature SVG — inline in index.html (GSAP targets .av-signature path)
        // To replace: update the <path d="..."> in index.html → .signature-container
        signatureStrokeColor: 'var(--primary-color)',
    },

    // ── Work Section ──────────────────────────────────────────────────────────
    work: {
        // Full-size parallax images (shown inside project sections)
        images: {
            unishare:  'assets/work/images/unishare.jpg',
            dmrc:      'assets/work/images/dmrc.png',
            mfine:     'assets/work/images/mfine.jpg',
        },

        // Project card thumbnails (used in grid/list view — future)
        thumbnails: {
            project1:  'assets/work/thumbnails/project1.png',
            project2:  'assets/work/thumbnails/project2.png',
            project3:  'assets/work/thumbnails/project3.png',
        },
    },

    // ── About Section ─────────────────────────────────────────────────────────
    about: {
        // Add portrait photo, resume PDF link, etc. here when built
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    footer: {
        // Add footer background or icons here
    },

};
