/**
 * ── Minimalist Ultra-Subtle Liquid Ribbon Mouse Trail ───────────────────────
 * 40% Longer, fluid mass-spring continuous curve following cursor movement.
 * Zero breaks, zero dots.
 * Automatically adapts between Signature Accent Orange (#FF5509) on dark backgrounds
 * and Deep Obsidian Charcoal (#111111) on light backgrounds.
 * ──────────────────────────────────────────────────────────────────────────
 */

export function initMouseTrail() {
    // Disable on touch / mobile or when user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.isTouchDevice || window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        return;
    }

    // Create Canvas Element
    const canvas = document.createElement('canvas');
    canvas.id = 'mouse-trail-canvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '9997'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // 40% Longer trail node count (20 nodes vs 14 nodes)
    const NUM_NODES = 20;
    const nodes = [];
    let targetX = width / 2;
    let targetY = height / 2;
    let isMoving = false;
    let idleTimer = null;
    let trailAlpha = 0;

    for (let i = 0; i < NUM_NODES; i++) {
        nodes.push({ x: targetX, y: targetY });
    }

    // Background Luminance Sensing state for Adaptive Contrast
    let isLightBg = false;
    let colorLerpFactor = 0; // 0 = Dark BG (Orange), 1 = Light BG (Obsidian)
    let lastSenseTime = 0;

    function senseBackground() {
        const now = performance.now();
        if (now - lastSenseTime < 80) return;
        lastSenseTime = now;

        const stack = document.elementsFromPoint(targetX, targetY);
        let lum = null;
        for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (el === canvas || el.classList.contains('cursor-dot') || el.classList.contains('cursor-outline')) continue;
            const bg = getComputedStyle(el).backgroundColor;
            if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
            const m = bg.match(/\d+\.?\d*/g);
            if (m && m.length >= 3) {
                lum = 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2];
                break;
            }
        }

        if (lum === null) {
            const bodyBg = getComputedStyle(document.body).backgroundColor;
            const m = bodyBg.match(/\d+\.?\d*/g);
            lum = m && m.length >= 3 ? 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2] : 0;
        }

        isLightBg = lum > 140;
    }

    window.addEventListener('mousemove', (e) => {
        if (e._isAutoPan) return;
        targetX = e.clientX;
        targetY = e.clientY;
        isMoving = true;

        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            isMoving = false;
        }, 150);
    }, { passive: true });

    // Main Render Loop
    function render() {
        ctx.clearRect(0, 0, width, height);

        // Smooth opacity transition on mouse activity
        const targetAlpha = isMoving ? 1.0 : 0.0;
        trailAlpha += (targetAlpha - trailAlpha) * 0.12;

        // Background Contrast Color Lerping
        senseBackground();
        const targetColorLerp = isLightBg ? 1.0 : 0.0;
        colorLerpFactor += (targetColorLerp - colorLerpFactor) * 0.12;

        // Mass-Spring Physics across nodes (Node 0 locked to pointer center)
        nodes[0].x = targetX;
        nodes[0].y = targetY;

        for (let i = 1; i < NUM_NODES; i++) {
            const prev = nodes[i - 1];
            const curr = nodes[i];
            const ease = 0.52 - (i / NUM_NODES) * 0.20;
            curr.x += (prev.x - curr.x) * ease;
            curr.y += (prev.y - curr.y) * ease;
        }

        // Render ONE single thin continuous unbroken path
        if (trailAlpha > 0.01) {
            ctx.save();

            const head = nodes[0];
            const tail = nodes[NUM_NODES - 1];

            // Linear gradient along head-to-tail vector
            const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);

            const r = Math.round(255 * (1 - colorLerpFactor) + 17 * colorLerpFactor);
            const g = Math.round(100 * (1 - colorLerpFactor) + 17 * colorLerpFactor);
            const b = Math.round(20 * (1 - colorLerpFactor) + 17 * colorLerpFactor);

            // Subtle, premium opacity gradient
            const startAlpha = 0.70 * trailAlpha;
            const midAlpha = 0.32 * trailAlpha;
            const endAlpha = 0.0;

            grad.addColorStop(0.0, `rgba(${r}, ${g}, ${b}, ${startAlpha})`);
            grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${midAlpha})`);
            grad.addColorStop(1.0, `rgba(${r}, ${g}, ${b}, ${endAlpha})`);

            ctx.beginPath();
            ctx.moveTo(nodes[0].x, nodes[0].y);

            for (let i = 1; i < NUM_NODES - 1; i++) {
                const xc = (nodes[i].x + nodes[i + 1].x) / 2;
                const yc = (nodes[i].y + nodes[i + 1].y) / 2;
                ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
            }
            ctx.lineTo(nodes[NUM_NODES - 1].x, nodes[NUM_NODES - 1].y);

            // Thin, subtle stroke width (1.2px)
            ctx.lineWidth = Math.max(0.75, 1.35 * trailAlpha);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = grad;
            ctx.shadowColor = isLightBg ? 'transparent' : 'rgba(255, 85, 9, 0.4)';
            ctx.shadowBlur = isLightBg ? 0 : 3;

            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    render();
}
