// ─────────────────────────────────────────────────────────────────────────────
// projects.content.js — Universal Case Study Content Data (All 12 Projects)
// ─────────────────────────────────────────────────────────────────────────────
// Keyed by project `id` from sections/work/projects.data.js.
// Each project provides an array of typed sections. The renderer in
// project-viewer.js maps each type to a universal HTML template.
// ─────────────────────────────────────────────────────────────────────────────

export const PROJECT_CONTENT = {

    // 01 HEALTH RECORDS
    "health-records": {
        sections: [
            {
                type: "hero",
                eyebrow: "HEALTHCARE · PRODUCT DESIGN · 2026",
                title: "Health Records",
                titleAccent: "2.0",
                tagline: "Making a patient's health history easier to understand, track and act on."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Product Design Lead" },
                    { label: "TEAM", value: "1 Designer · 2 Engineers · 1 PM" },
                    { label: "TIMELINE", value: "4 Months · 2026" },
                    { label: "SCOPE", value: "Research · UX Strategy · UI · Design Systems" },
                    { label: "PLATFORM", value: "iOS · Android · Web" },
                    { label: "SCALE", value: "1M+ Active Patients" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Narayana Health serves millions of patients across India. Managing medical records, lab reports, and consultations across different hospital visits was fragmented, causing anxiety for patients and friction during consultations.",
                    "Health Records 2.0 was initiated to transform raw clinical data into a clear, chronological narrative that patients can understand and doctors can review in seconds."
                ]
            },
            {
                type: "stats",
                items: [
                    { value: "1M+", label: "Patient Accounts Migrated" },
                    { value: "+30%*", label: "Report Download Velocity" },
                    { value: "4.8★", label: "App Store Satisfaction" }
                ]
            },
            {
                type: "media",
                label: "COVER MEDIA FRAME — HEALTH RECORDS 2.0 UI",
                caption: "Figure 1.0 — Unified Patient Timeline Interface (Dark & Light Mode Systems).",
                number: "01"
            },
            {
                type: "text",
                sectionId: "research",
                number: "02",
                heading: "Research",
                body: [
                    "We conducted contextual inquiries across 3 hospital centers, observing 24 live doctor-patient consultations and interviewing 18 patients across age demographics."
                ]
            },
            {
                type: "quote",
                text: "I have 4 different PDFs from my last visit. When the doctor asks about my blood sugar from 6 months ago, I don't know which document to open.",
                attribution: "Chronic Care Patient, Bengaluru"
            },
            {
                type: "text",
                body: [
                    "Key finding: Patients don't think in clinical department terms (Radiology, Hematology). They think in life events — \"My knee surgery last winter\", \"My monthly diabetes checkup\"."
                ]
            },
            {
                type: "media",
                label: "RESEARCH SYNTHESIS MATRIX & USER PATTERNS",
                number: "02"
            },
            {
                type: "text",
                sectionId: "problem",
                number: "03",
                heading: "Problem",
                body: [
                    "Existing patient portals presented lab values as dense, unformatted tables without context. A high creatinine result looked visually identical to a normal hemoglobin result."
                ]
            },
            {
                type: "split",
                items: [
                    {
                        title: "Legacy Experience",
                        body: "Isolated PDF downloads with no historical trend lines or health range indicators."
                    },
                    {
                        title: "Health Records 2.0 Goal",
                        body: "Interactive visual trends, smart status indicators, and contextual doctor notes."
                    }
                ]
            },
            {
                type: "media",
                label: "LEGACY VS REDESIGNED EXPERIENCE COMPARISON",
                number: "03"
            },
            {
                type: "text",
                sectionId: "insights",
                number: "04",
                heading: "Insights",
                body: [
                    "Synthesizing qualitative research yielded three core product directives:"
                ]
            },
            {
                type: "list",
                items: [
                    { bold: "Chronological Continuity:", text: "Group all test results, prescriptions, and notes by visit episode." },
                    { bold: "Visual Health Indicators:", text: "Use clear color-coded ranges (Normal, Borderline, Action Required) without inducing panic." },
                    { bold: "One-Tap Sharing:", text: "Allow instant secure PDF export for second opinions and external specialists." }
                ]
            },
            {
                type: "media",
                label: "PATIENT MENTAL MODEL & IA DIAGRAM",
                number: "04"
            },
            {
                type: "text",
                sectionId: "strategy",
                number: "05",
                heading: "Strategy",
                body: [
                    "We restructured the Information Architecture into a 3-tier hierarchy: Timeline View (Macro), Episode Detail (Meso), and Parameter Deep Dive (Micro)."
                ]
            },
            {
                type: "media",
                label: "INFORMATION ARCHITECTURE ROADMAP & FLYWHEEL",
                number: "05"
            },
            {
                type: "text",
                sectionId: "design",
                number: "06",
                heading: "Design",
                body: [
                    "The design system prioritizes high-contrast legibility, accessible touch targets for elderly patients, and instant glanceability during active consultations."
                ]
            },
            {
                type: "media",
                label: "FINAL HIGH-FIDELITY MOBILE & WEB INTERFACES",
                number: "06",
                aspect: "16/10"
            },
            {
                type: "text",
                sectionId: "system",
                number: "07",
                heading: "System",
                body: [
                    "Built a resilient component design system in Figma with WCAG AAA accessibility compliance, custom sparkline graphs, and multi-language support (English, Hindi, Kannada)."
                ]
            },
            {
                type: "media",
                label: "HEALTHCARE DESIGN SYSTEM COMPONENTS & TOKENS",
                number: "07"
            },
            {
                type: "text",
                sectionId: "outcome",
                number: "08",
                heading: "Outcome",
                body: [
                    "Health Records 2.0 launched across 1M+ active patient accounts, significantly improving digital record retrieval and patient trust."
                ]
            },
            {
                type: "stats",
                items: [
                    { value: "+30%*", label: "Patient Engagement" },
                    { value: "-65%", label: "Support Tickets for Lost Reports" },
                    { value: "12s", label: "Avg Record Retrieval Time" }
                ]
            }
        ]
    },

    // 02 BOOK APPOINTMENT
    "book-appointment": {
        sections: [
            {
                type: "hero",
                eyebrow: "HEALTHCARE · PRODUCT DESIGN · 2026",
                title: "Book Appointment",
                tagline: "A simpler path from finding a doctor to booking an appointment."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Lead UX Designer" },
                    { label: "ORGANIZATION", value: "Narayana Health" },
                    { label: "TIMELINE", value: "3 Months" },
                    { label: "PLATFORM", value: "iOS · Android · Responsive Web" },
                    { label: "KEY METRIC", value: "Appointment Conversion Rate" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Booking a doctor's appointment online was bogged down by confusing department structures, ambiguous doctor availability, and multi-step confirmation flows.",
                    "We redesigned the end-to-end appointment discovery and booking flow to help patients locate the right specialist in under 60 seconds."
                ]
            },
            {
                type: "stats",
                items: [
                    { value: "-45%", label: "Drop-off Rate" },
                    { value: "48s", label: "Average Time to Book" },
                    { value: "+28%", label: "Completed Bookings" }
                ]
            },
            {
                type: "media",
                label: "APPOINTMENT BOOKING FLOW — MAIN DASHBOARD",
                caption: "Figure 2.0 — Doctor Discovery & Slot Picker Interface.",
                number: "01"
            },
            {
                type: "text",
                sectionId: "problem",
                number: "02",
                heading: "Problem & Strategy",
                body: [
                    "Patients booking appointments often struggle to match symptoms with medical specialties (e.g. Nephrology vs Urology). Our strategy focused on intelligent symptom search, transparent fee structures, and friction-free slot selection."
                ]
            },
            {
                type: "split",
                items: [
                    {
                        title: "Old Flow",
                        body: "Complex 7-step wizard requiring account creation prior to viewing available doctor slots."
                    },
                    {
                        title: "Redesigned Flow",
                        body: "Instant 3-step slot reservation with guest checkout and symptom-based doctor recommendations."
                    }
                ]
            },
            {
                type: "media",
                label: "HIGH FIDELITY SCREEN — DOCTOR PROFILE & SLOT PICKER",
                number: "02"
            }
        ]
    },

    // 03 KIOSK
    "kiosk": {
        sections: [
            {
                type: "hero",
                eyebrow: "HEALTHCARE · KIOSK · SERVICE DESIGN",
                title: "In-Hospital Kiosk",
                tagline: "Streamlining in-hospital self-service for tests, checkups and patient flow."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Service & Product Designer" },
                    { label: "ORGANIZATION", value: "Narayana Health" },
                    { label: "TIMELINE", value: "5 Months" },
                    { label: "HARDWARE", value: "32-inch Touch Kiosks" },
                    { label: "DEPLOYMENT", value: "14 Hospitals Nationwide" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Long queues at hospital reception counters created friction for patients arriving for routine blood tests and pre-booked consultations.",
                    "We designed a touch-first kiosk interface tailored for high-contrast accessibility, supporting rapid check-in, token generation, and payment processing."
                ]
            },
            {
                type: "stats",
                items: [
                    { value: "14", label: "Hospital Centers Deployed" },
                    { value: "35s", label: "Avg Self Check-in Time" },
                    { value: "-40%", label: "Reception Desk Queue" }
                ]
            },
            {
                type: "media",
                label: "TOUCH KIOSK INTERFACE — WELCOME & TOKEN FLOW",
                caption: "Figure 3.0 — Physical Kiosk Ergonomics & UI Flow.",
                number: "01"
            }
        ]
    },

    // 04 SPEND ANALYSIS
    "spend-analysis": {
        sections: [
            {
                type: "hero",
                eyebrow: "FINTECH · PRODUCT DESIGN · DATA VIZ",
                title: "Spend Analysis",
                tagline: "Making everyday spending easier to understand and manage."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Lead Product Designer" },
                    { label: "COMPANY", value: "BranchX" },
                    { label: "TIMELINE", value: "3 Months" },
                    { label: "PLATFORM", value: "iOS & Android" },
                    { label: "IMPACT", value: "+35% Monthly Active Users" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Traditional banking apps list transactions as raw text lines, making it difficult for users to track spending habits or budget effectively.",
                    "Spend Analysis introduces intuitive visual categorization, merchant insights, and predictive monthly spend forecasts."
                ]
            },
            {
                type: "stats",
                items: [
                    { value: "+35%", label: "MAU Engagement" },
                    { value: "4.7★", label: "User Feedback Score" },
                    { value: "2.5M", label: "Transactions Analyzed" }
                ]
            },
            {
                type: "media",
                label: "SPEND ANALYSIS DASHBOARD & CATEGORY BREAKDOWN",
                caption: "Figure 4.0 — Data Visualization & Financial Insights.",
                number: "01"
            }
        ]
    },

    // 05 GO KARTING
    "go-karting": {
        sections: [
            {
                type: "hero",
                eyebrow: "MOBILITY · UX · INTERACTION DESIGN",
                title: "Go Karting App",
                tagline: "A connected karting experience from booking to the chequered flag."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "End-to-End Product Designer" },
                    { label: "PROJECT", value: "Independent Mobile App" },
                    { label: "TIMELINE", value: "2 Months" },
                    { label: "PLATFORM", value: "iOS & WatchOS" },
                    { label: "FOCUS", value: "Telemetry & Live Telemetry" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Go-karting enthusiasts lack a unified digital platform to track lap times, compare telemetry with friends, and book track sessions.",
                    "This mobile and smartwatch experience seamlessly integrates pre-race track booking, live telemetry during sessions, and post-race lap analysis."
                ]
            },
            {
                type: "media",
                label: "LIVE TELEMETRY & LAP TIME COMPARISON SCREEN",
                caption: "Figure 5.0 — Real-Time Telemetry & Leaderboard UI.",
                number: "01"
            }
        ]
    },

    // 06 DMRC
    "dmrc": {
        sections: [
            {
                type: "hero",
                eyebrow: "MOBILITY · UI/UX · INDEPENDENT",
                title: "DMRC Metro Guide",
                tagline: "Finding a better route through Delhi's metro network."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "UX Researcher & Designer" },
                    { label: "CONTEXT", value: "Independent Transit Study" },
                    { label: "TIMELINE", value: "2 Months" },
                    { label: "PLATFORM", value: "Mobile Web & iOS" },
                    { label: "USER BASE", value: "6M+ Daily Commuters" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Delhi Metro is one of the world's largest transit systems, yet existing navigation apps overload users with complex maps and static fare tables.",
                    "This case study reimagines transit navigation with real-time train arrivals, interchange guidance, and offline map support."
                ]
            },
            {
                type: "media",
                label: "DMRC ROUTE FINDER & INTERCHANGE GUIDE",
                caption: "Figure 6.0 — Route Card & Interchange Step-by-Step UI.",
                number: "01"
            }
        ]
    },

    // 07 UNISHARE
    "unishare": {
        sections: [
            {
                type: "hero",
                eyebrow: "PRODUCT · UX/UI · CAMPUS MOBILITY",
                title: "UniShare",
                tagline: "End-to-end ride-sharing experience for campus commuters."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Lead Product Designer" },
                    { label: "CONTEXT", value: "Campus Mobility Initiative" },
                    { label: "TIMELINE", value: "3 Months" },
                    { label: "PLATFORM", value: "Cross-Platform Mobile" },
                    { label: "TARGET", value: "University Students & Faculty" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Campus commuters face daily challenges with expensive single-occupancy cabs and overcrowded buses.",
                    "UniShare connects students traveling along similar campus corridors for safe, verified, and cost-efficient carpooling."
                ]
            },
            {
                type: "media",
                label: "UNISHARE RIDE MATCHING & COST SPLIT INTERFACE",
                caption: "Figure 7.0 — Peer Matching & Split Payment Flow.",
                number: "01"
            }
        ]
    },

    // 08 EVY VOICE INTERFACE
    "evy-voice-interface": {
        sections: [
            {
                type: "hero",
                eyebrow: "VUI · MULTIMODAL · AUTOMOTIVE",
                title: "EVY — Voice User Interface",
                tagline: "A multimodal in-car experience combining voice assistance with visual interaction."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Multimodal Interaction Designer" },
                    { label: "CONTEXT", value: "Automotive Concept Design" },
                    { label: "TIMELINE", value: "4 Months" },
                    { label: "SYSTEM", value: "In-Vehicle Infotainment (IVI)" },
                    { label: "MODALITY", value: "Voice + Touch + Visual HUD" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "In-car touchscreens introduce cognitive driver distraction. EVY explores a zero-glance voice-first interface paired with subtle visual feedback on ambient displays.",
                    "Designed to handle complex multi-turn commands like navigation adjustments, climate control, and media playback while maintaining full driver focus."
                ]
            },
            {
                type: "media",
                label: "EVY IN-CAR HUD & AMBIENT VOICE WAVEFORM INTERFACE",
                caption: "Figure 8.0 — Multimodal Voice Feedback & HUD Display.",
                number: "01"
            }
        ]
    },

    // 09 DIGITAL DETOX
    "digital-detox": {
        sections: [
            {
                type: "hero",
                eyebrow: "WELLNESS · PRODUCT DESIGN · INDEPENDENT",
                title: "Digital Detox",
                tagline: "Helping people build healthier relationships with their screens."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Product Designer & Researcher" },
                    { label: "CONTEXT", value: "Digital Wellbeing Study" },
                    { label: "TIMELINE", value: "2 Months" },
                    { label: "PLATFORM", value: "iOS App & Widget" },
                    { label: "FOCUS", value: "Behavioral Design & Habit Loop" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Screen-time blockers often rely on punitive restrictions that users quickly bypass. Digital Detox utilizes positive reinforcement and micro-reflections to build intentional digital habits."
                ]
            },
            {
                type: "media",
                label: "WELLBEING DASHBOARD & INTENTIONAL SCREEN TIME INTERFACE",
                caption: "Figure 9.0 — Micro-Reflection Prompt & Focus Mode UI.",
                number: "01"
            }
        ]
    },

    // 10 DUNE SPEAKER
    "dune-speaker": {
        sections: [
            {
                type: "hero",
                eyebrow: "INDUSTRIAL DESIGN · CMF · CONCEPT",
                title: "Dune Speaker",
                tagline: "A speaker inspired by the sculptural forms of desert landscapes."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Industrial Designer" },
                    { label: "CATEGORY", value: "Consumer Electronics & CMF" },
                    { label: "TIMELINE", value: "3 Months" },
                    { label: "MATERIALS", value: "Cast Aluminum · Anodized Mesh" },
                    { label: "OUTPUT", value: "3D CAD & Photorealistic Renders" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Dune Speaker explores organic tactile forms in home audio equipment. Moving away from utilitarian black boxes, its flowing geometry is sculpted to diffuse 360-degree sound naturally throughout residential spaces."
                ]
            },
            {
                type: "media",
                label: "3D INDUSTRIAL DESIGN RENDERS — DUNE SPEAKER CMF",
                caption: "Figure 10.0 — Photorealistic CMF & Acoustic Diffusion Form.",
                number: "01",
                aspect: "16/10"
            }
        ]
    },

    // 11 DATA THAT I WEAR
    "data-that-i-wear": {
        sections: [
            {
                type: "hero",
                eyebrow: "WEARABLE · DATA VIZ · CONCEPT",
                title: "Data That I Wear",
                tagline: "Exploring the intersection of personal data and wearable aesthetics."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Concept Designer & Researcher" },
                    { label: "CATEGORY", value: "Speculative Design & Wearable Tech" },
                    { label: "TIMELINE", value: "2 Months" },
                    { label: "MEDIUM", value: "Generative Data & E-Textiles" },
                    { label: "FOCUS", value: "Biometric Data Visualization" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "What if personal biometric data wasn't hidden behind glass smartphone screens, but expressed through subtle ambient changes in garment texture and light?",
                    "Data That I Wear explores dynamic data visualization woven directly into personal attire."
                ]
            },
            {
                type: "media",
                label: "BIOMETRIC E-TEXTILE DATA VISUALIZATION CONCEPT",
                caption: "Figure 11.0 — Ambient Data Expression & Wearable Artifacts.",
                number: "01"
            }
        ]
    },

    // 12 BUBLINGO
    "bublingo": {
        sections: [
            {
                type: "hero",
                eyebrow: "EDTECH · PRODUCT DESIGN · GAMIFICATION",
                title: "Bublingo",
                tagline: "Making language learning feel like play."
            },
            {
                type: "snapshot",
                items: [
                    { label: "ROLE", value: "Product Design Lead" },
                    { label: "COMPANY", value: "Bublingo EdTech" },
                    { label: "TIMELINE", value: "4 Months" },
                    { label: "PLATFORM", value: "iOS & Android" },
                    { label: "TARGET", value: "Early Childhood Language Learners" }
                ]
            },
            {
                type: "text",
                sectionId: "overview",
                number: "01",
                heading: "Overview",
                body: [
                    "Bublingo combines conversational AI, tactile micro-games, and bite-sized daily quests to help young learners acquire new languages naturally.",
                    "The product design balances playful visual energy with rigorous pedagogical progression."
                ]
            },
            {
                type: "media",
                label: "BUBLINGO GAMIFIED LESSON & CHARACTER INTERFACE",
                caption: "Figure 12.0 — Gamified Quiz Loop & Character Animation.",
                number: "01"
            }
        ]
    }

};
