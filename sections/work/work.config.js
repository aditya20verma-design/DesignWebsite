/**
 * WORK SECTION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all projects.
 *
 * HOW TO ADD A NEW PROJECT:
 *   1. Create: sections/work/assets/{slug}/
 *              sections/work/assets/{slug}/cover.{jpg|png}
 *              sections/work/assets/{slug}/thumbnail.{jpg|png}
 *              sections/work/assets/{slug}/gallery/   ← for future project page
 *   2. Add a new entry to WORK_CONFIG.projects[] below.
 *   3. Add the HTML block to index.html (copy an existing project section).
 *   Done. No other files need touching.
 *
 * ASSET CONVENTION (per project folder):
 *   cover.*      → full-size parallax image shown in Work section
 *   thumbnail.*  → small card preview (future grid view)
 *   gallery/     → case study images for future dedicated project page
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Base path helper — update this ONE line if the folder ever moves
const BASE = 'sections/work/assets';

export const WORK_CONFIG = {

    // ── Projects ──────────────────────────────────────────────────────────────
    // Each entry maps 1:1 to a <section> in index.html.
    // slug must match the folder name inside /assets/.
    projects: [
        {
            slug:      'unishare',
            title:     'UniShare',
            subtitle:  'Making shared rides less awkward.',
            meta:      '2024 · Product Design',
            year:      '2024',
            tags:      ['Product Design', 'UX Research', 'Interaction'],
            // Assets — resolved from BASE/slug/
            cover:     `${BASE}/unishare/cover.jpg`,
            thumbnail: `${BASE}/unishare/thumbnail.png`,
            gallery:   `${BASE}/unishare/gallery/`,  // ← future project page images
            // Links
            externalUrl: 'https://www.behance.net/gallery/173110489/UniShare',  // current redirect
            projectPage:  '/projects/unishare.html',  // ← future internal page
        },
        {
            slug:      'dmrc',
            title:     'DMRC Redesign',
            subtitle:  'Simplifying Delhi metro for 2M+ daily riders.',
            meta:      '2024 · UI/UX Redesign',
            year:      '2024',
            tags:      ['UX Research', 'Systems Design', 'Accessibility'],
            cover:     `${BASE}/dmrc/cover.png`,
            thumbnail: `${BASE}/dmrc/thumbnail.png`,
            gallery:   `${BASE}/dmrc/gallery/`,
            externalUrl: 'https://www.behance.net/gallery/192019961/Delhi-Metro-Companion-Route-Finding-App',
            projectPage:  '/projects/dmrc.html',
        },
        {
            slug:      'nutribuddy',
            title:     'NutriBuddy',
            subtitle:  'Personalized diet tracking for Indian demographics.',
            meta:      '2023 · Health & Wellness',
            year:      '2023',
            tags:      ['Product Design', 'Healthcare UX'],
            cover:     `${BASE}/nutribuddy/cover.png`,
            thumbnail: `${BASE}/nutribuddy/thumbnail.png`,
            gallery:   `${BASE}/nutribuddy/gallery/`,
            externalUrl: 'https://www.behance.net/gallery/159157943/NutriBuddy-Healthier-food-choices',
            projectPage:  '/projects/nutribuddy.html',
        },
        {
            slug:      'mfine',
            title:     'mFine App Redesign',
            subtitle:  'Reducing friction in tele-health consultations.',
            meta:      '2025 · Competitive Analysis',
            year:      '2025',
            tags:      ['Product Design', 'Healthcare UX', 'Competitive Research'],
            cover:     `${BASE}/mfine/cover.jpg`,
            thumbnail:  null,   // ← add thumbnail.png to mfine/gallery when ready
            gallery:   `${BASE}/mfine/gallery/`,
            externalUrl: 'https://www.behance.net/gallery/216643991/mfine-App-Competitive-Analysis-Redesign',
            projectPage:  '/projects/mfine.html',
        },
    ],

};
