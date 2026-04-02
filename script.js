// ── Hamburger / Mobile Nav ────────────────────────────────────────────────
(function () {
    const hamburger   = document.getElementById('hamburger');
    const mobileNav   = document.getElementById('mobile-nav');
    const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

    function openMenu() {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.contains('open') ? closeMenu() : openMenu();
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 350); // wait for overlay to close
                }
            }
        });
    });
})();

// ── Scroll-aware Nav State (transparent hero → frosted glass) ─────────────
// Defined as a global so Lenis can also call it via its own scroll event
const nav = document.querySelector('nav');

function updateNavState(scrollPos) {
    if (!nav) return;
    // Hero is 100vh; switch to frosted glass after 60% of hero has passed
    const threshold = window.innerHeight * 0.6;
    if (scrollPos < threshold) {
        nav.classList.add('at-hero');
        nav.classList.remove('scrolled');
    } else {
        nav.classList.remove('at-hero');
        nav.classList.add('scrolled');
    }
}

// Run on page load
updateNavState(window.scrollY || 0);
// Fallback: native window scroll (works on desktop + when Lenis is passive)
window.addEventListener('scroll', () => updateNavState(window.scrollY), { passive: true });

// ── Detect touch/mobile for disabling heavy effects ───────────────────────
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const isMobile = window.innerWidth <= 600;

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 0.8, // M3 tuning: faster, less floaty scroll
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
});

// Initial AV Logo Reveal (Single Wipe Masking)
gsap.set('.av-shape', { clipPath: "inset(100% 0% 0% 0%)" });

gsap.to('.av-shape', {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: 1.2,
    delay: 1.5,
    ease: "power2.inOut"
});

// Landonorris Scale & Signature Reveal Effect — desktop only
if (!isMobile) {
let isLogoHidden = false;
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero-track",
        start: "top top", /* Starts instantly when scrolling down from top */
        end: "bottom bottom", /* Finishes when track completes */
        scrub: 1, // Add a bit of smoothing (1 sec delay) to the scrub for premium feel
        onUpdate: (self) => {
            const p = self.progress;
            // Hide the logo while actively traversing the scale gap
            if (p > 0.05 && p < 0.95) {
                if (!isLogoHidden) {
                    gsap.to('.av-shape', { clipPath: "inset(0% 0% 100% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" });
                    isLogoHidden = true;
                }
            } else {
                // Return the logo beautifully when scroll is at rest (either top or fully bottom)
                if (isLogoHidden) {
                    gsap.to('.av-shape', { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
                    isLogoHidden = false;
                }
            }
        }
    }
});

gsap.set('.hero', { clipPath: "inset(0vh calc(0vw - 0vh) 0vh calc(0vw - 0vh) round 0px)" });

tl.to('.hero', {
    scale: 0.35, /* Container shrinks significantly down to form an elegant wide block */
    clipPath: "inset(0vh calc(50vw - 80vh) 0vh calc(50vw - 80vh) round 0px)", /* Perfect Horizontal Golden Ratio (1.6x width, 1x height) */
    opacity: 0.35, /* Reduce transparency */
    ease: "power2.inOut"
}, 0);

tl.to('.unicorn-canvas', {
    scale: 1.6, /* Moderate parallax counter-scale */
    yPercent: 10, /* Slight downward crop during scroll */
    ease: "power2.inOut"
}, 0);

tl.to('.signature-container', {
    scale: 0.6, /* Makes it significantly smaller in the end state */
    ease: "power2.inOut"
}, 0);

tl.to('.av-signature path', {
    strokeDashoffset: 0, /* Draws the signature path fully */
    ease: "power2.inOut"
}, 0);

} // end !isMobile

// Hide persistent AV logo when entering content section
ScrollTrigger.create({
    trigger: ".content-wrapper",
    start: "top 60%", // Triggers right as the dark background comes up over the scaled hero
    onEnter: () => gsap.to('.av-shape', { clipPath: "inset(0% 0% 100% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" }),
    onLeaveBack: () => gsap.to('.av-shape', { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power2.inOut", overwrite: "auto" })
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
// CRITICAL: Also drive the nav state from Lenis's scroll on every frame.
// This is the only reliable way to update the nav on mobile where Lenis
// intercepts touch scroll before window.scroll events fire.
lenis.on('scroll', ({ scroll }) => updateNavState(scroll));

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// Shared mouse coordinates (used by cursor + particle system)
let mouseX = 0; let mouseY = 0;

// 2. Custom Cursor Implementation (desktop only)
if (!isTouchDevice) {
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const hoverTriggers = document.querySelectorAll('.hover-trigger, .view-btn, a, .magnetic');

let outlineX = 0; let outlineY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
    
    // Bind cursor coordinates to global CSS runtime layout (for mask tracking)
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
    outlineX += (mouseX - outlineX) * dt;
    outlineY += (mouseY - outlineY) * dt;
    gsap.set(cursorOutline, { x: outlineX, y: outlineY });
});

hoverTriggers.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover-state'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover-state'));
});
} // end !isTouchDevice

// 3. Magnetic UI Elements (M3 Physics - No Elastic)
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
        const bounds = el.getBoundingClientRect();
        const x = e.clientX - bounds.left - bounds.width / 2;
        const y = e.clientY - bounds.top - bounds.height / 2;
        const strength = el.dataset.strength || 20;
        gsap.to(el, { 
            x: (x / bounds.width) * strength, 
            y: (y / bounds.height) * strength, 
            duration: 0.2, // Short duration tracking
            ease: "power2.out" 
        });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { 
            x: 0, y: 0, 
            duration: 0.4, // M3 Standard Decelerate exit 
            ease: "power2.out" 
        });
    });
});

// 4. Initial Loader Sequence (Disabled visually in CSS, keeping timeline for entrance reveals only)
const tlLoader = gsap.timeline();

tlLoader.fromTo('.loader-text', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" } // M3 Emphasized
    )
    .to('.loader-text', { y: -50, opacity: 0, duration: 0.5, ease: "power4.in", delay: 0.3 })
    .to('.loader', { yPercent: -100, duration: 0.6, ease: "power2.inOut", onComplete: () => lenis.start() }) // M3 Long 4
    .fromTo('.reveal-text', 
        { y: 100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "expo.out" }, // Fast staggers
        "-=0.2"
    )
    .fromTo('.reveal-text-delay', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 
        "-=0.4"
    );

// 5. ScrollTrigger Animations
gsap.to('#hero-bg-text', {
    xPercent: -30,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

document.querySelectorAll('.project').forEach((section) => {
    const marquee = section.querySelector('.project-bg-text');
    if (marquee) {
        const dir = marquee.classList.contains('marquee-left') ? -30 : 30;
        gsap.to(marquee, { xPercent: dir, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 } });
    }

    const parallaxImage = section.querySelector('.parallax-image');
    if (parallaxImage) {
        gsap.to(parallaxImage, { 
            yPercent: 20, 
            ease: "none", 
            scrollTrigger: {
                trigger: section.querySelector('.project-image-wrapper'),
                start: "top bottom",
                end: "bottom top",
                scrub: true
            } 
        });

        // M3 Scale Reveal
        gsap.fromTo(section.querySelector('.project-image-wrapper'), 
            { scale: 0.9, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", scrollTrigger: {
                trigger: section,
                start: "top 80%", 
            }}
        );
    }

    // Parallax mapping for text content
    const content = section.querySelector('.project-content');
    if (content) {
        gsap.fromTo(content, 
            { y: 50 }, 
            { y: -50, ease: "none", scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }}
        );
    }

    // M3 Text Stagger Reveal
    const texts = section.querySelectorAll('.reveal-text-scroll');
    if (texts.length > 0) {
        gsap.fromTo(texts, 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", scrollTrigger: {
                trigger: section,
                start: "top 70%", 
            }}
        );
    }
});

// 6. Advanced Text Reveal (Character Staggering mapped to M3 Short tokens)
document.querySelectorAll('.split-type').forEach((text) => {
    const words = text.innerText.split(" ");
    text.innerHTML = words.map(word => `<span style="display:inline-block; overflow:hidden;"><span style="display:inline-block;">${word}&nbsp;</span></span>`).join("");

    const innerSpans = text.querySelectorAll('span > span');

    gsap.from(innerSpans, {
        scrollTrigger: {
            trigger: text,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: "100%",
        duration: 0.5, // M3 Long 2
        stagger: 0.03, // M3 Short Micro
        ease: "expo.out" // M3 Emphasized
    });
});

// 7. Project Image "Tilt" Effect (M3 Rational Motion)
document.querySelectorAll('.project-image-wrapper').forEach((img) => {
    img.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = img.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;

        gsap.to(img, {
            rotationY: x * 10,
            rotationX: -y * 10,
            transformPerspective: 1000,
            duration: 0.3, // M3 Medium 2
            ease: "power2.out"
        });
    });

    img.addEventListener('mouseleave', () => {
        // Return without elastic bounce physics
        gsap.to(img, { rotationY: 0, rotationX: 0, duration: 0.5, ease: "power2.out" }); 
    });
});

// 8. Kinetic Text Hover (OffBrand Style Character Roll)
document.querySelectorAll('.hover-stagger').forEach(link => {
    const text = link.innerText;
    link.innerHTML = ''; // Clear existing
    
    const wrapperUp = document.createElement('div');
    const wrapperDown = document.createElement('div');
    wrapperUp.classList.add('stagger-up');
    wrapperDown.classList.add('stagger-down');
    
    text.split('').forEach((char, i) => {
        const spanUp = document.createElement('span');
        const spanDown = document.createElement('span');
        
        const content = char === ' ' ? '&nbsp;' : char;
        spanUp.innerHTML = content;
        spanDown.innerHTML = content;
        
        const delay = `${i * 0.02}s`;
        spanUp.style.transitionDelay = delay;
        spanDown.style.transitionDelay = delay;
        
        wrapperUp.appendChild(spanUp);
        wrapperDown.appendChild(spanDown);
    });
    
    link.appendChild(wrapperUp);
    link.appendChild(wrapperDown);
});

// 9. Kinetic Dual-Arrow Swap Wipe (hover physics)
document.querySelectorAll('.cta-arrow, .nav-arrow').forEach((arrow) => {
    const rawHTML = arrow.innerHTML;
    const rawText = arrow.textContent.trim();
    
    const isDiag = rawHTML.includes('nearr') || rawText === '↗';
    const isDown = rawHTML.includes('darr') || rawText === '↓';

    const char = rawText || '→'; 
    arrow.innerHTML = '';
    
    arrow.style.position = 'relative';
    arrow.style.display = 'inline-flex';
    arrow.style.width = '1em'; /* Reverted to tight 1em bound for exact wipe matching */
    arrow.style.height = '1em';
    arrow.style.alignItems = 'center';
    arrow.style.justifyContent = 'center';
    arrow.style.overflow = 'hidden'; 
    
    const arr1 = document.createElement('span');
    arr1.textContent = char;
    arr1.style.position = 'absolute';
    
    const arr2 = document.createElement('span');
    arr2.textContent = char;
    arr2.style.position = 'absolute';

    // Use exact 100% boundaries to match the text stagger translate Y distance exactly.
    let outX = '100%', outY = '0%'; 
    let inX = '-100%', inY = '0%';  

    if (isDiag) {
        outX = '100%'; outY = '-100%'; 
        inX = '-100%'; inY = '100%';   
    } else if (isDown) {
        outX = '0%'; outY = '100%'; 
        inX = '0%'; inY = '-100%';  
    }

    gsap.set(arr2, { x: inX, y: inY });

    arrow.appendChild(arr1);
    arrow.appendChild(arr2);

    const parentLink = arrow.closest('a');
    if (parentLink) {
        /* Synced precisely to transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1) */
        parentLink.addEventListener('mouseenter', () => {
            gsap.to(arr1, { x: outX, y: outY, duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
            gsap.to(arr2, { x: "0%", y: "0%", duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
        });
        parentLink.addEventListener('mouseleave', () => {
            gsap.to(arr1, { x: "0%", y: "0%", duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
            gsap.to(arr2, { x: inX, y: inY, duration: 0.4, ease: "cubic-bezier(0.2, 0, 0, 1)" });
        });
    }
});

// 9b. Copy Icon Wipe (same kinetic dual-span pattern as arrows)
const emailPill = document.getElementById('email-copy-btn');
if (emailPill) {
    const icon1 = emailPill.querySelector('.copy-icon-1');
    const icon2 = emailPill.querySelector('.copy-icon-2');
    emailPill.addEventListener('mouseenter', () => {
        gsap.to(icon1, { y: '-100%', duration: 0.4, ease: "power2.inOut" });
        gsap.to(icon2, { y: '0%',    duration: 0.4, ease: "power2.inOut" });
    });
    emailPill.addEventListener('mouseleave', () => {
        gsap.to(icon1, { y: '0%',    duration: 0.4, ease: "power2.inOut" });
        gsap.to(icon2, { y: '100%',  duration: 0.4, ease: "power2.inOut" });
    });
}


if (typeof UnicornStudio !== 'undefined') {
    UnicornStudio.init();
}

// 11. Interactive Independent Particle System Overlay
const dotCanvas = document.getElementById('dotsCanvas');
if (dotCanvas) {
    const ctx = dotCanvas.getContext('2d');
    const dotSpacing = 24;
    const repelRadius = 150;
    const maxDisplacement = 12; // Controls how far points mathematically glitch away
    let dots = [];

    function initDots() {
        const parentRect = dotCanvas.parentElement.getBoundingClientRect();
        dotCanvas.width = parentRect.width;
        dotCanvas.height = parentRect.height;
        dots = [];
        
        for (let x = 0; x <= dotCanvas.width; x += dotSpacing) {
            for (let y = 0; y <= dotCanvas.height; y += dotSpacing) {
                dots.push({
                    ox: x, oy: y, // Immutable mathematical origin
                    x: x, y: y,   // Fluid current position
                    vx: 0, vy: 0  // Spring physics velocity vectors
                });
            }
        }
    }

    initDots();
    window.addEventListener('resize', initDots);

    // Run custom rendering loop synchronously with GSAP ticker
    gsap.ticker.add(() => {
        // Completely clear the canvas for the next memory frame
        ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
        
        const parentRect = dotCanvas.getBoundingClientRect();
        const localMouseX = mouseX - parentRect.left;
        const localMouseY = mouseY - parentRect.top;

        // Increased opacity for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';

        for (let i = 0; i < dots.length; i++) {
            let dot = dots[i];
            
            // Step 1: Independently calculate distance of this specific dot to the cursor
            const dx = localMouseX - dot.ox;
            const dy = localMouseY - dot.oy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetX = dot.ox;
            let targetY = dot.oy;

            // Step 2: If the dot is within the cursor blast radius, calculate its explicit repulsion coordinate
            if (dist < repelRadius && dist > 1) {
                // Force gets exponentially stronger the closer the cursor is to the dot
                const force = Math.pow((repelRadius - dist) / repelRadius, 2);
                targetX = dot.ox - (dx / dist) * force * maxDisplacement;
                targetY = dot.oy - (dy / dist) * force * maxDisplacement;
            }

            // Step 3: Fast, tight spring physics pulling the particle toward its calculated target
            dot.vx += (targetX - dot.x) * 0.3; // Spring strength (tight)
            dot.vy += (targetY - dot.y) * 0.3;
            
            // Friction damping stops any continuous wave "blob" physics by absorbing the kinetic energy instantly
            dot.vx *= 0.6; 
            dot.vy *= 0.6;
            
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Step 4: Draw the discrete particle element into memory
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1.25, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// 12. Navigation Smooth Scrolling
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        
        if (!targetId || !targetId.startsWith('#')) return;
        
        e.preventDefault();
        
        if (targetId === '#') {
            // Scroll to top
            lenis.scrollTo(0, {
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            // Scroll to target section
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    offset: 0
                });
            }
        }
    });
});

// 13. Email Copy CTA Interaction
const emailCopyBtn = document.getElementById('email-copy-btn');
if (emailCopyBtn) {
    emailCopyBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const emailText   = emailCopyBtn.querySelector('.email-text');
        const copiedText  = emailCopyBtn.querySelector('.copied-text');
        const copyIcon1   = emailCopyBtn.querySelector('.copy-icon-1');
        const copyIcon2   = emailCopyBtn.querySelector('.copy-icon-2');
        const checkIcon   = emailCopyBtn.querySelector('.check-icon-1');
        const iconStack   = emailCopyBtn.querySelector('.icon-stack');
        const originalEmail = 'aditya20verma@gmail.com';

        try {
            await navigator.clipboard.writeText(originalEmail);

            // Crossfade text
            if (emailText)  emailText.style.opacity  = '0';
            if (copiedText) copiedText.style.opacity  = '1';

            // Swap icon: hide copy wipe, show check
            if (copyIcon1) copyIcon1.style.display = 'none';
            if (copyIcon2) copyIcon2.style.display = 'none';
            if (checkIcon) { checkIcon.style.display = 'inline-flex'; }

            // Revert after 1.5s
            setTimeout(() => {
                if (emailText)  emailText.style.opacity  = '1';
                if (copiedText) copiedText.style.opacity  = '0';
                // Restore copy icons, reset wipe positions
                if (copyIcon1) { copyIcon1.style.display = 'inline-flex'; gsap.set(copyIcon1, { y: '0%' }); }
                if (copyIcon2) { copyIcon2.style.display = 'inline-flex'; gsap.set(copyIcon2, { y: '100%' }); }
                if (checkIcon) checkIcon.style.display = 'none';
            }, 1500);

        } catch (err) {
            console.error('Failed to copy email: ', err);
        }
    });
}