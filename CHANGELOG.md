# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - Interactive Project Viewer & Case Study Expansion

### Highlights
- Built an interactive, seamless inline Project Viewer overlay system (`projects/project-viewer.js`, `projects/project-viewer.css`) for full case study presentations.
- Added comprehensive project content and standalone case study pages (`bublingo`, `data-that-i-wear`, `digital-detox`, `dune-speaker`, `go-karting`, and updated existing project views).

### Experience
- Implemented intelligent scroll-position saving and smooth restoration when navigating to and from case study views.
- Added direct deep-linking redirect capabilities for individual project URLs back into the primary portfolio experience.

## [2.1.1] - Repository Cleanup

### Technical
- Removed broken GitHub Actions workflow.
- Untracked scratch dev files and virtual environments from the repository.

## [2.1.0] - Cinematic Work Interaction Refinements

### Highlights
- Completely rebuilt the "More Work" component layout into a stable, non-collapsing grid system.
- Implemented an elegant "early-click auto-completion" model for Featured Work cards during the scroll entrance.

### Experience
- Early clicks on a partially visible Featured Work card during the entrance transition now organically auto-scroll to the settled boundary before securely triggering the expansion tween.
- Re-architected Featured Work click gating to enforce an "Expand first, Navigate second" user flow without fragile timeout dependencies.
- Refactored `mouseleave` resets to perfectly respect native and Lenis scroll states, preventing the page from abruptly snapping back to Card 01 during reverse scrubs.

### Fixes
- Fixed an alpha-channel evaluation bug in the smart cursor system that incorrectly displayed light-mode pills on dark transparent background blends.

## [2.0.0] - Modular Architecture Refactor

### Highlights
- Completely modularized the portfolio architecture, decoupling CSS and JS files by specific sections.
- Stabilized and froze the underlying codebase structure, laying the technical foundation for future visual redesigns.

### Technical
- Implemented a dynamic lightweight Section Registry (`shared/section-registry.js`) for global domain-aware routing.
- Upgraded the Circuit tracker to dynamically derive zones and milestones from the Section Registry instead of hardcoded metrics.
- Extracted section-specific styles from the monolithic `style.css` into dedicated module stylesheets (`hero.css`, `work.css`, `footer.css`, etc.).
- Extracted section-specific JavaScript from `script.js` into targeted runtime modules (`hero.js`, `work.js`, etc.).
- Decoupled Testimonials and Shared Sound ownership from the monolithic footer logic.

## [1.2.1] - Bike Sequence Expansion Refinements

### Experience
- Refined initial Scroll Expand Media state to 55vw.
- Added a 20% scroll delay to the expansion, creating a more stable cinematic card presentation before the transition begins.
- Flawlessly resolved a background color seam by isolating the anamorphic lens vignette to the inner clip-path container, preserving the pure `#141414` environment globally.
- Reverted a corrupted python-based image patch in favor of a lossless `.jpg` asset for Frame 1, ensuring perfect color fidelity.
## [1.2.0] - Bike Sequence Cinematic Expansion

### Highlights
- Replaced the legacy Ken Burns entry effect with a premium, Framer-style scroll-driven media expansion for the bike sequence.
- Implemented a physically accurate `#141414` environment for the bike canvas, matching the global Design System.

### Experience
- Added a constrained 45vw media card state that dynamically expands to edge-to-edge full-bleed based on scroll progress.
- Resolved "white bleed" transition artifacts between the Work and About sections.
- Flawlessly patched the baked `#111111` background in the initial 3D render frame to match the native UI environment without requiring runtime compositing.

## [1.1.0] - Phase 2 Design System & Repository Governance

### Highlights
- Finalized Phase 2 Design System architecture, successfully mapping all components to a strict foundation and semantic token cascade.
- Established a rigorous, permanent repository governance workflow (`AGENTS.md` and `VERSIONING.md`).

### Technical
- Implemented `npm run design:check` validation script.
- Synchronized `package.json` version, git tags, and changelog as a strict invariant.

### Fixes
- Removed obsolete generator scripts and clarified legacy font documentation.
- Consolidated uncoupled color (`--color-orange-*`) and typography (`--font-sf`) tokens into their unified semantic architecture.

## [1.0.0] - BMW Hero Scroll & Interaction Polish

*Baseline established release.*

### Highlights
- Finalized premium, flicker-free cinematic scroll transitions.
- Completed BMW Ken Burns zoom-out effect with anamorphic vignetting and parallax.
- Added adaptive telemetry mouse-trail and smart CTA ring hover interactions.

### Experience
- Refined hero-to-philosophy scroll transition with oversized background typography.
- Perfected Lando Norris-style kinetic manifesto section with scrubbed typography reveal.
- Updated testimonial heading typography to premium mixed-font style.
- Resolved UX conflicts between the preloader interaction and the hero auto-pan functionality.

### Performance
- Fine-tuned preloader breathing intensity.
- Synchronized WebGL canvas initialization with the cinematic loader to prevent white flashes.
