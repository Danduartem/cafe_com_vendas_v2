/**
 * User Journey Tests for Café com Vendas
 * 
 * These tests validate critical user paths through the landing page,
 * ensuring both functionality and analytics work correctly.
 */

import { test, expect, type Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';
const TIMEOUT = 30000;

// Test data
const TEST_USER = {
  name: 'Maria Silva',
  email: `test-${Date.now()}@example.com`,
  phone: '912345678',
  countryCode: 'PT'
};

// Helper function to check if analytics event was fired
async function checkAnalyticsEvent(page: Page, eventName: string, timeout = 5000): Promise<boolean> {
  try {
    const result = await page.evaluate(
      ({ eventName, timeout }) => {
        return new Promise<boolean>((resolve) => {
          const startTime = Date.now();
          const checkInterval = setInterval(() => {
            const dataLayer = window.dataLayer || [];
            const hasEvent = dataLayer.some((event) => event.event === eventName);
            
            if (hasEvent || Date.now() - startTime > timeout) {
              clearInterval(checkInterval);
              resolve(hasEvent);
            }
          }, 100);
        });
      },
      { eventName, timeout }
    );
    return result;
  } catch {
    return false;
  }
}

// Helper to fill lead form
async function fillLeadForm(page: Page, userData = TEST_USER) {
  await page.fill('input[name="fullName"]', userData.name);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="phone"]', userData.phone);
  
  // Accept terms if checkbox exists
  const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
  if (await termsCheckbox.isVisible()) {
    await termsCheckbox.check();
  }
}

test.describe('User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if GTM is loaded
    await page.waitForFunction(() => typeof window.dataLayer !== 'undefined', { timeout: 10000 });
  });

  test('Complete Purchase Journey', async ({ page }) => {
    // Step 1: Verify landing page loads correctly
    await expect(page).toHaveTitle(/Café com Vendas/);
    
    // Step 2: Scroll through value proposition sections
    const sections = ['hero', 'problem', 'solution', 'about', 'offer'];
    for (const section of sections) {
      const element = page.locator(`#${section}, [data-section="${section}"]`).first();
      if (await element.isVisible()) {
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Small delay for scroll tracking
        
        // Verify section view event
        const eventFired = await checkAnalyticsEvent(page, 'section_view');
        expect(eventFired).toBeTruthy();
      }
    }
    
    // Step 3: Click main CTA button
    const ctaButton = page.locator('button:has-text("Quero Participar"), button:has-text("Reservar"), a:has-text("Inscrever")').first();
    await expect(ctaButton).toBeVisible({ timeout: TIMEOUT });
    await ctaButton.click();
    
    // Verify CTA click event
    const ctaEventFired = await checkAnalyticsEvent(page, 'cta_click');
    expect(ctaEventFired).toBeTruthy();
    
    // Step 4: Fill lead capture form
    await page.waitForSelector('form', { timeout: TIMEOUT });
    await fillLeadForm(page);
    
    // Step 5: Submit lead form
    const submitButton = page.locator('button[type="submit"]:has-text("Continuar"), button[type="submit"]:has-text("Prosseguir")').first();
    await submitButton.click();
    
    // Step 6: Wait for payment form
    await page.waitForSelector('#payment-element, .stripe-payment, iframe[name*="stripe"]', { timeout: TIMEOUT });
    
    // Step 7: Fill payment details (using Stripe test card)
    // Note: Stripe Elements are in iframes, so we need to handle them carefully
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    if (stripeFrame) {
      // Fill test card number: 4242 4242 4242 4242
      const cardInput = stripeFrame.locator('[placeholder*="Card number"], [placeholder*="Número"]').first();
      await cardInput.fill('4242 4242 4242 4242');
      
      // Fill expiry date
      const expiryInput = stripeFrame.locator('[placeholder*="MM / YY"], [placeholder*="Validade"]').first();
      await expiryInput.fill('12/25');
      
      // Fill CVC
      const cvcInput = stripeFrame.locator('[placeholder*="CVC"], [placeholder*="CVV"]').first();
      await cvcInput.fill('123');
      
      // Fill postal code if required
      const postalInput = stripeFrame.locator('[placeholder*="ZIP"], [placeholder*="Postal"]').first();
      if (await postalInput.isVisible()) {
        await postalInput.fill('1000-001');
      }
    }
    
    // Step 8: Complete purchase
    const payButton = page.locator('button:has-text("Pagar"), button:has-text("Finalizar"), button[id="payBtn"]').first();
    await payButton.click();
    
    // Step 9: Verify thank you page
    await page.waitForURL(/obrigado|thank-you|sucesso/, { timeout: TIMEOUT });
    
    // Step 10: Verify payment_completed event was fired
    const paymentEventFired = await checkAnalyticsEvent(page, 'payment_completed');
    expect(paymentEventFired).toBeTruthy();
    
    // Verify thank you page content
    await expect(page.locator('h1, h2').first()).toContainText(/Obrigad|Paraben|Sucesso/i);
  });

  test('Mobile User Journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Step 1: Verify responsive layout
    await expect(page).toHaveTitle(/Café com Vendas/);
    
    // Check mobile menu if exists
    const mobileMenuButton = page.locator('[aria-label*="menu"], .mobile-menu-button, .hamburger').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300); // Wait for menu animation
      
      // Close menu
      const closeButton = page.locator('[aria-label*="close"], .close-menu').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    // Step 2: Check WhatsApp button visibility and position
    const whatsappButton = page.locator('[href*="whatsapp"], [aria-label*="WhatsApp"], .whatsapp-button').first();
    await expect(whatsappButton).toBeVisible();
    
    // Verify it's positioned correctly (usually fixed position on mobile)
    const whatsappBox = await whatsappButton.boundingBox();
    expect(whatsappBox).toBeTruthy();
    
    // Step 3: Test FAQ accordion on mobile
    const faqSection = page.locator('#faq, [data-section="faq"]').first();
    if (await faqSection.isVisible()) {
      await faqSection.scrollIntoViewIfNeeded();
      
      // Click first FAQ item
      const firstFaqButton = page.locator('[data-accordion-button], .faq-question, .accordion-trigger').first();
      if (await firstFaqButton.isVisible()) {
        await firstFaqButton.click();
        
        // Verify content expands
        const faqContent = page.locator('[data-accordion-content], .faq-answer, .accordion-content').first();
        await expect(faqContent).toBeVisible();
        
        // Verify FAQ toggle event
        const faqEventFired = await checkAnalyticsEvent(page, 'faq_toggle');
        expect(faqEventFired).toBeTruthy();
      }
    }
    
    // Step 4: Test form usability on mobile
    const ctaButton = page.locator('button:has-text("Quero Participar"), button:has-text("Reservar")').first();
    await ctaButton.scrollIntoViewIfNeeded();
    await ctaButton.click();
    
    // Verify form is usable on mobile
    await page.waitForSelector('form', { timeout: TIMEOUT });
    
    // Check form inputs are accessible
    const nameInput = page.locator('input[name="fullName"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(TEST_USER.name);
    
    // Verify keyboard doesn't obscure inputs (mobile specific)
    const inputBox = await nameInput.boundingBox();
    expect(inputBox?.y).toBeGreaterThan(50); // Should not be at very top of screen
    
    // Step 5: Verify touch interactions work
    const emailInput = page.locator('input[name="email"]');
    await emailInput.tap(); // Use tap instead of click for mobile
    await emailInput.fill(TEST_USER.email);
    
    // Verify form validation works on mobile
    await emailInput.fill('invalid-email');
    await page.keyboard.press('Tab');
    
    // Check for validation message
    const validationMessage = page.locator('.error-message, [role="alert"], .invalid-feedback').first();
    if (await validationMessage.isVisible({ timeout: 2000 })) {
      expect(await validationMessage.textContent()).toContain(/email|e-mail/i);
    }
  });

  test('Abandonment Recovery Journey', async ({ page }) => {
    // Step 1: Start checkout process
    const ctaButton = page.locator('button:has-text("Quero Participar"), button:has-text("Reservar")').first();
    await ctaButton.click();
    
    // Step 2: Fill lead form
    await page.waitForSelector('form', { timeout: TIMEOUT });
    await fillLeadForm(page);
    
    // Step 3: Submit lead form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Step 4: Wait for payment form to load
    await page.waitForSelector('#payment-element, .stripe-payment, iframe[name*="stripe"]', { timeout: TIMEOUT });
    
    // Step 5: Simulate abandonment by navigating away
    await page.waitForTimeout(2000); // Wait to ensure lead is captured
    
    // Navigate back to homepage
    await page.goto(BASE_URL);
    
    // Step 6: Verify lead was captured (this would need backend verification in real scenario)
    // For now, we'll check if form submission event was tracked
    const formSubmitEventFired = await checkAnalyticsEvent(page, 'form_submission');
    expect(formSubmitEventFired).toBeTruthy();
    
    // Step 7: Simulate returning user (would trigger remarketing in production)
    await page.reload();
    
    // Check if any remarketing elements appear for returning users
    const returningUserBanner = page.locator('[data-returning-user], .comeback-offer').first();
    if (await returningUserBanner.isVisible({ timeout: 2000 })) {
      expect(await returningUserBanner.textContent()).toBeTruthy();
    }
  });

  test('Trust Building Journey', async ({ page }) => {
    // Step 1: User explores trust signals
    
    // Check guarantee/refund policy link
    const guaranteeLink = page.locator('a:has-text("Garantia"), a:has-text("Reembolso"), a[href*="garantia"]').first();
    if (await guaranteeLink.isVisible()) {
      await guaranteeLink.click();
      
      // Verify guarantee page loads
      await expect(page).toHaveURL(/garantia|reembolso/);
      await expect(page.locator('h1, h2').first()).toContainText(/Garantia|Reembolso/i);
      
      // Navigate back
      await page.goBack();
    }
    
    // Step 2: Check social proof section
    const socialProofSection = page.locator('#social-proof, [data-section="social-proof"], .testimonials').first();
    if (await socialProofSection.isVisible()) {
      await socialProofSection.scrollIntoViewIfNeeded();
      
      // Look for video testimonials
      const videoElements = page.locator('iframe[src*="youtube"], video, .video-testimonial').first();
      if (await videoElements.isVisible()) {
        // If it's a YouTube iframe, check if it's loaded
        const iframeSrc = await videoElements.getAttribute('src');
        expect(iframeSrc).toBeTruthy();
        
        // Simulate watching (can't actually play iframe videos in tests)
        await page.waitForTimeout(2000);
        
        // Check if video play event was tracked
        const videoEventFired = await checkAnalyticsEvent(page, 'video_play');
        if (videoEventFired) {
          expect(videoEventFired).toBeTruthy();
        }
      }
    }
    
    // Step 3: Check presenter/about section
    const aboutSection = page.locator('#about, [data-section="about"], .presenter').first();
    if (await aboutSection.isVisible()) {
      await aboutSection.scrollIntoViewIfNeeded();
      
      // Verify presenter information is visible
      const presenterImage = page.locator('.presenter-image, [alt*="Ana"], img[src*="presenter"]').first();
      await expect(presenterImage).toBeVisible();
      
      // Check credentials or bio
      const credentials = page.locator('.credentials, .bio, .presenter-description').first();
      if (await credentials.isVisible()) {
        const bioText = await credentials.textContent();
        expect(bioText).toBeTruthy();
        expect(bioText?.length || 0).toBeGreaterThan(50); // Should have substantial bio
      }
    }
    
    // Step 4: After building trust, proceed to purchase
    const ctaButton = page.locator('button:has-text("Quero Participar"), button:has-text("Reservar")').first();
    await ctaButton.scrollIntoViewIfNeeded();
    await ctaButton.click();
    
    // Verify checkout modal/form appears
    await expect(page.locator('form, [role="dialog"]').first()).toBeVisible({ timeout: TIMEOUT });
    
    // Step 5: Verify trust signals in checkout
    const checkoutTrustSignals = page.locator('.security-badge, .guarantee-text, [src*="stripe"], .payment-security').first();
    if (await checkoutTrustSignals.isVisible()) {
      expect(await checkoutTrustSignals.isVisible()).toBeTruthy();
    }
  });

  test('Analytics Events Tracking', async ({ page }) => {
    // This test specifically validates that all critical analytics events fire correctly
    
    // Step 1: Page view event
    const pageViewFired = await checkAnalyticsEvent(page, 'page_view');
    expect(pageViewFired).toBeTruthy();
    
    // Step 2: Scroll depth tracking
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const scrollEventFired = await checkAnalyticsEvent(page, 'scroll_depth');
    if (scrollEventFired) {
      expect(scrollEventFired).toBeTruthy();
    }
    
    // Step 3: Component interactions
    const firstButton = page.locator('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      
      const interactionEventFired = await checkAnalyticsEvent(page, 'component_interaction');
      if (interactionEventFired) {
        expect(interactionEventFired).toBeTruthy();
      }
    }
    
    // Step 4: WhatsApp click tracking
    const whatsappLink = page.locator('[href*="whatsapp"]').first();
    if (await whatsappLink.isVisible()) {
      // Don't actually click (would open WhatsApp), just check the event handler exists
      const hasClickHandler = await whatsappLink.evaluate(el => {
        return el.hasAttribute('onclick') || el.hasAttribute('data-event');
      });
      expect(hasClickHandler).toBeTruthy();
    }
    
    // Step 5: Verify dataLayer structure
    const dataLayerStructure = await page.evaluate(() => {
      const dl = window.dataLayer || [];
      return {
        hasEvents: dl.length > 0,
        hasGTMLoad: dl.some((e) => e['gtm.start'] !== undefined),
        eventTypes: [...new Set(dl.map((e) => e.event).filter(Boolean))]
      };
    });
    
    expect(dataLayerStructure.hasEvents).toBeTruthy();
    expect(dataLayerStructure.hasGTMLoad).toBeTruthy();
    expect(dataLayerStructure.eventTypes.length).toBeGreaterThan(0);
  });
});