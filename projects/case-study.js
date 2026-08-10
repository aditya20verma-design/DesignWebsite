// ─────────────────────────────────────────────────────────────────────────────
// case-study.js — Master Case Study Timeline Navigation & Interactive Engine
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    initTimelineNav();
});

function initTimelineNav() {
    const sections = document.querySelectorAll(".cs-section");
    const navLinks = document.querySelectorAll(".cs-timeline-link");

    if (!sections.length || !navLinks.length) return;

    // ── 1. ScrollSpy IntersectionObserver for Sticky Timeline Active State ──
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                
                navLinks.forEach((link) => {
                    const href = link.getAttribute("href");
                    if (href === `#${id}`) {
                        link.classList.add("active");
                        // Ensure horizontal scroll container brings active link into view on mobile
                        const parentNav = link.closest('.cs-timeline-nav');
                        if (parentNav && window.innerWidth <= 1024) {
                            link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    } else {
                        link.classList.remove("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    // ── 2. Smooth Click-to-Scroll Handling ─────────────────────────────────
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");
            if (targetId && targetId.startsWith("#")) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 90;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });
}
