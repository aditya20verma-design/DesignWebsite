// ─────────────────────────────────────────────────────────────────────────────
// manifesto.config.js — Ducati Panigale V4 R · Small Inline Signature
// ★ EDIT THIS FILE to tune camera, lighting, and interaction feel.
//
// Model facts (ducati_v4r.glb, confirmed by inspection):
//   GLTFLoader auto-corrects Sketchfab's -90° X wrapper.
//   fbx node applies 0.01 scale → loaded size ≈ 1.96W × 0.80H × 1.50D units.
//   Bike runs along Z-axis. rotationY: Math.PI points front toward camera.
//   22 materials, all OPAQUE. Material[1] "Vt_Liu" = Ducati red fairing.
//   No embedded cameras, lights, or animations.
// ─────────────────────────────────────────────────────────────────────────────

export const MANIFESTO_CONFIG = {

    // ── Model ─────────────────────────────────────────────────────────────────
    model: {
        path: 'sections/hero/assets/ducati_v4r.glb',

        // Target longest-axis size in Three.js world units after auto-fit scale.
        // Smaller = more breathing room. Increase if bike looks too small in canvas.
        targetSize: 1.7,

        // Initial orientation — the drag baseline the model returns toward.
        // Math.PI = front faces camera. Add/subtract to angle the bike slightly.
        // Current: PI * 0.88 shows front-left 3/4 (recognisable Ducati profile).
        rotationY: Math.PI * 0.88,
        rotationX: 0.04,   // very slight downward tilt — grounding
        rotationZ: 0.0,
    },

    // ── Camera — full-bike 3/4 silhouette at small scale ─────────────────────
    camera: {
        fov: 46,    // standard FOV — full bike visible without dramatic perspective

        // Slightly elevated, slightly to viewer's left → natural 3/4 profile view.
        // Tune Z (forward/backward) to frame more/less of the bike.
        position: { x: -0.15, y: 0.28, z: 1.55 },

        // Look at slightly above center-mass of the bike
        target:   { x: 0.0,  y: -0.05, z: 0.0 },
    },

    // ── Lighting — clean read against #141414, red fairing legible ────────────
    lighting: {
        // Ambient: very soft base so nothing is absolute black
        ambient: {
            skyColor:    0x1e1e1e,
            groundColor: 0x0a0a0a,
            intensity:   0.06,
        },

        // Key: upper-front — defines fairing and wheel
        key: {
            color:     0xfff8f4,   // warm white
            intensity: 1.8,        // strong read against dark bg
            position:  { x: -1.8, y: 2.2, z: 2.0 },
        },

        // Fill: right side, very low — prevent total black on shadow side
        fill: {
            color:     0xd0dde8,   // slightly cool
            intensity: 0.18,
            position:  { x: 2.0,  y: 0.6,  z: 1.2 },
        },

        // Rim: rear-lower — traces the silhouette edge
        rim: {
            color:     0xffffff,
            intensity: 0.45,
            position:  { x: 0.8,  y: -0.3, z: -1.8 },
        },

        // Key intensity during hover — subtle brightness hint (hover affordance)
        keyHoverIntensity:  2.1,    // 1.8 at rest → 2.1 on hover
        keyIntensityLerp:   0.08,   // speed of hover brightness transition (0–1)
    },

    // ── Interaction ───────────────────────────────────────────────────────────
    interaction: {
        // Drag sensitivity: radians per pixel dragged
        dragSensitivityX:  0.008,   // Y-axis rotation per horizontal px
        dragSensitivityY:  0.004,   // X-axis rotation per vertical px

        // Clamps for X-axis (vertical) rotation
        maxRotationX:  0.35,   // radians — about 20°
        minRotationX: -0.20,   // radians

        // Inertia after release: velocity multiplied each frame
        inertiaDamping: 0.88,   // 0 = no inertia, 1 = infinite spin

        // Velocity magnitude below which inertia loop stops
        inertiaThreshold: 0.0002,
    },

    // ── Performance ───────────────────────────────────────────────────────────
    performance: {
        // Pixel ratio cap for this tiny canvas
        maxPixelRatio: 2.0,

        // IntersectionObserver rootMargin for lazy-load trigger
        lazyLoadMargin: '300px',
    },
};
