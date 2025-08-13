/**
 * Café com Vendas Landing Page - Enhanced JavaScript
 * Premium landing page interactions and animations with pure Tailwind CSS
 * 
 * Architecture:
 * - IIFE pattern to avoid global scope pollution
 * - Modular organization by concern
 * - Pure Tailwind class manipulation (no direct style manipulation)
 * - Comprehensive error handling and analytics
 */
(function() {
    'use strict';
    
    // Configuration Constants
    const CONFIG = {
        animations: {
            duration: {
                fast: 150,
                normal: 300,
                slow: 700,
                verySlow: 1000
            },
            easing: 'ease-out',
            stagger: 150
        },
        breakpoints: {
            mobile: 640,
            tablet: 768,
            desktop: 1024,
            xl: 1280
        },
        scroll: {
            throttle: 16, // ~60fps
            thresholds: [25, 50, 75]
        },
        analytics: {
            events: {
                HERO_LCP: 'hero_lcp_timing',
                SCROLL_DEPTH: 'scroll_depth',
                FAQ_TOGGLE: 'faq_toggle',
                TESTIMONIAL_VIEW: 'view_testimonial_slide',
                WHATSAPP_CLICK: 'whatsapp_click',
                SCROLL_INDICATOR: 'scroll_indicator_click'
            }
        }
    };

    // Shared State Management
    const state = {
        scrollDepth: {
            25: false,
            50: false,
            75: false
        },
        faqOpenTimes: {},
        isInitialized: false
    };
    
    // Utilities Module
    const Utils = {
        /**
         * Throttle function for performance optimization
         */
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        /**
         * Debounce function for user input
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        /**
         * Safe element query with error handling
         */
        safeQuery(selector, context = document) {
            try {
                return context.querySelector(selector);
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return null;
            }
        },
        
        /**
         * Safe element query all with error handling
         */
        safeQueryAll(selector, context = document) {
            try {
                return context.querySelectorAll(selector);
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return [];
            }
        },
        
        /**
         * Calculate responsive slides per view for carousel
         */
        calculateSlidesPerView(containerWidth) {
            if (containerWidth >= CONFIG.breakpoints.xl) return 3;
            if (containerWidth >= CONFIG.breakpoints.desktop) return 2.5;
            if (containerWidth >= CONFIG.breakpoints.tablet) return 2;
            if (containerWidth >= CONFIG.breakpoints.mobile) return 1.5;
            return 1;
        },
        
        /**
         * Generate unique ID for tracking
         */
        generateId() {
            return 'id_' + Math.random().toString(36).substr(2, 9);
        }
    };
    
    // Animation Utilities
    const Animations = {
        /**
         * Add reveal animation classes to elements
         */
        prepareRevealElements(elements, config = {}) {
            const {
                hiddenClasses = ['opacity-0', 'translate-y-4'],
                transitionClasses = ['transition-all', 'duration-700', 'ease-out']
            } = config;
            
            elements.forEach(element => {
                if (element) {
                    element.classList.add(...hiddenClasses, ...transitionClasses);
                }
            });
        },
        
        /**
         * Reveal elements with staggered animation
         */
        revealElements(elements, config = {}) {
            const {
                visibleClasses = ['opacity-100', 'translate-y-0'],
                hiddenClasses = ['opacity-0', 'translate-y-4'],
                staggerDelay = CONFIG.animations.stagger,
                initialDelay = 0
            } = config;
            
            elements.forEach((element, index) => {
                if (element) {
                    setTimeout(() => {
                        element.classList.remove(...hiddenClasses);
                        element.classList.add(...visibleClasses);
                    }, initialDelay + (index * staggerDelay));
                }
            });
        },
        
        /**
         * Create intersection observer for animations
         */
        createObserver(options = {}) {
            const defaultOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            return new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && options.callback) {
                        options.callback(entry);
                        if (options.once) {
                            options.observer?.unobserve(entry.target);
                        }
                    }
                });
            }, { ...defaultOptions, ...options });
        },
        
        /**
         * Add scale animation on click
         */
        addClickFeedback(element, scaleClass = 'scale-95', duration = 100) {
            if (!element) return;
            
            element.addEventListener('click', function() {
                this.classList.add(scaleClass);
                setTimeout(() => {
                    this.classList.remove(scaleClass);
                }, duration);
            });
        }
    };

    // Analytics Module
    const Analytics = {
        /**
         * Track event with Google Analytics if available
         */
        track(eventName, parameters = {}) {
            // Console logging for debugging
            console.log(`Analytics: ${eventName}`, parameters);
            
            // Google Analytics integration
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
        },
        
        /**
         * Initialize performance tracking
         */
        initPerformanceTracking() {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            this.track(CONFIG.analytics.events.HERO_LCP, {
                                custom_parameter: entry.startTime,
                                event_category: 'Performance'
                            });
                        }
                    }
                });
                lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
            } catch (error) {
                console.warn('Performance tracking not available:', error);
            }
        },
        
        /**
         * Initialize scroll depth tracking
         */
        initScrollDepthTracking() {
            const trackScrollDepth = Utils.throttle(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                
                CONFIG.scroll.thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !state.scrollDepth[threshold]) {
                        state.scrollDepth[threshold] = true;
                        this.track(CONFIG.analytics.events.SCROLL_DEPTH, {
                            event_category: 'Engagement',
                            event_label: `${threshold}%`,
                            value: threshold
                        });
                    }
                });
            }, CONFIG.scroll.throttle);
            
            window.addEventListener('scroll', trackScrollDepth, { passive: true });
        },
        
        /**
         * Track FAQ engagement time
         */
        trackFAQEngagement(faqId, isOpening) {
            if (isOpening) {
                state.faqOpenTimes[faqId] = Date.now();
            } else {
                const openTime = state.faqOpenTimes[faqId];
                if (openTime) {
                    const engagementTime = Date.now() - openTime;
                    const engagementSeconds = Math.round(engagementTime / 1000);
                    
                    if (engagementSeconds > 3) {
                        this.track('faq_meaningful_engagement', {
                            event_category: 'FAQ',
                            event_label: faqId,
                            value: engagementSeconds
                        });
                    }
                    
                    delete state.faqOpenTimes[faqId];
                }
            }
        }
    };

    // Navigation Utilities
    const Navigation = {
        /**
         * Smooth scroll to next section
         */
        scrollToNext() {
            try {
                const explicitNext = Utils.safeQuery('#inscricao');
                if (explicitNext) {
                    explicitNext.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    Analytics.track(CONFIG.analytics.events.SCROLL_INDICATOR, {
                        event_category: 'Navigation',
                        event_label: 'Hero to Inscricao'
                    });
                    return;
                }
                
                const heroSection = Utils.safeQuery('.hero-section') || Utils.safeQuery('#hero2-section');
                const nextSection = heroSection?.nextElementSibling;
                
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }
                
                Analytics.track(CONFIG.analytics.events.SCROLL_INDICATOR, {
                    event_category: 'Navigation',
                    event_label: 'Hero Scroll Indicator'
                });
            } catch (error) {
                console.error('Error in scrollToNext:', error);
            }
        }
    };

    // Component Modules
    const Components = {
        // Hero Component
        Hero: {
            init() {
                try {
                    this.initAnimations();
                    this.initInteractions();
                    this.initScrollIndicator();
                    this.initWhatsAppButton();
                } catch (error) {
                    console.error('Error initializing Hero component:', error);
                }
            },
            
            initAnimations() {
                const heroSection = Utils.safeQuery('#hero');
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
                
                Animations.prepareRevealElements(animatableElements);
                
                const observer = Animations.createObserver({
                    callback: () => {
                        Animations.revealElements(animatableElements, {
                            initialDelay: 300
                        });
                    },
                    once: true,
                    rootMargin: '0px 0px -10% 0px'
                });
                
                observer.observe(heroSection);
            },
            
            initScrollIndicator() {
                const scrollIndicatorBtn = Utils.safeQuery('#scroll-indicator-btn');
                if (!scrollIndicatorBtn) return;
                
                scrollIndicatorBtn.addEventListener('click', Navigation.scrollToNext);
                
                // Enhanced interactions
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
                
                // Keyboard navigation
                scrollIndicatorBtn.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        Navigation.scrollToNext();
                        this.classList.add('scale-110');
                        setTimeout(() => this.classList.remove('scale-110'), CONFIG.animations.duration.fast);
                    }
                });
            },
            
            initInteractions() {
                const heroCtaButton = Utils.safeQuery('.hero-cta-primary');
                if (!heroCtaButton) return;
                
                // Hover effects
                heroCtaButton.addEventListener('mouseenter', function() {
                    this.classList.add('scale-105');
                });
                
                heroCtaButton.addEventListener('mouseleave', function() {
                    this.classList.remove('scale-105');
                });
                
                // Click feedback
                Animations.addClickFeedback(heroCtaButton);
                
                // Keyboard feedback
                heroCtaButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        Animations.addClickFeedback(this);
                    }
                });
            },
            
            initWhatsAppButton() {
                const whatsappButton = Utils.safeQuery('#whatsapp-button');
                if (!whatsappButton) return;
                
                setTimeout(() => {
                    whatsappButton.classList.remove('opacity-0', 'translate-y-4');
                    whatsappButton.classList.add('opacity-100', 'translate-y-0');
                }, 500);
            }
        },

        // Banner Component
        Banner: {
            init() {
                try {
                    this.setupHeightVariable();
                } catch (error) {
                    console.error('Error initializing Banner component:', error);
                }
            },
            
            setupHeightVariable() {
                const setTopBannerHeightVar = () => {
                    const banner = Utils.safeQuery('#topBanner');
                    if (!banner) return;
                    
                    const height = banner.offsetHeight || 56;
                    document.documentElement.style.setProperty('--top-banner-h', height + 'px');
                };
                
                window.addEventListener('load', setTopBannerHeightVar);
                window.addEventListener('resize', setTopBannerHeightVar);
                setTimeout(setTopBannerHeightVar, 500);
            }
        },

        // YouTube Component
        YouTube: {
            init() {
                try {
                    this.initializeEmbeds();
                } catch (error) {
                    console.error('Error initializing YouTube component:', error);
                }
            },
            
            initializeEmbeds() {
                const youtubeEmbeds = Utils.safeQueryAll('.youtube-embed');
                
                youtubeEmbeds.forEach(embed => {
                    const playButton = embed.querySelector('.youtube-play-btn');
                    const videoId = embed.dataset.videoId;
                    
                    if (playButton && videoId) {
                        playButton.addEventListener('click', () => {
                            this.loadVideo(embed, videoId);
                        }, { passive: true });
                    }
                });
            },
            
            loadVideo(embed, videoId) {
                const iframe = document.createElement('iframe');
                iframe.className = 'absolute inset-0 w-full h-full';
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=1&iv_load_policy=3&playsinline=1`;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay';
                iframe.allowFullscreen = true;
                iframe.title = 'Testemunho - Café com Vendas';
                
                embed.innerHTML = '';
                embed.appendChild(iframe);
                
                Analytics.track(`youtube_video_play_${videoId}`);
            }
        },

        // Offer Component
        Offer: {
            init() {
                try {
                    this.initMBWayToggle();
                    this.initDeliverableAnimations();
                } catch (error) {
                    console.error('Error initializing Offer component:', error);
                }
            },
            
            initMBWayToggle() {
                // Make toggleMBWayInfo available globally for onclick handlers
                window.toggleMBWayInfo = this.toggleMBWayInfo.bind(this);
            },
            
            toggleMBWayInfo() {
                const mbwayInfo = Utils.safeQuery('#mbway-info');
                const button = Utils.safeQuery('#mbway-button');
                
                if (!mbwayInfo || !button) return;
                
                const chevron = button.querySelector('svg:last-child');
                const isHidden = mbwayInfo.classList.contains('hidden');
                
                if (isHidden) {
                    mbwayInfo.classList.remove('hidden', 'max-h-0', 'opacity-0');
                    mbwayInfo.classList.add('max-h-48', 'opacity-100');
                    button.setAttribute('aria-expanded', 'true');
                    chevron?.classList.add('rotate-180');
                    
                    setTimeout(() => {
                        const firstFocusable = mbwayInfo.querySelector('p');
                        firstFocusable?.focus();
                    }, CONFIG.animations.duration.normal);
                } else {
                    mbwayInfo.classList.remove('max-h-48', 'opacity-100');
                    mbwayInfo.classList.add('max-h-0', 'opacity-0');
                    button.setAttribute('aria-expanded', 'false');
                    chevron?.classList.remove('rotate-180');
                    
                    setTimeout(() => {
                        mbwayInfo.classList.add('hidden');
                    }, CONFIG.animations.duration.normal);
                }
                
                Analytics.track('view_mbway_option', {
                    event_category: 'Payment',
                    event_label: 'MBWay Option Viewed',
                    value: isHidden ? 1 : 0
                });
            },
            
            initDeliverableAnimations() {
                const deliverableItems = Utils.safeQueryAll('.deliverable-item');
                if (!deliverableItems.length) return;
                
                Animations.prepareRevealElements(deliverableItems, {
                    hiddenClasses: ['opacity-0', 'translate-y-2'],
                    transitionClasses: ['transition-all', 'duration-400', 'ease-out']
                });
                
                const observer = Animations.createObserver({
                    callback: (entry) => {
                        if (entry.target.classList.contains('deliverable-item')) {
                            entry.target.classList.remove('opacity-0', 'translate-y-2');
                            entry.target.classList.add('opacity-100', 'translate-y-0');
                        }
                    },
                    threshold: 0.15,
                    rootMargin: '0px 0px -30px 0px'
                });
                
                deliverableItems.forEach(item => observer.observe(item));
            }
        },

        // FAQ Component
        FAQ: {
            init() {
                try {
                    this.initializePremiumFAQSystem();
                } catch (error) {
                    console.error('Error initializing FAQ component:', error);
                }
            },
            
            initializePremiumFAQSystem() {
                const faqContainer = Utils.safeQuery('[data-faq-container]');
                const faqItems = Utils.safeQueryAll('[data-faq-item]');
                
                if (!faqContainer || !faqItems.length) {
                    console.warn('FAQ elements not found - FAQ functionality disabled');
                    return;
                }
                
                // Make toggleFAQ available globally for onclick handlers
                window.toggleFAQ = this.toggleFAQ.bind(this);
                
                // Event delegation
                faqContainer.addEventListener('click', this.handleFAQClick.bind(this), { passive: false });
                faqContainer.addEventListener('keydown', this.handleFAQKeydown.bind(this), { passive: false });
                
                // Initialize animations and interactions
                this.initializeFAQRevealAnimation(faqItems);
                this.initializeFAQHoverEffects(faqItems);
                this.initializeFAQKeyboardNavigation(faqContainer);
            },
            
            toggleFAQ(faqId) {
                // Debounce rapid clicks
                if (this.isAnimating) return;
                this.isAnimating = true;
                setTimeout(() => { this.isAnimating = false; }, CONFIG.animations.duration.normal);
                
                try {
                    const faqNumber = faqId.split('-')[1];
                    const answerElement = Utils.safeQuery(`#faq-answer-${faqNumber}`);
                    const iconElement = Utils.safeQuery(`#faq-icon-${faqNumber}`);
                    const cardElement = answerElement?.closest('[data-faq-item]');
                    const buttonElement = cardElement?.querySelector('[data-faq-toggle]');
                    
                    if (!answerElement || !iconElement || !buttonElement || !cardElement) {
                        console.error(`FAQ elements not found for ID: ${faqId}`);
                        return;
                    }
                    
                    const isCurrentlyOpen = !answerElement.classList.contains('max-h-0');
                    
                    // Close other FAQs (accordion behavior)
                    this.closeOtherFAQs(cardElement);
                    
                    if (!isCurrentlyOpen) {
                        this.openFAQ(answerElement, iconElement, buttonElement, cardElement);
                        Analytics.trackFAQEngagement(faqId, true);
                    } else {
                        this.closeFAQ(answerElement, iconElement, buttonElement);
                        Analytics.trackFAQEngagement(faqId, false);
                    }
                    
                    Analytics.track('faq_toggle', {
                        event_category: 'FAQ',
                        event_label: faqId,
                        action: isCurrentlyOpen ? 'close' : 'open'
                    });
                    
                } catch (error) {
                    console.error('Error in toggleFAQ function:', error);
                }
            },
            
            closeOtherFAQs(currentCard) {
                const allFAQContainers = Utils.safeQueryAll('[data-faq-item]');
                allFAQContainers.forEach(faqContainer => {
                    if (faqContainer !== currentCard) {
                        const otherAnswer = faqContainer.querySelector('[id^="faq-answer-"]');
                        const otherIcon = faqContainer.querySelector('[id^="faq-icon-"]');
                        const otherButton = faqContainer.querySelector('[data-faq-toggle]');
                        
                        if (otherAnswer && !otherAnswer.classList.contains('max-h-0')) {
                            otherAnswer.classList.add('max-h-0', 'opacity-0');
                            otherAnswer.classList.remove('max-h-96', 'opacity-100');
                            otherIcon?.classList.remove('rotate-45');
                            otherButton?.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            },
            
            openFAQ(answerElement, iconElement, buttonElement, cardElement) {
                answerElement.classList.remove('max-h-0', 'opacity-0');
                answerElement.classList.add('max-h-96', 'opacity-100');
                buttonElement.setAttribute('aria-expanded', 'true');
                iconElement.classList.add('rotate-45');
                
                // Premium micro-interaction
                cardElement.classList.add('scale-[1.02]');
                setTimeout(() => {
                    cardElement.classList.remove('scale-[1.02]');
                }, 200);
                
                // Focus management
                setTimeout(() => {
                    const firstFocusableElement = answerElement.querySelector('a, button, [tabindex]');
                    firstFocusableElement?.focus({ preventScroll: true });
                }, CONFIG.animations.duration.normal);
            },
            
            closeFAQ(answerElement, iconElement, buttonElement) {
                answerElement.classList.remove('max-h-96', 'opacity-100');
                answerElement.classList.add('max-h-0', 'opacity-0');
                buttonElement.setAttribute('aria-expanded', 'false');
                iconElement.classList.remove('rotate-45');
                buttonElement.focus({ preventScroll: true });
            },
            
            handleFAQClick(event) {
                const faqToggleButton = event.target.closest('[data-faq-toggle]');
                if (!faqToggleButton) return;
                
                event.preventDefault();
                const faqId = faqToggleButton.getAttribute('data-faq-toggle');
                if (faqId) this.toggleFAQ(faqId);
            },
            
            handleFAQKeydown(event) {
                const faqToggleButton = event.target.closest('[data-faq-toggle]');
                if (!faqToggleButton) return;
                
                const faqId = faqToggleButton.getAttribute('data-faq-toggle');
                
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                    case 'Spacebar':
                        event.preventDefault();
                        if (faqId) this.toggleFAQ(faqId);
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.focusNextFAQButton(faqToggleButton);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        this.focusPreviousFAQButton(faqToggleButton);
                        break;
                    case 'Home':
                        event.preventDefault();
                        this.focusFirstFAQButton();
                        break;
                    case 'End':
                        event.preventDefault();
                        this.focusLastFAQButton();
                        break;
                }
            },
            
            initializeFAQRevealAnimation(faqItems) {
                Animations.prepareRevealElements(faqItems, {
                    transitionClasses: ['transition-all', 'duration-500', 'ease-out']
                });
                
                const observer = Animations.createObserver({
                    callback: (entry, index) => {
                        setTimeout(() => {
                            entry.target.classList.add('opacity-100', 'translate-y-0');
                            entry.target.classList.remove('opacity-0', 'translate-y-4');
                        }, index * 100);
                    },
                    once: true,
                    rootMargin: '0px 0px -50px 0px'
                });
                
                faqItems.forEach(item => observer.observe(item));
            },
            
            initializeFAQHoverEffects(faqItems) {
                faqItems.forEach(item => {
                    const button = item.querySelector('[data-faq-toggle]');
                    if (!button) return;
                    
                    button.addEventListener('focus', () => {
                        item.classList.add('ring-2', 'ring-burgundy-400', 'ring-opacity-50');
                    }, { passive: true });
                    
                    button.addEventListener('blur', () => {
                        item.classList.remove('ring-2', 'ring-burgundy-400', 'ring-opacity-50');
                    }, { passive: true });
                });
            },
            
            initializeFAQKeyboardNavigation(faqContainer) {
                const firstFAQButton = faqContainer.querySelector('[data-faq-toggle]');
                firstFAQButton?.setAttribute('tabindex', '0');
                
                const allFAQButtons = faqContainer.querySelectorAll('[data-faq-toggle]');
                allFAQButtons.forEach((button, index) => {
                    if (index > 0) button.setAttribute('tabindex', '-1');
                });
            },
            
            focusNextFAQButton(currentButton) {
                const allButtons = [...Utils.safeQueryAll('[data-faq-toggle]')];
                const currentIndex = allButtons.indexOf(currentButton);
                const nextButton = allButtons[currentIndex + 1] || allButtons[0];
                this.updateFAQTabIndex(currentButton, nextButton);
                nextButton.focus();
            },
            
            focusPreviousFAQButton(currentButton) {
                const allButtons = [...Utils.safeQueryAll('[data-faq-toggle]')];
                const currentIndex = allButtons.indexOf(currentButton);
                const prevButton = allButtons[currentIndex - 1] || allButtons[allButtons.length - 1];
                this.updateFAQTabIndex(currentButton, prevButton);
                prevButton.focus();
            },
            
            focusFirstFAQButton() {
                const firstButton = Utils.safeQuery('[data-faq-toggle]');
                const currentFocused = Utils.safeQuery('[data-faq-toggle][tabindex="0"]');
                if (currentFocused && firstButton) {
                    this.updateFAQTabIndex(currentFocused, firstButton);
                    firstButton.focus();
                }
            },
            
            focusLastFAQButton() {
                const allButtons = [...Utils.safeQueryAll('[data-faq-toggle]')];
                const lastButton = allButtons[allButtons.length - 1];
                const currentFocused = Utils.safeQuery('[data-faq-toggle][tabindex="0"]');
                if (currentFocused && lastButton) {
                    this.updateFAQTabIndex(currentFocused, lastButton);
                    lastButton.focus();
                }
            },
            
            updateFAQTabIndex(previousButton, nextButton) {
                previousButton?.setAttribute('tabindex', '-1');
                nextButton?.setAttribute('tabindex', '0');
            }
        },

        // Final CTA Component with premium interactions
        FinalCTA: {
            init() {
                try {
                    this.initAnimations();
                    this.initInteractions();
                    this.initParallax();
                } catch (error) {
                    console.error('Error initializing FinalCTA component:', error);
                }
            },
            
            initAnimations() {
                const finalCtaSection = Utils.safeQuery('#final-cta');
                const finalCtaButton = Utils.safeQuery('.final-cta-button');
                
                if (!finalCtaSection || !finalCtaButton) return;
                
                const observer = Animations.createObserver({
                    callback: (entry) => {
                        const elements = [
                            entry.target.querySelector('h2'),
                            entry.target.querySelector('.space-y-6'),
                            entry.target.querySelector('.final-cta-button')?.parentElement,
                            entry.target.querySelector('.space-y-4')
                        ].filter(Boolean);
                        
                        elements.forEach((element, index) => {
                            if (element) {
                                element.classList.add('transition-all', 'duration-700', 'ease-out');
                                setTimeout(() => {
                                    element.classList.add('transform', 'scale-105');
                                    setTimeout(() => element.classList.remove('scale-105'), 200);
                                }, index * 200 + 300);
                            }
                        });
                        
                        this.animateFloatingElements();
                    },
                    once: true,
                    threshold: 0.3,
                    rootMargin: '0px 0px -10% 0px'
                });
                
                observer.observe(finalCtaSection);
            },
            
            animateFloatingElements() {
                const floatingElements = Utils.safeQueryAll('#final-cta [class*="animate-pulse"]');
                floatingElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.classList.add('transform', 'scale-110');
                        setTimeout(() => element.classList.remove('scale-110'), 400);
                    }, index * 300 + 800);
                });
            },
            
            initInteractions() {
                const finalCtaButton = Utils.safeQuery('.final-cta-button');
                const floatingElements = Utils.safeQueryAll('#final-cta [class*="animate-pulse"]');
                
                if (!finalCtaButton) return;
                
                finalCtaButton.addEventListener('mouseenter', function() {
                    const glowElement = this.previousElementSibling;
                    glowElement?.classList.add('animate-pulse');
                    
                    floatingElements.forEach(element => {
                        element.classList.add('scale-110');
                    });
                });
                
                finalCtaButton.addEventListener('mouseleave', function() {
                    const glowElement = this.previousElementSibling;
                    glowElement?.classList.remove('animate-pulse');
                    
                    floatingElements.forEach(element => {
                        element.classList.remove('scale-110');
                    });
                });
                
                finalCtaButton.addEventListener('click', this.createRippleEffect.bind(this));
            },
            
            createRippleEffect(e) {
                const rect = e.currentTarget.getBoundingClientRect();
                const ripple = document.createElement('div');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.className = 'absolute rounded-full bg-white/20 pointer-events-none animate-ping';
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                e.currentTarget.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
                
                const finalCtaSection = Utils.safeQuery('#final-cta');
                if (finalCtaSection) {
                    finalCtaSection.classList.add('scale-[1.01]', 'transition-transform', 'duration-200');
                    setTimeout(() => finalCtaSection.classList.remove('scale-[1.01]'), 200);
                }
            },
            
            initParallax() {
                const finalCtaSection = Utils.safeQuery('#final-cta');
                const floatingElements = Utils.safeQueryAll('#final-cta [class*="animate-pulse"]');
                
                if (!finalCtaSection || !floatingElements.length) return;
                
                let ticking = false;
                
                const updateParallax = () => {
                    const scrolled = window.pageYOffset;
                    const sectionTop = finalCtaSection.offsetTop;
                    const sectionHeight = finalCtaSection.offsetHeight;
                    const windowHeight = window.innerHeight;
                    
                    if (scrolled + windowHeight > sectionTop && scrolled < sectionTop + sectionHeight) {
                        const progress = (scrolled + windowHeight - sectionTop) / (sectionHeight + windowHeight);
                        
                        floatingElements.forEach((element, index) => {
                            const speed = 0.3 + (index * 0.1);
                            const yPos = -progress * 50 * speed;
                            
                            let transformClass = this.getTransformClass(yPos);
                            
                            element.classList.remove(
                                '-translate-y-12', '-translate-y-8', '-translate-y-6',
                                '-translate-y-4', '-translate-y-2', 'translate-y-0',
                                'translate-y-2', 'translate-y-4'
                            );
                            element.classList.add('transform', 'transition-transform', 'duration-75', 'ease-out', transformClass);
                        });
                    }
                    
                    ticking = false;
                };
                
                const onScroll = () => {
                    if (!ticking) {
                        requestAnimationFrame(updateParallax);
                        ticking = true;
                    }
                };
                
                window.addEventListener('scroll', onScroll, { passive: true });
                
                floatingElements.forEach(element => {
                    element.classList.add('transition-all', 'duration-1000', 'ease-out');
                });
            },
            
            getTransformClass(yPos) {
                if (yPos < -40) return '-translate-y-12';
                if (yPos < -30) return '-translate-y-8';
                if (yPos < -20) return '-translate-y-6';
                if (yPos < -10) return '-translate-y-4';
                if (yPos < -5) return '-translate-y-2';
                if (yPos > 5) return 'translate-y-2';
                if (yPos > 10) return 'translate-y-4';
                return 'translate-y-0';
            }
        },

        // Footer Component
        Footer: {
            init() {
                try {
                    this.initFloatingPatterns();
                    this.initMagneticHover();
                    this.enhanceWhatsAppButton();
                    this.initScrollGradient();
                    this.initFooterReveal();
                    this.enhanceEmailLink();
                    this.addPremiumFocusStates();
                } catch (error) {
                    console.error('Error initializing Footer component:', error);
                }
            },
            
            initFloatingPatterns() {
                const patterns = Utils.safeQueryAll('#footer .absolute.opacity-5 > div');
                const delays = ['0s', '1s', '2s', '3s'];
                const durations = ['8s', '10s', '12s', '15s'];
                
                patterns.forEach((pattern, index) => {
                    pattern.classList.add('animate-pulse');
                    pattern.style.animationDelay = delays[index % delays.length];
                    pattern.style.animationDuration = durations[index % durations.length];
                    
                    pattern.addEventListener('mouseenter', () => {
                        pattern.classList.add('scale-110', 'transition-transform', 'duration-500');
                    });
                    
                    pattern.addEventListener('mouseleave', () => {
                        pattern.classList.remove('scale-110');
                    });
                });
            },
            
            initMagneticHover() {
                const magneticElements = Utils.safeQueryAll('#footer a, #footer .group');
                
                magneticElements.forEach(element => {
                    element.addEventListener('mouseenter', function() {
                        this.classList.add('magnetic-hover');
                        
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
            },
            
            enhanceWhatsAppButton() {
                const whatsappBtn = Utils.safeQuery('#footer .whatsapp-pulse');
                if (!whatsappBtn) return;
                
                whatsappBtn.addEventListener('mouseenter', () => {
                    this.createParticleEffect(whatsappBtn);
                });
                
                whatsappBtn.addEventListener('click', function(e) {
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
                    
                    Analytics.track('footer_whatsapp_click');
                });
            },
            
            createParticleEffect(element) {
                for (let i = 0; i < 6; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.animationDelay = Math.random() * 2 + 's';
                    element.style.position = 'relative';
                    element.appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 8000);
                }
            },
            
            initScrollGradient() {
                const footer = Utils.safeQuery('#footer');
                if (!footer) return;
                
                const scrollHandler = Utils.throttle(() => {
                    const scrollPercent = Math.min(
                        window.scrollY / (document.body.scrollHeight - window.innerHeight), 1
                    );
                    
                    if (scrollPercent > 0.8) {
                        footer.classList.remove('bg-gradient-to-br');
                        footer.classList.add('bg-gradient-to-bl');
                    } else if (scrollPercent > 0.4) {
                        footer.classList.remove('bg-gradient-to-bl', 'bg-gradient-to-br');
                        footer.classList.add('bg-gradient-to-b');
                    } else {
                        footer.classList.remove('bg-gradient-to-b', 'bg-gradient-to-bl');
                        footer.classList.add('bg-gradient-to-br');
                    }
                }, CONFIG.scroll.throttle);
                
                window.addEventListener('scroll', scrollHandler, { passive: true });
            },
            
            initFooterReveal() {
                const footerSections = Utils.safeQueryAll('#footer [data-reveal]');
                if (!footerSections.length) return;
                
                Animations.prepareRevealElements(footerSections, {
                    hiddenClasses: ['opacity-0', 'translate-y-8'],
                    transitionClasses: ['transition-all', 'duration-700', 'ease-out']
                });
                
                const observer = Animations.createObserver({
                    callback: (entry, index) => {
                        setTimeout(() => {
                            entry.target.classList.add('opacity-100', 'translate-y-0');
                            entry.target.classList.remove('opacity-0', 'translate-y-8');
                            
                            // Trigger counter animation
                            if (entry.target.querySelector('[data-counter]')) {
                                setTimeout(this.animateCounters, 200);
                            }
                        }, index * 200);
                    },
                    once: true,
                    threshold: 0.1,
                    rootMargin: '0px 0px -100px 0px'
                });
                
                footerSections.forEach(section => observer.observe(section));
            },
            
            animateCounters() {
                const counters = Utils.safeQueryAll('[data-counter]');
                
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-counter'));
                    const increment = target / 60;
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        
                        if (current >= target) {
                            counter.textContent = target;
                            clearInterval(timer);
                        }
                    }, CONFIG.scroll.throttle);
                });
            },
            
            enhanceEmailLink() {
                const emailLink = Utils.safeQuery('#footer a[href^="mailto:"]');
                if (!emailLink) return;
                
                emailLink.addEventListener('click', function() {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<span class="text-green-400">✓ Email copiado!</span>';
                    
                    navigator.clipboard.writeText('support@cafecomvendas.com').catch(() => {});
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                    
                    Analytics.track('footer_email_click');
                });
            },
            
            addPremiumFocusStates() {
                const footerLinks = Utils.safeQueryAll('#footer a, #footer button');
                footerLinks.forEach(link => {
                    link.classList.add('footer-link');
                    
                    link.addEventListener('focus', function() {
                        this.classList.add('ring-2', 'ring-gold-400', 'ring-offset-2', 'ring-offset-navy-900');
                    });
                    
                    link.addEventListener('blur', function() {
                        this.classList.remove('ring-2', 'ring-gold-400', 'ring-offset-2', 'ring-offset-navy-900');
                    });
                });
            }
        },

        // Testimonials Component with Native Carousel
        Testimonials: {
            init() {
                try {
                    this.initTestimonialsCarousel();
                    this.initVideoCardEffects();
                } catch (error) {
                    console.error('Error initializing Testimonials component:', error);
                }
            },
            
            initTestimonialsCarousel() {
                const carouselContainer = Utils.safeQuery('.testimonials-carousel-container');
                const carouselTrack = Utils.safeQuery('[data-carousel-track]');
                const slides = Utils.safeQueryAll('.carousel-slide');
                const prevButton = Utils.safeQuery('[data-carousel-prev]');
                const nextButton = Utils.safeQuery('[data-carousel-next]');
                const paginationContainer = Utils.safeQuery('[data-carousel-pagination]');
                
                if (!carouselContainer || !carouselTrack || !slides.length) {
                    console.warn('Testimonials carousel elements not found');
                    return;
                }
                
                let currentIndex = 0;
                let slidesPerView = 1;
                let slideWidth = 0;
                
                const calculateSlidesPerView = () => {
                    const containerWidth = carouselContainer.offsetWidth;
                    slidesPerView = Utils.calculateSlidesPerView(containerWidth);
                    slideWidth = containerWidth / slidesPerView;
                };
                
                const createPagination = () => {
                    if (!paginationContainer) return;
                    
                    paginationContainer.innerHTML = '';
                    const totalPages = Math.ceil(slides.length / Math.floor(slidesPerView));
                    
                    for (let i = 0; i < totalPages; i++) {
                        const dot = document.createElement('button');
                        dot.className = 'w-2 h-2 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
                        dot.setAttribute('aria-label', `Ir para página ${i + 1} dos testemunhos`);
                        dot.addEventListener('click', () => this.goToSlide(i * Math.floor(slidesPerView)));
                        paginationContainer.appendChild(dot);
                    }
                    this.updatePagination();
                };
                
                this.updatePagination = () => {
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
                };
                
                const updateCarousel = () => {
                    const translateX = -currentIndex * (slideWidth + 24);
                    carouselTrack.style.transform = `translateX(${translateX}px)`;
                    this.updatePagination();
                    this.updateNavigationButtons();
                };
                
                this.updateNavigationButtons = () => {
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
                };
                
                this.goToSlide = (index) => {
                    const maxIndex = slides.length - Math.floor(slidesPerView);
                    currentIndex = Math.max(0, Math.min(index, maxIndex));
                    updateCarousel();
                    
                    Analytics.track(CONFIG.analytics.events.TESTIMONIAL_VIEW, {
                        slide_index: currentIndex + 1,
                        total_slides: slides.length
                    });
                };
                
                const initCarousel = () => {
                    calculateSlidesPerView();
                    slides.forEach(slide => {
                        slide.style.minWidth = `${slideWidth}px`;
                    });
                    createPagination();
                    updateCarousel();
                };
                
                // Event listeners
                prevButton?.addEventListener('click', () => this.goToSlide(currentIndex - 1));
                nextButton?.addEventListener('click', () => this.goToSlide(currentIndex + 1));
                
                // Touch support
                this.initTouchSupport(carouselTrack);
                
                // Resize handler
                const handleResize = Utils.debounce(() => {
                    calculateSlidesPerView();
                    slides.forEach(slide => {
                        slide.style.minWidth = `${slideWidth}px`;
                    });
                    createPagination();
                    
                    const maxIndex = slides.length - Math.floor(slidesPerView);
                    if (currentIndex > maxIndex) {
                        currentIndex = maxIndex;
                    }
                    
                    updateCarousel();
                }, 250);
                
                window.addEventListener('resize', handleResize, { passive: true });
                
                initCarousel();
                this.trackSectionView();
            },
            
            initTouchSupport(carouselTrack) {
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
                    
                    if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                            this.goToSlide(currentIndex + 1);
                        } else {
                            this.goToSlide(currentIndex - 1);
                        }
                    }
                    
                    isDragging = false;
                }, { passive: true });
            },
            
            initVideoCardEffects() {
                const videoCards = Utils.safeQueryAll('[data-video-card]');
                
                videoCards.forEach(card => {
                    card.addEventListener('mouseenter', function() {
                        this.classList.add('-translate-y-1');
                    }, { passive: true });
                    
                    card.addEventListener('mouseleave', function() {
                        this.classList.remove('-translate-y-1');
                    }, { passive: true });
                });
            },
            
            trackSectionView() {
                const observer = Animations.createObserver({
                    callback: () => {
                        Analytics.track('view_testimonials_section');
                    },
                    once: true,
                    threshold: 0.3
                });
                
                const socialProofSection = Utils.safeQuery('#social-proof');
                if (socialProofSection) {
                    observer.observe(socialProofSection);
                }
            }
        }
    };

    // Main Application Object - Café com Vendas
    const CafeComVendas = {
        /**
         * Initialize all components and functionality
         */
        init() {
            if (state.isInitialized) {
                console.warn('CafeComVendas already initialized');
                return;
            }
            
            try {
                console.log('Initializing Café com Vendas landing page...');
                
                // Initialize analytics first
                Analytics.initPerformanceTracking();
                Analytics.initScrollDepthTracking();
                
                // Initialize all components
                this.initializeComponents();
                
                state.isInitialized = true;
                console.log('Café com Vendas initialized successfully');
                
            } catch (error) {
                console.error('Failed to initialize Café com Vendas:', error);
            }
        },
        
        /**
         * Initialize all page components
         */
        initializeComponents() {
            const components = [
                'Hero',
                'Banner', 
                'YouTube',
                'Offer',
                'FAQ',
                'FinalCTA',
                'Footer',
                'Testimonials'
            ];
            
            components.forEach(componentName => {
                try {
                    if (Components[componentName] && typeof Components[componentName].init === 'function') {
                        Components[componentName].init();
                        console.log(`✓ ${componentName} component initialized`);
                    }
                } catch (error) {
                    console.error(`✗ Failed to initialize ${componentName} component:`, error);
                }
            });
        },
        
        /**
         * Get current state for debugging
         */
        getState() {
            return { ...state };
        },
        
        /**
         * Get configuration
         */
        getConfig() {
            return CONFIG;
        }
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        CafeComVendas.init();
    });
    
    // Expose for debugging in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        window.CafeComVendas = CafeComVendas;
        window.CafeComVendasUtils = { Utils, Animations, Analytics, Components };
    }
    
})(); // End IIFE