#!/usr/bin/env python3
"""
Modifies index.html to:
1. Add about.css link in <head>
2. Replace the sequence section + old about section with:
   - sequence section containing about-me overlay
3. Add footer-curtain class to the footer
4. Add about.js script tag before script.js
"""

import re

with open('/Users/Aditya/Website/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ── Fix 1a: Add about.css link after sequence.css ──────────────────────────
html = html.replace(
    '    <link rel="stylesheet" href="sections/about/sequence.css?v=16">',
    '    <link rel="stylesheet" href="sections/about/sequence.css?v=16">\n    <link rel="stylesheet" href="sections/about/about.css?v=2">'
)

# ── Fix 1b: Replace sequence section + old about section ───────────────────
OLD_BLOCK = '''            <!-- ── About Intro: Image Sequence Scrub ──────────────────────
                 168 WebP frames scrubbed via GSAP ScrollTrigger.
                 Frames: sections/about/assets/sequence/Frame1–168.webp
                 Logic:  sections/about/sequence.js
            ──────────────────────────────────────────────────────────────-->
            <section id="about-sequence">

                <!-- Canvas wrapper — this element gets pinned by ScrollTrigger -->
                <div id="sequence-canvas-wrap">

                    <!-- Preloader overlay (above everything, hidden once loaded) -->
                    <div id="sequence-loader">
                        <div class="seq-loader-bar-track">
                            <div class="seq-loader-bar-fill"></div>
                        </div>
                        <span class="seq-loader-label">0%</span>
                    </div>

                    <!-- Inner wrapper: receives the scale transform (NOT the sticky el) -->
                    <div id="sequence-canvas-inner">
                        <canvas id="sequence-canvas"></canvas>
                        <!-- Phase 2: #e5e4e0 smoke bleeds in -->
                        <div id="sequence-smoke"></div>
                    </div>

                    <!-- Overlay text — driven by frame windows -->
                    <div class="seq-overlay">
                        <p class="seq-subtitle"></p>
                        <h2 class="seq-title"></h2>
                    </div>

                </div>

            </section>

            <!-- About Section -->

            <section class="about-section hover-trigger" id="about" style="background: #e5e4e0; color: #1a1a1a;">
                <div class="about-grid about-grid--single">
                    <div class="about-col-left fade-up-minimal">
                        <p class="about-label" style="color: rgba(26,26,26,0.5);">About Me</p>
                        <p class="about-desc" style="color: #1a1a1a;">
                            Product Designer with 3+ years across healthcare, fintech &amp; architecture. Skilled at
                            transforming complex systems into intuitive, accessible experiences. Specialized in scaling
                            design systems, optimizing patient flows, and driving measurable growth. Background in
                            architecture with an M.Des, applying systems thinking and research-driven design to complex
                            challenges.
                        </p>
                    </div>
                </div>
            </section>'''

NEW_BLOCK = '''            <!-- ── Bike Sequence + About Me Overlay ──────────────────────────────
                 The bike burnout ends with white smoke filling the screen.
                 About Me content fades in ON TOP of that white frame —
                 zero dead-white scrolling. You ARE the biker.
            ────────────────────────────────────────────────────────────────── -->
            <section id="about-sequence">

                <!-- Canvas wrapper — pinned sticky during scroll range -->
                <div id="sequence-canvas-wrap">

                    <!-- Preloader overlay -->
                    <div id="sequence-loader">
                        <div class="seq-loader-bar-track">
                            <div class="seq-loader-bar-fill"></div>
                        </div>
                        <span class="seq-loader-label">0%</span>
                    </div>

                    <!-- Inner wrapper: receives the scale transform -->
                    <div id="sequence-canvas-inner">
                        <canvas id="sequence-canvas"></canvas>
                        <!-- Phase 2: #e5e4e0 smoke bleeds in -->
                        <div id="sequence-smoke"></div>
                    </div>

                    <!-- Overlay text — driven by frame windows -->
                    <div class="seq-overlay">
                        <p class="seq-subtitle"></p>
                        <h2 class="seq-title"></h2>
                    </div>

                    <!-- About Me: overlaid on the white smoke frame.
                         sequence.js will set opacity:1 on this when smoke hits 100%.
                         z-index sits above smoke. Scrollable via the outer section. -->
                    <div id="about-smoke-overlay">
                        <div id="about-me" aria-label="About Aditya Verma">
                            <div class="about-me__inner">

                                <!-- IDENTITY BLOCK -->
                                <div class="about-me__identity">
                                    <p class="about-me__identity-line1">Product Designer&thinsp;&middot;&thinsp;3Y</p>
                                    <p class="about-me__identity-line2">Architect <span class="about-me__arrow">&#8594;</span> UX&thinsp;/&thinsp;Product</p>
                                </div>

                                <hr class="about-me__rule">

                                <!-- CAREER PROGRESSION -->
                                <div class="about-me__career">
                                    <p class="about-me__section-label">Career Progression</p>
                                    <div class="about-me__board" role="list">

                                        <div class="about-me__row about-me__row--p1" role="listitem">
                                            <span class="about-me__pos">P1</span>
                                            <div class="about-me__company-block">
                                                <img src="sections/about/assets/Company logos/narayana.svg" alt="Narayana Health" class="about-me__logo" width="56" height="18">
                                                <div class="about-me__company-info">
                                                    <span class="about-me__company-name">Narayana Health</span>
                                                    <span class="about-me__role">Assoc. Product Designer</span>
                                                </div>
                                            </div>
                                            <div class="about-me__duration-col">
                                                <span class="about-me__duration">2024 &mdash; Present</span>
                                                <div class="about-me__live" aria-label="Currently active">
                                                    <span class="about-me__live-dot" aria-hidden="true"></span>
                                                    <span class="about-me__live-text">Live</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="about-me__row about-me__row--secondary" role="listitem">
                                            <span class="about-me__pos">P2</span>
                                            <div class="about-me__company-block">
                                                <img src="sections/about/assets/Company logos/branchx.svg" alt="BranchX" class="about-me__logo" width="60" height="18">
                                                <div class="about-me__company-info">
                                                    <span class="about-me__company-name">BranchX</span>
                                                    <span class="about-me__role">UX Designer</span>
                                                </div>
                                            </div>
                                            <div class="about-me__duration-col">
                                                <span class="about-me__duration">2023 &mdash; 2024</span>
                                            </div>
                                        </div>

                                        <div class="about-me__row about-me__row--secondary" role="listitem">
                                            <span class="about-me__pos">P3</span>
                                            <div class="about-me__company-block">
                                                <img src="sections/about/assets/Company logos/avanatri.svg" alt="Avanatri Technologies" class="about-me__logo" width="60" height="18">
                                                <div class="about-me__company-info">
                                                    <span class="about-me__company-name">Avanatri Technologies</span>
                                                    <span class="about-me__role">Product Design Intern</span>
                                                </div>
                                            </div>
                                            <div class="about-me__duration-col">
                                                <span class="about-me__duration">2022</span>
                                            </div>
                                        </div>

                                        <div class="about-me__row about-me__row--secondary" role="listitem">
                                            <span class="about-me__pos">P0</span>
                                            <div class="about-me__company-block">
                                                <img src="sections/about/assets/Company logos/architecture.svg" alt="Architecture" class="about-me__logo" width="48" height="18">
                                                <div class="about-me__company-info">
                                                    <span class="about-me__company-name">Architect</span>
                                                    <span class="about-me__role">Prior experience</span>
                                                </div>
                                            </div>
                                            <div class="about-me__duration-col">
                                                <span class="about-me__duration">~1.5 yrs</span>
                                            </div>
                                        </div>

                                    </div><!-- /.about-me__board -->
                                </div><!-- /.about-me__career -->

                                <hr class="about-me__rule">

                                <!-- THINKING STATEMENTS -->
                                <div class="about-me__thinking" aria-label="Design philosophy">
                                    <span class="about-me__statement">Systems Over Screens</span>
                                    <span class="about-me__statement">Clarity Over Complexity</span>
                                    <span class="about-me__statement">Real Users Over Assumptions</span>
                                </div>

                                <hr class="about-me__rule">

                                <!-- CLOSING LINE -->
                                <div class="about-me__closing">
                                    <p class="about-me__closing-text">Good Design Feels Inevitable</p>
                                </div>

                            </div><!-- /.about-me__inner -->
                        </div><!-- /#about-me -->
                    </div><!-- /#about-smoke-overlay -->

                </div><!-- /#sequence-canvas-wrap -->

            </section><!-- /#about-sequence -->'''

if OLD_BLOCK in html:
    html = html.replace(OLD_BLOCK, NEW_BLOCK)
    print("✅ Replaced sequence + about block")
else:
    print("❌ Could not find OLD_BLOCK — check whitespace/encoding")
    import sys; sys.exit(1)

# ── Fix 2: Footer curtain class ────────────────────────────────────────────
html = html.replace(
    '<footer class="footer-section" id="contact">',
    '<footer class="footer-section footer-curtain" id="contact">'
)
print("✅ Added footer-curtain class")

# ── Fix 3: Add about.js script before script.js ───────────────────────────
html = html.replace(
    '    <script src="script.js?v=147"></script>',
    '    <script src="sections/about/about.js?v=2"></script>\n    <script src="script.js?v=147"></script>'
)
print("✅ Added about.js script tag")

with open('/Users/Aditya/Website/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ index.html written successfully")
