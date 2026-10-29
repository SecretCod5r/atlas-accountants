const { test, expect } = require('@playwright/test');

test.describe('Header and Navigation Updates', () => {

  test('Desktop (1280x800): Contact link present, CTA highlighted, no mobile buttons, no layout shift', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify nav height is single line (approx 72-76px, well under 90px to prevent multi-line wrap)
    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox.height).toBeGreaterThanOrEqual(70);
    expect(navBox.height).toBeLessThanOrEqual(85);

    // 1. Desktop nav: "Contact" text link pointing to /contact
    const contactLink = page.locator('.nav-links a[href="/contact"]');
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveText('Contact');
    await expect(contactLink).not.toHaveClass(/nav-cta/);

    // 2. "Get My Free Review" is the single highlighted button
    const ctaLinks = page.locator('.nav-links .nav-cta');
    await expect(ctaLinks).toHaveCount(1);
    await expect(ctaLinks).toHaveText('Get My Free Review');

    // 3. Mobile header buttons are hidden on desktop
    await expect(page.locator('.mobile-nav-actions')).toBeHidden();
    await expect(page.locator('.mobile-phone-btn')).toBeHidden();
    await expect(page.locator('.mobile-menu-btn')).toBeHidden();
    await expect(page.locator('.mobile-menu-phone')).toBeHidden();
  });

  test('Tablet (768x1024): Clean header with mobile actions, no layout shift', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check no vertical layout explosion / multi-line wrap
    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox.height).toBeGreaterThanOrEqual(70);
    expect(navBox.height).toBeLessThanOrEqual(85);

    // Mobile nav actions visible at tablet width
    await expect(page.locator('.mobile-nav-actions')).toBeVisible();
    const phoneBtn = page.locator('.mobile-phone-btn');
    await expect(phoneBtn).toBeVisible();
    await expect(phoneBtn).toHaveAttribute('href', 'tel:+19194380294');
    await expect(phoneBtn).toHaveAttribute('aria-label', /Call Atlas Accountants at \(919\) 438-0294/);

    const menuBtn = page.locator('.mobile-menu-btn');
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveAttribute('aria-label', /Toggle menu/);
  });

  test('Mobile (390x844): tap-to-call icon, opened mobile menu contents, and phone_click tracking', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Confirm no header layout shift on mobile
    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox.height).toBeGreaterThanOrEqual(70);
    expect(navBox.height).toBeLessThanOrEqual(85);

    // 1. Verify tap-to-call phone button beside menu button with accessible label
    const phoneBtn = page.locator('.mobile-phone-btn');
    await expect(phoneBtn).toBeVisible();
    await expect(phoneBtn).toHaveAttribute('href', 'tel:+19194380294');
    await expect(phoneBtn).toHaveAttribute('aria-label', 'Call Atlas Accountants at (919) 438-0294');

    // 2. Click tap-to-call button and verify phone_click dataLayer event
    await phoneBtn.click();
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'phone_click');
    });

    // 3. Open mobile menu
    const menuBtn = page.locator('.mobile-menu-btn');
    await menuBtn.click();

    const navDrawer = page.locator('.nav-links');
    await expect(navDrawer).toHaveClass(/active/);

    // 4. Verify "Contact" link inside opened mobile menu
    const menuContact = navDrawer.locator('a[href="/contact"]');
    await expect(menuContact).toBeVisible();
    await expect(menuContact).toHaveText('Contact');

    // 5. Verify phone number inside opened mobile menu
    const menuPhone = navDrawer.locator('.mobile-menu-phone');
    await expect(menuPhone).toBeVisible();
    await expect(menuPhone).toHaveAttribute('href', 'tel:+19194380294');
    await expect(menuPhone).toContainText('(919) 438-0294');

    // 6. Click phone number in opened mobile menu and verify phone_click event
    // Clear dataLayer or check new event
    await page.evaluate(() => { window.dataLayer = []; });
    await menuPhone.click();
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'phone_click');
    });
  });

  test('Contact Page Mobile Viewport: Phone, Email, and Book a call button visible in the first screen', async ({ page }) => {
    // Test on iPhone standard viewport (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact/index.html');

    const viewportHeight = 844;

    // 1. Locate phone, email, and Book a call button
    const phoneLink = page.locator('.get-in-touch a[href="tel:+19194380294"]');
    const emailLink = page.locator('.get-in-touch a[href="mailto:info@atlasaccountantsusa.com"]');
    const bookCallBtn = page.locator('#book-call-btn');
    const formSection = page.locator('.contact-form-section');

    await expect(phoneLink).toBeVisible();
    await expect(emailLink).toBeVisible();
    await expect(bookCallBtn).toBeVisible();
    await expect(formSection).toBeVisible();

    // 2. Measure bounding boxes before any scrolling
    const phoneBox = await phoneLink.boundingBox();
    const emailBox = await emailLink.boundingBox();
    const bookBox = await bookCallBtn.boundingBox();
    const formBox = await formSection.boundingBox();

    expect(phoneBox).not.toBeNull();
    expect(emailBox).not.toBeNull();
    expect(bookBox).not.toBeNull();
    expect(formBox).not.toBeNull();

    console.log(`Mobile Viewport First Screen Check:
      Phone bottom: ${phoneBox.y + phoneBox.height}px
      Email bottom: ${emailBox.y + emailBox.height}px
      Book a call button bottom: ${bookBox.y + bookBox.height}px
      Viewport Height: ${viewportHeight}px
      Form Top: ${formBox.y}px
    `);

    // Verify phone, email, and Book a call button are visible in first screen (< viewportHeight)
    expect(phoneBox.y + phoneBox.height).toBeLessThan(viewportHeight);
    expect(emailBox.y + emailBox.height).toBeLessThan(viewportHeight);
    expect(bookBox.y + bookBox.height).toBeLessThan(viewportHeight);

    // Verify form is below them
    expect(formBox.y).toBeGreaterThan(bookBox.y + bookBox.height);
  });

  test('Small Mobile (375x667 iPhone SE): First screen check for contact essentials', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/contact/index.html');

    const viewportHeight = 667;

    const phoneLink = page.locator('.get-in-touch a[href="tel:+19194380294"]');
    const emailLink = page.locator('.get-in-touch a[href="mailto:info@atlasaccountantsusa.com"]');
    const bookCallBtn = page.locator('#book-call-btn');

    await expect(phoneLink).toBeVisible();
    await expect(emailLink).toBeVisible();
    await expect(bookCallBtn).toBeVisible();

    const phoneBox = await phoneLink.boundingBox();
    const emailBox = await emailLink.boundingBox();
    const bookBox = await bookCallBtn.boundingBox();

    expect(phoneBox.y + phoneBox.height).toBeLessThan(viewportHeight);
    expect(emailBox.y + emailBox.height).toBeLessThan(viewportHeight);
    expect(bookBox.y + bookBox.height).toBeLessThan(viewportHeight);
  });

  test('dataLayer event tracking for phone_click and email_click on contact page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/contact/index.html');

    // Test email_click
    const emailLink = page.locator('.get-in-touch a[href="mailto:info@atlasaccountantsusa.com"]');
    await emailLink.click();
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'email_click');
    });

    // Test phone_click
    const phoneLink = page.locator('.get-in-touch a[href="tel:+19194380294"]');
    await phoneLink.click();
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'phone_click');
    });
  });

  test('Homepage "See The Margin Line" button redirects to /margin-line, not .html', async ({ page }) => {
    await page.goto('/index.html');
    const mlBtn = page.locator('#ml-start');
    await expect(mlBtn).toBeVisible();
    await mlBtn.click();
    await page.waitForURL(url => url.pathname.includes('/margin-line') && !url.pathname.includes('.html'), { timeout: 5000 });
    expect(page.url()).toContain('/margin-line');
    expect(page.url()).not.toContain('margin-line.html');
  });

  test('Homepage quiz card click redirects to /margin-line, not .html', async ({ page }) => {
    await page.goto('/index.html');
    const quizLink = page.locator('a[href="/margin-line"]:has(#ml-end)');
    await expect(quizLink).toBeVisible();
    await expect(quizLink).toHaveAttribute('href', '/margin-line');
  });

});
