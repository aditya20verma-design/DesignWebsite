// ══════════════════════════════════════════════════════════════════
// ARCHIVED: BMW S1000RR Headlight Manifesto JS Timeline Fragment
// Originally lived in: sections/hero/hero.js → initMasterHeroScroll()
// Replaced by: Phase 3A New Manifesto Redesign (2026-08-16)
// DO NOT import or call this file. Reference only.
// ══════════════════════════════════════════════════════════════════

// ── CHARACTER PARSING (old system) ──────────────────────────────
// This block ran inside initMasterHeroScroll() before the masterTl.
// It dynamically parsed .manifesto-line elements into .manifesto-char spans.

const ACCENT_WORDS = ['CREATIVITY', 'SYSTEMS', 'RESONATE.'];
const lines = typography.querySelectorAll('.manifesto-line');
const allChars = [];

lines.forEach((line) => {
    const lineText = line.textContent.trim();
    const words = lineText.split(/\s+/);
    line.innerHTML = '';
    words.forEach((wordText) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'manifesto-word';
        const isAccentWord = ACCENT_WORDS.some(w => wordText.includes(w) || w.includes(wordText));
        Array.from(wordText).forEach((charStr) => {
            const charSpan = document.createElement('span');
            charSpan.className = 'manifesto-char';
            charSpan.textContent = charStr;
            if (isAccentWord) charSpan.dataset.accent = 'true';
            wordSpan.appendChild(charSpan);
            allChars.push(charSpan);
        });
        line.appendChild(wordSpan);
    });
});

gsap.set(typography, { opacity: 1 });
gsap.set('.manifesto-line', { opacity: 1, y: 0 });
gsap.set('.manifesto-char', { color: 'rgba(255, 255, 255, 0.22)' });

// ── INITIAL BMW DORMANT STATE ─────────────────────────────────────
gsap.set('.bmw-light-system', { opacity: 1, y: 0 });
gsap.set('#bmw-fairing', { opacity: 0.22, filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))' });
gsap.set('#bmw-drl', { opacity: 0.25, filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.1))' });
gsap.set('#bmw-drl path', { fill: '#4A4A4A' });
gsap.set('#bmw-projector', { opacity: 0, filter: 'none' });
gsap.set('.beam-stream', { opacity: 0, scaleX: 0.1, scaleY: 0 });
gsap.set('#beam-bloom', { opacity: 0, scale: 0.2 });
gsap.set('#white-takeover', { opacity: 0, pointerEvents: 'none' });

// ── PHASE 3: Character-by-Character Illumination Reveal (0.45 → 0.70) ──
const numChars = allChars.length;
const totalSpan = 0.25;
const step = numChars > 1 ? totalSpan / (numChars - 1) : 0;

allChars.forEach((char, i) => {
    const tStart = 0.45 + (i * step);
    const isAccent = char.dataset.accent === 'true';
    if (isAccent) {
        masterTl.to(char, { color: '#ffffff', textShadow: '0 0 16px rgba(255, 255, 255, 0.9), 0 0 25px rgba(255, 255, 255, 0.7)', duration: 0.015, ease: 'none' }, tStart);
        masterTl.to(char, { color: '#FF5509', textShadow: 'none', duration: 0.025, ease: 'none' }, tStart + 0.015);
    } else {
        masterTl.to(char, { color: '#FF5509', textShadow: '0 0 16px rgba(255, 85, 9, 0.9), 0 0 30px rgba(255, 85, 9, 0.6)', duration: 0.015, ease: 'none' }, tStart);
        masterTl.to(char, { color: '#ffffff', textShadow: 'none', duration: 0.025, ease: 'none' }, tStart + 0.015);
    }
});

// ── PHASE 4: DRL Ignition Sequence (0.45 → 0.52) ─────────────────
masterTl.to('#bmw-drl path', { fill: '#ffffff', duration: 0.03, ease: 'sine.out' }, 0.45);
masterTl.to('#bmw-drl', { opacity: 1.0, filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 35px rgba(255, 255, 255, 0.6))', duration: 0.03, ease: 'sine.out' }, 0.45);
masterTl.to('#bmw-drl', { filter: 'drop-shadow(0 0 24px rgba(255, 255, 255, 1)) drop-shadow(0 0 45px rgba(255, 255, 255, 0.8))', duration: 0.04, ease: 'sine.inOut' }, 0.48);

// ── PHASE 5: Projector Awakening (0.62 → 0.72) ───────────────────
masterTl.to('#bmw-projector', { opacity: 0.45, filter: 'drop-shadow(0 0 8px rgba(255, 85, 9, 0.8)) drop-shadow(0 0 20px rgba(255, 85, 9, 0.5))', duration: 0.05, ease: 'power1.inOut' }, 0.62);
masterTl.to('#bmw-projector', { opacity: 1.0, filter: 'drop-shadow(0 0 14px rgba(255, 85, 9, 1)) drop-shadow(0 0 35px rgba(255, 85, 9, 0.85)) drop-shadow(0 0 70px rgba(255, 85, 9, 0.5))', duration: 0.04, ease: 'power2.out' }, 0.68);

// ── PHASE 6 + 7: Unified Orange Swell (0.68 → 0.80) ─────────────
masterTl.to('#beam-left',  { opacity: 1.0, scaleX: 14.0, scaleY: 5.0, duration: 0.04, ease: 'power2.out' }, 0.70);
masterTl.to('#beam-right', { opacity: 1.0, scaleX: 14.0, scaleY: 5.0, duration: 0.04, ease: 'power2.out' }, 0.70);
masterTl.to('#beam-bloom', { opacity: 0.85, scale: 7.0, duration: 0.08, ease: 'power1.inOut' }, 0.68);
masterTl.to('#white-takeover', { opacity: 1.0, duration: 0.10, ease: 'power1.inOut' }, 0.68);
masterTl.to('#manifesto-typography', { opacity: 0, y: -10, duration: 0.05, ease: 'power1.in' }, 0.73);
masterTl.to('.bmw-light-system', { opacity: 0, scale: 1.05, duration: 0.05, ease: 'power1.in' }, 0.73);
