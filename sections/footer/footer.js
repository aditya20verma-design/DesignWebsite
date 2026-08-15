// ─────────────────────────────────────────────────────────────────────────────
// footer.js — Footer Section Animations and Logic
// Includes: Footer Reveal (Icomat style), Footer Headline Repel, Hover Sounds, Deck Reveal
// ─────────────────────────────────────────────────────────────────────────────

export function initFooter() {

    // ── Footer Reveal (Perfect Icomat Match) ──
    const footerEl = document.getElementById('contact');
    const innerEl = document.querySelector('.footer-inner');
    if (footerEl && innerEl) {
        gsap.fromTo(innerEl, 
            { yPercent: -70 }, 
            { yPercent: 0, ease: 'none', scrollTrigger: { trigger: footerEl, start: 'top bottom', end: 'bottom bottom', scrub: true } }
        );
    }

    // ── Footer Headline Per-Letter Cursor Repel ──
    const heading = document.querySelector('.footer-heading');
    if (heading && !window.matchMedia('(hover: none)').matches) {
        const RADIUS = 200, MAX_PX = 25, SLACK = 250;
        function wordSplit(text) {
            const frag = document.createDocumentFragment(), words = text.split(' ');
            words.forEach((word, wi) => {
                if (word.length === 0) { frag.appendChild(document.createTextNode(' ')); return; }
                const wordEl = document.createElement('span');
                wordEl.style.cssText = 'display:inline-block;white-space:nowrap;';
                Array.from(word).forEach(ch => {
                    const s = document.createElement('span'); s.textContent = ch; s.dataset.repel = '';
                    s.style.cssText = 'display:inline-block;will-change:transform;vertical-align:baseline;';
                    wordEl.appendChild(s);
                });
                frag.appendChild(wordEl);
                if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
            });
            return frag;
        }
        (function walk(node) {
            Array.from(node.childNodes).forEach(kid => {
                if (kid.nodeType === Node.ELEMENT_NODE) {
                    if (kid.id !== 'email-copy-btn' && kid.tagName !== 'BR') walk(kid);
                } else if (kid.nodeType === Node.TEXT_NODE && kid.textContent.trim()) {
                    kid.parentNode.replaceChild(wordSplit(kid.textContent), kid);
                }
            });
        }(heading));

        const chars = Array.from(heading.querySelectorAll('[data-repel]'));
        if (chars.length) {
            const proxies = chars.map(el => ({
                el: el,
                pushX: gsap.quickTo(el, 'x', { duration: 0.35, ease: 'expo.out', overwrite: true }),
                pushY: gsap.quickTo(el, 'y', { duration: 0.35, ease: 'expo.out', overwrite: true }),
                returnX: gsap.quickTo(el, 'x', { duration: 0.75, ease: 'power2.out', overwrite: true }),
                returnY: gsap.quickTo(el, 'y', { duration: 0.75, ease: 'power2.out', overwrite: true }),
                inRange: false
            }));

            let mx = -9999, my = -9999, hRect = heading.getBoundingClientRect();
            window.addEventListener('mousemove', (e) => { if (e._isAutoPan) return; mx = e.clientX; my = e.clientY; }, { passive: true });
            function refreshRect() { hRect = heading.getBoundingClientRect(); }
            window.addEventListener('scroll', refreshRect, { passive: true });
            window.addEventListener('resize', refreshRect);

            gsap.ticker.add(() => {
                if (mx < hRect.left - SLACK || mx > hRect.right + SLACK || my < hRect.top - SLACK || my > hRect.bottom + SLACK) {
                    proxies.forEach(p => { if (p.inRange) { p.returnX(0); p.returnY(0); p.inRange = false; } }); return;
                }
                proxies.forEach(p => {
                    const r = p.el.getBoundingClientRect(), cx = r.left + r.width * 0.5, cy = r.top + r.height * 0.5;
                    const dx = cx - mx, dy = cy - my, d = Math.sqrt(dx * dx + dy * dy);
                    if (d < RADIUS && d > 0) {
                        const f = (1 - d / RADIUS) * (1 - d / RADIUS);
                        p.pushX((dx / d) * f * MAX_PX); p.pushY((dy / d) * f * MAX_PX); p.inRange = true;
                    } else if (p.inRange) { p.returnX(0); p.returnY(0); p.inRange = false; }
                });
            });
        }
    }

    // ── Email Copy CTA Interaction ──
    const emailCopyBtn = document.getElementById('email-copy-btn');
    if (emailCopyBtn) {
        const emailText = emailCopyBtn.querySelector('.email-text'), copiedText = emailCopyBtn.querySelector('.copied-text');
        const copyIcon1 = emailCopyBtn.querySelector('.copy-icon-1'), copyIcon2 = emailCopyBtn.querySelector('.copy-icon-2');
        const checkIcon = emailCopyBtn.querySelector('.check-icon-1');
        
        emailCopyBtn.addEventListener('mouseenter', () => { gsap.to(copyIcon1, { y: '-100%', duration: 0.4, ease: "power2.inOut" }); gsap.to(copyIcon2, { y: '0%', duration: 0.4, ease: "power2.inOut" }); });
        emailCopyBtn.addEventListener('mouseleave', () => { gsap.to(copyIcon1, { y: '0%', duration: 0.4, ease: "power2.inOut" }); gsap.to(copyIcon2, { y: '100%', duration: 0.4, ease: "power2.inOut" }); });

        emailCopyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await navigator.clipboard.writeText('aditya20verma@gmail.com');
                if (emailText) emailText.style.opacity = '0';
                if (copiedText) copiedText.style.opacity = '1';
                if (copyIcon1) copyIcon1.style.display = 'none';
                if (copyIcon2) copyIcon2.style.display = 'none';
                if (checkIcon) checkIcon.style.display = 'inline-flex';
                setTimeout(() => {
                    if (emailText) emailText.style.opacity = '1';
                    if (copiedText) copiedText.style.opacity = '0';
                    if (copyIcon1) { copyIcon1.style.display = 'inline-flex'; gsap.set(copyIcon1, { y: '0%' }); }
                    if (copyIcon2) { copyIcon2.style.display = 'inline-flex'; gsap.set(copyIcon2, { y: '100%' }); }
                    if (checkIcon) checkIcon.style.display = 'none';
                }, 1500);
            } catch (err) { console.error('Failed to copy email: ', err); }
        });
    }



}
