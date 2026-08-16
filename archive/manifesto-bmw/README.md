# Archive: Manifesto BMW Light Assembly

**Archived on:** 2026-08-16  
**Architecture commit:** b912322 (refactor: modularize portfolio architecture)  
**Replaced by:** Phase 3A — New Manifesto Redesign

---

## What this was

This is the archived implementation of the **BMW S1000RR Headlight Interaction Assembly** that formed the visual centrepiece of the original Hero Manifesto section.

It was an intricate, scroll-scrubbed cinematic animation that:

1. Simulated the cold-start ignition sequence of a BMW S1000RR motorcycle headlight
2. Emitted volumetric orange high-beam light cones using CSS gradients + `mix-blend-mode: screen`
3. Built up an atmospheric orange bloom that crescendoed into a full-screen orange takeover (`#white-takeover`)
4. Accompanied the character-by-character typographic illumination of the Manifesto text

---

## Where it originally lived

| Asset type | Original location |
|---|---|
| DOM (HTML) | `index.html` — inside `.manifesto-stage > .manifesto-container` |
| CSS | `sections/hero/hero.css` — lines ~345–528 |
| JS animation | `sections/hero/hero.js` — inside `initMasterHeroScroll()`, phases 3–7 |
| Character parsing | `sections/hero/hero.js` — lines ~404–543 |

---

## DOM elements it contained

```html
<div class="bmw-light-system" id="bmw-light-system">
  <div class="bmw-assembly">
    <svg class="bmw-layer bmw-fairing" id="bmw-fairing">...</svg>
    <svg class="bmw-layer bmw-drl" id="bmw-drl">...</svg>
    <svg class="bmw-layer bmw-projector" id="bmw-projector">...</svg>
    <div class="beam-stream beam-left" id="beam-left"></div>
    <div class="beam-stream beam-right" id="beam-right"></div>
    <div class="beam-bloom" id="beam-bloom"></div>
  </div>
</div>
```

---

## Timeline positions it occupied (masterTl 0.0–1.0)

| Progress | Effect |
|---|---|
| 0.30–0.45 | Fairing fade-in (opacity 0.22 → 0.45) |
| 0.45–0.48 | DRL ignition (grey #4A4A4A → white flash) |
| 0.62–0.68 | Projector lens glow awakens |
| 0.68–0.72 | Full projector ignition |
| 0.70–0.74 | Volumetric beams expand |
| 0.68–0.78 | `#white-takeover` orange screen fill |
| 0.73–0.78 | Typography + BMW system fade out into orange |

---

## Intention

This is **intentionally archived, not deleted**. It may be reused as:
- A standalone case-study element
- A section break or ambient animation in a future redesign
- A reference implementation for scroll-scrubbed SVG ignition sequences

Do NOT load any files from this directory in `index.html` or `script.js`.

---

## Files in this archive

- `dom-fragment.html` — The original HTML DOM block for the BMW assembly
- `css-fragment.css` — The original CSS for the BMW assembly and character system
- `js-fragment.js` — The original GSAP timeline segments (Phases 3–7)
- `README.md` — This file
