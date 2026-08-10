/**
 * ── Testimonials Config ───────────────────────────────────────────────────
 * Single source of truth for all testimonial card content.
 * To add a new testimonial: push a new object to TESTIMONIALS_DATA.
 * To update content: edit the fields below.
 * DO NOT touch index.html for testimonial changes.
 * ─────────────────────────────────────────────────────────────────────────
 */

window.TESTIMONIALS_DATA = [
    {
        logo:    'sections/about/assets/Company logos/narayana.svg',
        logoAlt: 'Narayana Health Logo',
        name:    'Rohan Mehta',
        company: 'Narayana Health',
        role:    'Product Manager',
        quote:   '"Aditya has a rare ability to connect user empathy with system-level thinking. He shipped three major modules in under a year — and they just worked, for patients and ops teams alike."',
    },
    {
        logo:    'sections/about/assets/Company logos/branchx.svg',
        logoAlt: 'BranchX Logo',
        name:    'Priya Nair',
        company: 'BranchX',
        role:    'Engineering Lead',
        quote:   '"Aditya built our design system from scratch. Devs loved working with him — perfectly documented, pixel-precise. Cut our handoff friction in half and raised the bar for every sprint."',
    },
    {
        logo:    'sections/about/assets/Company logos/avanatri.svg',
        logoAlt: 'Avantari Technologies Logo',
        name:    'Karan Desai',
        company: 'Avantari',
        role:    'Head of Product',
        quote:   '"One of the sharpest design interns we\'ve worked with. He didn\'t just deliver screens — he delivered a product mindset that outlasted the internship and influenced our long-term plans."',
    },
    {
        logo:    'sections/about/assets/Company logos/architecture.svg',
        logoAlt: 'Architecture Logo',
        name:    'Amit Soni',
        company: 'Architecture',
        role:    'Principal Architect',
        quote:   '"Aditya brings the rigor of architectural thinking to every brief. He sees the whole before anyone else sees the parts — and that changes everything about the final output."',
    },
];

/**
 * Render testimonials into the DOM.
 * Called automatically on DOMContentLoaded.
 */
(function renderTestimonials() {
    const stage = document.querySelector('#testimonials .testimonial-stage');
    if (!stage || !window.TESTIMONIALS_DATA) return;

    stage.innerHTML = window.TESTIMONIALS_DATA.map((t, i) => `
        <div class="exp-card" data-index="${i}" tabindex="0" role="article" aria-label="Testimonial from ${t.name}">
            <div class="exp-card-header">
                <div class="exp-card-left">
                    <img src="${t.logo}" class="exp-card-logo" alt="${t.logoAlt}">
                    <span class="exp-card-company">${t.name}</span>
                </div>
                <span class="exp-date">${t.company}</span>
            </div>
            <h3 class="exp-role">${t.role}</h3>
            <p class="exp-desc">${t.quote}</p>
        </div>
    `).join('');
}());
