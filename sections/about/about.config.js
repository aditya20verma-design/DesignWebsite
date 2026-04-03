/**
 * ABOUT SECTION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for About section content.
 *
 * HOW TO UPDATE:
 *   • Add portrait    → set assets.portrait path
 *   • Update bio      → edit content.bio
 *   • Link resume     → set content.resumeUrl
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ABOUT_CONFIG = {

    assets: {
        portrait: null,   // e.g. './assets/portrait.jpg'
    },

    content: {
        name:       'Aditya Verma',
        title:      'Product Designer',
        bio:        'I design digital products that feel natural, look intentional, and ship on time.',
        resumeUrl:  '#',      // ← update with Google Drive / PDF link
        email:      'adityaverma@example.com',
    },

    // Social links — add / remove freely
    social: {
        linkedin:  'https://linkedin.com/in/aditya-verma',
        dribbble:  'https://dribbble.com/',
        twitter:   'https://twitter.com/',
    },

};
