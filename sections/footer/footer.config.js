/**
 * FOOTER SECTION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Footer content.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FOOTER_CONFIG = {

    email: 'adityaverma@example.com',   // ← used for mailto + copy-to-clipboard

    nav: [
        { label: 'Work',    href: '#work' },
        { label: 'About',   href: '#about' },
        { label: 'Contact', href: '#contact' },
    ],

    social: [
        { label: 'LinkedIn', href: 'https://linkedin.com/in/aditya-verma' },
        { label: 'Dribbble', href: 'https://dribbble.com/' },
        { label: 'Twitter',  href: 'https://twitter.com/' },
    ],

    copyright: `© ${new Date().getFullYear()} Aditya Verma. All rights reserved.`,

};
