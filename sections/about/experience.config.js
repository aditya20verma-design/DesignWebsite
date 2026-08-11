/**
 * ── My Journey Timeline & List Engine (Dual View + Memory Resumption) ────────
 * Continuous auto-play loop engine that pauses on user cursor interaction
 * and resumes memory playback from the leftover milestone when cursor leaves.
 * Includes interactive View Switcher to toggle between Timeline & Glowing List
 * with Isolated Per-Row Radial Spotlight Cursor Follower & Hover Reveal Subtexts.
 * ──────────────────────────────────────────────────────────────────────────
 */

window.JOURNEY_DATA = [
    {
        year: '2020',
        company: 'Architecture',
        role: 'Architectural Designer',
        built: 'Residential • Commercial • Spatial Systems • Client Delivery',
        period: 'Aug 2020 — Jul 2021',
        duration: '1 year',
        domain: 'Architecture',
        desc: 'The starting point.',
        logo: 'sections/about/assets/Company logos/architecture.svg'
    },
    {
        year: '2022',
        company: 'Avantari Technologies',
        role: 'Product Design Intern',
        built: 'Manufacturing • Product Research • DFA • Industrial Design',
        period: 'Jun 2022 — Aug 2022',
        duration: '3 months',
        domain: 'Industrial Design',
        desc: 'Worked across emerging technology and interaction design.',
        logo: 'sections/about/assets/Company logos/avanatri.svg'
    },
    {
        year: '2023',
        company: 'BranchX',
        role: 'UX Designer',
        built: 'Merchant Platform • Design System • ONDC Experience',
        period: 'Sep 2023 — Nov 2024',
        duration: '1 year 2 months',
        domain: 'Fintech',
        desc: 'Designed fintech experiences for India\'s migrant workforce.',
        logo: 'sections/about/assets/Company logos/branchx.svg'
    },
    {
        year: 'NOW',
        company: 'Narayana Health',
        role: 'Product Designer',
        built: 'Health Records • Appointment Booking • Health Checkups • Patient Kiosk',
        period: 'Nov 2024 — Present',
        duration: '1 year 10 months',
        domain: 'Healthcare',
        desc: 'Building digital healthcare experiences used by 1M+ users.',
        logo: 'sections/about/assets/Company logos/narayana.svg'
    }
];

(function initJourneyTimeline() {
    let activeIndex = -1;
    let isInteractive = false;
    let isUserHovering = false;
    let lastVisitedIndex = 0; // Memory tracker for leftover milestone

    let autoPlayTimer = null;
    let resumeTimeout = null;

    const nodePositionsPercent = [0, 33.333, 66.666, 100];

    function renderTimeline() {
        const nodesWrap = document.getElementById('journey-nodes-wrap');
        const track = document.getElementById('journey-timeline-track');
        const card = document.getElementById('journey-card');
        const fill = document.getElementById('journey-line-fill');
        if (!nodesWrap || !track || !card || !window.JOURNEY_DATA) return;

        // Reset fill line
        if (fill) fill.style.width = '0%';

        // Render markers (end-to-end positions: 0%, 33.33%, 66.66%, 100%)
        nodesWrap.innerHTML = window.JOURNEY_DATA.map((item, i) => `
            <button class="journey-node-btn" data-index="${i}" aria-label="${item.company} (${item.year})">
                <span class="node-year">${item.year}</span>
                <span class="node-dot"></span>
            </button>
        `).join('');

        const nodeBtns = nodesWrap.querySelectorAll('.journey-node-btn');

        // Hybrid 75% Magnetic Auto-Fill + Real-Time Cursor Tracking Engine
        track.addEventListener('mousemove', (e) => {
            if (!isInteractive) return;

            // Pause auto-play loop when user interacts
            pauseAutoPlay();
            isUserHovering = true;

            const trackRect = track.getBoundingClientRect();
            const relativeX = e.clientX - trackRect.left;
            const percent = Math.max(0, Math.min(100, (relativeX / trackRect.width) * 100));

            let targetNodeIndex = 0;
            let displayFillPercent = percent;

            // Evaluate 3 timeline segments (0-33.3%, 33.3-66.6%, 66.6-100%)
            if (percent < 33.333) {
                if (percent >= 25) {
                    targetNodeIndex = 1;
                    displayFillPercent = 33.333; // 75% threshold auto-fill
                } else {
                    targetNodeIndex = 0;
                    displayFillPercent = percent; // Real-time cursor tracking
                }
            } else if (percent < 66.666) {
                if (percent >= 58.333) {
                    targetNodeIndex = 2;
                    displayFillPercent = 66.666; // 75% threshold auto-fill
                } else {
                    targetNodeIndex = 1;
                    displayFillPercent = percent;
                }
            } else {
                if (percent >= 91.666) {
                    targetNodeIndex = 3;
                    displayFillPercent = 100; // 75% threshold auto-fill
                } else {
                    targetNodeIndex = 2;
                    displayFillPercent = percent;
                }
            }

            lastVisitedIndex = targetNodeIndex;

            // Smooth fill line update
            if (fill) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(fill, {
                        width: `${displayFillPercent}%`,
                        duration: displayFillPercent === percent ? 0.1 : 0.3,
                        ease: displayFillPercent === percent ? 'power1.out' : 'power3.out',
                        overwrite: 'auto'
                    });
                } else {
                    fill.style.width = `${displayFillPercent}%`;
                }
            }

            showCardForIndex(targetNodeIndex, nodeBtns[targetNodeIndex]);
        });

        // Individual node hover/click fallback
        nodeBtns.forEach((btn) => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            btn.addEventListener('mouseenter', () => {
                if (isInteractive) {
                    pauseAutoPlay();
                    isUserHovering = true;
                    lastVisitedIndex = idx;
                    showCardForIndex(idx, btn);
                }
            });
            btn.addEventListener('click', () => {
                if (isInteractive) {
                    pauseAutoPlay();
                    isUserHovering = true;
                    lastVisitedIndex = idx;
                    showCardForIndex(idx, btn);
                }
            });
        });

        // Cursor Leave: Schedule memory resumption from leftover milestone
        track.addEventListener('mouseleave', () => {
            if (!isInteractive) return;
            isUserHovering = false;
            
            // Clear any existing resume handle
            if (resumeTimeout) clearTimeout(resumeTimeout);

            // After 1.2s grace period, resume continuous auto-play from next milestone
            resumeTimeout = setTimeout(() => {
                if (!isUserHovering) {
                    const nextStartIndex = (lastVisitedIndex + 1) % window.JOURNEY_DATA.length;
                    startAutoPlayLoop(nextStartIndex);
                }
            }, 1200);
        });

        // Window resize repositioning
        window.addEventListener('resize', () => {
            if (activeIndex >= 0 && nodeBtns[activeIndex]) {
                positionCard(activeIndex, nodeBtns[activeIndex], false);
            }
        });

        // Render secondary Glowing List View & initialize View Switcher
        renderListView();
        initViewToggle();

        // ScrollTrigger entrance
        initJourneyEntrance();
    }

    function renderListView() {
        const listBody = document.getElementById('exp-table-body');
        if (!listBody || !window.JOURNEY_DATA) return;

        // Reverse array to display Narayana Health (NOW) first down to Architecture (2020)
        const reversedData = [...window.JOURNEY_DATA].reverse();

        listBody.innerHTML = reversedData.map(item => `
            <div class="exp-row">
                <div class="exp-row-spotlight"></div>
                <div class="exp-row-inner">
                    <div class="col-company">
                        <div class="exp-logo-wrap">
                            <img src="${item.logo}" alt="${item.company} logo" class="exp-logo">
                        </div>
                        <span class="company-name">${item.company}</span>
                    </div>
                    <div class="col-role">
                        <span class="role-title">${item.role}</span>
                        <div class="role-built-tags">${item.built ? item.built.replaceAll('•', '·') : ''}</div>
                    </div>
                    <div class="col-period font-mono">
                        <span class="period-range">${item.period}</span>
                        <span class="period-duration">${item.duration}</span>
                    </div>
                    <div class="col-domain font-mono">
                        <span>${item.domain}</span>
                    </div>
                </div>
            </div>
        `).join('');

        initSpotlight();
    }

    function initSpotlight() {
        const rows = document.querySelectorAll('.exp-row');
        rows.forEach(row => {
            const spotlight = row.querySelector('.exp-row-spotlight');
            if (!spotlight) return;

            row.addEventListener('mousemove', (e) => {
                const rect = row.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                spotlight.style.setProperty('--mouse-x', `${x}px`);
                spotlight.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    function initViewToggle() {
        const toggleContainer = document.getElementById('journey-view-toggle');
        const timelineStage = document.getElementById('journey-stage');
        const listStage = document.getElementById('journey-stage-list');
        if (!toggleContainer || !timelineStage || !listStage) return;

        const toggleBtns = toggleContainer.querySelectorAll('.view-toggle-btn');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.getAttribute('data-view');

                toggleBtns.forEach(b => {
                    const isActive = b === btn;
                    b.classList.toggle('active', isActive);
                    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                if (typeof window.__playHoverSound === 'function') {
                    window.__playHoverSound();
                }

                if (targetView === 'timeline') {
                    // Fade out List, Fade in Timeline cleanly without Y-axis drift
                    if (typeof gsap !== 'undefined') {
                        gsap.to(listStage, {
                            opacity: 0,
                            duration: 0.2,
                            ease: 'power2.in',
                            onComplete: () => {
                                listStage.style.display = 'none';
                                timelineStage.style.display = 'block';
                                gsap.fromTo(timelineStage,
                                    { opacity: 0 },
                                    { opacity: 1, duration: 0.28, ease: 'power2.out', clearProps: 'transform' }
                                );
                                if (!isUserHovering) {
                                    startAutoPlayLoop(lastVisitedIndex >= 0 ? lastVisitedIndex : 0);
                                }
                            }
                        });
                    } else {
                        listStage.style.display = 'none';
                        timelineStage.style.display = 'block';
                        timelineStage.style.opacity = '1';
                    }
                } else if (targetView === 'list') {
                    // Pause auto-play timeline loop
                    pauseAutoPlay();

                    // Fade out Timeline, Fade in List cleanly without Y-axis drift
                    if (typeof gsap !== 'undefined') {
                        gsap.to(timelineStage, {
                            opacity: 0,
                            duration: 0.2,
                            ease: 'power2.in',
                            onComplete: () => {
                                timelineStage.style.display = 'none';
                                listStage.style.display = 'block';
                                gsap.fromTo(listStage,
                                    { opacity: 0 },
                                    { opacity: 1, duration: 0.28, ease: 'power2.out', clearProps: 'transform' }
                                );
                            }
                        });
                    } else {
                        timelineStage.style.display = 'none';
                        listStage.style.display = 'block';
                        listStage.style.opacity = '1';
                    }
                }
            });
        });
    }

    function startAutoPlayLoop(startIndex = 0) {
        pauseAutoPlay();
        if (isUserHovering) return;

        let currentIndex = startIndex;
        const nodeBtns = document.querySelectorAll('.journey-node-btn');

        function step() {
            if (isUserHovering) return;

            if (nodeBtns[currentIndex]) {
                lastVisitedIndex = currentIndex;
                showCardForIndex(currentIndex, nodeBtns[currentIndex]);
            }

            currentIndex = (currentIndex + 1) % window.JOURNEY_DATA.length;
            autoPlayTimer = setTimeout(step, 2400); // 2.4s per milestone loop
        }

        step();
    }

    function pauseAutoPlay() {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }
        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
            resumeTimeout = null;
        }
    }

    function setCardContent(index) {
        const data = window.JOURNEY_DATA[index];
        if (!data) return;

        const logoEl = document.getElementById('j-card-logo');
        const companyEl = document.getElementById('j-card-company');
        const roleEl = document.getElementById('j-card-role');
        const periodEl = document.getElementById('j-card-period');
        const domainEl = document.getElementById('j-card-domain');
        const descEl = document.getElementById('j-card-desc');

        if (logoEl) {
            logoEl.src = data.logo;
            logoEl.alt = `${data.company} logo`;
        }
        if (companyEl) companyEl.textContent = data.company;
        if (roleEl) roleEl.textContent = data.role;
        if (periodEl) periodEl.textContent = data.period.toUpperCase();
        if (domainEl) domainEl.textContent = data.domain.toUpperCase();
        if (descEl) descEl.textContent = data.desc;
    }

    function positionCard(index, nodeBtn, animate = true) {
        const track = document.getElementById('journey-timeline-track');
        const card = document.getElementById('journey-card');
        const pointer = document.getElementById('journey-card-pointer');
        const fill = document.getElementById('journey-line-fill');
        if (!track || !card || !nodeBtn || !pointer) return;

        const trackRect = track.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;

        if (isMobile) return;

        // Checkpoint square center X relative to timeline track
        const nodeDot = nodeBtn.querySelector('.node-dot') || nodeBtn;
        const dotRect = nodeDot.getBoundingClientRect();
        const nodeCenterX = dotRect.left + (dotRect.width / 2) - trackRect.left;

        const cardWidth = card.offsetWidth || 440;
        let targetLeft = nodeCenterX - (cardWidth / 2);

        // Clamp card position within track boundaries
        const minLeft = 0;
        const maxLeft = trackRect.width - cardWidth;
        targetLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));

        // Pointer stem offset pointing to checkpoint square
        const pointerLeft = Math.max(18, Math.min(cardWidth - 18, nodeCenterX - targetLeft));
        pointer.style.left = `${pointerLeft}px`;

        // Update fill line to target checkpoint position (for auto-play mode)
        if (!isUserHovering && fill) {
            const targetFillPercent = nodePositionsPercent[index];
            if (typeof gsap !== 'undefined' && animate) {
                gsap.to(fill, {
                    width: `${targetFillPercent}%`,
                    duration: 0.42,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            } else {
                fill.style.width = `${targetFillPercent}%`;
            }
        }

        // Animate card position
        if (typeof gsap !== 'undefined' && animate && card.classList.contains('is-visible')) {
            gsap.to(card, {
                left: targetLeft,
                duration: 0.42,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        } else {
            card.style.left = `${targetLeft}px`;
        }
    }

    function showCardForIndex(index, nodeBtn) {
        if (index === activeIndex) return;

        const card = document.getElementById('journey-card');
        const nodeBtns = document.querySelectorAll('.journey-node-btn');
        if (!card) return;

        // Active node styling
        nodeBtns.forEach((btn, i) => {
            if (i === index) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const wasVisible = card.classList.contains('is-visible');

        if (typeof window.__playHoverSound === 'function') {
            window.__playHoverSound();
        }

        if (!wasVisible) {
            setCardContent(index);
            positionCard(index, nodeBtn, false);
            card.classList.add('is-visible');

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(card,
                    { opacity: 0, y: 10, scale: 0.97 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power3.out' }
                );
            }
        } else {
            // Slide card & crossfade inner elements
            positionCard(index, nodeBtn, true);

            const cardInner = card.querySelector('.journey-card-inner');
            if (typeof gsap !== 'undefined' && cardInner) {
                gsap.to(cardInner, {
                    opacity: 0,
                    y: -5,
                    duration: 0.12,
                    ease: 'power2.in',
                    onComplete: () => {
                        setCardContent(index);
                        gsap.fromTo(cardInner,
                            { opacity: 0, y: 6 },
                            { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
                        );
                    }
                });
            } else {
                setCardContent(index);
            }
        }

        activeIndex = index;
    }

    function initJourneyEntrance() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const section = document.getElementById('my-journey');
        const title = document.querySelector('.journey-title');
        const lineBase = document.querySelector('.journey-line-base');
        const fill = document.getElementById('journey-line-fill');
        const nodes = document.querySelectorAll('.journey-node-btn');
        const card = document.getElementById('journey-card');
        if (!section) return;

        // Set initial state for reveal
        if (title) gsap.set(title, { opacity: 0, y: 16 });
        if (lineBase) gsap.set(lineBase, { scaleX: 0, transformOrigin: 'left center' });
        if (fill) gsap.set(fill, { width: '0%' });
        if (nodes.length) {
            nodes.forEach(node => {
                gsap.set(node, { opacity: 0, scale: 0.5 });
            });
        }
        if (card) {
            gsap.set(card, { opacity: 0, y: 10, scale: 0.97 });
            card.classList.remove('is-visible');
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            onComplete: () => {
                isInteractive = true;
                // Continuous auto-play loop starts automatically upon viewport entrance
                if (!isUserHovering) {
                    startAutoPlayLoop(0);
                }
            }
        });

        // STEP 1: "MY JOURNEY" title reveal
        if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0);

        // STEP 2: Timeline line draw (LEFT -> RIGHT 100%)
        if (lineBase) tl.to(lineBase, { scaleX: 1, duration: 0.85, ease: 'power3.inOut' }, 0.15);

        // STEPS 3–6: Reveal 2020, 2022, 2023, NOW square checkpoints
        if (nodes.length) {
            nodes.forEach((node, i) => {
                tl.to(node, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.35 + i * 0.15);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderTimeline);
    } else {
        renderTimeline();
    }
}());
