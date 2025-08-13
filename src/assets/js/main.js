// TEST COMMENT: Copilot is verifying build output sync

/**
 * Performance optimization: Track LCP for hero image
 * Monitors Largest Contentful Paint to optimize hero section loading
 */
const lcpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
            // Track LCP for analytics if gtag is available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_lcp_timing', {
                    custom_parameter: entry.startTime,
                    event_category: 'Performance'
                });
            }
        }
    }
});
lcpObserver.observe({entryTypes: ['largest-contentful-paint']});

/**
 * Scroll depth tracking for hero section effectiveness
 * Monitors user engagement with page content
 */
let scrollDepth25 = false;
let scrollDepth50 = false;
let scrollDepth75 = false;

function trackScrollDepth() {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollPercent >= 25 && !scrollDepth25) {
        scrollDepth25 = true;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
                event_category: 'Engagement',
                event_label: '25%',
                value: 25
            });
        }
    }
    
    if (scrollPercent >= 50 && !scrollDepth50) {
        scrollDepth50 = true;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
                event_category: 'Engagement', 
                event_label: '50%',
                value: 50
            });
        }
    }
    
    if (scrollPercent >= 75 && !scrollDepth75) {
        scrollDepth75 = true;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
                event_category: 'Engagement',
                event_label: '75%',
                value: 75
            });
        }
    }
}

window.addEventListener('scroll', trackScrollDepth, { passive: true });

// (removed unused observeElements helper to keep JS lean)

// --- NEW DIAGNOSTIC CODE ---


function initializeAnimations() {
    // Animate WhatsApp Button (no console noise)
    const whatsappButton = document.querySelector('#whatsapp-button');
    if (whatsappButton) {
        setTimeout(() => {
            whatsappButton.classList.remove('opacity-0', 'translate-y-4');
            whatsappButton.classList.add('opacity-100', 'translate-y-0');
        }, 500);
    }
}

/**
 * Scroll to Next Section Function
 * Smoothly scrolls to the next section when hero scroll indicator is clicked
 */
function scrollToNext() {
  const explicitNext = document.querySelector('#inscricao');
  if (explicitNext) {
    explicitNext.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof gtag !== 'undefined') {
        gtag('event', 'scroll_indicator_click', {
            event_category: 'Navigation',
            event_label: 'Hero to Inscricao'
        });
    }
    return;
  }
  
  const heroSection = document.querySelector('.hero-section') || document.querySelector('#hero2-section');
  const nextSection = heroSection ? heroSection.nextElementSibling : null;
  if (nextSection) {
    nextSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }
  
  if (typeof gtag !== 'undefined') {
    gtag('event', 'scroll_indicator_click', {
        event_category: 'Navigation',
        event_label: 'Hero Scroll Indicator'
    });
  }
}


// Run animation initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Initialize scroll indicator button and hero animations
document.addEventListener('DOMContentLoaded', function() {
  const scrollIndicatorBtn = document.getElementById('scroll-indicator-btn');
  if (scrollIndicatorBtn) {
    scrollIndicatorBtn.addEventListener('click', scrollToNext);
  }
  
  // Initialize hero animations with intersection observer
  initHeroAnimations();
});

/**
 * Hero animations with intersection observer for performance
 * Implements staggered reveal animations for hero section elements
 */
function initHeroAnimations() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;
  
  const animatableElements = [
    heroSection.querySelector('.hero-accent'),
    heroSection.querySelector('h1'),
    heroSection.querySelector('p[class*="italic"]'),
    heroSection.querySelector('.hero-badge'),
    heroSection.querySelector('p[class*="font-century"]'),
    heroSection.querySelector('.hero-cta-primary'),
    heroSection.querySelector('a[class*="underline"]'),
    heroSection.querySelector('.hero-scroll-indicator')
  ].filter(Boolean);
  
  // Add initial hidden state with optimized classes
  animatableElements.forEach((element) => {
    element.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700', 'ease-out');
  });
  
  // Intersection observer for staggered reveal
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Staggered animation with elegant timing
        animatableElements.forEach((element, index) => {
          setTimeout(() => {
            element.classList.remove('opacity-0', 'translate-y-4');
            element.classList.add('opacity-100', 'translate-y-0');
          }, index * 150 + 300); // 150ms stagger delay + 300ms initial delay
        });
        
        heroObserver.disconnect();
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });
  
  heroObserver.observe(heroSection);
}

/**
 * Enhanced interaction feedback for hero elements
 * Adds hover effects, click feedback, and micro-interactions
 */
function initHeroInteractionFeedback() {
  const heroCtaButton = document.querySelector('.hero-cta-primary');
  const scrollIndicatorBtn = document.getElementById('scroll-indicator-btn');
  
  // Enhanced CTA button interactions
  if (heroCtaButton) {
    heroCtaButton.addEventListener('mouseenter', function() {
      this.classList.add('scale-105');
    });
    
    heroCtaButton.addEventListener('mouseleave', function() {
      this.classList.remove('scale-105');
    });
    
    heroCtaButton.addEventListener('click', function() {
      // Add press feedback with scale animation
      this.classList.add('scale-95');
      setTimeout(() => {
        this.classList.remove('scale-95');
        this.classList.add('scale-105');
        setTimeout(() => this.classList.remove('scale-105'), 100);
      }, 100);
    });
  }
  
  // Enhanced scroll indicator interactions
  if (scrollIndicatorBtn) {
    scrollIndicatorBtn.addEventListener('mouseenter', function() {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-bounce');
        svg.classList.add('animate-pulse');
      }
    });
    
    scrollIndicatorBtn.addEventListener('mouseleave', function() {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-pulse');
        svg.classList.add('animate-bounce');
      }
    });
    
    scrollIndicatorBtn.addEventListener('click', function() {
      // Add feedback animation
      this.classList.add('scale-110');
      setTimeout(() => this.classList.remove('scale-110'), 150);
    });
  }
}

/**
 * Enhanced keyboard navigation for hero elements
 * Ensures accessibility compliance with proper keyboard interaction handling
 */
function initHeroKeyboardNavigation() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;
  
  // Add keyboard navigation for scroll indicator
  const scrollIndicatorBtn = document.getElementById('scroll-indicator-btn');
  if (scrollIndicatorBtn) {
    scrollIndicatorBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToNext();
        // Add visual feedback for keyboard activation
        this.classList.add('scale-110');
        setTimeout(() => this.classList.remove('scale-110'), 150);
      }
    });
  }
  
  // Enhanced focus management for CTA button
  const heroCtaButton = document.querySelector('.hero-cta-primary');
  if (heroCtaButton) {
    heroCtaButton.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        // Add the same feedback as click
        this.classList.add('scale-95');
        setTimeout(() => {
          this.classList.remove('scale-95');
          this.classList.add('scale-105');
          setTimeout(() => this.classList.remove('scale-105'), 100);
        }, 100);
      }
    });
  }
}

// Initialize hero interaction feedback and keyboard navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initHeroInteractionFeedback();
  initHeroKeyboardNavigation();
});

// Keep --top-banner-h in sync with the actual banner height
function setTopBannerHeightVar() {
  const banner = document.getElementById('topBanner');
  if (!banner) return;
  const height = banner.offsetHeight || 56;
  document.documentElement.style.setProperty('--top-banner-h', height + 'px');
}

window.addEventListener('load', setTopBannerHeightVar);
window.addEventListener('resize', setTopBannerHeightVar);
setTimeout(setTopBannerHeightVar, 500);

// YouTube Click-to-Load Functionality
function initializeYouTubeEmbeds() {
    const youtubeEmbeds = document.querySelectorAll('.youtube-embed');
    
    youtubeEmbeds.forEach(embed => {
        const playButton = embed.querySelector('.youtube-play-btn');
        const videoId = embed.dataset.videoId;
        
        if (playButton && videoId) {
            playButton.addEventListener('click', function() {
                // Create iframe
                const iframe = document.createElement('iframe');
                iframe.className = 'absolute inset-0 w-full h-full';
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=1&iv_load_policy=3&playsinline=1`;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay';
                iframe.allowFullscreen = true;
                iframe.title = `Testemunho - Café com Vendas`;
                
                // Replace thumbnail with iframe
                embed.innerHTML = '';
                embed.appendChild(iframe);
                
                // Analytics tracking
                console.log(`Analytics: youtube_video_play_${videoId}`);
            }, { passive: true });
        }
    });
}

// Initialize YouTube embeds when DOM is ready
document.addEventListener('DOMContentLoaded', initializeYouTubeEmbeds);

// MBWay Toggle Function for Offer Section
function toggleMBWayInfo() {
  const mbwayInfo = document.getElementById('mbway-info');
  const isHidden = mbwayInfo.classList.contains('hidden');
  
  if (isHidden) {
    mbwayInfo.classList.remove('hidden');
  } else {
    mbwayInfo.classList.add('hidden');
  }
  
  // Analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_mbway_option', {
      'event_category': 'Payment',
      'event_label': 'MBWay Option Viewed',
      'value': isHidden ? 1 : 0
    });
  }
}

// Enhanced Scroll Animations for Offer Section
document.addEventListener('DOMContentLoaded', function() {
  // Optimized Observer for performance
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Simple fade-in for deliverable items
        if (entry.target.classList.contains('deliverable-item')) {
          entry.target.classList.remove('opacity-0', 'translate-y-2');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      }
    });
  }, observerOptions);
  
  // Initialize deliverable items
  const deliverableItems = document.querySelectorAll('.deliverable-item');
  deliverableItems.forEach((item) => {
    item.classList.add('translate-y-2', 'opacity-0', 'transition-all', 'duration-400', 'ease-out');
    observer.observe(item);
  });
});

// Premium FAQ Toggle Function with Elegant Animations
function toggleFAQ(faqId) {
  const faqNumber = faqId.split('-')[1];
  const answerElement = document.getElementById(`faq-answer-${faqNumber}`);
  const iconElement = document.getElementById(`faq-icon-${faqNumber}`);
  const buttonElement = answerElement.previousElementSibling;
  const cardElement = answerElement.closest('[data-faq-item]');
  
  // Check if currently open (using new class structure)
  const isCurrentlyOpen = !answerElement.classList.contains('max-h-0') && 
                          !answerElement.classList.contains('opacity-0');
  
  // Optional: Close other open FAQs for cleaner UX (accordion behavior)
  const allFAQs = document.querySelectorAll('[data-faq-item]');
  allFAQs.forEach(faq => {
    if (faq !== cardElement) {
      const otherAnswer = faq.querySelector('[id^="faq-answer-"]');
      const otherIcon = faq.querySelector('[id^="faq-icon-"]');
      const otherButton = otherAnswer.previousElementSibling;
      
      if (otherAnswer && !otherAnswer.classList.contains('max-h-0')) {
        // Close other FAQ
        otherAnswer.classList.add('max-h-0', 'opacity-0');
        otherAnswer.classList.remove('max-h-96', 'opacity-100');
        otherIcon.classList.remove('rotate-45');
        otherButton.setAttribute('aria-expanded', 'false');
      }
    }
  });
  
  if (!isCurrentlyOpen) {
    // Open this FAQ with elegant animation
    answerElement.classList.remove('max-h-0', 'opacity-0');
    answerElement.classList.add('max-h-96', 'opacity-100');
    buttonElement.setAttribute('aria-expanded', 'true');
    
    // Elegant icon rotation with spring-like animation
    iconElement.classList.add('rotate-45');
    
    // Add gentle card elevation
    cardElement.classList.add('scale-[1.02]');
    setTimeout(() => {
      cardElement.classList.remove('scale-[1.02]');
    }, 200);
    
  } else {
    // Close this FAQ
    answerElement.classList.remove('max-h-96', 'opacity-100');
    answerElement.classList.add('max-h-0', 'opacity-0');
    buttonElement.setAttribute('aria-expanded', 'false');
    
    // Rotate icon back with smooth animation
    iconElement.classList.remove('rotate-45');
  }
  
  // Enhanced analytics with interaction context
  const eventData = {
    faq_id: faqId,
    action: isCurrentlyOpen ? 'close' : 'open',
    faq_number: faqNumber,
    timestamp: Date.now()
  };
  
  console.log(`Analytics: toggle_faq_${eventData.action}_${faqNumber}`, eventData);
  
  // Optional: Track engagement time when closing
  if (isCurrentlyOpen && window.faqOpenTimes) {
    const openTime = window.faqOpenTimes[faqId];
    if (openTime) {
      const engagementTime = Date.now() - openTime;
      console.log(`Analytics: faq_engagement_time_${faqNumber}`, { 
        duration_ms: engagementTime,
        duration_seconds: Math.round(engagementTime / 1000)
      });
      delete window.faqOpenTimes[faqId];
    }
  } else if (!isCurrentlyOpen) {
    // Track when FAQ is opened
    if (!window.faqOpenTimes) window.faqOpenTimes = {};
    window.faqOpenTimes[faqId] = Date.now();
  }
}

// Premium FAQ Initialization with Staggered Reveal Animation
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('[data-faq-item]');
  
  // Create intersection observer for staggered animation
  const faqObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Staggered reveal with elegant timing
        setTimeout(() => {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }, index * 100); // 100ms delay between each item
        
        faqObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Initialize FAQ items with hidden state for animation
  faqItems.forEach((item) => {
    item.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-500', 'ease-out');
    faqObserver.observe(item);
  });
  
  // Add premium hover effects
  faqItems.forEach(item => {
    const button = item.querySelector('button');
    if (button) {
      button.addEventListener('mouseenter', () => {
        item.classList.add('transform', 'transition-transform', 'duration-300');
      });
    }
  });
});

// Premium Final CTA Animations with Sophisticated Interactions
document.addEventListener('DOMContentLoaded', function() {
  const finalCtaSection = document.querySelector('#final-cta');
  const finalCtaButton = document.querySelector('.final-cta-button');
  const floatingElements = document.querySelectorAll('#final-cta [class*="animate-pulse"]');
  
  if (!finalCtaSection || !finalCtaButton) return;
  
  // Staggered entrance animation for section elements
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const elements = [
          entry.target.querySelector('h2'),
          entry.target.querySelector('.space-y-6'),
          entry.target.querySelector('.final-cta-button').parentElement,
          entry.target.querySelector('.space-y-4')
        ].filter(Boolean);
        
        // Staggered reveal with elegant timing
        elements.forEach((element, index) => {
          if (element) {
            // Only add transition classes, don't hide elements that are already visible
            element.classList.add('transition-all', 'duration-700', 'ease-out');
            
            // Add a subtle scale animation instead of opacity flash
            setTimeout(() => {
              element.classList.add('transform', 'scale-105');
              setTimeout(() => {
                element.classList.remove('scale-105');
              }, 200);
            }, index * 200 + 300);
          }
        });
        
        // Animate floating elements with subtle scale pulse
        floatingElements.forEach((element, index) => {
          setTimeout(() => {
            element.classList.add('transform', 'scale-110');
            setTimeout(() => {
              element.classList.remove('scale-110');
            }, 400);
          }, index * 300 + 800);
        });
        
        ctaObserver.disconnect();
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -10% 0px'
  });
  
  ctaObserver.observe(finalCtaSection);
  
  // Enhanced button interactions with micro-animations
  finalCtaButton.addEventListener('mouseenter', function() {
    // Add breathing effect to button glow
    const glowElement = this.previousElementSibling;
    if (glowElement) {
      glowElement.classList.add('animate-pulse');
    }
    
    // Enhance floating elements animation on hover
    floatingElements.forEach(element => {
      element.classList.add('scale-110');
    });
  });
  
  finalCtaButton.addEventListener('mouseleave', function() {
    // Remove breathing effect
    const glowElement = this.previousElementSibling;
    if (glowElement) {
      glowElement.classList.remove('animate-pulse');
    }
    
    // Reset floating elements
    floatingElements.forEach(element => {
      element.classList.remove('scale-110');
    });
  });
  
  // Sophisticated click animation
  finalCtaButton.addEventListener('click', function(e) {
    // Create ripple effect at click position
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.className = 'absolute rounded-full bg-white/20 pointer-events-none animate-ping';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // Add momentary scale effect to entire section
    finalCtaSection.classList.add('scale-[1.01]', 'transition-transform', 'duration-200');
    setTimeout(() => {
      finalCtaSection.classList.remove('scale-[1.01]');
    }, 200);
  });
  
  // Add subtle parallax effect to background elements
  let ticking = false;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const sectionTop = finalCtaSection.offsetTop;
    const sectionHeight = finalCtaSection.offsetHeight;
    const windowHeight = window.innerHeight;
    
    // Check if section is in viewport
    if (scrolled + windowHeight > sectionTop && scrolled < sectionTop + sectionHeight) {
      const progress = (scrolled + windowHeight - sectionTop) / (sectionHeight + windowHeight);
      
      floatingElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1); // Different speeds for each element
        const yPos = -progress * 50 * speed;
        
        // Use discrete Tailwind transform classes instead of custom CSS properties
        let transformClass = '';
        if (yPos < -40) transformClass = '-translate-y-12';
        else if (yPos < -30) transformClass = '-translate-y-8';
        else if (yPos < -20) transformClass = '-translate-y-6';
        else if (yPos < -10) transformClass = '-translate-y-4';
        else if (yPos < -5) transformClass = '-translate-y-2';
        else if (yPos > 5) transformClass = 'translate-y-2';
        else if (yPos > 10) transformClass = 'translate-y-4';
        else transformClass = 'translate-y-0';
        
        // Remove previous transform classes
        element.classList.remove('-translate-y-12', '-translate-y-8', '-translate-y-6', '-translate-y-4', '-translate-y-2', 'translate-y-0', 'translate-y-2', 'translate-y-4');
        element.classList.add('transform', 'transition-transform', 'duration-75', 'ease-out', transformClass);
      });
    }
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Initialize floating elements with smooth transitions (don't hide them)
  floatingElements.forEach(element => {
    element.classList.add('transition-all', 'duration-1000', 'ease-out');
  });
});

// Premium Footer Interactions and Animations
document.addEventListener('DOMContentLoaded', function() {
  
  // Counter Animation for Social Proof Stats
  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-counter'));
      const increment = target / 60; // 60 frames for smooth animation
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        counter.textContent = Math.ceil(current);
        
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        }
      }, 16); // ~60fps
    });
  }
  
  // Floating Geometric Pattern Animations
  function initFloatingPatterns() {
    const patterns = document.querySelectorAll('#footer .absolute.opacity-5 > div');
    
    patterns.forEach((pattern, index) => {
      // Add unique floating animations with different timings
      const delays = ['0s', '1s', '2s', '3s'];
      const durations = ['8s', '10s', '12s', '15s'];
      
      pattern.classList.add('animate-pulse');
      pattern.style.animationDelay = delays[index % delays.length];
      pattern.style.animationDuration = durations[index % durations.length];
      
      // Add subtle mouse interaction
      pattern.addEventListener('mouseenter', () => {
        pattern.classList.add('scale-110', 'transition-transform', 'duration-500');
      });
      
      pattern.addEventListener('mouseleave', () => {
        pattern.classList.remove('scale-110');
      });
    });
  }
  
  // Premium Magnetic Hover Effect for Footer Links
  function initMagneticHover() {
    const magneticElements = document.querySelectorAll('#footer a, #footer .group');
    
    magneticElements.forEach(element => {
      element.addEventListener('mouseenter', function() {
        this.classList.add('magnetic-hover');
        
        // Add subtle glow effect
        const glowDiv = document.createElement('div');
        glowDiv.className = 'absolute inset-0 bg-gold-500/10 rounded-2xl blur-lg opacity-0 transition-opacity duration-500';
        this.style.position = 'relative';
        this.appendChild(glowDiv);
        
        setTimeout(() => {
          glowDiv.classList.remove('opacity-0');
          glowDiv.classList.add('opacity-100');
        }, 50);
      });
      
      element.addEventListener('mouseleave', function() {
        const glow = this.querySelector('.bg-gold-500\\/10');
        if (glow) {
          glow.classList.add('opacity-0');
          setTimeout(() => glow.remove(), 500);
        }
      });
    });
  }
  
  // Enhanced WhatsApp Button Interactions
  function enhanceWhatsAppButton() {
    const whatsappBtn = document.querySelector('#footer .whatsapp-pulse');
    
    if (whatsappBtn) {
      // Add particle effect on hover
      whatsappBtn.addEventListener('mouseenter', function() {
        createParticleEffect(this);
      });
      
      // Success feedback on click
      whatsappBtn.addEventListener('click', function(e) {
        // Create success ripple
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height) * 1.5;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.className = 'absolute rounded-full bg-green-400/30 pointer-events-none';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.animation = 'ping 0.6s cubic-bezier(0, 0, 0.2, 1)';
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
        
        console.log('Analytics: footer_whatsapp_click');
      });
    }
  }
  
  // Particle Effect Generator
  function createParticleEffect(element) {
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      element.style.position = 'relative';
      element.appendChild(particle);
      
      setTimeout(() => particle.remove(), 8000);
    }
  }
  
  // Scroll-based Gradient Animation
  function initScrollGradient() {
    const footer = document.querySelector('#footer');
    
    const scrollHandler = () => {
      const scrollPercent = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
      const hue = 220 + (scrollPercent * 40); // Navy to slightly warmer
      
      footer.style.background = `linear-gradient(135deg, hsl(${hue}, 45%, 12%) 0%, hsl(${hue + 10}, 35%, 15%) 100%)`;
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }
  
  // Footer Intersection Observer for Staggered Animations
  function initFooterReveal() {
    const footerSections = document.querySelectorAll('#footer [data-reveal]');
    
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            
            // Trigger counter animation for stats section
            if (entry.target.querySelector('[data-counter]')) {
              setTimeout(animateCounters, 200);
            }
          }, index * 200);
          
          footerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });
    
    footerSections.forEach(section => {
      section.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
      footerObserver.observe(section);
    });
  }
  
  // Enhanced Email Link Interaction
  function enhanceEmailLink() {
    const emailLink = document.querySelector('#footer a[href^="mailto:"]');
    
    if (emailLink) {
      emailLink.addEventListener('click', function() {
        // Add success feedback
        const originalText = this.innerHTML;
        this.innerHTML = '<span class="text-green-400">✓ Email copiado!</span>';
        
        // Copy to clipboard as backup
        navigator.clipboard.writeText('support@cafecomvendas.com').catch(() => {});
        
        setTimeout(() => {
          this.innerHTML = originalText;
        }, 2000);
        
        console.log('Analytics: footer_email_click');
      });
    }
  }
  
  // Initialize All Footer Enhancements
  setTimeout(() => {
    initFloatingPatterns();
    initMagneticHover();
    enhanceWhatsAppButton();
    initScrollGradient();
    initFooterReveal();
    enhanceEmailLink();
  }, 100);
  
  // Add premium focus states for accessibility
  const footerLinks = document.querySelectorAll('#footer a, #footer button');
  footerLinks.forEach(link => {
    link.classList.add('footer-link');
    
    link.addEventListener('focus', function() {
      this.classList.add('ring-2', 'ring-gold-400', 'ring-offset-2', 'ring-offset-navy-900');
    });
    
    link.addEventListener('blur', function() {
      this.classList.remove('ring-2', 'ring-gold-400', 'ring-offset-2', 'ring-offset-navy-900');
    });
  });
});

// Native Testimonials Carousel Implementation
function initTestimonialsCarousel() {
  try {
    const carouselContainer = document.querySelector('.testimonials-carousel-container');
    const carouselTrack = document.querySelector('[data-carousel-track]');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('[data-carousel-prev]');
    const nextButton = document.querySelector('[data-carousel-next]');
    const paginationContainer = document.querySelector('[data-carousel-pagination]');
    
    if (!carouselContainer || !carouselTrack || !slides.length) {
      console.warn('Testimonials carousel elements not found');
      return;
    }
    
    let currentIndex = 0;
    let slidesPerView = 1;
    let slideWidth = 0;
    
    // Calculate responsive slides per view
    function calculateSlidesPerView() {
      const containerWidth = carouselContainer.offsetWidth;
      if (containerWidth >= 1280) {
        slidesPerView = 3;
      } else if (containerWidth >= 1024) {
        slidesPerView = 2.5;
      } else if (containerWidth >= 768) {
        slidesPerView = 2;
      } else if (containerWidth >= 640) {
        slidesPerView = 1.5;
      } else {
        slidesPerView = 1;
      }
      
      slideWidth = containerWidth / slidesPerView;
    }
    
    // Create pagination dots
    function createPagination() {
      if (!paginationContainer) return;
      
      paginationContainer.innerHTML = '';
      const totalPages = Math.ceil(slides.length / Math.floor(slidesPerView));
      
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-2 h-2 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
        dot.setAttribute('aria-label', `Ir para página ${i + 1} dos testemunhos`);
        dot.addEventListener('click', () => goToSlide(i * Math.floor(slidesPerView)));
        paginationContainer.appendChild(dot);
      }
      updatePagination();
    }
    
    // Update pagination active state
    function updatePagination() {
      if (!paginationContainer) return;
      
      const dots = paginationContainer.querySelectorAll('button');
      const activePage = Math.floor(currentIndex / Math.floor(slidesPerView));
      
      dots.forEach((dot, index) => {
        if (index === activePage) {
          dot.classList.remove('bg-navy-800/20');
          dot.classList.add('bg-navy-800', 'w-6');
        } else {
          dot.classList.remove('bg-navy-800', 'w-6');
          dot.classList.add('bg-navy-800/20');
        }
      });
    }
    
    // Update carousel position
    function updateCarousel() {
      const translateX = -currentIndex * (slideWidth + 24); // 24px is gap-6
      carouselTrack.style.transform = `translateX(${translateX}px)`;
      updatePagination();
      updateNavigationButtons();
    }
    
    // Update navigation button states
    function updateNavigationButtons() {
      if (!prevButton || !nextButton) return;
      
      const maxIndex = slides.length - Math.floor(slidesPerView);
      
      if (currentIndex <= 0) {
        prevButton.classList.add('opacity-50', 'cursor-not-allowed');
        prevButton.disabled = true;
      } else {
        prevButton.classList.remove('opacity-50', 'cursor-not-allowed');
        prevButton.disabled = false;
      }
      
      if (currentIndex >= maxIndex) {
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        nextButton.disabled = true;
      } else {
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        nextButton.disabled = false;
      }
    }
    
    // Go to specific slide
    function goToSlide(index) {
      const maxIndex = slides.length - Math.floor(slidesPerView);
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
      
      // Analytics tracking
      console.log('Analytics: testimonial_slide_change', { slideIndex: currentIndex });
      if (typeof gtag !== 'undefined') {
        gtag('event', 'view_testimonial_slide', {
          slide_index: currentIndex + 1,
          total_slides: slides.length
        });
      }
    }
    
    // Next slide
    function nextSlide() {
      goToSlide(currentIndex + 1);
    }
    
    // Previous slide
    function prevSlide() {
      goToSlide(currentIndex - 1);
    }
    
    // Initialize carousel
    function initCarousel() {
      calculateSlidesPerView();
      
      // Set slide widths
      slides.forEach(slide => {
        slide.style.minWidth = `${slideWidth}px`;
      });
      
      createPagination();
      updateCarousel();
    }
    
    // Event listeners
    if (prevButton) {
      prevButton.addEventListener('click', prevSlide);
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', nextSlide);
    }
    
    // Touch/swipe support
    let startX = 0;
    let isDragging = false;
    
    carouselTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    carouselTrack.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    }, { passive: false });
    
    carouselTrack.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      
      isDragging = false;
    }, { passive: true });
    
    // Resize handler with passive flag
    function handleResize() {
      calculateSlidesPerView();
      slides.forEach(slide => {
        slide.style.minWidth = `${slideWidth}px`;
      });
      createPagination();
      
      // Adjust current index if needed
      const maxIndex = slides.length - Math.floor(slidesPerView);
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      
      updateCarousel();
    }
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initialize
    initCarousel();
    
    // Track section view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Analytics: view_testimonials_section');
          if (typeof gtag !== 'undefined') {
            gtag('event', 'view_testimonials_section');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    const socialProofSection = document.getElementById('social-proof');
    if (socialProofSection) {
      observer.observe(socialProofSection);
    }
    
  } catch (error) {
    console.error('Error initializing testimonials carousel:', error);
  }
}

// Enhanced video card hover effects with Tailwind classes
function initVideoCardEffects() {
  try {
    const videoCards = document.querySelectorAll('[data-video-card]');
    
    videoCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.classList.add('-translate-y-1');
      }, { passive: true });
      
      card.addEventListener('mouseleave', function() {
        this.classList.remove('-translate-y-1');
      }, { passive: true });
    });
    
  } catch (error) {
    console.error('Error initializing video card effects:', error);
  }
}

// Initialize testimonials functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initTestimonialsCarousel();
  initVideoCardEffects();
});