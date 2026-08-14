# Design System — Aditya Verma Portfolio
# Version: v4.1 — 2026-08-14

> **Architectural Principle:**
> The design system is the source of design decisions, not a record of implementation decisions.
> Existing UI must consume the system. New UI must be created from the system.
> **Change Propagation:** Changing one foundation decision MUST propagate through semantic and component layers automatically without manual UI overrides.

---

## Documentation Workflow

```
DESIGN_SYSTEM.md  ←── SINGLE SOURCE OF TRUTH
      ↓
tools/generate-design-guide.py
      ↓
DESIGN_GUIDE.html  ←── READ-ONLY VISUAL GUIDE
```

---

## Token Hierarchy (The Stability Cascade)

```
[ PART 1 — FOUNDATIONS ]
  Design ingredients. Change these to globally alter the aesthetic.
        ↓
[ PART 2 — SEMANTIC SYSTEM ]
  Design meaning. This layer protects the website from foundation changes.
        ↓
[ PART 3 — COMPONENT SYSTEM ]
  Reusable UI contracts. Never references raw values directly.
        ↓
[ PART 4 — UI IMPLEMENTATION ]
  Website CSS. Consumes the component and semantic layers.
```

---

# PART 1 — FOUNDATIONS

## 1. Color Foundations

Use only meaningful available tones. Missing values are intentionally unused / reserved.

### 1.1 Primary Color (Brand Orange)
| Token | Hex | Status |
|:---|:---|:---|
| `--color-primary-400` | `#ff7a50` | Used |
| `--color-primary-500` | `#ff642f` | Used |
| `--color-primary-600` | `#FF5509` | Used (Core Brand) |
| `--color-primary-700` | `#cc4307` | Reserved |
| `--color-primary-800` | `#99320a` | Reserved |

### 1.2 Secondary Color
**Secondary: Undefined / Reserved.** 
(The portfolio is a single-accent system. Do not invent a secondary brand hue.)

### 1.3 Neutral Palette
Available neutral tones. Not a mathematically complete 0-1000 scale.

| Token | Hex | Status |
|:---|:---|:---|
| `--color-neutral-0` | `#000000` | Used |
| `--color-neutral-50` | `#f1f0ec` | Used |
| `--color-neutral-100` | `#f5f5f7` | Used |
| `--color-neutral-200` | `#bfbebe` | Used |
| `--color-neutral-400` | `#777777` | Used |
| `--color-neutral-500` | `#6f6f6f` | Used |
| `--color-neutral-600` | `#4a4a4a` | Used |
| `--color-neutral-700` | `#333333` | Used |
| `--color-neutral-800` | `#252525` | Used |
| `--color-neutral-850` | `#222222` | Used |
| `--color-neutral-900` | `#141414` | Used |
| `--color-neutral-950` | `#0f0f0f` | Used |
| `--color-neutral-1000` | `#ffffff` | Used |

### 1.4 Extended Colors
| Role | Status |
|:---|:---|
| Success | Reserved |
| Warning | Reserved |
| Error | Reserved |
| Info | Reserved |

### 1.5 Alpha Foundations
| Token | Value | 
|:---|:---|
| `--color-white-a05` | `rgba(255,255,255,0.05)` |
| `--color-white-a12` | `rgba(255,255,255,0.12)` |
| `--color-white-a20` | `rgba(255,255,255,0.20)` |
| `--color-black-a15` | `rgba(0,0,0,0.15)` |
| `--color-black-a50` | `rgba(0,0,0,0.50)` |
| `--color-black-a82` | `rgba(0,0,0,0.82)` |
| `--color-primary-a20` | `rgba(255,85,9,0.20)` |
| `--color-primary-a65` | `rgba(255,85,9,0.65)` |

---

## 2. Typography Foundations

The architecture allows full font swapping. If `--font-family-primary` changes, all UI consuming it updates automatically.
Brier is intentionally decoupled from the primary typeface.

### 2.1 Typeface Stack
| Role | Token | Stack |
|:---|:---|:---|
| **Primary** | `--font-family-primary` | `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif` |
| **Editorial** | `--font-family-editorial` | `'Brier', Georgia, serif` |
| **Monospace** | `--font-family-mono` | `ui-monospace, monospace` |

### 2.2 Typography Scale
Centralized font sizing. Changing these propagates everywhere.
| Style | Size (clamp) | Weight | Line-Height |
|:---|:---|:---|:---|
| `--text-display-size` | `clamp(52px, 9vw, 96px)` | 500 | 1.02 |
| `--text-h1-size` | `clamp(32px, 5.5vw, 52px)` | 600 | 1.18 |
| `--text-h3-size` | `clamp(20px, 3vw, 32px)` | 500 | 1.30 |
| `--text-body-size` | `clamp(15px, 1.5vw, 17px)` | 400 | 1.65 |
| `--text-label-size` | `clamp(13px, 1.2vw, 15px)` | 500 | 1.47 |

---

## 3. Spacing Foundations

Change-resilient 4px/8px basis. Changing a token (e.g., `--space-4: 20px`) will update all UI using it.

| Token | Value |
|:---|:---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-16` | 64px |

---

## 4. Radius Foundations

| Token | Value |
|:---|:---|
| `--radius-xs` | 4px |
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 20px |
| `--radius-pill` | 999px |

---

## 5. Motion Foundations

| Token | Duration |
|:---|:---|
| `--motion-duration-fast` | 160ms |
| `--motion-duration-medium`| 300ms |
| `--motion-duration-slow` | 500ms |

---

# PART 2 — SEMANTIC SYSTEM

This layer protects components from raw foundation changes.

## 6. Semantic Color Roles

| Role | Token | References |
|:---|:---|:---|
| Background | `--bg-base` | `var(--color-neutral-900)` |
| Background Elevated | `--bg-elevated` | `var(--color-neutral-800)` |
| Background Overlay | `--bg-overlay` | `var(--color-black-a82)` |
| Text Primary | `--text-primary` | `var(--color-neutral-100)` |
| Text Muted | `--text-muted` | `var(--color-neutral-400)` |
| Accent | `--accent` | `var(--color-primary-600)` |
| Accent Hover | `--accent-hover` | `var(--color-primary-500)` |
| Border Default | `--border-default` | `var(--color-white-a12)` |

## 7. Semantic Type Roles

| Role | Token | References |
|:---|:---|:---|
| Heading | `--font-heading` | `var(--font-family-primary)` |
| Body | `--font-body` | `var(--font-family-primary)` |
| UI | `--font-ui` | `var(--font-family-primary)` |
| Mono | `--font-mono` | `var(--font-family-mono)` |
| Accent | `--font-accent` | `var(--font-family-editorial)` |

---

# PART 3 — COMPONENT SYSTEM

Component tokens MUST reference semantic tokens (or foundations, if semantics don't apply). Never raw `#Hex`.

## 8. Component Contracts

### Buttons
| Token | References |
|:---|:---|
| `--btn-bg` | `transparent` |
| `--btn-border` | `var(--border-default)` |
| `--btn-text` | `var(--text-primary)` |

### Cards
| Token | References |
|:---|:---|
| `--card-bg` | `var(--bg-elevated)` |
| `--card-border` | `var(--border-default)` |
| `--card-radius` | `var(--radius-md)` |

---

# PART 4 — EXPERIENCE & IMPLEMENTATION

## 9. Cinematic Art Direction
GSAP choreographies (Hero sequence, Work pin) remain bespoke and independent of component tokens.

## 10. Website Token Adoption Map (Audit)

Classification of hardcoded values currently in the website:

### Color
* Migrated: ~98%
* Intentional exceptions: 3 (`#e5e4e0` in about.css/style.css, `#111` in style.css exp-card)
* Unmapped: 0

### Typography
* Migrated: 100% (All standard text styles and fallbacks map to type roles)
* Intentional exceptions: 0
* Unmapped: 0

### Spacing & Radius
* Migrated: ~95%
* Intentional exceptions: 2 (28px radius inside 32px padding constraint, 2px cinematic border-radius in work.css)
* Unmapped: 0

### Components
* Migrated: 100% of standard contracts. 

---

## 11. Why Not Tokenized?

For meaningful values intentionally left outside the system:

| Value | File | Reason | Classification |
|:---|:---|:---|:---|
| `#e5e4e0` | `about.css`, `style.css` | Warm paper tone for About intro/Ghosts, matching testimonials. | C — Intentional Art Direction |
| `#111` | `style.css` (`.exp-card`) | Hover card 3D lighting/shadow intent that sits slightly darker than `#141414` but lighter than `#0f0f0f`. | C — Intentional Art Direction |
| `border-radius: 2px` | `work.css` | Sub-pixel cinematic frame border detail. | E — Intentional One-Off |
| `border-radius: 28px` | `style.css` | Concentric geometric calculation requiring inner corners to be square within 32px padding. | D — Calculated |
| `rgba(12, 12, 12, *)` | `work.css` | Gradients specifically designed to blend cinematic images into the `#141414` background in GSAP. | C — Intentional Art Direction |
| `#ffffff` | `horiz-journey.css` | Background explicitly matches bike WebGL exit frame (Frame 83). | C — Intentional Art Direction |
| `rgba(255,255,255,0.02)` | `work.css` (`.mw-card`) | Subtler transparent card background that doesn't match standard elevated backgrounds. | C — Intentional Art Direction |

---

## 12. Final Architectural Principle
"The design system is the source of design decisions, not a record of implementation decisions."
Existing UI must consume the system. New UI must be created from the system.
