// ─────────────────────────────────────────────────────────────────────────────
// section-registry.js — Lightweight Section Registry
//
// Scans the DOM for elements with [data-section-id] and exposes their
// measured layout positions so the Circuit Tracker (and any future consumer)
// can derive scroll-to-progress mappings without hardcoded section IDs or
// fractional percentages.
//
// DESIGN CONSTRAINTS (from forensic audit):
//   - NO new scroll listeners, RAF loops, or ticker hooks
//   - NO getBoundingClientRect() per frame
//   - Measures ONCE on init, re-measures on resize / ScrollTrigger.refresh
//   - Handles sticky/pinned sections (hero 520vh, bike ~400vh) correctly
//     by using actual offsetTop accumulation (same algorithm as the existing
//     Circuit computeMilestones)
//   - Gracefully ignores missing / display:none / zero-height sections
//   - Returns sections in actual DOM order, NOT a hardcoded sequence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registry entry shape:
 * {
 *   id:       string,            // data-section-id value
 *   label:    string | null,     // data-section-label value (used by Circuit for hover labels)
 *   theme:    string | null,     // data-section-theme value (reserved for future use)
 *   scrollTo: string,            // data-section-scroll-to OR data-section-id (the ID to scroll to on click)
 *   el:       HTMLElement,       // the actual DOM element
 *   top:      number,            // absolute document top (px) — computed via offsetTop chain
 *   height:   number,            // element offsetHeight (px)
 * }
 */

const _registeredSections = [];

/**
 * Compute absolute document-top for an element by walking the offsetParent chain.
 * This is the SAME algorithm the existing Circuit computeMilestones() uses,
 * preserving identical measurement behavior.
 */
function _absoluteTop(el) {
    let top = 0;
    let curr = el;
    while (curr && curr !== document.body) {
        top += curr.offsetTop || 0;
        curr = curr.offsetParent;
    }
    return top;
}

/**
 * Scan the DOM for all [data-section-id] elements, filter out hidden/zero-height
 * sections, sort by actual document position, and store the result.
 *
 * Call this after layout is stable (DOMContentLoaded + dynamic content rendered).
 * Call again on resize.
 */
function measure() {
    _registeredSections.length = 0;

    const els = document.querySelectorAll('[data-section-id]');

    els.forEach(el => {
        // Skip elements that are not laid out
        // display:none → offsetHeight = 0 and offsetParent = null
        // visibility:hidden → still has layout, we include it (it occupies space)
        if (!el.offsetParent && el.offsetHeight === 0) return;
        if (el.offsetHeight === 0) return;

        const id      = el.getAttribute('data-section-id');
        const label   = el.getAttribute('data-section-label') || null;
        const theme   = el.getAttribute('data-section-theme') || null;
        const scrollTarget = el.getAttribute('data-section-scroll-to') || id;

        _registeredSections.push({
            id,
            label,
            theme,
            scrollTo: scrollTarget,
            el,
            top:    _absoluteTop(el),
            height: el.offsetHeight,
        });
    });

    // Sort by actual document position (DOM order is usually correct,
    // but negative margins can shift things — sort guarantees truth)
    _registeredSections.sort((a, b) => a.top - b.top);
}

/**
 * Return a shallow copy of the current registered sections array.
 * Each entry contains { id, label, theme, scrollTo, el, top, height }.
 */
function getSections() {
    return _registeredSections.slice();
}

/**
 * Return a section entry by its id, or null if not registered / hidden.
 */
function getSection(id) {
    return _registeredSections.find(s => s.id === id) || null;
}

/**
 * Return the number of currently registered (visible, laid-out) sections.
 */
function count() {
    return _registeredSections.length;
}

export { measure, getSections, getSection, count };
