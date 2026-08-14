// ─────────────────────────────────────────────────────────────────────────────
// projects.data.js — Complete Project Data Model (12 Case Studies)
// ─────────────────────────────────────────────────────────────────────────────
// Adding a project: push a new object + drop a cover.webp in assets/<folder>.
// featured: true → appears in the cinematic 5-panel selector
// featured: false → appears in the More Work grid
// ─────────────────────────────────────────────────────────────────────────────

export const PROJECTS_DATA = [
    // ── FEATURED WORK (5 Projects) ──────────────────────────────────────────
    {
        id: "health-records",
        number: "01",
        title: "Health Records",
        company: "Narayana Health",
        hook: "Reimagining how patients discover, understand and manage their health information.",
        tags: ["HEALTHCARE", "PRODUCT DESIGN", "UX"],
        image: "sections/work/assets/01 health-records/cover.webp",
        caseStudyUrl: "projects/narayana.html",
        featured: true
    },
    {
        id: "book-appointment",
        number: "02",
        title: "Book Appointment",
        company: "Narayana Health",
        hook: "A simpler path from finding a doctor to booking an appointment.",
        tags: ["HEALTHCARE", "PRODUCT DESIGN", "UX"],
        image: "sections/work/assets/02 book-appointment/cover.webp",
        caseStudyUrl: "projects/book-appointment.html",
        featured: true
    },
    {
        id: "kiosk",
        number: "03",
        title: "Kiosk",
        company: "Narayana Health",
        hook: "Streamlining in-hospital self-service for tests, checkups and patient flow.",
        tags: ["HEALTHCARE", "KIOSK", "SERVICE DESIGN"],
        image: "sections/work/assets/03 kiosk/cover.webp",
        caseStudyUrl: "projects/group-checkup.html",
        featured: true
    },
    {
        id: "spend-analysis",
        number: "04",
        title: "Spend Analysis",
        company: "BranchX",
        hook: "Making everyday spending easier to understand and manage.",
        tags: ["FINTECH", "PRODUCT DESIGN", "DATA VIZ"],
        image: "sections/work/assets/04 spend-analysis/cover.webp",
        caseStudyUrl: "projects/branchx.html",
        featured: true
    },
    {
        id: "go-karting",
        number: "05",
        title: "Go Karting App",
        company: "Independent",
        hook: "A connected karting experience from booking to the chequered flag.",
        tags: ["MOBILITY", "UX", "INTERACTION DESIGN"],
        image: "sections/work/assets/05 go-karting/cover.webp",
        caseStudyUrl: "projects/go-karting.html",
        featured: true
    },

    // ── MORE WORK (7 Projects) ──────────────────────────────────────────────
    {
        id: "dmrc",
        number: "06",
        title: "DMRC",
        company: "Independent Case Study",
        hook: "Finding a better route through Delhi's metro network.",
        tags: ["MOBILITY", "UI/UX"],
        image: "sections/work/assets/06 DMRC/cover.webp",
        caseStudyUrl: "projects/dmrc.html",
        featured: false
    },
    {
        id: "unishare",
        number: "07",
        title: "UniShare",
        company: "Campus Product",
        hook: "End-to-end ride-sharing experience for campus commuters.",
        tags: ["PRODUCT", "UX/UI"],
        image: "sections/work/assets/07 unishare/cover.webp",
        caseStudyUrl: "projects/unishare.html",
        featured: false
    },
    {
        id: "evy-voice-interface",
        number: "08",
        title: "EVY — Voice User Interface",
        company: "Concept Design",
        hook: "A multimodal in-car experience combining voice assistance with visual interaction.",
        tags: ["VUI", "MULTIMODAL", "AUTOMOTIVE"],
        image: "sections/work/assets/08 evy-voice-interface/cover.webp",
        caseStudyUrl: "projects/evy.html",
        featured: false
    },
    {
        id: "digital-detox",
        number: "09",
        title: "Digital Detox",
        company: "Independent",
        hook: "Helping people build healthier relationships with their screens.",
        tags: ["WELLNESS", "PRODUCT DESIGN"],
        image: "sections/work/assets/09 digital-detox/cover.webp",
        caseStudyUrl: "projects/digital-detox.html",
        featured: false
    },
    {
        id: "dune-speaker",
        number: "10",
        title: "Dune Speaker",
        company: "Industrial Design",
        hook: "A speaker inspired by the sculptural forms of desert landscapes.",
        tags: ["INDUSTRIAL DESIGN", "CMF"],
        image: "sections/work/assets/10 dune-speaker/cover.webp",
        caseStudyUrl: "projects/dune-speaker.html",
        featured: false
    },
    {
        id: "data-that-i-wear",
        number: "11",
        title: "Data That I Wear",
        company: "Wearable Concept",
        hook: "Exploring the intersection of personal data and wearable aesthetics.",
        tags: ["WEARABLE", "DATA VIZ", "CONCEPT"],
        image: "sections/work/assets/11 data-that-i-wear/cover.webp",
        caseStudyUrl: "projects/data-that-i-wear.html",
        featured: false
    },
    {
        id: "bublingo",
        number: "12",
        title: "Bublingo",
        company: "EdTech",
        hook: "Making language learning feel like play.",
        tags: ["EDTECH", "PRODUCT DESIGN", "GAMIFICATION"],
        image: "sections/work/assets/12 bublingo/cover.webp",
        caseStudyUrl: "projects/bublingo.html",
        featured: false
    }
];
