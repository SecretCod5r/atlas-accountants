# Atlas Accountants - SEO & AEO Foundation

## The Stack
- **Framework/Architecture**: Vanilla HTML5, CSS3, and JavaScript. No build step (no React, Next.js, etc.).
- **Routing**: Folder-based static routing (e.g., `/about/index.html` accessed via `/about`).
- **Styling**: Vanilla CSS (`styles.css`) with CSS variables. Font stack uses Google Fonts (Fraunces for headings, Sen for body).
- **Interactions/Animations**: `atlas-interactions.js` using GSAP (ScrollTrigger) and Lenis for smooth scrolling. Custom cursor and load-in overlays are present.
- **Head/Meta**: Manually coded in each HTML file. Includes standard Title, Meta Description, Open Graph (OG), Twitter Cards, and Canonical tags. Google Analytics (GA4) is hardcoded.

## Existing Pages
Based on the repository structure, the following pages exist (all inside their respective folders as `index.html` for clean URLs, except the root `index.html` and `404.html`):
- `/` (Home)
- `/404.html` (Error Page)
- `/about`
- `/contact`
- `/financial-health-review`
- `/margin-line`
- `/pricing`
- `/privacy-policy`
- `/services`
- `/services-cfo-advisory`
- `/services-construction`
- `/services-law-firm`
- `/services-payroll`
- `/services-real-estate`
- `/services-retail-sales-tax`
- `/services-small-business`
- `/terms`

## Plan
1. **Discovery & Documentation**: Establish `BUSINESS_FACTS.md` and document open questions.
2. **Technical SEO Audit & Fixes**: Address schema markup, canonical consistency, and Core Web Vitals (JS deferral).
3. **On-Page SEO Optimization**: Optimize H1s, meta tags, and image alt attributes for the core ICPs (Contractors, Real Estate Investors, Trades).
4. **AEO (Answer Engine Optimization) Implementation**: Structure content (FAQs, clear definitions) to capture AI search queries (ChatGPT, Perplexity, Google AI Overviews).
5. **Internal Linking Strategy**: Improve contextual linking between the services pages and the lead magnet (`/margin-line`).
