# Technical SEO Audit - Atlas Accountants

## 1. Canonical Domain Handling
- **Current State**: The site relies on the hosting provider for canonicalization (Apex vs. www, HTTPS). There is no explicit `.htaccess` or server config in the repo.
- **Recommendation**: Ensure the hosting provider (e.g., Netlify/Vercel/GitHub Pages) is configured to force HTTPS and 301 redirect `www` to the apex domain (`atlasaccountantsusa.com`).

## 2. Robots.txt
- **Current State**: Basic `robots.txt` exists but does not explicitly whitelist/blacklist AI retrieval crawlers or reference the sitemap dynamically.
- **Fix Needed**: Update `robots.txt` to explicitly allow Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, and Applebot-Extended, and include the sitemap URL.

## 3. Sitemap.xml
- **Current State**: Handcoded `sitemap.xml` exists. Needs to be auto-generated to ensure accurate `<loc>`, `<lastmod>`, and canonical URLs only (with proper folder structure, e.g., `/about`).
- **Fix Needed**: Implement a script to generate `sitemap.xml` dynamically from real routes.

## 4. Title, Meta Description, and Open Graph / Twitter Tags
- **Current State**: Hardcoded in every file. Homepage title is 56 chars (Good). Description is 127 chars (A bit short). Inner pages often share identical or unoptimized tags, or lack unique OG/Twitter data.
- **Fix Needed**: Implement a reusable SEO utility to inject unique, length-optimized (Title: 50-60 chars, Desc: 140-160 chars) tags for every page.

## 5. Heading Structure
- **Current State**: Homepage uses `H1` effectively for copywriting but lacks the primary keyword ("Bookkeeping for Contractors"). Secondary pages use `H1`, but structure varies.
- **Fix Needed**: Optimize `H1` tags across all pages to target core ICPs.

## 6. Canonical Tags
- **Current State**: Hardcoded. With the recent shift to folder-based URLs (`/about/index.html`), the canonicals point to `/about`. We need to ensure complete consistency.
- **Fix Needed**: The SEO utility will inject the exact absolute canonical URL for each page.

## 7. Image Alt Text
- **Current State**: Generic (e.g., `alt="Atlas Accountants"` for logo). Badges and background textures lack descriptive alt text or are empty.
- **Fix Needed**: Update alt text for all meaningful images (e.g., QuickBooks badge, logo) to be keyword-rich and descriptive.

## 8. Internal Links & Broken Links
- **Current State**: Broken service card links on the homepage (e.g., pointing to mismatched URL slugs).
- **Fix Needed**: Fix broken links. Add contextual internal links from body paragraphs, not just the nav.

## 9. Redirect Chains
- **Current State**: None currently detectable in the static code, but dependent on the host's handling of trailing slashes (e.g., `/about` vs `/about/`).
- **Fix Needed**: Standardize links to avoid trailing slash redirects if the host defaults to one or the other.

## 10. Structured Data (Schema.org)
- **Current State**: 0 structured data found.
- **Fix Needed**: Add `Organization`, `LocalBusiness`, `AccountingService`, and `Person` JSON-LD schemas in Phase 3.

## 11. Known Issues Identified
- Footer phone number mismatch (`tel:+19194380294` vs displayed text if any).
- Personal email (`zensick.agency@gmail.com`) found in `mailto:` form actions.
- Tax-return language present in `/financial-health-review/` which conflicts with compliance rules.
- Hero slider animations need verification for non-JS rendering.
