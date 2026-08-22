import { initShared } from './shared/shared.js';
import { initHero } from './sections/hero/hero.js';
import { HERO_CONFIG } from './sections/hero/hero.config.js';

import { initWork } from './sections/work/work.js';
import { initTestimonials } from './sections/testimonials/testimonials.js';
import { initFooter } from './sections/footer/footer.js';
import { initSound } from './shared/sound.js';
import { initProjectViewer } from './projects/project-viewer.js';
import * as SectionRegistry from './shared/section-registry.js';

// ══════════════════════════════════════════════════════════════════════════════
// ASSET CONFIG — swap any asset by updating section config files.
// ══════════════════════════════════════════════════════════════════════════════
window.ASSETS = {
    hero: { unicornProjectId: HERO_CONFIG.unicorn.projectId },
    work: {
        covers: { unishare: 'sections/work/assets/unishare/cover.jpg', dmrc: 'sections/work/assets/dmrc/cover.png', nutribuddy: 'sections/work/assets/nutribuddy/cover.png', mfine: 'sections/work/assets/mfine/cover.jpg' },
        thumbnails: { unishare: 'sections/work/assets/unishare/thumbnail.png', dmrc: 'sections/work/assets/dmrc/thumbnail.png', nutribuddy: 'sections/work/assets/nutribuddy/thumbnail.png', mfine: null }
    }
};

// ── Expose Section Registry globally for non-module consumers (circuit.js) ──
window.__sectionRegistry = SectionRegistry;

document.addEventListener("DOMContentLoaded", () => {
    initSound();
    initShared();
    initHero();

    initWork();
    initTestimonials();
    initFooter();
    initProjectViewer();
});
