# Typography Kit — Aditya Verma Portfolio
> **Two fonts only. No exceptions.**

---

## Font Families

| Variable | Font | Source | Usage Role |
|---|---|---|---|
| `--font-sf` | **Apple SF Pro** | System Stack | Everything by default |
| `--font-brier` | **Brier** | `assets/fonts/` | Decorative accents only |
| `--font-sf-mono` | **SF Mono** | System Stack | Dates, timestamps, metadata |

### Full System Stacks

```css
/* Primary — SF Pro Display/Text */
--font-sf: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;

/* Accent — Brier (local) */
--font-brier: 'Brier', Georgia, serif;

/* Monospace — SF Mono */
--font-sf-mono: ui-monospace, "SF Mono", "Menlo", "Courier New", monospace;
```

### Semantic Aliases (use these in components, never the raw stack)

```css
--font-heading: var(--font-sf);     /* All h1–h6, nav, large display text */
--font-body:    var(--font-sf);     /* Body copy, descriptions, paragraphs */
--font-accent:  var(--font-brier);  /* Decorative highlight spans only */
--font-mono:    var(--font-sf-mono);/* Dates, timestamps, code, small metadata */
--font:         var(--font-body);   /* Global shorthand on <body> */
```

---

## Type Scale

| Variable | Size (fluid clamp) | Role | Example Selector |
|---|---|---|---|
| `--text-xs` | `clamp(0.65rem, 0.9vw, 0.75rem)` | Tags, micro-labels | `.badge`, `.tag` |
| `--text-sm` | `clamp(0.75rem, 1.1vw, 0.875rem)` | Captions, dates, nav labels | `.exp-date`, `.project-meta` |
| `--text-base` | `clamp(0.9rem, 1.3vw, 1rem)` | Body copy | `body`, `p` |
| `--text-md` | `clamp(1rem, 1.5vw, 1.25rem)` | Subheadings, descriptions | `.about-desc`, `.exp-role` |
| `--text-lg` | `clamp(1.5rem, 3vw, 2.5rem)` | Section headings | `h3`, `.section-title` |
| `--text-xl` | `clamp(2rem, 5vw, 4rem)` | Project titles, hero h1 | `.project-title`, `h2` |
| `--text-2xl` | `clamp(2.5rem, 7vw, 6rem)` | Display/footer headings | `.footer-heading`, `h1` |

---

## Font Weights

| Weight | SF Pro Name | Usage |
|---|---|---|
| `300` | Light | Decorative, subtle labels (use sparingly) |
| `400` | Regular | Body copy, descriptions |
| `500` | Medium | Nav links, emphasis within body |
| `600` | Semibold | Subheadings, strong emphasis |
| `700` | Bold | Brier accent text, small labels needing punch |
| `800` | Heavy | Project titles, section headings (h2) |
| `900` | Black | Display headings, hero text (h1) |

> **Brier available weights:** 400 (Regular), 700 (Bold)

---

## Letter Spacing Rules

| Context | Tracking | Notes |
|---|---|---|
| Display headings (`--text-2xl`, `--text-xl`) | `-0.04em` to `-0.05em` | Tight — modern editorial |
| Section headings (`--text-lg`) | `-0.03em` | Slightly tighter than body |
| Body copy | `0` | Never force-track body text |
| ALL CAPS labels (nav, meta, tags) | `+0.12em` to `+0.15em` | Humanise the uppercase |
| Monospace dates | `+0.05em` | Slight open for readability |

---

## Brier Accent Rules

Brier is a **decorative touch only** — it should feel like editorial punctuation, not the main narrative.

### ✅ Use Brier for:
- **One or two words** within a large heading (e.g., the word "IDEA" in the footer CTA)
- **Section labels** ("About Me", "Experience") for a editorial contrast
- **Project meta** (e.g., "2023 · App Design") to differentiate from the main heading
- **One key word in project titles** to create typographic interest

### ❌ Never use Brier for:
- Full paragraphs or body copy
- Navigation links
- Button text / CTAs
- More than one decorative word per visual block
- Any interactive element

### Implementation

```html
<!-- Correct: Single accent word within a heading -->
<h2>Metro Route <span class="font-accent">Finder</span></h2>

<!-- Correct: Metadata label -->
<p class="project-meta font-accent">2024 · UI/UX Redesign</p>

<!-- Wrong: entire heading in Brier -->
<h2 class="font-accent">Metro Route Finder</h2>
```

```css
/* The accent class */
.font-accent {
    font-family: var(--font-accent);
    font-weight: 400;
    font-style: italic;
    letter-spacing: normal;
    text-transform: none;
}
```

---

## Current Usage Map

| Component | Element | Font | Weight | Size | Tracking |
|---|---|---|---|---|---|
| Nav links | `.nav-link` | SF Pro | 500 | `--text-sm` | `+0.15em` |
| Logo (SVG) | SVG paths | SVG (custom) | — | fixed px | — |
| Hero / Loader | `.loader-logo` | SVG (custom) | — | — | — |
| Project meta | `.project-meta` | **Brier** | 400 | `--text-sm` | `+0.15em` |
| Project title | `.project-title` | SF Pro | 800 | `--text-xl` | `-0.04em` |
| Project title accent | `span.font-accent` | **Brier** | 400 | inherited | normal |
| Project desc | `.project-desc` | SF Pro | 400 | `--text-base` | 0 |
| About label | `.about-label` | **Brier** | 400 | `--text-sm` | `+0.15em` |
| About desc | `.about-desc` | SF Pro | 400 | `--text-md` | 0 |
| Experience role | `.exp-role` | SF Pro | 500 | `--text-md` | 0 |
| Experience company | `.exp-company` | SF Pro | 400 | `--text-base` | 0 |
| Experience date | `.exp-date` | SF Mono | 400 | `--text-sm` | `+0.05em` |
| Footer heading | `.footer-heading` | SF Pro | 400 | `--text-2xl` | `-0.05em` |
| Footer heading accent | `span.font-accent` | **Brier** | 400 | inherited | normal |
| Circuit nav labels | `.section-label` | SF Pro | 400 | 60px (scaled) | 0 |

---

## For New Sections / Pages

1. **Body text** → `font-family: var(--font-body)` + `font-size: var(--text-base or --text-md)`
2. **Headings** → `font-family: var(--font-heading)` + `font-size: var(--text-xl or --text-2xl)` + `font-weight: 800`
3. **Dates / timestamps** → `font-family: var(--font-mono)` + `font-size: var(--text-sm)`
4. **Brier accent** → add class `font-accent` to a single `<span>` inside the heading
5. **Never** hardcode a font family with a string — always use the CSS variables

---

*Last updated: April 2026*
