import type { AddOn, Service } from "@/types/quote-catalog.types";

export const SERVICES: Service[] = [
    {
        id: "web",
        name: "Web Development",
        tagline: "Pages, admin panel, backend, API & database migration.",
        options: [
            {
                id: "pages",
                name: "Website pages",
                note: "Custom-designed pages, up to 8 blocks each.",
                kind: "counter",
                unitPrice: 22_000,
                min: 0,
                max: 40,
            },
            {
                id: "admin",
                name: "Admin panel",
                note: "Content management with role-based access.",
                kind: "toggle",
                price: 45_000,
            },
            {
                id: "backend",
                name: "Backend & APIs",
                note: "REST endpoints, auth, and business logic.",
                kind: "toggle",
                price: 90_000,
            },
            {
                id: "api-migration",
                name: "API migration",
                note: "Re-point and re-document existing integrations.",
                kind: "toggle",
                price: 30_000,
            },
            {
                id: "database-migration",
                name: "Database migration",
                note: "Per legacy system or data source.",
                kind: "counter",
                unitPrice: 18_000,
                min: 0,
                max: 10,
            },
            {
                id: "payment",
                name: "Payment gateway",
                note: "Razorpay or Stripe checkout with invoicing.",
                kind: "toggle",
                price: 25_000,
            },
            {
                id: "seo",
                name: "Technical SEO setup",
                note: "Schema, sitemaps, metadata and page speed pass.",
                kind: "toggle",
                price: 15_000,
            },
        ],
    },
    {
        id: "uiux",
        name: "UI / UX Design",
        tagline: "Wireframes, hi-fi screens, prototypes and design systems.",
        options: [
            {
                id: "screens",
                name: "Hi-fi screens",
                note: "Desktop and mobile states per screen.",
                kind: "counter",
                unitPrice: 6_000,
                min: 0,
                max: 60,
            },
            {
                id: "design-system",
                name: "Design system",
                note: "Tokens, components and usage documentation.",
                kind: "toggle",
                price: 28_000,
            },
            {
                id: "prototype",
                name: "Clickable prototype",
                note: "Interactive flows for stakeholder review.",
                kind: "toggle",
                price: 18_000,
            },
            {
                id: "research",
                name: "User research",
                note: "Five interviews, findings and recommendations.",
                kind: "toggle",
                price: 22_000,
            },
        ],
    },
    {
        id: "graphic",
        name: "Graphic Design",
        tagline: "Logo, brand kit, social templates and print collateral.",
        options: [
            {
                id: "logo",
                name: "Logo suite",
                note: "Primary, secondary and favicon lockups.",
                kind: "toggle",
                price: 15_000,
            },
            {
                id: "guidelines",
                name: "Brand guidelines",
                note: "Colour, type, imagery and tone rules.",
                kind: "toggle",
                price: 25_000,
            },
            {
                id: "templates",
                name: "Social templates",
                note: "Editable post and story templates.",
                kind: "counter",
                unitPrice: 2_500,
                min: 0,
                max: 50,
            },
            {
                id: "print",
                name: "Print collateral",
                note: "Cards, brochure and standee artwork.",
                kind: "toggle",
                price: 12_000,
            },
        ],
    },
    {
        id: "video",
        name: "Video Editing",
        tagline: "Reels, cutdowns, motion graphics and sound design.",
        options: [
            {
                id: "videos",
                name: "Edited videos",
                note: "Up to 90 seconds each, two revision rounds.",
                kind: "counter",
                unitPrice: 12_000,
                min: 0,
                max: 40,
            },
            {
                id: "motion",
                name: "Motion graphics",
                note: "Animated titles, lower thirds and transitions.",
                kind: "toggle",
                price: 20_000,
            },
            {
                id: "sound",
                name: "Sound design & mix",
                note: "Licensed music, SFX and dialogue clean-up.",
                kind: "toggle",
                price: 8_000,
            },
            {
                id: "subtitles",
                name: "Subtitles & captions",
                note: "Burned-in captions plus SRT files.",
                kind: "toggle",
                price: 4_000,
            },
        ],
    },
];

export const ADD_ONS: AddOn[] = [
    {
        id: "care",
        name: "Monthly care plan",
        note: "Hosting, backups and 4 hours of support each month, billed for 12 months.",
        price: 72_000,
        suffix: "₹6,000 / month",
        triggers: ["web"],
    },
    {
        id: "content",
        name: "Content writing",
        note: "SEO-ready copy for every page, one revision round.",
        price: 18_000,
        triggers: ["web", "uiux"],
    },
    {
        id: "analytics",
        name: "Analytics & dashboards",
        note: "GA4, events and a conversion dashboard.",
        price: 12_000,
        triggers: ["web", "video"],
    },
    {
        id: "photoshoot",
        name: "Product photoshoot",
        note: "Half-day shoot, 25 retouched images.",
        price: 35_000,
        triggers: ["graphic", "video", "web"],
    },
    {
        id: "adcreatives",
        name: "Ad creative pack",
        note: "10 static and 3 video ad variants for launch.",
        price: 22_000,
        triggers: ["graphic", "video", "uiux"],
    },
];

export const STUDIO = {
    name: "Quorion",
    descriptor: "Studio quotation desk",
    gstin: "07ABCDE1234F1Z5",
    email: "hello@quorion.studio",
};

export const QUOTATION_TERMS = [
    "50% advance to start, 25% at design sign-off, 25% before handover.",
    "Prices are in INR and valid for 30 days from the date of this quotation.",
    "GST charged at 18% as applicable. Third-party licences billed at actuals.",
    "Timelines confirmed after the kick-off call and content handover.",
];
