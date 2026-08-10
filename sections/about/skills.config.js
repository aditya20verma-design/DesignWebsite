/**
 * ── Skills & Tools Config ─────────────────────────────────────────────────
 * Single source of truth for all skills displayed on the portfolio.
 * 
 * HOW TO UPDATE:
 *   1. Edit the categories and skills arrays below.
 *   2. Each skill can have: name, icon (emoji), proficiency (1-4 dots).
 *   3. That's it — the renderer handles HTML injection and GSAP animation.
 *
 * Proficiency scale:
 *   4 = Expert (daily driver)
 *   3 = Proficient (strong working knowledge)
 *   2 = Familiar (have shipped with it)
 *   1 = Exploring (learning / side projects)
 * ─────────────────────────────────────────────────────────────────────────
 */

window.SKILLS_DATA = [
    {
        category: 'Design',
        skills: [
            { name: 'Figma',              icon: '◆',  proficiency: 4 },
            { name: 'Design Systems',     icon: '⬡',  proficiency: 4 },
            { name: 'Prototyping',        icon: '▶',  proficiency: 4 },
            { name: 'Interaction Design', icon: '◎',  proficiency: 4 },
            { name: 'Visual Design',      icon: '◐',  proficiency: 3 },
            { name: 'Motion Design',      icon: '↻',  proficiency: 3 },
            { name: 'Information Architecture', icon: '⊞', proficiency: 3 },
        ],
    },
    {
        category: 'Research',
        skills: [
            { name: 'User Interviews',    icon: '◉',  proficiency: 4 },
            { name: 'Usability Testing',  icon: '✓',  proficiency: 4 },
            { name: 'Competitive Analysis', icon: '⊕', proficiency: 4 },
            { name: 'Journey Mapping',    icon: '⤳',  proficiency: 3 },
            { name: 'A/B Testing',        icon: '⇄',  proficiency: 3 },
            { name: 'Heuristic Evaluation', icon: '☰', proficiency: 3 },
        ],
    },
    {
        category: 'Development',
        skills: [
            { name: 'HTML / CSS',         icon: '⟨⟩', proficiency: 4 },
            { name: 'JavaScript',         icon: 'JS', proficiency: 3 },
            { name: 'React Basics',       icon: '⚛',  proficiency: 2 },
            { name: 'Design Tokens',      icon: '⊡',  proficiency: 3 },
            { name: 'Git / Version Control', icon: '⑂', proficiency: 3 },
            { name: 'Responsive Design',  icon: '⊟',  proficiency: 4 },
        ],
    },
    {
        category: 'Tools',
        skills: [
            { name: 'Figma',             icon: '◆',  proficiency: 4 },
            { name: 'FigJam',            icon: '◇',  proficiency: 4 },
            { name: 'Adobe CC',          icon: '▲',  proficiency: 3 },
            { name: 'Notion',            icon: '▪',  proficiency: 4 },
            { name: 'Jira / Linear',     icon: '⊞',  proficiency: 3 },
            { name: 'Lottie / After Effects', icon: '⊙', proficiency: 3 },
        ],
    },
    {
        category: 'Soft Skills',
        skills: [
            { name: 'Cross-functional Collaboration', icon: '⤝', proficiency: 4 },
            { name: 'Stakeholder Mgmt',  icon: '⊛',  proficiency: 4 },
            { name: 'Design Presentations', icon: '▤', proficiency: 4 },
            { name: 'Documentation',     icon: '▥',  proficiency: 4 },
            { name: 'Mentoring',         icon: '⊕',  proficiency: 3 },
        ],
    },
    {
        category: 'Domain Expertise',
        skills: [
            { name: 'Healthcare UX',     icon: '✚',  proficiency: 4 },
            { name: 'Fintech',           icon: '₹',  proficiency: 3 },
            { name: 'Enterprise SaaS',   icon: '⊞',  proficiency: 3 },
            { name: 'Accessibility (a11y)', icon: '♿', proficiency: 3 },
            { name: 'Architecture / Spatial', icon: '⊿', proficiency: 4 },
        ],
    },
];

/**
 * Render skills section into the DOM.
 * Auto-runs on load.
 */
(function renderSkills() {
    const container = document.querySelector('#skills .skills__grid');
    if (!container || !window.SKILLS_DATA) return;

    container.innerHTML = window.SKILLS_DATA.map(cat => `
        <div class="skills__category">
            <h3 class="skills__cat-title">${cat.category}</h3>
            <div class="skills__tags">
                ${cat.skills.map(s => {
                    const dots = Array.from({ length: 4 }, (_, i) =>
                        `<span class="skills__dot${i < s.proficiency ? ' skills__dot--filled' : ''}"></span>`
                    ).join('');
                    return `
                        <span class="skills__tag">
                            <span class="skills__tag-icon">${s.icon}</span>
                            ${s.name}
                            <span class="skills__proficiency">${dots}</span>
                        </span>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}());
