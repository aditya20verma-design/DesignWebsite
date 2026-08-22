// ─────────────────────────────────────────────────────────────────────────────
// manifesto.js — Ducati Panigale V4 R · Inline Interactive Signature
//
// Concept: small personal 3D artifact sitting beside "Who Race".
// Interaction: drag-to-rotate with damped inertia.
// Performance: render-on-demand only — no permanent animation loop.
// Lazy-load: Three.js + GLB loaded only when section nears viewport.
// ─────────────────────────────────────────────────────────────────────────────

import { MANIFESTO_CONFIG as CFG } from './manifesto.config.js';

export function initManifesto() {

    // ── Bail early conditions ──────────────────────────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const row = document.querySelector('.manifesto-tagline-row');
    if (!row) return;

    // ── DOM: create wrapper + canvas, inject after tagline text ───────────────
    const wrap = document.createElement('div');
    wrap.className = 'manifesto-ducati-wrap';
    wrap.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.id = 'manifesto-ducati-canvas';
    wrap.appendChild(canvas);
    row.appendChild(wrap);

    // ── Three.js scene state ───────────────────────────────────────────────────
    let THREE       = null;
    let renderer    = null;
    let scene       = null;
    let camera      = null;
    let keyLight    = null;   // reference for hover brightness
    let bikeGroup   = null;   // pivot group for rotation
    let isLoaded    = false;
    let isVisible   = false;  // section in viewport?
    let threeLoaded = false;  // has dynamic import been triggered?

    // ── Render-on-demand state ─────────────────────────────────────────────────
    let rafId        = null;
    let needsRender  = false; // set true to trigger exactly one extra frame

    // ── Drag / rotation state ─────────────────────────────────────────────────
    let isDragging   = false;
    let dragStartX   = 0;
    let dragStartY   = 0;
    let rotationY    = CFG.model.rotationY;  // current Y (yaw)
    let rotationX    = CFG.model.rotationX;  // current X (pitch)
    let velocityY    = 0;
    let velocityX    = 0;
    let prevDragX    = 0;
    let prevDragY    = 0;

    // ── Hover brightness state ─────────────────────────────────────────────────
    let isHovered           = false;
    let currentKeyIntensity = CFG.lighting.key.intensity;
    let targetKeyIntensity  = CFG.lighting.key.intensity;

    // ─────────────────────────────────────────────────────────────────────────
    // Lazy-load: trigger Three.js + model only when section nears viewport
    // ─────────────────────────────────────────────────────────────────────────
    const loadObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !threeLoaded) {
            threeLoaded = true;
            loadObserver.disconnect();
            loadThreeAndModel();
        }
    }, { rootMargin: CFG.performance.lazyLoadMargin });
    loadObserver.observe(row);

    // ─────────────────────────────────────────────────────────────────────────
    // Visibility: pause render loop when section not in viewport
    // ─────────────────────────────────────────────────────────────────────────
    const visObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if (!isVisible) stopLoop();
    }, { threshold: 0 });
    visObserver.observe(row);

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic import — importmap in index.html resolves bare specifiers
    // ─────────────────────────────────────────────────────────────────────────
    async function loadThreeAndModel() {
        try {
            THREE                    = await import('three');
            const { GLTFLoader }     = await import('three/addons/loaders/GLTFLoader.js');
            const { DRACOLoader }    = await import('three/addons/loaders/DRACOLoader.js');
            buildScene(GLTFLoader, DRACOLoader);
        } catch (err) {
            console.warn('[Manifesto] Three.js load failed:', err);
            wrap.style.display = 'none';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Build scene
    // ─────────────────────────────────────────────────────────────────────────
    function buildScene(GLTFLoader, DRACOLoader) {
        const dpr = Math.min(window.devicePixelRatio, CFG.performance.maxPixelRatio);

        // Renderer — alpha: true for transparent background
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(dpr);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping      = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.setClearColor(0x000000, 0); // fully transparent

        // Scene
        scene = new THREE.Scene();

        // Camera
        const cp = CFG.camera.position;
        camera = new THREE.PerspectiveCamera(CFG.camera.fov, 1, 0.01, 50);
        camera.position.set(cp.x, cp.y, cp.z);

        // Lights
        const la = CFG.lighting.ambient;
        scene.add(new THREE.HemisphereLight(la.skyColor, la.groundColor, la.intensity));

        const lk = CFG.lighting.key;
        keyLight = new THREE.DirectionalLight(lk.color, lk.intensity);
        keyLight.position.set(lk.position.x, lk.position.y, lk.position.z);
        scene.add(keyLight);

        const lf = CFG.lighting.fill;
        const fillLight = new THREE.DirectionalLight(lf.color, lf.intensity);
        fillLight.position.set(lf.position.x, lf.position.y, lf.position.z);
        scene.add(fillLight);

        const lr = CFG.lighting.rim;
        const rimLight = new THREE.DirectionalLight(lr.color, lr.intensity);
        rimLight.position.set(lr.position.x, lr.position.y, lr.position.z);
        scene.add(rimLight);

        // Initial camera target
        const ct = CFG.camera.target;
        camera.lookAt(ct.x, ct.y, ct.z);

        // Resize observer — keep canvas filling the wrapper
        new ResizeObserver(onResize).observe(wrap);
        onResize();

        // Load GLB
        const loader = new GLTFLoader();
        const draco  = new DRACOLoader();
        draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.167.0/examples/jsm/libs/draco/');
        loader.setDRACOLoader(draco);

        loader.load(
            CFG.model.path,
            onModelLoaded,
            undefined,
            (err) => {
                console.warn('[Manifesto] Model failed to load:', err);
                wrap.style.display = 'none';
            }
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Model loaded
    // ─────────────────────────────────────────────────────────────────────────
    function onModelLoaded(gltf) {
        const model = gltf.scene;

        // Auto-fit: scale so longest axis = CFG.model.targetSize
        const box    = new THREE.Box3().setFromObject(model);
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(CFG.model.targetSize / maxDim);

        // Re-centre at geometric origin
        const cBox   = new THREE.Box3().setFromObject(model);
        const centre = cBox.getCenter(new THREE.Vector3());
        model.position.sub(centre);

        // Apply initial orientation from config
        model.rotation.set(CFG.model.rotationX, CFG.model.rotationY, CFG.model.rotationZ);

        // Pivot group — drag rotations applied here so model offset is preserved
        bikeGroup = new THREE.Group();
        bikeGroup.add(model);
        scene.add(bikeGroup);

        isLoaded = true;

        // Render one initial frame then let canvas fade in
        renderOnce();
        requestAnimationFrame(() => {
            canvas.style.opacity = '1';
        });

        // Wire up interaction now that model is ready
        bindInteraction();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render-on-demand helpers
    // ─────────────────────────────────────────────────────────────────────────
    function renderOnce() {
        if (!isLoaded || !renderer || !scene || !camera) return;
        applyRotation();
        renderer.render(scene, camera);
    }

    function startLoop() {
        if (!rafId) rafId = requestAnimationFrame(renderLoop);
    }

    function stopLoop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function renderLoop() {
        rafId = null;

        if (!isLoaded || !isVisible) return;

        // ── Inertia ────────────────────────────────────────────────────────────
        if (!isDragging) {
            velocityY *= CFG.interaction.inertiaDamping;
            velocityX *= CFG.interaction.inertiaDamping;
            rotationY += velocityY;
            rotationX += velocityX;
            rotationX = Math.max(CFG.interaction.minRotationX,
                        Math.min(CFG.interaction.maxRotationX, rotationX));
        }

        // ── Hover brightness lerp ──────────────────────────────────────────────
        const brightnessDiff = Math.abs(targetKeyIntensity - currentKeyIntensity);
        if (brightnessDiff > 0.005) {
            currentKeyIntensity += (targetKeyIntensity - currentKeyIntensity) * CFG.lighting.keyIntensityLerp;
            if (keyLight) keyLight.intensity = currentKeyIntensity;
        }

        // Apply rotation and render
        applyRotation();
        renderer.render(scene, camera);

        // Continue loop only if still needed
        const velMag = Math.abs(velocityY) + Math.abs(velocityX);
        const hoverTransitioning = brightnessDiff > 0.005;

        if (isDragging || velMag > CFG.interaction.inertiaThreshold || hoverTransitioning) {
            rafId = requestAnimationFrame(renderLoop);
        }
    }

    function applyRotation() {
        if (!bikeGroup) return;
        bikeGroup.rotation.y = rotationY;
        bikeGroup.rotation.x = rotationX;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Resize
    // ─────────────────────────────────────────────────────────────────────────
    function onResize() {
        if (!renderer || !camera) return;
        const w = wrap.offsetWidth;
        const h = wrap.offsetHeight;
        if (w === 0 || h === 0) return;

        renderer.setSize(w, h, false); // false = don't override CSS width/height
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        if (isLoaded) renderOnce(); // re-render at new size
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Interaction — pointer (desktop) and touch (mobile)
    // ─────────────────────────────────────────────────────────────────────────
    function bindInteraction() {

        // ── Hover ────────────────────────────────────────────────────────────
        wrap.addEventListener('pointerenter', () => {
            isHovered = true;
            targetKeyIntensity = CFG.lighting.keyHoverIntensity;
            if (isVisible) startLoop(); // will run until hover transition complete
        });

        wrap.addEventListener('pointerleave', () => {
            if (isDragging) return; // keep state until drag ends
            isHovered = false;
            targetKeyIntensity = CFG.lighting.key.intensity;
            if (isVisible) startLoop();
        });

        // ── Pointer (desktop + pen) ───────────────────────────────────────────
        wrap.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') return; // handled by touch events
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
            wrap.setPointerCapture(e.pointerId);
            wrap.classList.add('is-dragging');
        });

        wrap.addEventListener('pointermove', (e) => {
            if (!isDragging || e.pointerType === 'touch') return;
            moveDrag(e.clientX, e.clientY);
        });

        wrap.addEventListener('pointerup', (e) => {
            if (!isDragging || e.pointerType === 'touch') return;
            endDrag();
            wrap.classList.remove('is-dragging');
            // Revert hover state if cursor left during drag
            if (!isHovered) targetKeyIntensity = CFG.lighting.key.intensity;
        });

        wrap.addEventListener('pointercancel', () => {
            if (!isDragging) return;
            endDrag();
            wrap.classList.remove('is-dragging');
        });

        // ── Touch (mobile) ────────────────────────────────────────────────────
        wrap.addEventListener('touchstart', (e) => {
            e.preventDefault(); // prevent scroll takeover
            const t = e.touches[0];
            startDrag(t.clientX, t.clientY);
        }, { passive: false });

        wrap.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const t = e.touches[0];
            moveDrag(t.clientX, t.clientY);
        }, { passive: false });

        wrap.addEventListener('touchend', () => {
            if (!isDragging) return;
            endDrag();
        });
    }

    function startDrag(clientX, clientY) {
        isDragging = true;
        dragStartX = clientX;
        dragStartY = clientY;
        prevDragX  = clientX;
        prevDragY  = clientY;
        velocityY  = 0;
        velocityX  = 0;
        if (isVisible) startLoop();
    }

    function moveDrag(clientX, clientY) {
        const dx = clientX - prevDragX;
        const dy = clientY - prevDragY;

        velocityY  = dx * CFG.interaction.dragSensitivityX;
        velocityX  = dy * CFG.interaction.dragSensitivityY;

        rotationY += velocityY;
        rotationX += velocityX;
        rotationX  = Math.max(CFG.interaction.minRotationX,
                     Math.min(CFG.interaction.maxRotationX, rotationX));

        prevDragX = clientX;
        prevDragY = clientY;
    }

    function endDrag() {
        isDragging = false;
        // velocityY and velocityX carry into inertia — loop continues
    }
}
