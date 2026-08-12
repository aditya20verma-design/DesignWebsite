import { initShared } from './shared/shared.js';
import { initHero } from './sections/hero/hero.js';
import { HERO_CONFIG } from './sections/hero/hero.config.js';
import { initWork } from './sections/work/work.js';
import { initFooter } from './sections/footer/footer.js';

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

document.addEventListener("DOMContentLoaded", () => {
    initShared();
    initHero();
    initWork();
    initFooter();
});
