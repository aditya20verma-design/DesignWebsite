// ─────────────────────────────────────────────────────────────────────────────
// sound.js — Global Hover Sound System
// ─────────────────────────────────────────────────────────────────────────────

export function initSound() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let soundEnabled = false;
        const toggleBtn = document.getElementById('sound-toggle');
        const SRC = 'assets/sounds/hover.mp3', POOL_SIZE = 4;
        const pool = Array.from({ length: POOL_SIZE }, () => {
            const a = new Audio(SRC); a.volume = 0.3; a.playbackRate = 0.5; a.preload = 'auto'; return a;
        });
        let poolIndex = 0;

        function playTick() {
            if (!soundEnabled) return;
            const audio = pool[poolIndex % POOL_SIZE]; poolIndex++;
            audio.currentTime = 0; audio.play().catch(() => {});
        }
        window.__playHoverSound = playTick;

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                soundEnabled = !soundEnabled;
                if (soundEnabled) {
                    toggleBtn.classList.add('sound-on');
                    const label = toggleBtn.querySelector('.sound-label'); if (label) label.textContent = 'SOUND ON';
                    pool.forEach(a => { a.load(); a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {}); });
                } else {
                    toggleBtn.classList.remove('sound-on');
                    const label = toggleBtn.querySelector('.sound-label'); if (label) label.textContent = 'SOUND OFF';
                }
            });
        }
        function bindSoundSelectors() {
            document.querySelectorAll('[data-sound], .view-btn, #email-copy-btn, nav a, .nav-link, #sound-toggle').forEach(el => {
                if (el.dataset.soundBound) return; el.dataset.soundBound = 'true';
                el.addEventListener('mouseenter', playTick, { passive: true });
            });
        }
        bindSoundSelectors(); window.addEventListener('load', bindSoundSelectors);

        const RESTART_SFX = new Audio('assets/audio/restartv2.mp3'); RESTART_SFX.volume = 0.85;
        const logoBtn = document.getElementById('logo-link');
        if (logoBtn) {
            logoBtn.addEventListener('click', () => { if (soundEnabled) { RESTART_SFX.currentTime = 0; RESTART_SFX.play().catch(() => {}); } });
        }
    }
}
