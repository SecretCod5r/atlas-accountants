// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Favicon and Head Verification', () => {
  test('Direct favicon asset endpoints return HTTP 200', async ({ request }) => {
    const icoRes = await request.get('/favicon.ico');
    expect(icoRes.status()).toBe(200);

    const pngRes = await request.get('/favicon.png');
    expect(pngRes.status()).toBe(200);

    const assetsPngRes = await request.get('/assets/favicon.png');
    expect(assetsPngRes.status()).toBe(200);

    const assetsIcoRes = await request.get('/assets/favicon.ico');
    expect(assetsIcoRes.status()).toBe(200);
  });

  const testPages = [
    '/',
    '/contact',
    '/about',
    '/margin-line',
    '/pricing',
    '/services',
    '/financial-health-review',
    '/services/construction-bookkeeping',
    '/404.html'
  ];

  for (const pagePath of testPages) {
    test(`Page "${pagePath}" has valid favicon links in <head> and none in <body>`, async ({ page }) => {
      await page.goto(pagePath);

      // Verify favicon link exists inside <head>
      const headFaviconCount = await page.evaluate(() => {
        return document.querySelectorAll('head link[rel*="icon"]').length;
      });
      expect(headFaviconCount).toBeGreaterThanOrEqual(2);

      // Verify NO favicon link was placed inside <body>
      const bodyFaviconCount = await page.evaluate(() => {
        return document.querySelectorAll('body link[rel*="icon"]').length;
      });
      expect(bodyFaviconCount).toBe(0);

      // Verify document.title is accessible and inside head
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }
});
