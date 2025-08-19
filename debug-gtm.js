/**
 * GTM Debug Script with Normalizer Testing for Café com Vendas
 * Enhanced debugging with normalization validation
 * 
 * Usage:
 * 1. Open your site in a browser
 * 2. Open DevTools Console (F12)
 * 3. Copy and paste this entire script
 * 4. Use the commands to test events and normalization
 */

// ============================================
// NORMALIZER FUNCTIONS (for testing)
// ============================================
window.gtmNormalizer = {
  normalizeString(value, maxLength = 50, fallback = 'other') {
    if (value == null || value === '') return fallback;
    
    let normalized = String(value)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_\- ]+/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, maxLength)
      .trim();
    
    return normalized || fallback;
  },
  
  normalizeId(id) {
    if (!id) return 'unknown_id';
    return String(id)
      .toLowerCase()
      .replace(/[^a-z0-9_\-]+/g, '_')
      .slice(0, 100);
  },
  
  normalizeSection(section) {
    const knownSections = [
      'hero', 'problem', 'solution', 'social_proof',
      'testimonials', 'offer', 'pricing_table', 'faq',
      'final_cta', 'footer', 'checkout_modal', 'floating_button'
    ];
    
    const normalized = this.normalizeString(section, 30, 'unknown');
    const found = knownSections.find(k => k === normalized || k.includes(normalized));
    return found || normalized;
  },
  
  normalizeAction(action) {
    const validActions = ['open', 'close', 'click', 'submit', 'view', 'play', 'pause', 'complete'];
    const normalized = this.normalizeString(action, 20, 'unknown');
    return validActions.includes(normalized) ? normalized : 'other';
  },
  
  normalizePricingTier(tier) {
    const validTiers = ['early_bird', 'regular', 'last_minute', 'vip', 'standard'];
    const normalized = this.normalizeString(tier, 30, 'standard');
    return validTiers.includes(normalized) ? normalized : 'standard';
  }
};

// ============================================
// SETUP: Enhanced dataLayer logging
// ============================================
(function setupGTMDebugger() {
  window.dataLayer = window.dataLayer || [];
  const originalPush = window.dataLayer.push;
  
  window.gtmDebug = {
    events: [],
    enabled: true,
    normalizeEnabled: true
  };
  
  window.dataLayer.push = function() {
    const result = originalPush.apply(window.dataLayer, arguments);
    
    if (window.gtmDebug.enabled) {
      const event = arguments[0];
      const timestamp = new Date().toISOString();
      
      // Check normalization
      const normalized = window.gtmDebug.normalizeEnabled ? 
        checkNormalization(event) : event;
      
      window.gtmDebug.events.push({
        timestamp,
        original: event,
        normalized,
        warnings: getNormalizationWarnings(event)
      });
      
      // Enhanced logging with normalization info
      console.log(
        '%c📊 GTM Event',
        'background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;',
        event.event || 'No event name'
      );
      
      // Show original vs normalized
      if (window.gtmDebug.normalizeEnabled) {
        console.log('%c  Original:', 'color: #888', event);
        console.log('%c  Normalized:', 'color: #4CAF50', normalized);
      } else {
        console.log(event);
      }
      
      // Show warnings
      const warnings = getNormalizationWarnings(event);
      if (warnings.length > 0) {
        console.warn('%c⚠️ Normalization Warnings:', 'color: #ff9800', warnings);
      }
    }
    
    return result;
  };
  
  function checkNormalization(event) {
    const normalized = {};
    for (const [key, value] of Object.entries(event)) {
      if (key === 'event' || key === 'timestamp' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'object') {
        normalized[key] = value;
      } else if (typeof value === 'string') {
        normalized[key] = window.gtmNormalizer.normalizeString(value);
      }
    }
    return normalized;
  }
  
  function getNormalizationWarnings(event) {
    const warnings = [];
    
    for (const [key, value] of Object.entries(event)) {
      if (typeof value === 'string') {
        // Check for non-normalized values
        if (value !== value.toLowerCase()) {
          warnings.push(`${key}: contains uppercase (${value})`);
        }
        if (value.length > 50 && key !== 'question' && key !== 'transaction_id') {
          warnings.push(`${key}: exceeds 50 chars (${value.length} chars)`);
        }
        if (/[^a-z0-9_\- ]/.test(value.toLowerCase())) {
          warnings.push(`${key}: contains special chars (${value})`);
        }
        if (/[\u0300-\u036f]/.test(value)) {
          warnings.push(`${key}: contains accents (${value})`);
        }
      }
    }
    
    return warnings;
  }
  
  console.log('%c✅ GTM Debugger with Normalizer Activated', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
})();

// ============================================
// NORMALIZATION TEST SUITE
// ============================================
window.gtmNormalizerTest = {
  runAll() {
    console.log('%c🧪 Running Normalization Tests...', 'color: #2196F3; font-size: 14px; font-weight: bold;');
    
    this.testStrings();
    this.testSections();
    this.testActions();
    this.testPricingTiers();
    this.testIds();
    
    console.log('%c✅ All tests complete!', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
  },
  
  testStrings() {
    console.log('\n📝 String Normalization:');
    const tests = [
      { input: 'Café com Vendas!', expected: 'cafe com vendas' },
      { input: 'São Paulo - Brasil', expected: 'sao paulo brasil' },
      { input: 'UPPERCASE_TEXT_123', expected: 'uppercase_text_123' },
      { input: '   spaces   everywhere   ', expected: 'spaces everywhere' },
      { input: 'Special@#$%Characters!', expected: 'specialcharacters' },
      { input: '', expected: 'other' },
      { input: null, expected: 'other' },
      { input: 'A'.repeat(100), expected: 'a'.repeat(50) }
    ];
    
    tests.forEach(test => {
      const result = window.gtmNormalizer.normalizeString(test.input);
      const pass = result === test.expected;
      console.log(
        `  ${pass ? '✅' : '❌'} "${test.input}" → "${result}"`,
        pass ? '' : `(expected: "${test.expected}")`
      );
    });
  },
  
  testSections() {
    console.log('\n📍 Section Normalization:');
    const tests = [
      { input: 'HERO', expected: 'hero' },
      { input: 'pricing_table', expected: 'pricing_table' },
      { input: 'Unknown Section', expected: 'unknown section' },
      { input: 'footer', expected: 'footer' },
      { input: '', expected: 'unknown' }
    ];
    
    tests.forEach(test => {
      const result = window.gtmNormalizer.normalizeSection(test.input);
      const pass = result === test.expected;
      console.log(
        `  ${pass ? '✅' : '❌'} "${test.input}" → "${result}"`,
        pass ? '' : `(expected: "${test.expected}")`
      );
    });
  },
  
  testActions() {
    console.log('\n🎯 Action Normalization:');
    const tests = [
      { input: 'OPEN', expected: 'open' },
      { input: 'close', expected: 'close' },
      { input: 'unknown_action', expected: 'other' },
      { input: 'click', expected: 'click' },
      { input: '', expected: 'other' }
    ];
    
    tests.forEach(test => {
      const result = window.gtmNormalizer.normalizeAction(test.input);
      const pass = result === test.expected;
      console.log(
        `  ${pass ? '✅' : '❌'} "${test.input}" → "${result}"`,
        pass ? '' : `(expected: "${test.expected}")`
      );
    });
  },
  
  testPricingTiers() {
    console.log('\n💰 Pricing Tier Normalization:');
    const tests = [
      { input: 'EARLY_BIRD', expected: 'early_bird' },
      { input: 'regular', expected: 'regular' },
      { input: 'unknown_tier', expected: 'standard' },
      { input: 'VIP', expected: 'vip' },
      { input: '', expected: 'standard' }
    ];
    
    tests.forEach(test => {
      const result = window.gtmNormalizer.normalizePricingTier(test.input);
      const pass = result === test.expected;
      console.log(
        `  ${pass ? '✅' : '❌'} "${test.input}" → "${result}"`,
        pass ? '' : `(expected: "${test.expected}")`
      );
    });
  },
  
  testIds() {
    console.log('\n🔑 ID Normalization:');
    const tests = [
      { input: 'TX_2025_000123', expected: 'tx_2025_000123' },
      { input: 'pi_1AbC2DeF3GhI', expected: 'pi_1abc2def3ghi' },
      { input: 'Special@ID#123', expected: 'special_id_123' },
      { input: '', expected: 'unknown_id' },
      { input: null, expected: 'unknown_id' }
    ];
    
    tests.forEach(test => {
      const result = window.gtmNormalizer.normalizeId(test.input);
      const pass = result === test.expected;
      console.log(
        `  ${pass ? '✅' : '❌'} "${test.input}" → "${result}"`,
        pass ? '' : `(expected: "${test.expected}")`
      );
    });
  }
};

// ============================================
// TEST EVENTS WITH NORMALIZATION
// ============================================
window.gtmTest = {
  // Test with non-normalized values to see normalization in action
  leadFormRaw() {
    dataLayer.push({
      event: 'lead_form_submitted',
      lead_id: 'TEST_LEAD_' + Date.now(), // Will be normalized to lowercase
      form_location: 'Checkout Modal!', // Will be normalized
      source_section: 'PRICING TABLE' // Will be normalized
    });
    console.log('✅ Fired: lead_form_submitted (raw values)');
  },
  
  checkoutRaw() {
    dataLayer.push({
      event: 'checkout_opened',
      value: 180, // Number - NOT normalized
      currency: 'EUR',
      pricing_tier: 'Early Bird Special!', // Will be normalized
      items: [{
        item_id: 'SKU_CCV_PT_2025',
        item_name: 'Café com Vendas – Portugal 2025', // In items array, not normalized directly
        price: 180,
        quantity: 1,
        item_category: 'Event'
      }]
    });
    console.log('✅ Fired: checkout_opened (raw values)');
  },
  
  faqRaw() {
    dataLayer.push({
      event: 'faq_toggle',
      action: 'OPEN', // Will be normalized to 'open'
      question: 'Como funciona o Café com Vendas? É necessário ter experiência prévia?' // Will be normalized
    });
    console.log('✅ Fired: faq_toggle (raw values)');
  },
  
  whatsappRaw() {
    dataLayer.push({
      event: 'whatsapp_click',
      link_url: 'https://wa.me/351912345678?text=Olá!', // Will be normalized
      link_text: 'Falar no WhatsApp Agora!', // Will be normalized
      location: 'FOOTER_SECTION' // Will be normalized
    });
    console.log('✅ Fired: whatsapp_click (raw values)');
  },
  
  // Test cardinality prevention
  cardinalityTest() {
    console.log('%c🔥 Testing Cardinality Prevention...', 'color: #ff5722; font-weight: bold;');
    
    // Fire 10 events with slightly different values
    for (let i = 0; i < 10; i++) {
      const variations = [
        'Café com Vendas',
        'CAFÉ COM VENDAS',
        'café com vendas!',
        'Cafe Com Vendas',
        '  Café  com  Vendas  ',
        'Café_com_Vendas',
        'CAFE-COM-VENDAS',
        'café@com#vendas',
        'Café com Vendas!!!',
        'CaFé CoM VeNdAs'
      ];
      
      dataLayer.push({
        event: 'cardinality_test',
        test_value: variations[i]
      });
    }
    
    // Check unique values
    const uniqueValues = new Set();
    window.gtmDebug.events
      .filter(e => e.original.event === 'cardinality_test')
      .forEach(e => uniqueValues.add(e.normalized.test_value));
    
    console.log(`📊 10 variations sent → ${uniqueValues.size} unique normalized values`);
    console.log('Unique values:', Array.from(uniqueValues));
    
    if (uniqueValues.size === 1) {
      console.log('%c✅ Cardinality prevention working!', 'color: #4CAF50; font-weight: bold;');
    } else {
      console.warn('%c⚠️ Multiple unique values detected!', 'color: #ff9800; font-weight: bold;');
    }
  }
};

// ============================================
// ANALYSIS TOOLS
// ============================================
window.gtmAnalyze = {
  // Check cardinality for all events
  checkCardinality() {
    console.log('%c📊 Cardinality Analysis', 'color: #2196F3; font-size: 14px; font-weight: bold;');
    
    const fields = {};
    
    window.gtmDebug.events.forEach(e => {
      Object.entries(e.normalized).forEach(([key, value]) => {
        if (typeof value === 'string') {
          if (!fields[key]) fields[key] = new Set();
          fields[key].add(value);
        }
      });
    });
    
    console.table(
      Object.entries(fields).map(([field, values]) => ({
        Field: field,
        'Unique Values': values.size,
        Values: Array.from(values).slice(0, 5).join(', ') + (values.size > 5 ? '...' : '')
      }))
    );
  },
  
  // Find non-normalized values
  findIssues() {
    console.log('%c🔍 Finding Non-Normalized Values', 'color: #ff5722; font-size: 14px; font-weight: bold;');
    
    const issues = [];
    
    window.gtmDebug.events.forEach((e, index) => {
      if (e.warnings && e.warnings.length > 0) {
        issues.push({
          index,
          event: e.original.event,
          warnings: e.warnings
        });
      }
    });
    
    if (issues.length === 0) {
      console.log('✅ No normalization issues found!');
    } else {
      console.table(issues);
    }
  },
  
  // Export normalized events
  exportNormalized() {
    const normalized = window.gtmDebug.events.map(e => e.normalized);
    const data = JSON.stringify(normalized, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm-normalized-${Date.now()}.json`;
    a.click();
    console.log('📥 Normalized events exported');
  }
};

// ============================================
// INSTRUCTIONS
// ============================================
console.log(`
╔══════════════════════════════════════════════════════╗
║      GTM DEBUG CONSOLE WITH NORMALIZER               ║
╠══════════════════════════════════════════════════════╣
║                                                       ║
║ 🧪 NORMALIZATION TESTS:                              ║
║   gtmNormalizerTest.runAll()  - Run all tests        ║
║   gtmNormalizerTest.testStrings() - Test strings     ║
║   gtmNormalizerTest.testSections() - Test sections   ║
║                                                       ║
║ 📝 TEST RAW EVENTS (see normalization):              ║
║   gtmTest.leadFormRaw()    - Raw lead form           ║
║   gtmTest.checkoutRaw()    - Raw checkout            ║
║   gtmTest.faqRaw()         - Raw FAQ                 ║
║   gtmTest.whatsappRaw()    - Raw WhatsApp            ║
║   gtmTest.cardinalityTest() - Test cardinality       ║
║                                                       ║
║ 📊 ANALYSIS TOOLS:                                   ║
║   gtmAnalyze.checkCardinality() - Field analysis     ║
║   gtmAnalyze.findIssues()    - Find problems         ║
║   gtmAnalyze.exportNormalized() - Export data        ║
║                                                       ║
║ 🔧 DEBUG CONTROLS:                                   ║
║   gtmDebug.showEvents()     - Show all events        ║
║   gtmDebug.clearEvents()    - Clear history          ║
║   gtmDebug.normalizeEnabled = false - Disable norm   ║
║                                                       ║
║ 💡 TIP: Run gtmNormalizerTest.runAll() first!       ║
╚══════════════════════════════════════════════════════╝
`);