/**
 * Final CTA Component for Café com Vendas
 * Handles premium interactions, animations, and parallax effects
 */

import { CONFIG } from '../config/constants.js';
import { safeQuery, safeQueryAll, Animations } from '../utils/index.js';

export const FinalCTA = {
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
        const finalCtaSection = safeQuery('#final-cta');
        const finalCtaButton = safeQuery('.final-cta-button');
        
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
        const floatingElements = safeQueryAll('#final-cta [class*="animate-pulse"]');
        floatingElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('transform', 'scale-110');
                setTimeout(() => element.classList.remove('scale-110'), 400);
            }, index * 300 + 800);
        });
    },
    
    initInteractions() {
        const finalCtaButton = safeQuery('.final-cta-button');
        const floatingElements = safeQueryAll('#final-cta [class*="animate-pulse"]');
        
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
        
        const finalCtaSection = safeQuery('#final-cta');
        if (finalCtaSection) {
            finalCtaSection.classList.add('scale-[1.01]', 'transition-transform', 'duration-200');
            setTimeout(() => finalCtaSection.classList.remove('scale-[1.01]'), 200);
        }
    },
    
    initParallax() {
        const finalCtaSection = safeQuery('#final-cta');
        const floatingElements = safeQueryAll('#final-cta [class*="animate-pulse"]');
        
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
};