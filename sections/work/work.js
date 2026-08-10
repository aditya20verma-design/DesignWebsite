// ─────────────────────────────────────────────────────────────────────────────
// work.js — Work Section Component Renderer & Interaction Logic
// ─────────────────────────────────────────────────────────────────────────────

import { PROJECTS_DATA } from './projects.data.js';

// ── Component Generators ───────────────────────────────────────────────────

function createProjectVisual(project) {
    return `
        <div class="work-facade-media-frame" style="${project.aspectRatio ? `aspect-ratio: ${project.aspectRatio};` : ''}">
            <div class="work-facade-placeholder-bg">
                <span class="work-ph-num-bg">${project.number}</span>
                <div class="work-ph-grid-lines"></div>
            </div>
            <img src="${project.image}" alt="${project.title}" class="work-facade-img parallax-image" loading="lazy" onerror="this.style.display='none'">
        </div>
    `;
}

function createFeaturedProject(project) {
    const titleHtml = project.titleAccent 
        ? project.title.replace(project.titleAccent, `<span class="font-accent">${project.titleAccent}</span>`)
        : project.title;

    const isLeft = project.layoutVariant === 'featured-left';
    
    const infoHtml = `
        <div class="work-facade-info">
            <div class="work-facade-header-meta">
                <span class="work-facade-num">${project.number}</span>
                <span class="work-facade-category">${project.category}</span>
            </div>
            <h3 class="work-facade-title">${titleHtml}</h3>
            <p class="work-facade-tagline">“${project.description}”</p>
            
            <div class="work-facade-hover-meta">
                <div class="work-meta-block">
                    <span class="meta-label">CONTRIBUTION</span>
                    <span class="meta-val">${project.contribution}</span>
                </div>
                <div class="work-meta-stats">
                    <div class="meta-stat">
                        <span class="stat-num">${project.scale}</span>
                        <span class="stat-label">USERS</span>
                    </div>
                    <div class="meta-stat">
                        <span class="stat-num" ${project.isPlaceholderMetric ? 'data-placeholder-metric="true"' : ''}>${project.impact}</span>
                        <span class="stat-label">IMPACT</span>
                    </div>
                </div>
                <div class="work-meta-footer">
                    <span class="meta-timeline">${project.timeline}</span>
                    <span class="work-facade-cta">VIEW CASE STUDY <span class="cta-arrow">&nearr;</span></span>
                </div>
            </div>
        </div>
    `;

    const visualHtml = createProjectVisual(project);

    return `
        <article class="work-facade work-featured work-feat-${project.number} hover-trigger" id="project-${project.id}">
            <a href="${project.caseStudyUrl}" class="work-facade-link" aria-label="${project.company} - ${project.title} Case Study" data-cursor="pill" data-cursor-label="View project">
                <div class="work-facade-layout">
                    ${isLeft ? infoHtml + visualHtml : visualHtml + infoHtml}
                </div>
            </a>
        </article>
    `;
}

function createSupportingProject(project) {
    const titleHtml = project.titleAccent 
        ? project.title.replace(project.titleAccent, `<span class="font-accent">${project.titleAccent}</span>`)
        : project.title;

    const visualHtml = createProjectVisual(project);

    return `
        <article class="work-facade work-secondary ${project.gridSpan} hover-trigger" id="project-${project.id}">
            <a href="${project.caseStudyUrl}" class="work-facade-link" aria-label="${project.title} Case Study" data-cursor="pill" data-cursor-label="View project">
                ${visualHtml}
                <div class="work-facade-info">
                    <div class="work-facade-header-meta">
                        <span class="work-facade-num">${project.number}</span>
                        <span class="work-facade-category">${project.category}</span>
                    </div>
                    <h4 class="work-facade-title-sm">${titleHtml}</h4>
                    <p class="work-facade-tagline-sm">“${project.description}”</p>
                    <div class="work-facade-hover-meta">
                        <div class="work-meta-block-sm">
                            <span class="meta-label">CONTRIBUTION:</span> <span class="meta-val-sm">${project.contribution}</span>
                        </div>
                        <div class="work-meta-block-sm">
                            <span class="meta-label">IMPACT:</span> <span class="meta-val-sm" ${project.isPlaceholderMetric ? 'data-placeholder-metric="true"' : ''}>${project.impact}</span>
                        </div>
                        <div class="work-meta-footer-sm">
                            <span class="meta-timeline">${project.timeline}</span>
                            <span class="work-facade-cta-sm">VIEW CASE STUDY <span class="cta-arrow">&nearr;</span></span>
                        </div>
                    </div>
                </div>
            </a>
        </article>
    `;
}

function renderSectionIntro() {
    return `
        <header class="work-section-header">
            <div class="work-header-inner">
                <p class="work-header-eyebrow">SELECTED WORK</p>
                <h2 class="work-header-title">Products, systems and experiences shaped across <span class="font-accent">healthcare, fintech, mobility</span> and beyond.</h2>
            </div>
        </header>
    `;
}

export function renderSelectedWorks(container) {
    if (!container) return;

    const featuredProjects = PROJECTS_DATA.filter(p => p.featured);
    const supportingProjects = PROJECTS_DATA.filter(p => !p.featured);

    const introHtml = renderSectionIntro();

    const featuredHtml = `
        <div class="work-featured-container">
            ${featuredProjects.map(p => createFeaturedProject(p)).join('')}
        </div>
    `;

    const supportingHtml = `
        <div class="work-archival-section">
            <div class="work-archival-header">
                <span class="archival-eyebrow">ARCHIVAL SELECTION</span>
                <span class="archival-divider-line"></span>
            </div>
            <div class="work-archival-grid">
                ${supportingProjects.map(p => createSupportingProject(p)).join('')}
            </div>
        </div>
    `;

    container.innerHTML = introHtml + featuredHtml + supportingHtml;
}

// ── Main Section Initializer ───────────────────────────────────────────────

export function initWork() {
    const workInner = document.getElementById('work-inner');
    if (workInner) {
        renderSelectedWorks(workInner);
    }

    // ── 1. Hero Background Scroll Scrub ──
    const heroBg = document.getElementById('hero-bg-text');
    if (heroBg && typeof gsap !== 'undefined') {
        gsap.to(heroBg, {
            xPercent: -30,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
    }

    // ── 2. Work Facade ScrollTrigger Entrance Animations ──
    if (typeof gsap !== 'undefined') {
        document.querySelectorAll('.work-facade').forEach((facade) => {
            gsap.fromTo(facade, 
                { y: 40, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    ease: "power3.out", 
                    scrollTrigger: { 
                        trigger: facade, 
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    } 
                }
            );
        });
    }

    // ── 3. Subtle Internal Image Pointer Parallax (Stable Outer Frame) ──
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    if (supportsHover) {
        document.querySelectorAll('.work-facade-media-frame').forEach((frame) => {
            const img = frame.querySelector('.work-facade-img');
            const bgNum = frame.querySelector('.work-ph-num-bg');
            
            frame.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { left, top, width, height } = frame.getBoundingClientRect();
                const nx = (clientX - left) / width - 0.5;
                const ny = (clientY - top) / height - 0.5;

                if (typeof gsap !== 'undefined') {
                    // Outer frame stays stable (no 3D tilt)
                    // Internal image translation (subtle 10px shift)
                    if (img) {
                        gsap.to(img, { 
                            x: nx * 10, 
                            y: ny * 10, 
                            duration: 0.5, 
                            ease: "power2.out" 
                        });
                    }

                    // Background watermark number opposing offset
                    if (bgNum) {
                        gsap.to(bgNum, { 
                            x: -nx * 14, 
                            y: -ny * 14, 
                            duration: 0.5, 
                            ease: "power2.out" 
                        });
                    }
                }
            });

            frame.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    if (img) gsap.to(img, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
                    if (bgNum) gsap.to(bgNum, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
                }
            });
        });
    }

    // ── 4. Kinetic Text Hover ──
    document.querySelectorAll('.hover-stagger').forEach(link => {
        const text = link.innerText; link.innerHTML = '';
        const wrapperUp = document.createElement('div'), wrapperDown = document.createElement('div');
        wrapperUp.className = 'stagger-up'; wrapperDown.className = 'stagger-down';
        text.split('').forEach((char, i) => {
            const spanUp = document.createElement('span'), spanDown = document.createElement('span');
            spanUp.innerHTML = spanDown.innerHTML = char === ' ' ? '&nbsp;' : char;
            spanUp.style.transitionDelay = spanDown.style.transitionDelay = `${i * 0.02}s`;
            wrapperUp.appendChild(spanUp); wrapperDown.appendChild(spanDown);
        });
        link.appendChild(wrapperUp); link.appendChild(wrapperDown);
    });

    // ── 5. Kinetic Dual-Arrow Swap Wipe ──
    document.querySelectorAll('.cta-arrow, .nav-arrow').forEach((arrow) => {
        if (arrow.dataset.wipeInitialized) return;
        arrow.dataset.wipeInitialized = 'true';

        const rawHTML = arrow.innerHTML, rawText = arrow.textContent.trim();
        const isDiag = rawHTML.includes('nearr') || rawText === '↗' || rawText === '⇡';
        const isDown = rawHTML.includes('darr') || rawText === '↓';
        const char = rawText || '↗'; arrow.innerHTML = '';
        arrow.style.cssText = 'position:relative; display:inline-flex; width:1em; height:1em; align-items:center; justify-content:center; overflow:hidden;';
        const arr1 = document.createElement('span'), arr2 = document.createElement('span');
        arr1.textContent = arr2.textContent = char;
        arr1.style.position = arr2.style.position = 'absolute';
        let outX = '100%', outY = '0%', inX = '-100%', inY = '0%';
        if (isDiag) { outX = '100%'; outY = '-100%'; inX = '-100%'; inY = '100%'; }
        else if (isDown) { outX = '0%'; outY = '100%'; inX = '0%'; inY = '-100%'; }

        if (typeof gsap !== 'undefined') {
            gsap.set(arr2, { x: inX, y: inY });
        }
        arrow.append(arr1, arr2);
        const parentLink = arrow.closest('a');
        if (parentLink && typeof gsap !== 'undefined') {
            parentLink.addEventListener('mouseenter', () => { gsap.to(arr1, { x: outX, y: outY, duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" }); gsap.to(arr2, { x: "0%", y: "0%", duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" }); });
            parentLink.addEventListener('mouseleave', () => { gsap.to(arr1, { x: "0%", y: "0%", duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" }); gsap.to(arr2, { x: inX, y: inY, duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" }); });
        }
    });
}
