const { test, expect } = require('@playwright/test');

test.describe('Tracking and form submissions', () => {
  test('Margin Line form submission and dataLayer events', async ({ page }) => {
    // Intercept formspree to return ok
    await page.route('https://formspree.io/f/mbglpwan', async route => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = JSON.parse(request.postData());
      
      // Ensure PII is present in the form data (but should not be in dataLayer)
      expect(postData.name).toBe('Test User');
      expect(postData.email).toBe('test@example.com');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    // Mock sessionStorage
    await page.addInitScript(() => {
      window.sessionStorage.setItem('utm_source', 'test_source');
    });

    // Load margin line page
    await page.goto('/margin-line/index.html');

    // 1 general branch (this is idx = -1)
    const btnGeneral = page.locator('text=Residential GC or remodeler');
    if (await btnGeneral.isVisible()) {
      await btnGeneral.click();
    } else {
      await page.locator('.opt-btn').first().click();
    }

    // quiz_start should fire now (idx = 0)
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'quiz_start');
    });
    
    // There are 9 questions
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(600); // wait for animation
      await page.locator('.opt-btn').first().click();
    }
    
    // quiz_complete should fire
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'quiz_complete' && e.score_band);
    });

    // Fill form
    await page.fill('#gf-name', 'Test User');
    await page.fill('#gf-email', 'test@example.com');
    await page.selectOption('#gf-type', 'Other');
    await page.selectOption('#gf-rev', 'Under $500K');
    
    // Submit
    await page.click('text=Show My Full Breakdown');
    
    // Wait for generate_lead event
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'generate_lead');
    });

    // Validate dataLayer contents for PII
    const dataLayer = await page.evaluate(() => window.dataLayer);
    
    const generateLeadEvent = dataLayer.find(e => e.event === 'generate_lead');
    expect(generateLeadEvent.lead_type).toBe('margin_line');
    expect(generateLeadEvent.event_id).toBeDefined();
    expect(generateLeadEvent.name).toBeUndefined();
    expect(generateLeadEvent.email).toBeUndefined();
    
    const quizCompleteEvent = dataLayer.find(e => e.event === 'quiz_complete');
    expect(quizCompleteEvent.score_band).toBeDefined();
  });

  test('Contact form submission and dataLayer events', async ({ page }) => {
    // Intercept formspree to return ok
    await page.route('https://formspree.io/f/mbglpwan', async route => {
      const request = route.request();
      const postData = JSON.parse(request.postData());
      
      expect(postData.name).toBe('Contact User');
      
      // Also verify UTM gets passed correctly
      expect(postData.utm_source).toBe('test_source_contact');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    // Mock sessionStorage
    await page.addInitScript(() => {
      window.sessionStorage.setItem('utm_source', 'test_source_contact');
    });

    await page.goto('/contact/index.html');

    // Fill form
    await page.fill('#contact-name', 'Contact User');
    await page.fill('#contact-email', 'contact@example.com');
    await page.fill('#contact-message', 'Hello this is a test.');
    
    // Submit
    await page.click('button:has-text("Send Message")');

    // Wait for generate_lead event
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'generate_lead');
    });

    // Validate dataLayer contents for PII
    const dataLayer = await page.evaluate(() => window.dataLayer);
    
    const generateLeadEvent = dataLayer.find(e => e.event === 'generate_lead');
    expect(generateLeadEvent.lead_type).toBe('contact');
    expect(generateLeadEvent.event_id).toBeDefined();
    expect(generateLeadEvent.name).toBeUndefined();
    expect(generateLeadEvent.email).toBeUndefined();
    expect(generateLeadEvent.message).toBeUndefined();

    // The thank you message should be visible
    await expect(page.locator('#contact-ty')).toBeVisible();
  });

  test('Calendly popup button, fallback link, and event tracking', async ({ page }) => {
    await page.goto('/contact/index.html');

    // 1. Verify no stuck inline iframe exists
    const inlineIframe = page.locator('.calendly-embed-wrapper iframe');
    await expect(inlineIframe).toHaveCount(0);

    // 2. Verify primary Book a call button exists
    const bookBtn = page.locator('#book-call-btn');
    await expect(bookBtn).toBeVisible();
    await expect(bookBtn).toHaveText('Book a call');

    // 3. Verify plain text fallback link exists
    const fallbackLink = page.locator('.booking-fallback a');
    await expect(fallbackLink).toBeVisible();
    await expect(fallbackLink).toHaveAttribute('href', 'https://calendly.com/anoop-atlasaccountantsusa/30min');

    // 4. Click Book a call button and verify booking_click event in dataLayer
    await bookBtn.click();
    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'booking_click');
    });

    // 5. Simulate calendly.event_scheduled window message and verify booking_complete (with NO PII)
    await page.evaluate(() => {
      window.postMessage({ event: 'calendly.event_scheduled', payload: { invitee: { email: 'secret@example.com', name: 'Secret User' } } }, '*');
    });

    await page.waitForFunction(() => {
      const dl = window.dataLayer || [];
      return dl.some(e => e.event === 'booking_complete');
    });

    const dataLayer = await page.evaluate(() => window.dataLayer);
    const bookingCompleteEvent = dataLayer.find(e => e.event === 'booking_complete');
    expect(bookingCompleteEvent).toBeDefined();
    expect(bookingCompleteEvent.name).toBeUndefined();
    expect(bookingCompleteEvent.email).toBeUndefined();
    expect(bookingCompleteEvent.payload).toBeUndefined();
  });
});

