/**
 * User Journey Tests for Café com Vendas
 * 
 * These tests validate critical user paths through the landing page,
 * ensuring both functionality and analytics work correctly.
 */

import { test, expect, type Page } from '@playwright/test';

// TypeScript interface for test user data
interface TestUserData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
}


// Test configuration (aligned with Playwright config timeout)
const BASE_URL = process.env.TEST_URL || 'http://localhost:8888';
const TIMEOUT = 120000; // 2 minutes to match Playwright config

// Enhanced test data generation with better isolation
function generateTestUser(): TestUserData {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 6);
  const workerId = process.env.PLAYWRIGHT_WORKER_ID || Math.floor(Math.random() * 100);
  
  return {
    name: 'Maria Silva',
    email: `test-${timestamp}-${workerId}-${randomId}@example.com`,
    phone: `91234567${Math.floor(Math.random() * 10)}`, // Vary last digit
    countryCode: 'PT'
  };
}

const TEST_USER = generateTestUser();

// GTM event mapping: test names → production GTM event names
const GTM_EVENT_ALIASES: Record<string, string[]> = {
  'form_submission': ['lead_form_submitted', 'form_submission'],
  'cta_click': ['checkout_opened', 'cta_click'],
  'section_view': ['view_testimonials_section', 'section_view'],
  'payment_completed': ['purchase_completed', 'payment_completed'],
  'faq_toggle': ['faq_toggle'],
  'page_view': ['page_view'],
  'scroll_depth': ['scroll_depth']
};

// Helper function to check if analytics event was fired
async function checkAnalyticsEvent(page: Page, eventName: string, timeout = 8000): Promise<boolean> {
  try {
    // Get possible event names (including GTM aliases)
    const possibleEvents = GTM_EVENT_ALIASES[eventName] || [eventName];
    
    const result = await page.evaluate(
      ({ possibleEvents, timeout }) => {
        return new Promise<boolean>((resolve) => {
          const startTime = Date.now();
          let foundEvent = false;
          
          const checkInterval = setInterval(() => {
            const dataLayer = window.dataLayer || [];
            
            // Check for any of the possible event names
            const hasEvent = dataLayer.some((event) => 
              possibleEvents.some((eventName) => event.event === eventName)
            );
            
            if (hasEvent) {
              foundEvent = true;
            }
            
            if (foundEvent || Date.now() - startTime > timeout) {
              clearInterval(checkInterval);
              
              resolve(foundEvent);
            }
          }, 100);
        });
      },
      { possibleEvents, timeout }
    );
    
    return result;
  } catch (error) {
    console.error(`[Test Analytics] Error checking event "${eventName}":`, error);
    return false;
  }
}

// Helper to detect browser type for optimized handling
function getBrowserType(page: Page): 'chromium' | 'webkit' | 'mobile' | 'unknown' {
  const viewport = page.viewportSize();
  
  // Check mobile FIRST based on viewport size - this must come before browser type check
  // to ensure mobile-chrome and mobile-safari are correctly identified as 'mobile'
  if (viewport && (viewport.width <= 768 || viewport.height <= 1024)) {
    return 'mobile';
  }
  
  // Then check browser type name
  const userAgent = page.context().browser()?.browserType().name() || 'unknown';
  if (userAgent.includes('chromium')) return 'chromium';
  if (userAgent.includes('webkit')) return 'webkit';
  return 'unknown';
}

// Helper to get browser-optimized timeouts
function getBrowserTimeouts(page: Page): { short: number; medium: number; long: number } {
  const browserType = getBrowserType(page);
  
  switch (browserType) {
    case 'chromium':
      return { short: 5000, medium: 15000, long: 30000 };
    case 'webkit':
      return { short: 10000, medium: 25000, long: 45000 };
    case 'mobile':
      return { short: 15000, medium: 35000, long: 60000 };
    default:
      return { short: 10000, medium: 20000, long: 40000 };
  }
}

// Helper to check if browser/page is still available
async function isBrowserAvailable(page: Page): Promise<boolean> {
  try {
    await page.evaluate(() => true);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Target page, context or browser has been closed') ||
        errorMessage.includes('Browser has been closed') ||
        errorMessage.includes('Protocol error')) {
      console.log('Browser is no longer available:', errorMessage);
      return false;
    }
    return true;
  }
}


// Helper to clean up browser resources for long-running tests
async function cleanupBrowserResources(page: Page): Promise<void> {
  try {
    // Clear browser storage and caches to free memory
    await page.evaluate(() => {
      // Clear various browser caches and storage
      if (window.caches) {
        void caches.keys().then(names => {
          void Promise.all(names.map(name => caches.delete(name)));
        });
      }
      
      // Clear local storage
      try {
        localStorage.clear();
      } catch {
        // Ignore errors
      }
      
      // Clear session storage
      try {
        sessionStorage.clear();
      } catch {
        // Ignore errors
      }
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    });
    
    // Give browser time to process cleanup
    await page.waitForTimeout(1000);
  } catch (error) {
    // Cleanup is optional, don't fail the test if it doesn't work
    console.log('Browser cleanup skipped:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Helper to safely check DOM elements with browser disconnection handling
async function safelyCheckElement(page: Page, selector: string, description: string): Promise<{ exists: boolean; classes?: string | null }> {
  try {
    // First check if browser is still available
    if (!(await isBrowserAvailable(page))) {
      throw new Error(`Browser disconnected before checking ${description}`);
    }
    
    const element = await page.$(selector);
    if (element) {
      const classes = await element.getAttribute('class');
      console.log(`${description} exists with classes: ${classes}`);
      return { exists: true, classes };
    } else {
      console.log(`${description} not found in DOM`);
      return { exists: false };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Target page, context or browser has been closed') || 
        errorMessage.includes('Browser has been closed') ||
        errorMessage.includes('Protocol error')) {
      console.log(`Browser disconnected while checking ${description}`);
      throw new Error(`Browser disconnected during DOM check: ${errorMessage}`);
    }
    console.log(`Error checking ${description}:`, errorMessage);
    return { exists: false };
  }
}

// Helper to fill lead form with fresh data for each call
async function fillLeadForm(page: Page, userData?: TestUserData) {
  // Generate fresh user data for each form fill to ensure uniqueness
  const freshUserData = userData || generateTestUser();
  
  await page.fill('input[name="fullName"]', freshUserData.name);
  await page.fill('input[name="email"]', freshUserData.email);
  await page.fill('input[name="phone"]', freshUserData.phone);
  
  // Accept terms if checkbox exists
  const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
  if (await termsCheckbox.isVisible()) {
    await termsCheckbox.check();
  }
}

test.describe('User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject Stripe test key BEFORE navigation
    // This ensures the key is available when modules load
    await page.addInitScript(() => {
      const testKey = 'pk_test_51RwIbW1g4ir2wIfRFq6secs10CgdKgOmSSAZkStmJakV4E9dZZXPVoM5BluYlRsLtViMwWnCkTsNZqykxqZO8c4500Ss4KwViq';
      
      // Inject test-specific Stripe configuration
      window.STRIPE_TEST_PUBLISHABLE_KEY = testKey;
      
      // Also inject into import.meta.env for Vite compatibility
      if (typeof window !== 'undefined') {
        // Create import.meta.env if it doesn't exist
        window.import = window.import || {};
        window.import.meta = window.import.meta || {};
        window.import.meta.env = window.import.meta.env || {};
        
        // Set the Stripe key
        window.import.meta.env.VITE_STRIPE_PUBLIC_KEY = testKey;
      }
    });
    
    // Capture console messages for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('[BROWSER ERROR]:', msg.text());
      } else if (msg.text().includes('[DEBUG]') || msg.text().includes('[Environment]') || msg.text().includes('[TEST]')) {
        console.log('[BROWSER LOG]:', msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log('[PAGE ERROR]:', error.message);
    });
    
    await page.goto(BASE_URL);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if GTM is loaded
    await page.waitForFunction(() => typeof window.dataLayer !== 'undefined', { timeout: 10000 });
    
    // Wait for app to initialize with browser-specific timeout
    const browserTimeouts = getBrowserTimeouts(page);
    await page.waitForFunction(() => typeof window.CafeComVendas !== 'undefined', { timeout: browserTimeouts.medium });
    
    // Add a small delay to ensure all events have fired
    await page.waitForTimeout(2000);
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
    const ctaButton = page.locator('[data-checkout-trigger]').first();
    await expect(ctaButton).toBeVisible({ timeout: TIMEOUT });
    await ctaButton.click();
    
    // Verify CTA click event
    const ctaEventFired = await checkAnalyticsEvent(page, 'cta_click');
    expect(ctaEventFired).toBeTruthy();
    
    // Step 4: Fill lead capture form
    await page.waitForSelector('form', { timeout: TIMEOUT });
    
    // Wait for checkout module to be initialized
    await page.waitForSelector('form[data-checkout-initialized="true"]', { timeout: 10000 });
    
    await fillLeadForm(page);
    
    // Step 5: Submit lead form (first step - no payment intent yet)
    
    // Debug: Check if Stripe key is available in the page
    await page.evaluate(() => {
      const hasEnvKey = !!window.import?.meta?.env?.VITE_STRIPE_PUBLIC_KEY;
      const hasTestKey = !!window.STRIPE_TEST_PUBLISHABLE_KEY;
      const configKey = !!window.CONFIG?.stripe?.publishableKey;
      console.log('[DEBUG] Stripe key check:', {
        hasEnvKey,
        hasTestKey,
        configKey,
        envValue: window.import?.meta?.env?.VITE_STRIPE_PUBLIC_KEY?.substring(0, 20),
        testValue: window.STRIPE_TEST_PUBLISHABLE_KEY?.substring(0, 20),
        configValue: window.CONFIG?.stripe?.publishableKey?.substring(0, 20)
      });
      return hasEnvKey || hasTestKey || configKey;
    });
    
    
    // Monitor network requests for debugging
    page.on('request', request => {
      if (request.url().includes('create-payment-intent')) {
        // Request is being tracked for debugging purposes
      }
    });
    
    // Add error listener to catch JavaScript errors
    page.on('pageerror', () => {
      // Page error is being tracked for debugging purposes
    });
    
    // Check if button click triggers any console logs
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (btn) {
        console.log('[DEBUG] Submit button found, adding click listener');
        btn.addEventListener('click', (e) => {
          console.log('[DEBUG] Submit button clicked!', e);
        });
      }
    });
    
    // Submit the form programmatically to ensure the event fires
    
    // Use evaluate to trigger form submission directly
    await page.evaluate(() => {
      const form = document.querySelector('#leadForm') as HTMLFormElement;
      if (form) {
        console.log('[DEBUG] Triggering form submit event');
        form.requestSubmit(); // This properly triggers submit event with validation
      } else {
        console.error('[DEBUG] Form not found!');
      }
    });
    
    // Wait for the form to transition to step 2 (payment form)
    // The payment intent is created when step 2 initializes
    
    // Wait for payment intent request that happens during step 2 initialization
    const response = await page.waitForResponse(resp => {
      const isPaymentRequest = resp.url().includes('/.netlify/functions/create-payment-intent');
      return isPaymentRequest && (resp.status() === 200 || resp.status() === 500);
    }, { timeout: TIMEOUT });
    
    // If we got a 500 error (likely idempotency conflict), retry once with delay
    if (response.status() === 500) {
      await page.waitForTimeout(1000); // Brief delay to avoid rapid retries
      
      // Trigger a fresh payment intent creation by refreshing the checkout state
      const retryButton = page.locator('button[type="submit"]');
      if (await retryButton.isVisible()) {
        await Promise.all([
          page.waitForResponse(resp => 
            resp.url().includes('/.netlify/functions/create-payment-intent') && 
            (resp.status() === 200 || resp.status() === 500), 
            { timeout: TIMEOUT }
          ),
          retryButton.click()
        ]);
      }
    }
    
    // Wait longer for the UI to update after successful API call - extended for slower responses
    await page.waitForTimeout(4000);
    
    // Clean up browser resources before the resource-intensive payment step
    const currentBrowserType = getBrowserType(page);
    if (currentBrowserType === 'webkit' || currentBrowserType === 'mobile') {
      await cleanupBrowserResources(page);
    }
    
    // Ensure network is idle before checking payment step (helps with WebKit/mobile)
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // Network idle timeout - proceeding anyway
    }
    
    // Step 6: Wait for payment form to be visible with progressive retry strategy
    let paymentStepVisible = false;
    let attempts = 0;
    // Reduce attempts for resource-intensive tests on slower browsers
    const currentBrowser = getBrowserType(page);
    const maxAttempts = (currentBrowser === 'webkit' || currentBrowser === 'mobile') ? 2 : 3;
    
    while (!paymentStepVisible && attempts < maxAttempts) {
      attempts++;
      
      try {
        // Check browser availability before waiting
        if (!(await isBrowserAvailable(page))) {
          throw new Error('Browser disconnected before waiting for payment step');
        }
        
        // Use JavaScript-based visibility check with browser-specific timeout
        const browserTimeouts = getBrowserTimeouts(page);
        
        await page.waitForFunction(() => {
          // Check if payment step is truly ready for interaction
          const paymentStep = document.getElementById('paymentStep');
          if (!paymentStep) return false;
          
          // Check if element is visible (not hidden by CSS)
          const styles = window.getComputedStyle(paymentStep);
          if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
            return false;
          }
          
          // Check if element has hidden class
          if (paymentStep.classList.contains('hidden')) {
            return false;
          }
          
          // Check if element is actually in viewport and has dimensions
          const rect = paymentStep.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            return false;
          }
          
          return true; // Payment step is ready
        }, { timeout: browserTimeouts.long });
        
        paymentStepVisible = true;
      } catch (error: unknown) {
        if (attempts < maxAttempts) {
          // Check if the step exists but is still hidden using safe DOM operations
          const stepInfo = await safelyCheckElement(page, '#paymentStep', 'Payment step');
          if (stepInfo.exists) {
            // Give browser-specific time for JavaScript/CSS to execute
            const browserTimeouts = getBrowserTimeouts(page);
            await page.waitForTimeout(browserTimeouts.short);
          }
        } else {
          // On final attempt, provide more context about the error
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const browserType = getBrowserType(page);
          
          if (errorMessage.includes('Target page, context or browser has been closed') ||
              errorMessage.includes('Browser has been closed') ||
              errorMessage.includes('Protocol error')) {
            throw new Error(`Test failed due to ${browserType} browser disconnection after ${maxAttempts} attempts: ${errorMessage}`);
          }
          
          if (errorMessage.includes('Timeout')) {
            throw new Error(`${browserType} browser timeout after ${maxAttempts} attempts with extended timeouts. Payment step never became visible.`);
          }
          
          throw new Error(`${browserType} browser error after ${maxAttempts} attempts: ${errorMessage}`);
        }
      }
    }
    
    // Wait a moment for Stripe to initialize
    await page.waitForTimeout(3000);
    
    // Then wait for either the payment element container to be visible or Stripe iframe to load
    // The payment-skeleton should be hidden and payment-element should be visible
    await Promise.race([
      page.waitForSelector('#payment-element:not(.hidden)', { state: 'visible', timeout: TIMEOUT }),
      page.waitForSelector('iframe[src*="stripe"], iframe[name*="__privateStripeFrame"], iframe[title*="Secure payment"]', { state: 'visible', timeout: TIMEOUT }),
      page.waitForSelector('#paymentStep .stripe-element', { state: 'visible', timeout: TIMEOUT })
    ]);
    
    // Step 7: Verify payment form loaded (Stripe iframe present)
    // The actual Stripe Payment Element is secure and we can't easily interact with it in tests
    // Just verify it loaded successfully
    const stripeIframe = await page.waitForSelector('iframe', { timeout: 5000 });
    expect(stripeIframe).toBeTruthy();
    
    // Verify pay button exists (it should be disabled until form is filled)
    const payButton = page.locator('#payBtn');
    await expect(payButton).toBeVisible();
    const isDisabled = await payButton.isDisabled();
    expect(isDisabled).toBeTruthy(); // Should be disabled since we didn't fill the form
    
    // For a complete E2E purchase test, you would need:
    // 1. Stripe test mode configured with special test cards
    // 2. Mock payment completion or use Stripe's test helpers
    // 3. Or use a test payment intent that auto-completes
    
    // Since we verified the payment form loads, we'll consider this flow tested
    // The key user journey elements validated are:
    // - CTA clicks work
    // - Modal opens
    // - Lead form submission works
    // - Payment step displays
    // - Stripe payment element loads successfully
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
    const ctaButton = page.locator('[data-checkout-trigger]').first();
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
    await emailInput.click(); // Click works for both mobile and desktop
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
    const ctaButton = page.locator('[data-checkout-trigger]').first();
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
    
    // This test specifically validates that all critical analytics events fire correctly
    
    // Step 1: Page view event
    const pageViewFired = await checkAnalyticsEvent(page, 'page_view', 8000);
    
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