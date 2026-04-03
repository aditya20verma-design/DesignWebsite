// ══════════════════════════════════════════════════════════════════════════
// CIRCUIT CONFIG  — /sections/circuit/circuit.config.js
// Single source of truth. Swap track by changing WAYPOINTS only.
// ══════════════════════════════════════════════════════════════════════════

window.CIRCUIT_CONFIG = {

    // ── TT Circuit Assen — waypoints (flat 2D, normalized 0–1)
    // Clockwise from S/F line. Generated from official circuit layout.
    // [x, y] in a unit square; renderer scales to canvas size.
    WAYPOINTS: [
        // [A] S/F Straight (top, going right)
        [0.10, 0.20], [0.28, 0.19], [0.48, 0.19], [0.68, 0.19], [0.84, 0.20],
        // T1 Geert Timmer — sweeping right
        [0.92, 0.22], [0.96, 0.28], [0.95, 0.36],
        // [C] De Strubben T2–T4 — tight S-chicane
        [0.90, 0.42],
        [0.84, 0.46], [0.80, 0.52], [0.83, 0.58], [0.88, 0.62], // right
        [0.86, 0.68], [0.79, 0.70], [0.73, 0.67], // left
        [0.70, 0.61], [0.72, 0.55], // right
        // [D] T5 Haarbocht
        [0.68, 0.50], [0.62, 0.47], [0.55, 0.48],
        // [E] Assen Corner T6–T7
        [0.49, 0.53], [0.46, 0.60], [0.50, 0.67],
        // [F] Ramshoek — tight right hairpin (the distinctive loop)
        [0.48, 0.73], [0.42, 0.79],
        [0.34, 0.84], [0.25, 0.86], [0.18, 0.83],
        [0.13, 0.76], [0.16, 0.68], [0.23, 0.63],
        // [G] Post-hairpin bottom section going right
        [0.30, 0.62], [0.36, 0.65], [0.42, 0.70],
        [0.48, 0.74], [0.55, 0.75], [0.62, 0.73],
        // [H] Duikersloot / Veensloot / Madijk
        [0.68, 0.69], [0.73, 0.63], [0.72, 0.56],
        [0.67, 0.50], [0.62, 0.44],
        // [I] Final straight — return to S/F
        [0.58, 0.36], [0.56, 0.28], [0.58, 0.22],
        [0.62, 0.20], [0.70, 0.19],
    ],

    // ── Section mapping (0–1 progress along the path)
    SECTIONS: [
        { id: 'hero',    progress: 0.00, label: null,      scrollTo: 'hero'    },
        { id: 'work',    progress: 0.28, label: 'WORK',    scrollTo: 'work'    },
        { id: 'about',   progress: 0.62, label: 'ABOUT',   scrollTo: 'contact' },
        { id: 'contact', progress: 0.88, label: 'CONTACT', scrollTo: 'contact' },
    ],

    // ── Colors
    COLOR: {
        trackSide:      '#1a1a1a',        // extrusion side wall
        trackTop:       'rgba(255,255,255,0.12)', // base track surface
        trackTopHover:  'rgba(255,255,255,0.22)',
        progress:       '#FF5509',        // progress stroke
        progressGlow:   'rgba(255,85,9,0.35)',
        rider:          '#FF5509',
        nodeDefault:    'rgba(255,255,255,0.5)',
        nodeActive:     '#FF5509',
        nodeHover:      '#ffffff',
        nodeBorder:     'rgba(255,255,255,0.2)',
        label:          '#ffffff',
        labelBg:        'rgba(15,15,15,0.88)',
    },

    // ── Track geometry
    TRACK: {
        width:          22,   // px — rendered track width on canvas
        extrudeHeight:  10,   // px — 3D extrusion depth (side wall)
        smoothSteps:    8,    // Catmull-Rom subdivision per segment
    },

    // ── Node sizes (canvas px)
    NODE: {
        radius:         7,
        radiusActive:   10,
        radiusHover:    9,
    },

    // ── Isometric transform
    ISO: {
        angleX: 54,   // degrees — forward tilt (pitch)
        angleZ: -30,  // degrees — rotation (yaw) - matches reference image angle
        scale:  1.1,  // overall scale after iso transform
    },

    // ── 3D tilt (mouse look)
    TILT: {
        maxDeg:  3.5,
        lerp:    0.05,
    },

    // ── Scroll
    SCROLL: {
        scrub: 1.2,
    },

    // ── Hover proximity (canvas px)
    HOVER_RADIUS: 30,
};
