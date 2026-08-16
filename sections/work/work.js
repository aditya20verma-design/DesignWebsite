// ─────────────────────────────────────────────────────────────────────────────
// work.js — Precision Top-Left Anchored Cinematic Story Strip & More Work Grid
// ─────────────────────────────────────────────────────────────────────────────
// Architecture:
// - Absolute top-left text positioning (.fw-panel-content at z-index: 10).
// - Atmospheric fades (.fw-fade-top, .fw-fade-bottom at z-index: 3, behind text).
// - Neutral hairline strokes (.fw-panel-stroke-left, .fw-panel-stroke-right).
// - Clean index display ("01", "02", "03", "04", "05" without "/05").
// - No dots/carousel navigator.
// ─────────────────────────────────────────────────────────────────────────────

import { PROJECTS_DATA } from './projects.data.js';

// ── Constants ───────────────────────────────────────────────────────────────
const FEATURED_COUNT = 5;
const PANEL_FLEX_ACTIVE = 3.5;   // ~52% width of 5-panel stage
const PANEL_FLEX_INACTIVE = 0.8; // ~12% width each for remaining 4
const TRANSITION_DURATION = 0.65;
const TRANSITION_EASE = 'power3.out';

// ── State ───────────────────────────────────────────────────────────────────
let activeProject = 0;
let clickActivatedIndex = -1;
let pendingActiveIndex = -1;
let isHovering = false;
let isDOMScrolling = false;
let panels = [];
let scrollTriggerInstance = null;
const isMobile = () => window.innerWidth <= 768;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('scroll', () => {
    isDOMScrolling = true;
    requestAnimationFrame(() => { isDOMScrolling = false; });
}, { passive: true });

// ══════════════════════════════════════════════════════════════════════════════
// RENDER — Build DOM
// ══════════════════════════════════════════════════════════════════════════════

function renderSectionHeader() {
    return `
        <header class="work-section-header">
            <div class="work-header-inner">
                <p class="work-header-eyebrow">FEATURED WORK</p>
                <h2 class="work-header-title">Products, systems and experiences shaped across <span class="font-accent">healthcare, fintech, mobility</span> and beyond.</h2>
            </div>
        </header>
    `;
}

function renderFeaturedPanel(project, index) {
    const tags = project.tags.map(t => `<span class="fw-panel-tag">${t}</span>`).join('');
    return `
        <a href="${project.caseStudyUrl}" 
           class="fw-panel ${index === 0 ? 'is-active' : ''}"
           id="project-${project.id}"
           data-project-index="${index}"
           data-project-id="${project.id}"
           tabindex="0"
           aria-label="${project.title} — ${project.company}">
            <div class="fw-panel-art">
                <img src="${project.image}"
                     alt="${project.title}"
                     loading="eager"
                     draggable="false">
            </div>
            <div class="fw-panel-scrim"></div>
            <div class="fw-panel-stroke-left"></div>
            <div class="fw-panel-stroke-right"></div>
            <div class="fw-panel-content">
                <div class="fw-panel-header">
                    <span class="fw-panel-number">${project.number}</span>
                    <span class="fw-panel-company">${project.company}</span>
                </div>
                <h3 class="fw-panel-title">${project.title}</h3>
                <div class="fw-panel-expanded">
                    <p class="fw-panel-hook">${project.hook}</p>
                    <div class="fw-panel-tags">${tags}</div>
                    <span class="fw-panel-cta">
                        VIEW CASE STUDY <span class="cta-arrow">↗</span>
                    </span>
                </div>
            </div>
        </a>
    `;
}

function renderFeaturedStage(featured) {
    const panelsMarkup = featured.map((p, i) => renderFeaturedPanel(p, i)).join('');

    return `
        <div class="fw-pin-outer" id="fw-pin-outer">
        <div class="fw-stage-wrap" id="fw-stage-wrap">
            <div class="fw-heading-bg" id="fw-heading-bg">
                <div class="fw-heading-content">
                    <h2 class="fw-brier-title">
                        <span class="fw-brier-line fw-line-brier">Projects worth</span>
                        <span class="fw-brier-line fw-line-regular">slowing down for.</span>
                    </h2>
                    <p class="fw-heading-body">Product thinking, sharp interfaces, and a little obsession with the details.</p>
                </div>
            </div>
            <div class="fw-stage" id="fw-stage">
                ${panelsMarkup}
            </div>
        </div>
        </div>
    `;
}

function renderMoreWorkCard(project) {
    return `
        <article class="mw-card hover-trigger"
                 id="project-${project.id}"
                 tabindex="0">
            <a href="${project.caseStudyUrl}"
               class="mw-card-link"
               data-cursor="pill"
               data-cursor-label="View case study ↗"
               aria-label="${project.title} Case Study">
                <div class="mw-card-media">
                    <span class="mw-card-bg-num">${project.number}</span>
                    <img src="${project.image}"
                         alt="${project.title}"
                         loading="lazy"
                         draggable="false">
                </div>
                <div class="mw-card-info">
                    <span class="mw-card-num">${project.number}</span>
                    <h4 class="mw-card-title">${project.title}</h4>
                    <span class="mw-card-company">${project.company}</span>
                    <p class="mw-card-hook">${project.hook}</p>
                    <span class="mw-card-cta">VIEW CASE STUDY <span class="cta-arrow">↗</span></span>
                </div>
            </a>
        </article>
    `;
}

function renderMoreWork(moreProjects) {
    const cards = moreProjects.map(p => renderMoreWorkCard(p)).join('');
    return `
        <div class="mw-section" id="more-work">
            <div class="mw-header">
                <span class="mw-eyebrow">MORE WORK</span>
                <span class="mw-divider"></span>
            </div>
            <div class="mw-grid">${cards}</div>
        </div>
    `;
}


// ══════════════════════════════════════════════════════════════════════════════
// STATE — Single source of truth
// ══════════════════════════════════════════════════════════════════════════════

const PROXIMITY_RADIUS = 140; // max proximity radius in px

function resetPanelStrokes() {
    panels.forEach(p => {
        p.style.removeProperty('--stroke-left-color');
        p.style.removeProperty('--stroke-right-color');
    });
}

function updateActiveStrokeProximity(e) {
    if (prefersReducedMotion() || isMobile()) return;

    const activePanel = panels[activeProject];
    if (!activePanel) return;

    const rect = activePanel.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const clampY = Math.max(rect.top, Math.min(rect.bottom, clientY));

    const distLeft = Math.hypot(clientX - rect.left, clientY - clampY);
    const distRight = Math.hypot(clientX - rect.right, clientY - clampY);

    const calculateStrokeColor = (dist) => {
        if (dist >= PROXIMITY_RADIUS) return 'rgba(255, 255, 255, 0.22)';

        const norm = 1 - dist / PROXIMITY_RADIUS;
        const p = norm * norm; // Smooth power falloff

        // Max 10-15% subtle orange warmth tint towards #FF5509
        const r = 255;
        const g = Math.round(255 - p * 38);  // 255 -> 217
        const b = Math.round(255 - p * 80);  // 255 -> 175
        const alpha = (0.22 + p * 0.20).toFixed(3); // 0.22 -> 0.42

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    activePanel.style.setProperty('--stroke-left-color', calculateStrokeColor(distLeft));
    activePanel.style.setProperty('--stroke-right-color', calculateStrokeColor(distRight));
}

// ── Fixed Track Geometry Helper ─────────────────────────────────────────────
function getLayoutGeometry() {
    const stage = document.querySelector('.fw-stage');
    if (!stage) return null;

    const W = stage.clientWidth || window.innerWidth;
    const g = Math.max(4, Math.min(window.innerWidth * 0.005, 8));
    const totalGutters = 4 * g;
    const W_avail = Math.max(0, W - totalGutters);

    const ratioActive = 3.5;
    const ratioCollapsed = 0.8;
    const totalRatio = ratioActive + 4 * ratioCollapsed; // 6.7

    const wActive = (ratioActive / totalRatio) * W_avail;
    const wCollapsed = (ratioCollapsed / totalRatio) * W_avail;
    const deltaW = wActive - wCollapsed;

    return { W, g, wActive, wCollapsed, deltaW };
}

function getPanelX(i, activeIdx, geom) {
    if (!geom) return 0;
    const { g, wCollapsed, deltaW } = geom;
    const active = activeIdx < 0 ? 0 : activeIdx;
    const base = i * (wCollapsed + g);
    return i > active ? base + deltaW : base;
}

function setActiveProject(index, animate = true) {
    if (index >= FEATURED_COUNT) return;
    const targetIdx = index < 0 ? 0 : index;

    resetPanelStrokes();
    activeProject = targetIdx;

    const geom = getLayoutGeometry();
    if (!geom) return;

    panels.forEach((panel, i) => {
        const isActive = i === activeProject;
        panel.classList.toggle('is-active', isActive);

        if (isMobile()) return;

        // Skip explicit JS/GSAP manipulation if the ScrollTrigger entrance is still active.
        // The ScrollTrigger's dynamic interpolator perfectly owns the composition logic.
        if (!window.fwEntranceSettled) return;

        const targetX = getPanelX(i, activeProject, geom);
        const targetWidth = isActive ? geom.wActive : geom.wCollapsed;

        if (animate && typeof gsap !== 'undefined' && !prefersReducedMotion()) {
            if (panel._hoverTween) panel._hoverTween.kill();
            
            panel._hoverTween = gsap.to(panel, {
                x: targetX,
                width: targetWidth,
                duration: TRANSITION_DURATION,
                ease: TRANSITION_EASE,
                overwrite: 'auto'
            });
        } else {
            gsap.set(panel, {
                x: targetX,
                width: targetWidth
            });
        }
    });
}


// ══════════════════════════════════════════════════════════════════════════════
// INTERACTION — Hover + Scroll + Keyboard
// ══════════════════════════════════════════════════════════════════════════════

function initPanelInteraction() {
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    panels.forEach((panel, index) => {
        if (supportsHover && !isMobile()) {
            panel.addEventListener('mouseenter', () => {
                if (!window.fwEntranceSettled) return;
                isHovering = true;
                setActiveProject(index);
            });

            const contentArea = panel.querySelector('.fw-panel-content');
            if (contentArea) {
                contentArea.addEventListener('mouseenter', () => {
                    if (panel.classList.contains('is-active') && window._cursorEnterPill) {
                        window._cursorEnterPill('View case study ↗');
                    }
                });

                contentArea.addEventListener('mouseleave', () => {
                    if (window._cursorLeavePill) window._cursorLeavePill();
                });
            }
        }

        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (!panel.classList.contains('is-active')) {
                    e.preventDefault();
                    setActiveProject(index);
                } else if (e.key === ' ') {
                    e.preventDefault();
                    window.location.href = panel.href;
                }
            }
            if (e.key === 'ArrowRight' && index < FEATURED_COUNT - 1) {
                e.preventDefault();
                panels[index + 1].focus();
                setActiveProject(index + 1);
            }
            if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                panels[index - 1].focus();
                setActiveProject(index - 1);
            }
        });

        panel.addEventListener('focus', () => {
            if (!isMobile()) setActiveProject(index);
        });

        panel.addEventListener('click', (e) => {
            if (!window.fwEntranceSettled) {
                e.preventDefault();
                pendingActiveIndex = index;
                
                if (window.fwScrollTriggers && window.fwScrollTriggers.length > 0) {
                    const st = window.fwScrollTriggers[0];
                    const targetScroll = st.start + (st.end - st.start) * 0.95 + 2; // +2px to guarantee progress >= 1
                    
                    if (window.__lenisInstance) {
                        window.__lenisInstance.scrollTo(targetScroll, { 
                            duration: 1.0, 
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
                        });
                    } else {
                        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                    }
                }
                return;
            }

            if (clickActivatedIndex !== index) {
                e.preventDefault();
                clickActivatedIndex = index;
                setActiveProject(index);
            }
        });
    });



    const stage = document.getElementById('fw-stage');
    const stageWrap = document.getElementById('fw-stage-wrap');

    if (stage && supportsHover && !isMobile()) {
        stage.addEventListener('mouseleave', () => {
            const isLenisScrolling = window.__lenisInstance && window.__lenisInstance.isScrolling;
            if (isLenisScrolling || isDOMScrolling) return;

            if (!window.fwEntranceSettled) return;
            isHovering = false;
            resetPanelStrokes();
            setActiveProject(0);
        });
    }

    if (stageWrap && supportsHover && !isMobile()) {
        stageWrap.addEventListener('mousemove', (e) => {
            if (isHovering && window.fwEntranceSettled) {
                updateActiveStrokeProximity(e);
            }
        }, { passive: true });
    }

    window.addEventListener('resize', () => {
        if (window.fwEntranceSettled) {
            setActiveProject(activeProject, false);
        }
    });
}


// ══════════════════════════════════════════════════════════════════════════════
// SCROLL — GSAP ScrollTrigger Pinned Progression
// ══════════════════════════════════════════════════════════════════════════════

function initScrollProgression() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (isMobile()) return;
    if (prefersReducedMotion()) return;

    const pinOuter = document.getElementById('fw-pin-outer');
    const stageWrap = document.getElementById('fw-stage-wrap');
    if (!pinOuter || !stageWrap) return;

    // Kill any previous instances
    if (window.fwScrollTriggers) {
        window.fwScrollTriggers.forEach(t => t.kill());
    }
    window.fwScrollTriggers = [];

    const headingBg = document.getElementById('fw-heading-bg');
    const stage = document.querySelector('.fw-stage');
    const panelEls = Array.from(document.querySelectorAll('.fw-panel'));

    if (!headingBg || !stage || panelEls.length < 5) return;

    window.fwEntranceSettled = false;

    const geom = getLayoutGeometry();
    if (!geom) return;

    const g = geom.g;

    // ── FINAL SETTLED STATE ──
    const settledX = panelEls.map((_, i) => getPanelX(i, 0, geom));
    const wChunk1 = headingBg.offsetWidth || Math.min(geom.W * 0.38, 520);
    const headingLeft = parseFloat(window.getComputedStyle(headingBg).left) || 0;

    // ── INITIAL STATE (t = 0) ──
    // Train entering from RIGHT side. 
    // Option B: Shifted back to 85vw so it only slightly peeks during the vertical entry scroll.
    const chunk1StartX = geom.W * 0.85;
    
    // The physical right edge of Chunk 1 on screen is (chunk1StartX + headingLeft) + wChunk1.
    // The deck must start exactly `chunkGap` pixels to the right of this physical edge.
    const chunkGap = 64; // Maximum gap from design system (--space-16)
    const deckStartX = chunk1StartX + headingLeft + wChunk1 + chunkGap;

    // Deck is fanned (16px offset)
    const FAN_OFFSET = 16;
    const initialCardX = panelEls.map((_, i) => deckStartX + i * FAN_OFFSET);

    // Set Initial CSS
    gsap.set(headingBg, { x: chunk1StartX, opacity: 1 });
    panelEls.forEach((panel, i) => {
        gsap.set(panel, { 
            x: initialCardX[i], 
            width: geom.wCollapsed 
        });
    });
    gsap.set(stage, { x: 0 });

    // ── PREPARE HEIGHT BUDGET ──
    // Activate the reserved scroll height (280vh) BEFORE creating the trigger.
    // This allows the timeline's 'bottom bottom' math to perfectly map the entire distance.
    if (pinOuter) pinOuter.classList.add('is-pinned');

    // ── ONE AUTHORITATIVE MASTER SCROLL TIMELINE ──
    // Uses dynamic interpolation to guarantee smooth reverse scrubs from ANY active hover state.
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: pinOuter,
            start: 'top bottom',  
            end: 'bottom bottom', 
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // ANIM_DUR maps the untacking sequence to 95% of the scroll range
                let p = self.progress / 0.95;
                if (p > 1) p = 1;

                if (p >= 1 && !window.fwEntranceSettled) {
                    window.fwEntranceSettled = true;
                    
                    if (pendingActiveIndex !== -1) {
                        activeProject = pendingActiveIndex;
                        clickActivatedIndex = pendingActiveIndex;
                        pendingActiveIndex = -1;
                        setActiveProject(activeProject, true); // Animate expansion
                    } else {
                        // Ensure the visual state perfectly matches the active class states
                        setActiveProject(activeProject === -1 ? 0 : activeProject, false);
                    }
                } else if (p < 1 && window.fwEntranceSettled) {
                    window.fwEntranceSettled = false;
                    
                    // Immediately kill active hover tweens and remove classes for reverse scrub
                    panelEls.forEach(panel => {
                        panel.classList.remove('is-active');
                        if (panel._hoverTween) {
                            panel._hoverTween.kill();
                            panel._hoverTween = null;
                        }
                    });
                }

                if (!window.fwEntranceSettled) {
                    // ── DYNAMIC INTERPOLATION ──
                    // By interpolating towards the LAST KNOWN active project, we guarantee that 
                    // scrolling backwards never causes a violent snap back to Card 0.
                    const targetActive = activeProject === -1 ? 0 : activeProject;
                    const currentSettledX = panelEls.map((_, i) => getPanelX(i, targetActive, geom));
                    const currentChunk1EndX = currentSettledX[0] - wChunk1 - chunkGap - headingLeft;

                    // Interpolate Heading
                    const headingX = chunk1StartX + (currentChunk1EndX - chunk1StartX) * p;
                    gsap.set(headingBg, { x: headingX });

                    // Interpolate Cards
                    panelEls.forEach((panel, i) => {
                        const currentX = initialCardX[i] + (currentSettledX[i] - initialCardX[i]) * p;
                        const targetW = i === targetActive ? geom.wActive : geom.wCollapsed;
                        const currentW = geom.wCollapsed + (targetW - geom.wCollapsed) * p;
                        
                        gsap.set(panel, { x: currentX, width: currentW });
                    });
                }
            },
            onLeaveBack: () => {
                window.fwEntranceSettled = false;
                activeProject = -1; // Reset memory so next entry defaults to Card 0
                pendingActiveIndex = -1;
            }
        }
    });

    // Dummy tween to force timeline to consume the full scrub range
    tl.to({}, { duration: 1 });

    window.fwScrollTriggers.push(tl.scrollTrigger);
}



// ══════════════════════════════════════════════════════════════════════════════
// CURSOR & NAVIGATION HOOKS
// ══════════════════════════════════════════════════════════════════════════════

function initCursorIntegration() {
    document.querySelectorAll('#work [data-cursor="pill"]').forEach(el => {
        if (el._cursorBound) return;
        el._cursorBound = true;
        const label = el.dataset.cursorLabel || 'View project';
        el.addEventListener('mouseenter', () => {
            if (window._cursorEnterPill) window._cursorEnterPill(label);
        });
        el.addEventListener('mouseleave', () => {
            if (window._cursorLeavePill) window._cursorLeavePill();
        });
    });
}

function initCaseStudyNavigation() {
    document.querySelectorAll('#work a[href*="projects/"]').forEach(link => {
        link.addEventListener('click', () => {
            const card = link.closest('.mw-card') || link.closest('.fw-panel');
            if (card && card.id) {
                sessionStorage.setItem('last_clicked_project_card', card.id);
            } else if (card && card.dataset.projectId) {
                sessionStorage.setItem('last_clicked_project_card', `project-${card.dataset.projectId}`);
            }
        });
    });

    const savedCardId = sessionStorage.getItem('last_clicked_project_card');
    if (savedCardId) {
        sessionStorage.removeItem('last_clicked_project_card');
        const targetCard = document.getElementById(savedCardId);
        if (targetCard) {
            setTimeout(() => {
                if (window.__lenisInstance) {
                    window.__lenisInstance.scrollTo(targetCard, { immediate: false, duration: 0.8, offset: -90 });
                } else {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }
}

function initEntranceAnimations() {
    if (typeof gsap === 'undefined') return;
    if (prefersReducedMotion()) return;

    document.querySelectorAll('.mw-card').forEach((card) => {
        gsap.fromTo(card,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
}

function initArrowAnimations() {
    document.querySelectorAll('#work .cta-arrow').forEach((arrow) => {
        if (arrow.dataset.wipeInitialized) return;
        arrow.dataset.wipeInitialized = 'true';

        const rawText = arrow.textContent.trim();
        const char = rawText || '↗';
        arrow.innerHTML = '';
        arrow.style.cssText = 'position:relative; display:inline-flex; width:1em; height:1em; align-items:center; justify-content:center; overflow:hidden;';

        const arr1 = document.createElement('span');
        const arr2 = document.createElement('span');
        arr1.textContent = arr2.textContent = char;
        arr1.style.position = arr2.style.position = 'absolute';

        const outX = '100%', outY = '-100%', inX = '-100%', inY = '100%';

        if (typeof gsap !== 'undefined') {
            gsap.set(arr2, { x: inX, y: inY });
        }
        arrow.append(arr1, arr2);

        const parentLink = arrow.closest('a');
        if (parentLink && typeof gsap !== 'undefined') {
            parentLink.addEventListener('mouseenter', () => {
                gsap.to(arr1, { x: outX, y: outY, duration: 0.4, ease: 'cubic-bezier(0.2, 0, 0, 1)' });
                gsap.to(arr2, { x: '0%', y: '0%', duration: 0.4, ease: 'cubic-bezier(0.2, 0, 0, 1)' });
            });
            parentLink.addEventListener('mouseleave', () => {
                gsap.to(arr1, { x: '0%', y: '0%', duration: 0.4, ease: 'cubic-bezier(0.2, 0, 0, 1)' });
                gsap.to(arr2, { x: inX, y: inY, duration: 0.4, ease: 'cubic-bezier(0.2, 0, 0, 1)' });
            });
        }
    });
}

function initResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) {
                initScrollProgression();
            } else if (scrollTriggerInstance) {
                scrollTriggerInstance.kill();
                scrollTriggerInstance = null;
                const pinOuter = document.getElementById('fw-pin-outer');
                if (pinOuter) pinOuter.classList.remove('is-pinned');
                panels.forEach(panel => {
                    panel.style.flex = '';
                });
            }
        }, 250);
    }, { passive: true });
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN INITIALIZER
// ══════════════════════════════════════════════════════════════════════════════

export function initWorkStage() {
    const panels = document.querySelectorAll('.fw-panel');
    if (!panels.length) return;

    // Reset flex to inactive by default for the entrance animation
    clickActivatedIndex = -1;
    setActiveProject(-1, false);
}

export function initWork() {
    const workInner = document.getElementById('work-inner');
    if (!workInner) return;

    const featured = PROJECTS_DATA.filter(p => p.featured);
    const more = PROJECTS_DATA.filter(p => !p.featured);

    workInner.innerHTML =
        renderFeaturedStage(featured) +
        renderMoreWork(more);

    panels = Array.from(document.querySelectorAll('.fw-panel'));

    setActiveProject(0, false);
    initPanelInteraction();
    initScrollProgression();
    initCursorIntegration();
    initCaseStudyNavigation();
    initEntranceAnimations();
    initArrowAnimations();
    initResizeHandler();
}

export { PROJECTS_DATA };
