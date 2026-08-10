/**
 * Horizontal Journey Track — Editorial Parallax Storytelling
 * Bike frames 78-83 actively play in background over p = 0.30 -> 0.50 while Product Designer glides over them.
 */
(function () {
    'use strict';

    var section  = document.getElementById('about-sequence');
    var track    = document.getElementById('horiz-track');
    var overlay  = document.getElementById('horiz-bg-overlay');

    if (!section || !track) return;

    var innerPlaceholders = Array.prototype.slice.call(document.querySelectorAll('.hj-card-placeholder, .hj-card-img'));

    var VW        = window.innerWidth;
    var VH        = window.innerHeight;
    var trackW    = 0;
    var targetP   = 0;
    var currentP  = 0;
    var raf       = null;

    function clamp(v, a, b) {
        return v < a ? a : v > b ? b : v;
    }

    function measure() {
        VW     = window.innerWidth;
        VH     = window.innerHeight;
        trackW = track.scrollWidth - VW;
    }

    function updateTargetP() {
        var rect   = section.getBoundingClientRect();
        var budget = section.offsetHeight - VH;
        if (budget <= 0) return;
        var rawP   = -rect.top / budget;
        targetP    = clamp(rawP, 0, 1);
    }

    function render(p) {
        // Horiz track starts gliding at p = 0.30 (Frame 78).
        // Over p = 0.30 -> 0.50 (720px scroll budget), bike canvas actively plays smoke frames 78-83 in background!
        var horizP = clamp((p - 0.30) / 0.70, 0, 1);
        
        // Smoothstep curve for silky motion
        var eased = horizP * horizP * (3 - 2 * horizP);

        // startX = 0.98vw places the leading edge right at the right viewport edge on Frame 78
        var startX        = VW * 0.98;
        var totalDistance = startX + trackW;
        var currentX      = startX - (eased * totalDistance);

        track.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px, 0, 0)';

        // 2. Background dark transition starts after bike frames finish at p = 0.50
        var darkP = clamp((p - 0.50) / 0.40, 0, 1);
        darkP = darkP * darkP * (3 - 2 * darkP); // Smoothstep curve
        if (overlay) overlay.style.opacity = darkP.toFixed(4);

        // Dark mode class toggle at midpoint
        if (p > 0.65) {
            section.classList.add('hj-dark-mode');
        } else {
            section.classList.remove('hj-dark-mode');
        }

        // 3. Subtle 5–10% inner image parallax shift
        var innerShift = (horizP - 0.5) * 12;
        var shiftStr   = innerShift.toFixed(2) + '%';
        for (var i = 0; i < innerPlaceholders.length; i++) {
            innerPlaceholders[i].style.transform = 'translate3d(' + shiftStr + ', 0, 0)';
        }
    }

    function loop() {
        var delta = targetP - currentP;
        if (Math.abs(delta) > 0.0001) {
            currentP += delta * 0.14;
            render(currentP);
        }
        raf = requestAnimationFrame(loop);
    }

    window.addEventListener('scroll', updateTargetP, { passive: true });
    window.addEventListener('resize', function () {
        measure();
        updateTargetP();
    }, { passive: true });

    measure();
    updateTargetP();
    currentP = targetP;
    render(currentP);

    raf = requestAnimationFrame(loop);
})();
