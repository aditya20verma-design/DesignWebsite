# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
