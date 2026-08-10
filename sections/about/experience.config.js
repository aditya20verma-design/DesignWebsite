/**
 * ── Experience Highlights Config ──────────────────────────────────────────
 * Single source of truth. Edit content here — no touching index.html.
 * Reverse-chronological order: current role first.
 * ──────────────────────────────────────────────────────────────────────────
 */

window.EXPERIENCE_DATA = [
    {
        company:  'Narayana Health',
        logo:     'sections/about/assets/Company logos/narayana.svg',
        role:     'Product Designer',
        period:   'Nov 2024 — Present',
        duration: '1 year 10 months',
        domain:   'Healthcare',
        projects: 'Health Records • Appointment Booking • Health Checkups • Patient Kiosk',
    },
    {
        company:  'BranchX',
        logo:     'sections/about/assets/Company logos/branchx.svg',
        role:     'UX Designer',
        period:   'Sep 2023 — Nov 2024',
        duration: '1 year 2 months',
        domain:   'Fintech',
        projects: 'Merchant Platform • Design System • ONDC Experience',
    },
    {
        company:  'Avantari Technologies',
        logo:     'sections/about/assets/Company logos/avanatri.svg',
        role:     'Product Design Intern',
        period:   'Jun 2022 — Aug 2022',
        duration: '3 months',
        domain:   'Industrial Design',
        projects: 'Manufacturing • Product Research • DFA • Industrial Design',
    },
    {
        company:  'Architecture',
        logo:     'sections/about/assets/Company logos/architecture.svg',
        role:     'Architectural Designer',
        period:   'Aug 2020 — Jul 2021',
        duration: '1 year',
        domain:   'Architecture',
        projects: 'Residential • Commercial • Spatial Systems • Client Delivery',
    }
];

/**
 * Render rows into the DOM, then kick off animations.
 */
(function renderExperienceTable() {
    function init() {
        const container = document.getElementById('exp-rows-list');
        if (!container || !window.EXPERIENCE_DATA) return;

        container.innerHTML = window.EXPERIENCE_DATA.map((item, i) => `
            <div class="exp-row" data-index="${i}" role="listitem">
                <div class="exp-row-curtain" aria-hidden="true"></div>
                <div class="exp-row-inner">

                    <!-- Company: logo + name -->
                    <div class="exp-col col-company">
                        <img
                            class="exp-logo"
                            src="${item.logo}"
                            alt="${item.company} logo"
                            loading="lazy"
                            draggable="false"
                        >
                        <span class="company-name">${item.company}</span>
                    </div>

                    <!-- Role + secondary projects reveal -->
                    <div class="exp-col col-role-wrap">
                        <span class="exp-role-title">${item.role}</span>
                        <span class="exp-projects-line">${item.projects}</span>
                    </div>

                    <!-- Period + secondary duration reveal -->
                    <div class="exp-col col-period-wrap">
                        <span class="exp-period-dates">${item.period}</span>
                        <span class="exp-duration-line">${item.duration}</span>
                    </div>

                    <!-- Domain -->
                    <span class="exp-col col-domain">${item.domain}</span>

                </div>
            </div>
        `).join('');

        initExperienceAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());


/* ────────────────────────────────────────────────────────────────────────────
 * initExperienceAnimations
 * 1. Staggered curtain wipe entrance (Lando Norris staircase)
 * 2. Restrained row hover — bg glow + logo reveal + smooth fade for metadata
 * ──────────────────────────────────────────────────────────────────────────── */
function initExperienceAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section  = document.getElementById('experience-highlights');
    const title    = document.querySelector('.exp-table-title');
    const colHeads = document.querySelector('.exp-table-cols');
    const rows     = document.querySelectorAll('.exp-row');
    const curtains = document.querySelectorAll('.exp-row-curtain');
    const inners   = document.querySelectorAll('.exp-row-inner');
    if (!section || !rows.length) return;

    // ── Phase 8: Reveal Content in strict architectural order ────────────────
    // Order: Experience heading → Column Headers → Row 1 → Row 2 → Row 3 → Row 4
    if (title) gsap.set(title, { opacity: 0, y: 18 });
    if (colHeads) gsap.set(colHeads, { opacity: 0, y: 10 });
    gsap.set(inners, { opacity: 0, y: 12 });
    gsap.set(curtains, { scaleX: 0, transformOrigin: 'left center' });

    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#experience-highlights',
            start: 'top 82%',
            toggleActions: 'play none none reverse'
        }
    });

    // 1. Heading reveal (Brier Orange)
    if (title) {
        masterTl.to(title, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0);
    }

    // 2. Column headers reveal
    if (colHeads) {
        masterTl.to(colHeads, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out'
        }, 0.2);
    }

    // 3. Staggered row curtain wipes + inner content assembly (0.68s sweep, 0.14s stagger, power3.inOut)
    masterTl.to(curtains, {
        scaleX: 1,
        duration: 0.68,
        stagger: 0.14,
        ease: 'power3.inOut',
        onComplete() {
            gsap.set(inners, { opacity: 1 });
        }
    }, 0.3)
    .to(inners, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.14,
        ease: 'power3.out'
    }, 0.6)
    .to(curtains, {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 0.65,
        stagger: 0.14,
        ease: 'power3.inOut'
    }, 0.75);

    // ── 3. Row hover — restrained, editorial, zero layout shift ─────────────
    document.querySelectorAll('.exp-row').forEach(row => {
        const logo         = row.querySelector('.exp-logo');
        const projectsLine = row.querySelector('.exp-projects-line');
        const durationLine = row.querySelector('.exp-duration-line');

        row.addEventListener('mouseenter', () => {
            // Soft row bg brightening
            gsap.to(row, {
                backgroundColor: 'rgba(255,255,255,0.032)',
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });
            // Logo: reveal in full color (remove grayscale)
            if (logo) {
                gsap.to(logo, {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
                logo.style.filter = 'none';
            }
            // Projects line: smooth opacity fade (no position shift)
            if (projectsLine) gsap.to(projectsLine, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });
            // Duration line: smooth opacity fade (no position shift)
            if (durationLine) gsap.to(durationLine, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });

            if (typeof window.__playHoverSound === 'function') window.__playHoverSound();
        });

        row.addEventListener('mouseleave', () => {
            gsap.to(row, {
                backgroundColor: 'transparent',
                duration: 0.35,
                ease: 'power2.inOut',
                overwrite: 'auto'
            });
            // Logo: back to monochrome clear state
            if (logo) {
                gsap.to(logo, {
                    opacity: 0.65,
                    duration: 0.3,
                    ease: 'power2.inOut',
                    overwrite: 'auto'
                });
                logo.style.filter = 'grayscale(1) brightness(2)';
            }
            if (projectsLine) gsap.to(projectsLine, {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                overwrite: 'auto'
            });
            if (durationLine) gsap.to(durationLine, {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                overwrite: 'auto'
            });
        });
    });
}
