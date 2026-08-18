// ─────────────────────────────────────────────────────────────────────────────
// project-viewer.js — Universal Case Study Viewer
// ─────────────────────────────────────────────────────────────────────────────
// Opens case studies as an immersive overlay layer. Integrates with the
// portfolio via History API. Renders content from projects.content.js
// using a universal template. Supports project-to-project navigation
// inside the viewer via the "More Projects" grid.
// ─────────────────────────────────────────────────────────────────────────────

import { PROJECT_CONTENT } from './projects.content.js';
import { PROJECTS_DATA } from '../sections/work/projects.data.js';

// Build lookup: caseStudyUrl → project data object
const URL_TO_PROJECT = {};
PROJECTS_DATA.forEach(p => { URL_TO_PROJECT[p.caseStudyUrl] = p; });

// Track current project and in-viewer history depth
let currentProjectId = null;
let viewerHistoryDepth = 0;

// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════

export function initProjectViewer() {
    const viewer = document.getElementById('project-viewer');
    if (!viewer) return;

    if (!history.state) {
        history.replaceState({ isPortfolio: true }, '', window.location.href);
    }

    // ── 1. Intercept project link clicks on the portfolio ──
    document.addEventListener('click', handleGlobalClick);

    // ── 2. Browser Back / Forward ──
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.projectId) {
            viewerHistoryDepth = e.state.depth || 1;
            openViewer(e.state.projectId, false);
        } else {
            viewerHistoryDepth = 0;
            closeViewer();
        }
    });

    // ── 3. Close button (Always exits to portfolio) ──
    const closeBtn = document.getElementById('project-viewer-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', handleCloseAction);
    }

    // ── 4. Scrim click to close (Always exits to portfolio) ──
    const scrim = document.getElementById('project-viewer-scrim');
    if (scrim) {
        scrim.addEventListener('click', handleCloseAction);
    }

    // ── 5. Scroll handler (Top blur activation + Transient scrollbar thumb) ──
    const scrollContainer = document.getElementById('project-viewer-scroll');
    const topFade = document.getElementById('project-viewer-top-fade');
    const scrollbar = document.getElementById('project-viewer-scrollbar');
    const thumb = document.getElementById('project-viewer-scrollbar-thumb');
    let scrollTimer = null;

    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', () => {
            const scrollTop = scrollContainer.scrollTop;

            // Toggle top edge progressive blur
            if (topFade) {
                if (scrollTop > 10) {
                    topFade.classList.add('is-scrolled');
                } else {
                    topFade.classList.remove('is-scrolled');
                }
            }

            // Sync custom transient scrollbar thumb
            if (scrollbar && thumb) {
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const maxScroll = scrollHeight - clientHeight;

                if (maxScroll > 0) {
                    const trackHeight = scrollbar.clientHeight;
                    const thumbHeight = Math.max(32, Math.min(trackHeight * 0.4, (clientHeight / scrollHeight) * trackHeight));
                    const maxThumbTop = trackHeight - thumbHeight;
                    const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
                    const thumbTop = progress * maxThumbTop;

                    thumb.style.height = `${thumbHeight}px`;
                    thumb.style.transform = `translateY(${thumbTop}px)`;

                    scrollbar.classList.add('is-active');

                    clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(() => {
                        scrollbar.classList.remove('is-active');
                    }, 800);
                }
            }
        });
    }

    // ── 6. Check for deep link or refreshed project ──
    checkInitialProjectDeepLink();
}

function handleCloseAction() {
    if (viewerHistoryDepth > 0 && window.history.length > viewerHistoryDepth) {
        const steps = viewerHistoryDepth;
        viewerHistoryDepth = 0;
        history.go(-steps);
    } else {
        viewerHistoryDepth = 0;
        closeViewer();
        const originPath = window.location.pathname.replace(/\/projects\/.*$/, '/index.html');
        history.replaceState({ isPortfolio: true }, '', originPath);
    }
}

function checkInitialProjectDeepLink() {
    // Check if redirected from a standalone project HTML page
    const redirectUrl = sessionStorage.getItem('open_project_url');
    if (redirectUrl) {
        sessionStorage.removeItem('open_project_url');
        const project = findProjectByHref(redirectUrl);
        if (project && PROJECT_CONTENT[project.id]) {
            viewerHistoryDepth = 1;
            openViewer(project.id, false);
            history.replaceState({ projectId: project.id, url: project.caseStudyUrl, depth: 1 }, '', project.caseStudyUrl);
            return;
        }
    }

    // Check if current URL pathname directly points to a project URL
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/' && !currentPath.endsWith('index.html')) {
        const project = findProjectByHref(currentPath);
        if (project && PROJECT_CONTENT[project.id]) {
            viewerHistoryDepth = 1;
            openViewer(project.id, false);
            history.replaceState({ projectId: project.id, url: project.caseStudyUrl, depth: 1 }, '', project.caseStudyUrl);
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// CLICK HANDLER
// ══════════════════════════════════════════════════════════════════════════════

function handleGlobalClick(e) {
    // CRITICAL: Respect Featured Work two-step interaction
    if (e.defaultPrevented) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    // Match against project catalogue
    const project = findProjectByHref(href);
    if (!project) return;

    // Only intercept projects that have content in the new system
    if (!PROJECT_CONTENT[project.id]) return;

    e.preventDefault();
    openViewer(project.id, true);
}

function findProjectByHref(href) {
    // Try exact match first
    if (URL_TO_PROJECT[href]) return URL_TO_PROJECT[href];
    // Try matching the tail of the href (handles relative vs absolute)
    for (const [url, proj] of Object.entries(URL_TO_PROJECT)) {
        if (href.endsWith(url) || url.endsWith(href)) return proj;
    }
    return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// OPEN / CLOSE
// ══════════════════════════════════════════════════════════════════════════════

function openViewer(projectId, pushHistory) {
    const viewer = document.getElementById('project-viewer');
    const scroll = document.getElementById('project-viewer-scroll');
    if (!viewer || !scroll) return;

    const project = PROJECTS_DATA.find(p => p.id === projectId);
    const content = PROJECT_CONTENT[projectId];
    if (!project || !content) return;

    // Push history state
    if (pushHistory) {
        viewerHistoryDepth++;
        history.pushState(
            { projectId, url: project.caseStudyUrl, depth: viewerHistoryDepth },
            '',
            project.caseStudyUrl
        );
    }

    // Freeze portfolio
    if (window.__lenisInstance) window.__lenisInstance.stop();
    document.body.style.overflow = 'hidden';
    document.body.classList.add('viewer-open');

    // Render only if switching to a different project
    if (currentProjectId !== projectId) {
        scroll.innerHTML = renderCaseStudy(project, content);
        currentProjectId = projectId;

        // Attach click listeners to More Projects cards inside the viewer
        attachMoreProjectLinks(scroll);
    }

    // Reset scroll, top fade, and transient scrollbar state
    scroll.scrollTop = 0;
    const topFade = document.getElementById('project-viewer-top-fade');
    if (topFade) topFade.classList.remove('is-scrolled');
    const scrollbar = document.getElementById('project-viewer-scrollbar');
    if (scrollbar) scrollbar.classList.remove('is-active');

    viewer.classList.add('is-open');
}

function closeViewer() {
    const viewer = document.getElementById('project-viewer');
    if (!viewer) return;

    viewer.classList.remove('is-open');
    document.body.classList.remove('viewer-open');
    document.body.style.overflow = '';
    currentProjectId = null;

    // Resume portfolio
    if (window.__lenisInstance) window.__lenisInstance.start();
}

// ══════════════════════════════════════════════════════════════════════════════
// MORE PROJECTS — In-Viewer Navigation
// ══════════════════════════════════════════════════════════════════════════════

function attachMoreProjectLinks(scrollContainer) {
    scrollContainer.querySelectorAll('.pv-project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const id = card.dataset.projectId;
            if (id && PROJECT_CONTENT[id]) {
                openViewer(id, true);
            } else if (id) {
                // Fallback: navigate to standalone page
                const proj = PROJECTS_DATA.find(p => p.id === id);
                if (proj) window.location.href = proj.caseStudyUrl;
            }
        });
    });

    const strip = scrollContainer.querySelector('.pv-more-strip');
    const prevBtn = scrollContainer.querySelector('.pv-more-prev');
    const nextBtn = scrollContainer.querySelector('.pv-more-next');

    if (strip && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            strip.scrollBy({ left: -340, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            strip.scrollBy({ left: 340, behavior: 'smooth' });
        });
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER — Universal Case Study Template
// ══════════════════════════════════════════════════════════════════════════════

function renderCaseStudy(project, content) {
    const sectionsHTML = content.sections.map(s => renderSection(s)).join('');
    const moreHTML = renderMoreProjects(project.id);

    return `
        <div class="pv-case-study">
            ${sectionsHTML}
            ${moreHTML}
        </div>
    `;
}

function renderSection(s) {
    switch (s.type) {
        case 'hero': return renderHero(s);
        case 'snapshot': return renderSnapshot(s);
        case 'text': return renderText(s);
        case 'quote': return renderQuote(s);
        case 'stats': return renderStats(s);
        case 'media': return renderMedia(s);
        case 'split': return renderSplit(s);
        case 'list': return renderList(s);
        default: return '';
    }
}

function renderHero(s) {
    const accent = s.titleAccent
        ? ` <span class="font-accent">${s.titleAccent}</span>`
        : '';
    return `
        <header class="pv-hero">
            <p class="pv-eyebrow">${s.eyebrow}</p>
            <h1 class="pv-title">${s.title}${accent}</h1>
            <p class="pv-tagline">${s.tagline}</p>
        </header>
    `;
}

function renderSnapshot(s) {
    const items = s.items.map(i => `
        <div class="pv-snap-item">
            <span class="pv-snap-label">${i.label}</span>
            <span class="pv-snap-value">${i.value}</span>
        </div>
    `).join('');
    return `<div class="pv-snapshot">${items}</div>`;
}

function renderText(s) {
    let html = '';
    if (s.heading) {
        const id = s.sectionId ? ` id="pv-${s.sectionId}"` : '';
        html += `
            <section class="pv-section"${id}>
                <header class="pv-section-header">
                    <span class="pv-section-num">${s.number}</span>
                    <h2 class="pv-section-title">${s.heading}</h2>
                </header>
        `;
    }
    if (s.body) {
        html += s.body.map(p => `<p class="pv-body">${p}</p>`).join('');
    }
    if (s.heading) {
        html += '</section>';
    }
    return html;
}

function renderQuote(s) {
    return `
        <blockquote class="pv-quote">
            <p class="pv-quote-text">"${s.text}"</p>
            <cite class="pv-quote-attr">— ${s.attribution}</cite>
        </blockquote>
    `;
}

function renderStats(s) {
    const cards = s.items.map(i => `
        <div class="pv-stat-card">
            <span class="pv-stat-value">${i.value}</span>
            <span class="pv-stat-label">${i.label}</span>
        </div>
    `).join('');
    return `<div class="pv-stats">${cards}</div>`;
}

function renderMedia(s) {
    const style = s.aspect ? ` style="aspect-ratio: ${s.aspect}"` : '';
    const caption = s.caption ? `<p class="pv-media-caption">${s.caption}</p>` : '';
    return `
        <div class="pv-media"${style}>
            <span class="pv-media-num">${s.number || ''}</span>
            <span class="pv-media-label">[ ${s.label} ]</span>
        </div>
        ${caption}
    `;
}

function renderSplit(s) {
    const cards = s.items.map(i => `
        <div class="pv-split-card">
            <h3>${i.title}</h3>
            <p>${i.body}</p>
        </div>
    `).join('');
    return `<div class="pv-split">${cards}</div>`;
}

function renderList(s) {
    const items = s.items.map(i => `
        <li><strong>${i.bold}</strong> ${i.text}</li>
    `).join('');
    return `<ol class="pv-list">${items}</ol>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// MORE PROJECTS STRIP (Horizontal Carousel)
// ══════════════════════════════════════════════════════════════════════════════

function renderMoreProjects(currentId) {
    const others = PROJECTS_DATA.filter(p => p.id !== currentId);

    const cards = others.map(p => {
        const hasMigratedContent = !!PROJECT_CONTENT[p.id];
        return `
            <a class="pv-project-card"
               href="${p.caseStudyUrl}"
               data-project-id="${p.id}"
               data-migrated="${hasMigratedContent}">
                <img class="pv-card-img"
                     src="${p.image}"
                     alt="${p.title}"
                     loading="lazy">
                <div class="pv-card-body">
                    <span class="pv-card-num">${p.number}</span>
                    <div class="pv-card-title">${p.title}</div>
                    <span class="pv-card-company">${p.company}</span>
                </div>
            </a>
        `;
    }).join('');

    return `
        <div class="pv-more-projects">
            <div class="pv-more-header">
                <span class="pv-more-label">MORE PROJECTS</span>
                <div class="pv-more-controls">
                    <button class="pv-more-arrow pv-more-prev" aria-label="Scroll left">
                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>
                    </button>
                    <button class="pv-more-arrow pv-more-next" aria-label="Scroll right">
                        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
                    </button>
                </div>
            </div>
            <div class="pv-more-strip-wrapper">
                <div class="pv-more-strip">${cards}</div>
            </div>
        </div>
    `;
}
