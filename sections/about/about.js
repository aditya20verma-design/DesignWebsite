/**
 * About Me Section — Lando Norris Style Scroll Reveal
 * Uses GSAP ScrollTrigger for masked text and staggered row reveals.
 */
(function () {
    'use strict';

    function init() {
        var section = document.getElementById('about-me');
        if (!section) return;

        if (typeof gsap === 'undefined' || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        // 1. Initial fade-in of the section container
        var sectionObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                setTimeout(function () {
                    section.classList.add('about-me--visible');
                    ScrollTrigger.refresh();
                }, 100);
                sectionObserver.disconnect();
            }
        }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
        sectionObserver.observe(section);

        // 2. Identity Block & Thinking Statements (Masked Text Reveal)
        var maskBlocks = section.querySelectorAll('.about-me__identity, .about-me__thinking, .about-me__transition-line, .about-me__closing');
        
        maskBlocks.forEach(function(block) {
            var lines = block.querySelectorAll('.mask-text');
            if (!lines.length) return;
            
            gsap.to(lines, {
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%"
                },
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1.2,
                ease: "power3.inOut",
                stagger: 0.1
            });
        });

        // 3. Rule Animations (Borders expanding)
        var rules = section.querySelectorAll('.rule-anim');
        rules.forEach(function(rule) {
            gsap.to(rule, {
                scrollTrigger: {
                    trigger: rule,
                    start: "top 90%"
                },
                scaleX: 1,
                duration: 1.2,
                ease: "power3.inOut"
            });
        });

        // 4. Career Rows (Borders + Masked Elements)
        // Career rows have a pseudo-element top border (animated via CSS class)
        // and mask-text content inside.
        ScrollTrigger.batch('.about-me__row', {
            start: "top 85%",
            onEnter: function(batch) {
                batch.forEach(function(row, i) {
                    var tl = gsap.timeline({ delay: i * 0.1 });
                    
                    // Add CSS class to trigger the pseudo-element border expansion (defined in CSS)
                    tl.add(function() {
                        row.classList.add('row--visible');
                    }, 0);
                    
                    var rowTexts = row.querySelectorAll('.mask-text');
                    tl.to(rowTexts, {
                        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                        duration: 1.2,
                        ease: "power3.inOut",
                        stagger: 0.05
                    }, 0.1); // text reveals slightly after border starts
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
