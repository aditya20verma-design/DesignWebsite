# Portfolio Architecture

## Structure

```
/Website
├── index.html              ← HTML shell (minimal, section containers)
├── script.js               ← JS orchestrator (Phase 1: monolithic; Phase 2: imports sections)
├── style.css               ← CSS orchestrator (Phase 1: monolithic; Phase 2: @imports sections)
│
├── /sections               ← Section modules — each section owns everything it needs
│   │
│   ├── /hero
│   │   ├── hero.config.js  ← ★ EDIT THIS to swap Unicorn visual or tune animation
│   │   ├── hero.js         ← hero init function (Phase 2: move GSAP logic here)
│   │   ├── hero.css        ← hero styles (Phase 2: move from style.css)
│   │   └── /assets
│   │       └── av-signature.svg
│   │
│   ├── /work
│   │   ├── work.config.js  ← ★ EDIT THIS to add/remove projects, swap images
│   │   ├── work.js         ← work animations (Phase 2)
│   │   ├── work.css        ← work styles (Phase 2)
│   │   └── /assets
│   │       ├── /images     ← Full-size parallax images
│   │       └── /thumbnails ← Project card thumbnails
│   │
│   ├── /about
│   │   ├── about.config.js ← ★ EDIT THIS to update bio, portrait, resume link
│   │   ├── about.js
│   │   ├── about.css
│   │   └── /assets
│   │
│   └── /footer
│       ├── footer.config.js← ★ EDIT THIS to update email, social links, nav
│       ├── footer.js
│       ├── footer.css
│       └── /assets
│
└── /shared
    ├── shared.js           ← Cross-section: cursor, Lenis, ScrollTrigger init
    └── tokens.css          ← Design tokens: CSS custom properties

```

---

## How to do common tasks

### Swap the hero WebGL visual
→ Edit `sections/hero/hero.config.js` → change `unicorn.projectId`
→ Also update `data-us-project` in `index.html` (temporary, Phase 2 auto-injects)

### Add a new work project
→ Edit `sections/work/work.config.js` → add to `projects[]`
→ Drop image into `sections/work/assets/images/`
→ Drop thumbnail into `sections/work/assets/thumbnails/`
→ Add HTML block to `index.html` referencing the new image path

### Update contact email
→ Edit `sections/footer/footer.config.js` → change `email`

### Add an About portrait
→ Drop image into `sections/about/assets/`
→ Edit `sections/about/about.config.js` → set `assets.portrait`

---

## Migration phases

### Phase 1 (Current — Safe, Structural)
- ✅ `/sections/` directory with all config files
- ✅ All assets co-located under their section
- ✅ `script.js` ASSETS block mirrors section configs
- ✅ `index.html` paths updated to `sections/work/assets/...`
- 📁 `script.js` and `style.css` are still monolithic (all logic in one file)
- 📁 Old `/assets/` directory preserved as backup

### Phase 2 (Next — Code Splitting)
When you're ready to split:
1. Add `type="module"` to `<script src="script.js">` in `index.html`
2. In each `{section}.js`, paste logic from `script.js` into `init{Section}()`
3. In each `{section}.css`, paste rules from `style.css`
4. In `script.js`, replace with:
   ```js
   import { initHero   } from './sections/hero/hero.js';
   import { initWork   } from './sections/work/work.js';
   import { initShared } from './shared/shared.js';
   initShared(); initHero(); initWork();
   ```
5. In `style.css`, replace with:
   ```css
   @import url('./shared/tokens.css');
   @import url('./sections/hero/hero.css');
   @import url('./sections/work/work.css');
   ```

---

## Old directories (safe to delete after Phase 2 verification)
- `/assets/` — original asset location (still intact as backup)
- `/Images/` — legacy duplicate of work images (unused)
- `/scripts/` — old empty stub directory
- `/styles/` — old empty stub directory
