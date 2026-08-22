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
    let lastVisitedIndex = 0; // Memory tracker for milestone
    let currentScrollP = 0;   // Current scroll progress of #my-journey section

    const nodePositionsPercent = [0, 33.333, 66.666, 100];

    // Cached DOM elements to avoid querying DOM during hover and scroll frames
    let nodesWrapEl = null;
    let trackEl = null;
    let cardEl = null;
    let pointerEl = null;
    let fillEl = null;
    let nodeBtnsList = [];
    let cardLogoEl = null;
    let cardCompanyEl = null;
    let cardRoleEl = null;
    let cardPeriodEl = null;
    let cardDomainEl = null;
    let cardDescEl = null;
    let cardInnerEl = null;

    function cacheDOMElements() {
        nodesWrapEl = document.getElementById('journey-nodes-wrap');
        trackEl = document.getElementById('journey-timeline-track');
        cardEl = document.getElementById('journey-card');
        pointerEl = document.getElementById('journey-card-pointer');
        fillEl = document.getElementById('journey-line-fill');
        cardLogoEl = document.getElementById('j-card-logo');
        cardCompanyEl = document.getElementById('j-card-company');
        cardRoleEl = document.getElementById('j-card-role');
        cardPeriodEl = document.getElementById('j-card-period');
        cardDomainEl = document.getElementById('j-card-domain');
        cardDescEl = document.getElementById('j-card-desc');
        if (cardEl) {
            cardInnerEl = cardEl.querySelector('.journey-card-inner');
        }
    }

    function renderTimeline() {
        cacheDOMElements();
        if (!nodesWrapEl || !trackEl || !cardEl || !window.JOURNEY_DATA) return;

        // Reset fill line
        if (fillEl) fillEl.style.width = '0%';

        // Render markers (end-to-end positions: 0%, 33.33%, 66.66%, 100%)
        nodesWrapEl.innerHTML = window.JOURNEY_DATA.map((item, i) => `
            <button class="journey-node-btn" data-index="${i}" aria-label="${item.company} (${item.year})">
                <span class="node-year">${item.year}</span>
                <span class="node-dot"></span>
            </button>
        `).join('');

        nodeBtnsList = Array.from(nodesWrapEl.querySelectorAll('.journey-node-btn'));

        // Real-Time Cursor Tracking & Hover Card Engine
        trackEl.addEventListener('mousemove', (e) => {
            if (!isInteractive) return;

            isUserHovering = true;

            const trackRect = trackEl.getBoundingClientRect();
            const relativeX = e.clientX - trackRect.left;
            const percent = Math.max(0, Math.min(100, (relativeX / trackRect.width) * 100));

            let targetNodeIndex = 0;
            let displayFillPercent = percent;

            // Evaluate 3 timeline segments (0-33.3%, 33.3-66.6%, 66.6-100%)
            if (percent < 33.333) {
                if (percent >= 25) {
                    targetNodeIndex = 1;
                    displayFillPercent = 33.333;
                } else {
                    targetNodeIndex = 0;
                    displayFillPercent = percent;
                }
            } else if (percent < 66.666) {
                if (percent >= 58.333) {
                    targetNodeIndex = 2;
                    displayFillPercent = 66.666;
                } else {
                    targetNodeIndex = 1;
                    displayFillPercent = percent;
                }
            } else {
                if (percent >= 91.666) {
                    targetNodeIndex = 3;
                    displayFillPercent = 100;
                } else {
                    targetNodeIndex = 2;
                    displayFillPercent = percent;
                }
            }

            lastVisitedIndex = targetNodeIndex;

            if (fillEl) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(fillEl, {
                        width: `${displayFillPercent}%`,
                        duration: displayFillPercent === percent ? 0.1 : 0.3,
                        ease: displayFillPercent === percent ? 'power1.out' : 'power3.out',
                        overwrite: 'auto'
                    });
                } else {
                    fillEl.style.width = `${displayFillPercent}%`;
                }
            }

            if (nodeBtnsList[targetNodeIndex]) {
                showCardForIndex(targetNodeIndex, nodeBtnsList[targetNodeIndex]);
            }
        });

        // Individual node hover/click fallback
        nodeBtnsList.forEach((btn, idx) => {
            btn.addEventListener('mouseenter', () => {
                if (isInteractive) {
                    isUserHovering = true;
                    lastVisitedIndex = idx;
                    showCardForIndex(idx, btn);
                }
            });
            btn.addEventListener('click', () => {
                if (isInteractive) {
                    isUserHovering = true;
                    lastVisitedIndex = idx;
                    showCardForIndex(idx, btn);
                }
            });
        });

        // Cursor Leave: Release hover and resume direct scroll tracking
        trackEl.addEventListener('mouseleave', () => {
            if (!isInteractive) return;
            isUserHovering = false;
            updateFromScrollP(currentScrollP);
        });

        // Window resize repositioning
        window.addEventListener('resize', () => {
            if (activeIndex >= 0 && nodeBtnsList[activeIndex]) {
                positionCard(activeIndex, nodeBtnsList[activeIndex], false);
            }
        });

        // Render secondary Glowing List View & initialize View Switcher
        renderListView();
        initViewToggle();

        // ScrollTrigger entrance
        initJourneyEntrance();
        initSwitcherEntrance();
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
        const switcherBtn = document.getElementById('journey-view-switcher');
        const timelineStage = document.getElementById('journey-stage');
        const listStage = document.getElementById('journey-stage-list');
        if (!switcherBtn || !timelineStage || !listStage) return;

        const wordGrid = switcherBtn.querySelector('.brier-word-grid');
        const wordList = switcherBtn.querySelector('.brier-word-list');
        const subWordGrid = switcherBtn.querySelector('.sub-word-grid');
        const subWordList = switcherBtn.querySelector('.sub-word-list');

        // 4 Equal Square Modules (Monochromatic Design System Palette)
        const sq1 = switcherBtn.querySelector('.sq-1');
        const sq2 = switcherBtn.querySelector('.sq-2');
        const sq3 = switcherBtn.querySelector('.sq-3');
        const sq4 = switcherBtn.querySelector('.sq-4');

        const bar1 = switcherBtn.querySelector('.bar-1');
        const bar2 = switcherBtn.querySelector('.bar-2');
        const bar3 = switcherBtn.querySelector('.bar-3');

        // Current destination state ('list' when Timeline is active, 'grid' when List View is active)
        let currentDestination = 'list';

        function updateSwitcherGraphic(destination, immediate = false) {
            const duration = immediate ? 0 : 0.45;
            const ease = 'power3.inOut';

            if (destination === 'list') {
                // Timeline active -> Control communicates destination: VIEW LIST
                switcherBtn.setAttribute('data-destination', 'list');
                switcherBtn.setAttribute('aria-label', 'Switch to List View');

                if (typeof gsap !== 'undefined') {
                    // Brier Text Roll: Hide GRID, Show LIST
                    gsap.to(wordGrid, { yPercent: 100, opacity: 0, duration: duration * 0.75, ease: 'power3.out' });
                    gsap.to(wordList, { yPercent: 0, opacity: 1, duration: duration * 0.75, ease: 'power3.out' });

                    // Sub-label Text Roll: Hide VIEW (Grid state), Show VIEW (List state)
                    if (subWordGrid && subWordList) {
                        gsap.to(subWordGrid, { yPercent: 100, opacity: 0, duration: duration * 0.75, ease: 'power3.out' });
                        gsap.to(subWordList, { yPercent: 0, opacity: 1, duration: duration * 0.75, ease: 'power3.out' });
                    }

                    // Monochromatic Physics Movement: 3 Squares form List row thumbnails (6px x 6px); 4th square folds into Row 3
                    gsap.to(sq1, { attr: { x: 1, y: 1.5, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.70)', opacity: 1, duration, ease });
                    gsap.to(sq2, { attr: { x: 1, y: 11.0, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.50)', opacity: 1, duration, ease });
                    gsap.to(sq3, { attr: { x: 1, y: 20.5, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.32)', opacity: 1, duration, ease });
                    gsap.to(sq4, { attr: { x: 1, y: 20.5, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.18)', opacity: 0, duration, ease });

                    // Reveal 3 Ultra-Thin Wireframe Lines (16px wide x 2.4px high, rx: 0.5px, vertically centered)
                    gsap.to(bar1, { attr: { x: 10, y: 3.3, width: 16, height: 2.4, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.70)', opacity: 0.85, duration: duration * 0.85, delay: duration * 0.08, ease: 'back.out(1.15)' });
                    gsap.to(bar2, { attr: { x: 10, y: 12.8, width: 16, height: 2.4, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.50)', opacity: 0.70, duration: duration * 0.85, delay: duration * 0.12, ease: 'back.out(1.15)' });
                    gsap.to(bar3, { attr: { x: 10, y: 22.3, width: 16, height: 2.4, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.32)', opacity: 0.55, duration: duration * 0.85, delay: duration * 0.16, ease: 'back.out(1.15)' });
                } else {
                    if (wordGrid) { wordGrid.style.opacity = '0'; wordGrid.style.transform = 'translateY(100%)'; }
                    if (wordList) { wordList.style.opacity = '1'; wordList.style.transform = 'translateY(0%)'; }
                    if (subWordGrid) { subWordGrid.style.opacity = '0'; subWordGrid.style.transform = 'translateY(100%)'; }
                    if (subWordList) { subWordList.style.opacity = '1'; subWordList.style.transform = 'translateY(0%)'; }
                }
            } else {
                // List View active -> Control communicates destination: VIEW GRID
                switcherBtn.setAttribute('data-destination', 'grid');
                switcherBtn.setAttribute('aria-label', 'Switch to Grid View');

                if (typeof gsap !== 'undefined') {
                    // Brier Text Roll: Show GRID, Hide LIST
                    gsap.to(wordGrid, { yPercent: 0, opacity: 1, duration: duration * 0.75, ease: 'power3.out' });
                    gsap.to(wordList, { yPercent: -100, opacity: 0, duration: duration * 0.75, ease: 'power3.out' });

                    // Sub-label Text Roll: Show VIEW (Grid state), Hide VIEW (List state)
                    if (subWordGrid && subWordList) {
                        gsap.to(subWordGrid, { yPercent: 0, opacity: 1, duration: duration * 0.75, ease: 'power3.out' });
                        gsap.to(subWordList, { yPercent: -100, opacity: 0, duration: duration * 0.75, ease: 'power3.out' });
                    }

                    // Collapse Wireframe Content Bars back into squares
                    gsap.to([bar1, bar2, bar3], { attr: { width: 0 }, opacity: 0, duration: duration * 0.5, ease: 'power2.in' });

                    // Monochromatic Physics Movement: All 4 squares form a single horizontal row [■] [□] [□] [□] (6px x 6px, rx: 0.5px, 3.5px horizontal gap)
                    gsap.to(sq1, { attr: { x: 1, y: 11, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.70)', opacity: 1, duration, ease });
                    gsap.to(sq2, { attr: { x: 10.5, y: 11, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.50)', opacity: 1, duration, ease });
                    gsap.to(sq3, { attr: { x: 20.0, y: 11, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.32)', opacity: 1, duration, ease });
                    gsap.to(sq4, { attr: { x: 29.5, y: 11, width: 6, height: 6, rx: 0.5 }, fill: 'rgba(229, 228, 224, 0.18)', opacity: 1, duration, ease });
                } else {
                    if (wordGrid) { wordGrid.style.opacity = '1'; wordGrid.style.transform = 'translateY(0%)'; }
                    if (wordList) { wordList.style.opacity = '0'; wordList.style.transform = 'translateY(-100%)'; }
                    if (subWordGrid) { subWordGrid.style.opacity = '1'; subWordGrid.style.transform = 'translateY(0%)'; }
                    if (subWordList) { subWordList.style.opacity = '0'; subWordList.style.transform = 'translateY(-100%)'; }
                }
            }
        }

        // Mouse Spotlight Tracking Effect
        switcherBtn.addEventListener('mousemove', (e) => {
            const rect = switcherBtn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            switcherBtn.style.setProperty('--spotlight-x', `${x}px`);
            switcherBtn.style.setProperty('--spotlight-y', `${y}px`);
            switcherBtn.style.setProperty('--spotlight-opacity', '0.1');
        });

        switcherBtn.addEventListener('mouseleave', () => {
            switcherBtn.style.setProperty('--spotlight-opacity', '0');
            // Return to exact resting destination state
            updateSwitcherGraphic(currentDestination);
        });

        // Initialize default view state (Timeline visible -> control destination is LIST VIEW)
        updateSwitcherGraphic('list', true);

        switcherBtn.addEventListener('click', () => {
            if (typeof window.__playHoverSound === 'function') {
                window.__playHoverSound();
            }

            if (currentDestination === 'list') {
                // Switch view from Timeline -> List View
                currentDestination = 'grid';
                updateSwitcherGraphic('grid');

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
            } else {
                // Switch view from List View -> Timeline
                currentDestination = 'list';
                updateSwitcherGraphic('list');

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
                                updateFromScrollP(currentScrollP);
                            }
                        }
                    });
                } else {
                    listStage.style.display = 'none';
                    timelineStage.style.display = 'block';
                    timelineStage.style.opacity = '1';
                    if (!isUserHovering) {
                        updateFromScrollP(currentScrollP);
                    }
                }
            }
        });
    }

    function initSwitcherEntrance() {
        const switcherBtn = document.getElementById('journey-view-switcher');
        const section = document.getElementById('my-journey');
        if (!switcherBtn || !section) return;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.set(switcherBtn, { opacity: 0, y: 16, pointerEvents: 'none' });

            ScrollTrigger.create({
                trigger: section,
                start: 'top 75%',
                end: 'bottom+=150% bottom',
                onEnter: () => {
                    gsap.to(switcherBtn, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.45, ease: 'power2.out' });
                },
                onLeave: () => {
                    gsap.to(switcherBtn, { opacity: 0, y: 12, pointerEvents: 'none', duration: 0.35, ease: 'power2.in' });
                },
                onEnterBack: () => {
                    gsap.to(switcherBtn, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.45, ease: 'power2.out' });
                },
                onLeaveBack: () => {
                    gsap.to(switcherBtn, { opacity: 0, y: 12, pointerEvents: 'none', duration: 0.35, ease: 'power2.in' });
                }
            });
        } else {
            switcherBtn.style.opacity = '1';
            switcherBtn.style.pointerEvents = 'auto';
        }
    }

    function updateFromScrollP(p) {
        if (!isInteractive || isUserHovering) return;

        let targetIndex = 0;
        if (p < 0.18) targetIndex = 0;
        else if (p < 0.48) targetIndex = 1;
        else if (p < 0.78) targetIndex = 2;
        else targetIndex = 3;

        lastVisitedIndex = targetIndex;

        const displayPercent = Math.max(0, Math.min(100, p * 100));

        if (fillEl) {
            if (typeof gsap !== 'undefined') {
                gsap.to(fillEl, {
                    width: `${displayPercent}%`,
                    duration: 0.18,
                    ease: 'power1.out',
                    overwrite: 'auto'
                });
            } else {
                fillEl.style.width = `${displayPercent}%`;
            }
        }

        if (nodeBtnsList[targetIndex]) {
            showCardForIndex(targetIndex, nodeBtnsList[targetIndex]);
        }
    }

    function setCardContent(index) {
        const data = window.JOURNEY_DATA[index];
        if (!data) return;

        if (cardLogoEl) {
            cardLogoEl.src = data.logo;
            cardLogoEl.alt = `${data.company} logo`;
        }
        if (cardCompanyEl) cardCompanyEl.textContent = data.company;
        if (cardRoleEl) cardRoleEl.textContent = data.role;
        if (cardPeriodEl) cardPeriodEl.textContent = data.period.toUpperCase();
        if (cardDomainEl) cardDomainEl.textContent = data.domain.toUpperCase();
        if (cardDescEl) cardDescEl.textContent = data.desc;
    }

    function positionCard(index, nodeBtn, animate = true) {
        if (!trackEl || !cardEl || !nodeBtn || !pointerEl) return;

        const trackRect = trackEl.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;

        if (isMobile) return;

        const nodeDot = nodeBtn.querySelector('.node-dot') || nodeBtn;
        const dotRect = nodeDot.getBoundingClientRect();
        const nodeCenterX = dotRect.left + (dotRect.width / 2) - trackRect.left;

        const cardWidth = cardEl.offsetWidth || 440;
        let targetLeft = nodeCenterX - (cardWidth / 2);

        const minLeft = 0;
        const maxLeft = trackRect.width - cardWidth;
        targetLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));

        const pointerLeft = Math.max(18, Math.min(cardWidth - 18, nodeCenterX - targetLeft));
        pointerEl.style.left = `${pointerLeft}px`;

        if (typeof gsap !== 'undefined' && animate && cardEl.classList.contains('is-visible')) {
            gsap.to(cardEl, {
                left: targetLeft,
                duration: 0.42,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        } else {
            cardEl.style.left = `${targetLeft}px`;
        }
    }

    function showCardForIndex(index, nodeBtn) {
        if (index === activeIndex) return;
        if (!cardEl) return;

        if (nodeBtnsList.length) {
            nodeBtnsList.forEach((btn, i) => {
                if (i === index) btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }

        const wasVisible = cardEl.classList.contains('is-visible');

        if (typeof window.__playHoverSound === 'function') {
            window.__playHoverSound();
        }

        if (!wasVisible) {
            setCardContent(index);
            positionCard(index, nodeBtn, false);
            cardEl.classList.add('is-visible');

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(cardEl,
                    { opacity: 0, y: 10, scale: 0.97 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power3.out' }
                );
            }
        } else {
            positionCard(index, nodeBtn, true);

            if (typeof gsap !== 'undefined' && cardInnerEl) {
                gsap.to(cardInnerEl, {
                    opacity: 0,
                    y: -5,
                    duration: 0.12,
                    ease: 'power2.in',
                    onComplete: () => {
                        setCardContent(index);
                        gsap.fromTo(cardInnerEl,
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
                if (!isUserHovering) {
                    updateFromScrollP(currentScrollP);
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

        // Pinned scroll-driven timeline tracking forward & backward
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            scrub: 0.3,
            onUpdate: (self) => {
                currentScrollP = self.progress;
                if (isInteractive && !isUserHovering) {
                    updateFromScrollP(self.progress);
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderTimeline);
    } else {
        renderTimeline();
    }
}());
