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
let scrollActiveProject = 0;
let isHovering = false;
let panels = [];
let scrollTriggerInstance = null;
const isMobile = () => window.innerWidth <= 768;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        <div class="fw-panel ${index === 0 ? 'is-active' : ''}"
             id="project-${project.id}"
             data-project-index="${index}"
             data-project-id="${project.id}"
             tabindex="0"
             role="button"
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
                    <a href="${project.caseStudyUrl}"
                       class="fw-panel-cta"
                       data-cursor="pill"
                       data-cursor-label="View project">
                        VIEW CASE STUDY <span class="cta-arrow">↗</span>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedStage(featured) {
    const panelsMarkup = featured.map((p, i) => renderFeaturedPanel(p, i)).join('');

    return `
        <div class="fw-stage-wrap" id="fw-stage-wrap">
            <div class="fw-heading-bg" id="fw-heading-bg">
                <h2 class="fw-brier-title">
                    <span class="fw-brier-line">Featured</span>
                    <span class="fw-brier-line">Work</span>
                </h2>
            </div>
            <div class="fw-stage" id="fw-stage">
                <div class="fw-fade-top"></div>
                <div class="fw-fade-bottom"></div>
                ${panelsMarkup}
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
               data-cursor-label="View project"
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
                    <div class="mw-card-hover">
                        <p class="mw-card-hook">${project.hook}</p>
                        <span class="mw-card-cta">VIEW CASE STUDY <span class="cta-arrow">↗</span></span>
                    </div>
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

function setActiveProject(index, animate = true) {
    if (index >= FEATURED_COUNT) return;
    if (index === activeProject && (index === -1 || panels[index]?.classList.contains('is-active'))) return;

    resetPanelStrokes();
    activeProject = index;

    panels.forEach((panel, i) => {
        const isActive = i === index;
        panel.classList.toggle('is-active', isActive);

        if (isMobile()) return;

        if (animate && typeof gsap !== 'undefined' && !prefersReducedMotion()) {
            const targetFlex = isActive ? PANEL_FLEX_ACTIVE : PANEL_FLEX_INACTIVE;
            gsap.to(panel, {
                flex: targetFlex,
                duration: 0.6,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        } else {
            panel.style.flex = isActive ? PANEL_FLEX_ACTIVE : PANEL_FLEX_INACTIVE;
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
        }

        // Add gutter dead-zone tracking using panel bounds
        panel.addEventListener('mousemove', (e) => {
            if (!window.fwEntranceSettled) return;
            const rect = panel.getBoundingClientRect();
            // Dead zone is the outer 12px of the panel (simulating the gutter interaction gap)
            const isNearEdge = (e.clientX - rect.left < 12) || (rect.right - e.clientX < 12);
            
            if (isNearEdge) {
                if (isHovering) {
                    isHovering = false;
                    setActiveProject(-1);
                }
            } else {
                if (!isHovering) {
                    isHovering = true;
                    setActiveProject(index);
                }
            }
        });

        panel.addEventListener('mouseleave', () => {
            // we let the stage mouseleave handle reverting to scroll state, or if it moves into another panel, that panel's enter fires
        });
        
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const cta = panel.querySelector('.fw-panel-cta');
                if (cta) {
                    sessionStorage.setItem('last_clicked_project_card', `project-${panel.dataset.projectId}`);
                    window.location.href = cta.href;
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
            if (e.target.closest('.fw-panel-cta')) return;

            if (panel.classList.contains('is-active')) {
                const cta = panel.querySelector('.fw-panel-cta');
                if (cta) {
                    sessionStorage.setItem('last_clicked_project_card', `project-${panel.dataset.projectId}`);
                    window.location.href = cta.href;
                }
            } else {
                setActiveProject(index);
                scrollActiveProject = index;
            }
        });
    });

    if (!supportsHover || isMobile()) {
        panels.forEach((panel, index) => {
            panel.addEventListener('click', () => {
                if (!panel.classList.contains('is-active')) {
                    setActiveProject(index);
                }
            });
        });
    }

    const stage = document.getElementById('fw-stage');
    const stageWrap = document.getElementById('fw-stage-wrap');

    if (stage && supportsHover && !isMobile()) {
        stage.addEventListener('mouseleave', () => {
            if (!window.fwEntranceSettled) return;
            isHovering = false;
            resetPanelStrokes();
            setActiveProject(-1);
        });
    }

    if (stageWrap && supportsHover && !isMobile()) {
        stageWrap.addEventListener('mousemove', (e) => {
            if (isHovering && window.fwEntranceSettled) {
                updateActiveStrokeProximity(e);
            }
        }, { passive: true });
    }
}


// ══════════════════════════════════════════════════════════════════════════════
// SCROLL — GSAP ScrollTrigger Pinned Progression
// ══════════════════════════════════════════════════════════════════════════════

function initScrollProgression() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (isMobile()) return;
    if (prefersReducedMotion()) return;

    const stageWrap = document.getElementById('fw-stage-wrap');
    if (!stageWrap) return;

    // Kill any previous instance
    if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
    }

    const headingBg = document.getElementById('fw-heading-bg');
    const stage = document.querySelector('.fw-stage');
    const panelEls = Array.from(document.querySelectorAll('.fw-panel'));

    if (!headingBg || !stage || panelEls.length < 5) return;

    window.fwEntranceSettled = false;

    // ── Initial hidden state: everything is off-screen to the RIGHT ──
    // Heading slides in with the group
    gsap.set(headingBg, { x: window.innerWidth, opacity: 0 });
    // Stage (contains all 5 panels) is also pushed right
    gsap.set(stage, { x: window.innerWidth * 0.6 });
    // Stack panels: panel[4] is rightmost (xPercent: 0), rest stacked on top of it to its right
    gsap.set(panelEls[0], { xPercent: 400 });
    gsap.set(panelEls[1], { xPercent: 300 });
    gsap.set(panelEls[2], { xPercent: 200 });
    gsap.set(panelEls[3], { xPercent: 100 });
    gsap.set(panelEls[4], { xPercent: 0 });

    // ─────────────────────────────────────────────────────────────────
    // SCROLL TIMELINE
    // Total pinned scroll: +=280vh (viewport heights)
    //   Phase 1 (0 → 0.22):    Heading + stacked deck enters     ~62vh
    //   Phase 2 (0.22 → 0.70): Stack unfolds                     ~134vh
    //   Phase 3 (0.70 → 1.0):  Hold + Interaction               ~84vh
    // ─────────────────────────────────────────────────────────────────
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stageWrap,
            start: 'top top',
            end: '+=280%',
            pin: true,
            pinType: 'fixed',     // Force fixed to avoid transform fallback issues
            anticipatePin: 1,
            scrub: 0.5,           // Responsive scrub
            onUpdate: (self) => {
                // Enable interaction at 0.70 so they are firmly settled in place.
                if (self.progress >= 0.70 && !window.fwEntranceSettled) {
                    window.fwEntranceSettled = true;
                    setActiveProject(0, false);
                    scrollActiveProject = 0;
                } else if (self.progress < 0.70 && window.fwEntranceSettled) {
                    window.fwEntranceSettled = false;
                    setActiveProject(-1, false);
                    scrollActiveProject = -1;
                }
            },
            onLeave: () => {
                // fwEntranceSettled is already handled dynamically by onUpdate
            },
            onEnterBack: () => {
                // fwEntranceSettled is handled by onUpdate as progress drops below 0.70
            },
            onLeaveBack: () => {
                window.fwEntranceSettled = false;
                // Reset panel flex states so scroll-back reversal is clean
                panels.forEach(panel => { panel.style.flex = ''; });
            }
        }
    });

    // ── Phase 1 (0 → 0.22): Enter from right ──
    tl.to(headingBg, { x: 0, opacity: 1, ease: 'power3.out', duration: 0.22 }, 0);
    tl.to(stage, { x: 0, ease: 'power3.out', duration: 0.22 }, 0);

    // ── Phase 2 (0.22 → 0.70): Staggered left-to-right unfold ──
    const unfoldStart = 0.22;
    const unfoldDuration = 0.48; // span
    const stagger = 0.05;        // offset

    tl.to(panelEls[0], { xPercent: 0, ease: 'power2.inOut', duration: unfoldDuration - stagger * 0 }, unfoldStart + stagger * 0);
    tl.to(panelEls[1], { xPercent: 0, ease: 'power2.inOut', duration: unfoldDuration - stagger * 1 }, unfoldStart + stagger * 1);
    tl.to(panelEls[2], { xPercent: 0, ease: 'power2.inOut', duration: unfoldDuration - stagger * 2 }, unfoldStart + stagger * 2);
    tl.to(panelEls[3], { xPercent: 0, ease: 'power2.inOut', duration: unfoldDuration - stagger * 3 }, unfoldStart + stagger * 3);
    // Panel 4 is already at xPercent:0 (rightmost anchor) — no animation needed

    // ── Phase 3 (0.70 → 1.0): Hold — all 5 visible ──
    tl.to({}, { duration: 0.30 }, 0.70); // empty tween to extend timeline to 1.0

    scrollTriggerInstance = tl.scrollTrigger;
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
    scrollActiveProject = -1;
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
