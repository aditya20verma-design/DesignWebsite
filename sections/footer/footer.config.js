/**
 * FOOTER SECTION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Footer content.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FOOTER_CONFIG = {

    email: 'aditya20verma@gmail.com',   // ← used for mailto + copy-to-clipboard

    nav: [
        { label: 'Work',    href: '#work' },
        { label: 'About',   href: '#about' },
        { label: 'Contact', href: '#contact' },
    ],

    social: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aditya20verma/' },
        { label: 'Behance',  href: 'https://www.behance.net/aditya20vrm' },
    ],

    resume: 'https://drive.google.com/file/d/1m9uWCMo32K5j0sqaknWDgNk4mHHYnSEF/view?usp=drive_link',

    copyright: `© ${new Date().getFullYear()} Aditya Verma. Designed & built with care.`,

};
