const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'https://atlasaccountantsusa.com';
const BUSINESS_EMAIL = 'info@atlasaccountantsusa.com';

const pagesMetadata = {
    'index.html': {
        title: 'Atlas Accountants | Job-Costed Bookkeeping for Contractors',
        desc: 'Atlas Accountants delivers CPA-ready bookkeeping and job-costed financial statements for contractors, remodelers, and real estate investors. Get your free review.',
    },
    '404.html': {
        title: 'Page Not Found | Atlas Accountants',
        desc: 'The page you are looking for does not exist. Return to Atlas Accountants homepage.',
    },
    'about/index.html': {
        title: 'About Atlas Accountants | Expert Construction Bookkeepers',
        desc: 'Learn about Atlas Accountants. Built by someone who ran job sites before reading a P&L, we deliver CPA-ready financials for contractors nationwide.',
    },
    'contact/index.html': {
        title: 'Contact Atlas Accountants | Virtual Bookkeeping Services',
        desc: 'Get in touch with Atlas Accountants to streamline your contractor bookkeeping. Serving all 50 states with job-costed financial reporting.',
    },
    'financial-health-review/index.html': {
        title: 'Free Financial Health Review | Atlas Accountants',
        desc: 'Get a free financial health review for your contracting or real estate business. Discover where your true margins are with our expert assessment.',
    },
    'margin-line/index.html': {
        title: 'The Margin Line Scorecard | Profitability for Contractors',
        desc: 'Take The Margin Line scorecard to see if your construction business is actually making money. A 9-question job profitability assessment.',
    },
    'pricing/index.html': {
        title: 'Bookkeeping Pricing for Contractors | Atlas Accountants',
        desc: 'Transparent bookkeeping pricing for contractors and real estate investors. No hidden fees, just CPA-ready financials and accurate job costing.',
    },
    'privacy-policy/index.html': {
        title: 'Privacy Policy | Atlas Accountants',
        desc: 'Read the privacy policy for Atlas Accountants to understand how we protect and manage your data.',
    },
    'terms/index.html': {
        title: 'Terms & Conditions | Atlas Accountants',
        desc: 'Terms and conditions for using the Atlas Accountants website and services.',
    },
    'services/index.html': {
        title: 'Bookkeeping Services for Contractors & Real Estate',
        desc: 'Explore our specialized bookkeeping services for residential GCs, remodelers, specialty trades, and real estate investors. Job-costed and CPA-ready.',
    },
    'services/cfo-advisory/index.html': {
        title: 'CFO Advisory Services for Contractors | Atlas Accountants',
        desc: 'Fractional CFO advisory services helping contractors and real estate investors scale profitably with data-driven financial strategies.',
    },
    'services/construction-bookkeeping/index.html': {
        title: 'Construction Bookkeeping & Job Costing | Atlas Accountants',
        desc: 'Expert bookkeeping and job costing for residential general contractors and remodelers. Know exactly which jobs make you money.',
    },
    'services/job-costing/index.html': {
        title: 'Construction Job Costing Services | Atlas Accountants',
        desc: 'Stop guessing if your projects are profitable. We provide construction job costing services and setup in QuickBooks for residential contractors.',
    },
    'services/quickbooks-cleanup/index.html': {
        title: 'QuickBooks Cleanup & Catch-Up Bookkeeping | Atlas Accountants',
        desc: 'Behind on your books? Our QuickBooks cleanup and catch-up bookkeeping services for contractors will fix your messy ledger and get you tax-ready fast.',
    },
    'services/law-firms/index.html': {
        title: 'Law Firm Bookkeeping Services | Atlas Accountants',
        desc: 'Specialized bookkeeping and trust accounting for law firms. Keep your IOLTA compliant and your financials CPA-ready.',
    },
    'services/payroll/index.html': {
        title: 'Payroll Services for Contractors | Atlas Accountants',
        desc: 'Accurate payroll processing and certified payroll reporting for specialty trades and construction businesses. Stay compliant effortlessly.',
    },
    'services/real-estate-investors/index.html': {
        title: 'Real Estate Accounting & Bookkeeping | Atlas Accountants',
        desc: 'Property-level P&Ls and accurate capitalization tracking for real estate investors, landlords, and house flippers.',
    },
    'services/retail-sales-tax/index.html': {
        title: 'Retail Sales Tax Compliance | Atlas Accountants',
        desc: 'Sales tax reconciliation and filing compliance for retail businesses. Keep your multi-state sales tax accurate and organized.',
    },
    'services/small-business/index.html': {
        title: 'Small Business Bookkeeping | Atlas Accountants',
        desc: 'Monthly CPA-ready bookkeeping for small businesses. Clean, reconciled financials that hold up to scrutiny.',
    },
    'resources/index.html': {
        title: 'Contractor Bookkeeping Resources | Atlas Accountants',
        desc: 'Articles and guides on construction bookkeeping, job costing, chart of accounts, and true profitability for general contractors and specialty trades.',
    },
    'resources/chart-of-accounts-for-contractors/index.html': {
        title: 'How to Set Up a Chart of Accounts for a Contractor | Atlas Accountants',
        desc: 'Learn how to structure a Chart of Accounts for a construction business to track job costs, overhead, and true gross margin accurately.',
    },
    'resources/construction-business-busy-but-broke/index.html': {
        title: 'Why is My Construction Business Busy But Broke? | Atlas Accountants',
        desc: 'You have a pipeline full of work, but no money in the bank. Discover the top reasons construction businesses go broke while staying busy.',
    }
};

const GA4_ID = 'G-98XT9JEQ0X';

function processHtmlFile(filePath, relPath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix email
    content = content.replace(/zensick\.agency@gmail\.com/g, '');
    content = content.replace(/mailto:info@atlasaccountantsusa\.com,/g, 'mailto:info@atlasaccountantsusa.com');

    // Remove tax return language in financial health review
    if (relPath === 'financial-health-review/index.html') {
        content = content.replace(/<li>&bull; Businesses looking for Tax Preparation<\/li>/g, '');
        content = content.replace(/<li>&bull; Businesses needing Tax Planning advice<\/li>/g, '');
    }

    const $ = cheerio.load(content);
    
    const meta = pagesMetadata[relPath] || {
        title: 'Atlas Accountants | Job-Costed Bookkeeping',
        desc: 'Atlas Accountants delivers CPA-ready bookkeeping and job-costed financial statements.'
    };

    // Update Title and Meta Desc
    $('title').text(meta.title);
    if ($('meta[name="description"]').length) {
        $('meta[name="description"]').attr('content', meta.desc);
    } else {
        $('head').append(`<meta name="description" content="${meta.desc}">\n`);
    }

    // Determine Canonical URL
    let slug = relPath.replace('/index.html', '').replace('index.html', '');
    let canonicalUrl = slug ? `${BASE_URL}/${slug}` : `${BASE_URL}/`;
    
    // Set Canonical
    if ($('link[rel="canonical"]').length) {
        $('link[rel="canonical"]').attr('href', canonicalUrl);
    } else {
        $('head').append(`<link rel="canonical" href="${canonicalUrl}">\n`);
    }

    // OG & Twitter Tags
    const ogTags = {
        'og:title': meta.title,
        'og:description': meta.desc,
        'og:type': 'website',
        'og:url': canonicalUrl,
        'og:image': `${BASE_URL}/assets/og-image.png`,
        'twitter:card': 'summary_large_image',
        'twitter:title': meta.title,
        'twitter:description': meta.desc,
        'twitter:image': `${BASE_URL}/assets/og-image.png`
    };

    for (const [name, content] of Object.entries(ogTags)) {
        let isTwitter = name.startsWith('twitter:');
        let attrName = isTwitter ? 'name' : 'property';
        if ($(`meta[${attrName}="${name}"]`).length) {
            $(`meta[${attrName}="${name}"]`).attr('content', content);
        } else {
            $('head').append(`<meta ${attrName}="${name}" content="${content}">\n`);
        }
    }

    // JSON-LD Structured Data Schema Generation
    let schemas = [];
    
    // 1. Organization Schema (Every page)
    schemas.push({
        "@context": "https://schema.org",
        "@type": "AccountingService",
        "name": "Atlas Accountants",
        "url": BASE_URL,
        "logo": `${BASE_URL}/assets/logo.png`,
        "email": "info@atlasaccountantsusa.com",
        "telephone": "+1-919-438-0294",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Wake Forest",
            "addressRegion": "NC",
            "addressCountry": "US"
        },
        "description": "Virtual bookkeeping and accounting firm serving clients in all 50 states."
    });

    // 2. BreadcrumbList Schema (All pages except home)
    if (slug !== '' && slug !== '404.html') {
        let breadcrumbParts = slug.split('/');
        let itemListElement = [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BASE_URL
        }];
        let currentUrl = BASE_URL;
        breadcrumbParts.forEach((part, index) => {
            currentUrl += '/' + part;
            itemListElement.push({
                "@type": "ListItem",
                "position": index + 2,
                "name": part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
                "item": currentUrl
            });
        });
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": itemListElement
        });
    }

    // 3. Service Schema
    if (relPath.startsWith('services/') && relPath !== 'services/index.html') {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": meta.title.split(' | ')[0],
            "description": meta.desc,
            "provider": {
                "@type": "AccountingService",
                "name": "Atlas Accountants"
            }
        });
    }

    // 4. FAQPage Schema (Matches visible AEO block content)
    const aeoH2 = $('.aeo-answer-block h2').text().trim();
    const aeoP = $('.aeo-answer-block p').text().trim();
    if (aeoH2 && aeoP) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": aeoH2,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": aeoP
                }
            }]
        });
    }

    // 5. Article Schema
    if (relPath.startsWith('resources/') && relPath !== 'resources/index.html') {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": meta.title.split(' | ')[0],
            "description": meta.desc,
            "author": {
                "@type": "Person",
                "name": "Anoop Mishra",
                "url": `${BASE_URL}/about`
            },
            "publisher": {
                "@type": "Organization",
                "name": "Atlas Accountants",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${BASE_URL}/assets/logo.png`
                }
            }
        });
    }

    // 6. Person Schema
    if (relPath === 'about/index.html') {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Anoop Mishra",
            "jobTitle": "Founder & Accountant",
            "worksFor": {
                "@type": "AccountingService",
                "name": "Atlas Accountants"
            }
        });
    }

    // Remove old schema script if exists
    $('script[type="application/ld+json"]').remove();
    
    // Inject new schema script
    $('head').append(`<script type="application/ld+json">\n${JSON.stringify(schemas, null, 2)}\n</script>\n`);

    // GA4 & Event Tracking Injection
    const gaScript = `
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4_ID}', { anonymize_ip: true });
      
      // Basic Event Tracking
      document.addEventListener('DOMContentLoaded', function() {
        document.body.addEventListener('click', function(e) {
            let el = e.target.closest('a, button');
            if(!el) return;
            
            if(el.href && el.href.startsWith('mailto:')) {
                gtag('event', 'email_click', { event_category: 'Contact', event_label: el.href });
            }
            if(el.href && el.href.startsWith('tel:')) {
                gtag('event', 'phone_click', { event_category: 'Contact', event_label: el.href });
            }
            if(el.classList.contains('btn-primary') || el.classList.contains('nav-cta')) {
                gtag('event', 'booking_click', { event_category: 'Conversion', event_label: el.innerText });
            }
        });
      });
    </script>
    `;
    
    // Remove old hardcoded GA4 if exists
    $('script[src*="googletagmanager.com"]').remove();
    const htmlString = $.html();
    const cleanHtml = htmlString.replace(/<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];.*?<\/script>/gs, '');
    
    const final$ = cheerio.load(cleanHtml);
    final$('head').append(gaScript);

    fs.writeFileSync(filePath, final$.html());
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (f === 'node_modules' || f === '.git' || f.startsWith('.')) return;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

// 1. Process HTML files
walkDir(__dirname, function(filePath) {
    if (filePath.endsWith('.html')) {
        let relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
        if(!relPath.startsWith('scratch') && !relPath.startsWith('seo')) {
             processHtmlFile(filePath, relPath);
        }
    }
});

// 2. Generate Sitemap
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
Object.keys(pagesMetadata).forEach(relPath => {
    if(relPath === '404.html') return;
    let slug = relPath.replace('/index.html', '').replace('index.html', '');
    let loc = slug ? `${BASE_URL}/${slug}` : `${BASE_URL}/`;
    let today = new Date().toISOString().split('T')[0];
    sitemapXml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
});
sitemapXml += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);

// 3. Generate Robots.txt
const robotsTxt = `User-agent: *
Allow: /

# Allow AI retrieval crawlers
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsTxt);

// 4. Generate llms.txt
const llmsTxt = `# Atlas Accountants

Atlas Accountants is a virtual bookkeeping and accounting firm based in Wake Forest, North Carolina, serving clients in all 50 states. We deliver CPA-ready bookkeeping and job-costed financial statements. Built by someone who ran job sites before reading a P&L.

Primary Focus: Residential general contractors and remodelers, real estate investors and landlords, and specialty trade subcontractors.

Key Services:
- Construction Bookkeeping
- Real Estate Accounting
- Small Business Payroll & Sales Tax

Contact: info@atlasaccountantsusa.com | (919) 438-0294
Lead Tool: [The Margin Line](${BASE_URL}/margin-line)
About Us: [About](${BASE_URL}/about)
`;
fs.writeFileSync(path.join(__dirname, 'llms.txt'), llmsTxt);

// 5. IndexNow
const indexNowKey = 'e9c3b8a4f2d14b6e8a9f0c7d5e2b3a1f'; // Random key
fs.writeFileSync(path.join(__dirname, `${indexNowKey}.txt`), indexNowKey);

console.log("SEO Build Complete with JSON-LD Schema Generation!");
