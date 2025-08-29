/**
 * Browser Data Collection Utilities
 * Collects rich user data for MailerLite integration
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  brand?: string;
  model?: string;
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine?: string;
}

export interface UserEnvironment {
  deviceInfo: DeviceInfo;
  browserInfo: BrowserInfo;
  language: string;
  timezone: string;
  screenResolution: string;
  viewportSize: string;
  cookieEnabled: boolean;
  javascriptEnabled: boolean;
  onlineStatus: boolean;
}

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  referrer_domain?: string;
  landing_page: string;
}

export interface BehaviorData {
  timeOnPage: number;
  scrollDepth: number;
  sectionsViewed: string[];
  pageViews: number;
  isReturningVisitor: boolean;
  sessionDuration: number;
}

/**
 * Detect device type based on screen size and user agent
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  // Mobile detection
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || screenWidth < 768) {
    return {
      type: 'mobile',
      brand: detectMobileBrand(userAgent),
    };
  }
  
  // Tablet detection
  if (/ipad|tablet|kindle|playbook|silk/i.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) {
    return {
      type: 'tablet',
      brand: detectTabletBrand(userAgent),
    };
  }
  
  return {
    type: 'desktop',
    brand: detectDesktopBrand(userAgent),
  };
}

/**
 * Get detailed browser information
 */
export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;
  
  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return {
      name: 'Chrome',
      version: extractVersion(userAgent, /Chrome\/(\d+\.\d+)/),
      engine: 'Blink'
    };
  }
  
  // Firefox
  if (userAgent.includes('Firefox')) {
    return {
      name: 'Firefox',
      version: extractVersion(userAgent, /Firefox\/(\d+\.\d+)/),
      engine: 'Gecko'
    };
  }
  
  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return {
      name: 'Safari',
      version: extractVersion(userAgent, /Version\/(\d+\.\d+)/),
      engine: 'WebKit'
    };
  }
  
  // Edge
  if (userAgent.includes('Edg')) {
    return {
      name: 'Edge',
      version: extractVersion(userAgent, /Edg\/(\d+\.\d+)/),
      engine: 'Blink'
    };
  }
  
  return {
    name: 'Unknown',
    version: '0.0'
  };
}

/**
 * Collect complete user environment data
 */
export function getUserEnvironment(): UserEnvironment {
  return {
    deviceInfo: getDeviceInfo(),
    browserInfo: getBrowserInfo(),
    language: navigator.language || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    screenResolution: `${screen.width}x${screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    cookieEnabled: navigator.cookieEnabled,
    javascriptEnabled: true, // If this runs, JS is enabled
    onlineStatus: navigator.onLine
  };
}

/**
 * Extract UTM parameters and referrer data from current page
 */
export function getAttributionData(): AttributionData {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  
  // Store first-touch attribution in sessionStorage
  if (!sessionStorage.getItem('first_utm_source') && urlParams.get('utm_source')) {
    sessionStorage.setItem('first_utm_source', urlParams.get('utm_source') || '');
    sessionStorage.setItem('first_utm_campaign', urlParams.get('utm_campaign') || '');
    sessionStorage.setItem('first_utm_medium', urlParams.get('utm_medium') || '');
  }
  
  return {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    utm_term: urlParams.get('utm_term') || undefined,
    referrer: referrer || undefined,
    referrer_domain: referrer ? new URL(referrer).hostname : undefined,
    landing_page: window.location.pathname + window.location.search
  };
}

/**
 * Track user behavior on the page
 */
export class BehaviorTracker {
  private startTime: number;
  private maxScrollDepth = 0;
  private sectionsViewed = new Set<string>();
  private pageViews: number;
  
  constructor() {
    this.startTime = Date.now();
    this.pageViews = this.getSessionPageViews();
    this.initScrollTracking();
    this.initSectionTracking();
  }
  
  /**
   * Get current behavior data
   */
  getBehaviorData(): BehaviorData {
    return {
      timeOnPage: Math.floor((Date.now() - this.startTime) / 1000),
      scrollDepth: this.maxScrollDepth,
      sectionsViewed: Array.from(this.sectionsViewed),
      pageViews: this.pageViews,
      isReturningVisitor: this.isReturningVisitor(),
      sessionDuration: this.getSessionDuration()
    };
  }
  
  private initScrollTracking(): void {
    const updateScrollDepth = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      this.maxScrollDepth = Math.max(this.maxScrollDepth, Math.min(scrollPercentage, 100));
    };
    
    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    window.addEventListener('resize', updateScrollDepth, { passive: true });
    
    // Initial calculation
    updateScrollDepth();
  }
  
  private initSectionTracking(): void {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          this.sectionsViewed.add(entry.target.id);
        }
      });
    }, {
      threshold: 0.5 // Section must be 50% visible
    });
    
    sections.forEach(section => observer.observe(section));
  }
  
  private getSessionPageViews(): number {
    const views = sessionStorage.getItem('pageViews');
    const currentViews = views ? parseInt(views) + 1 : 1;
    sessionStorage.setItem('pageViews', currentViews.toString());
    return currentViews;
  }
  
  private isReturningVisitor(): boolean {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      localStorage.setItem('hasVisited', 'true');
      return false;
    }
    return true;
  }
  
  private getSessionDuration(): number {
    const sessionStart = sessionStorage.getItem('sessionStart');
    if (!sessionStart) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
      return 0;
    }
    return Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
  }
}

// Helper functions
function detectMobileBrand(userAgent: string): string {
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'Apple';
  if (userAgent.includes('samsung')) return 'Samsung';
  if (userAgent.includes('huawei')) return 'Huawei';
  if (userAgent.includes('xiaomi')) return 'Xiaomi';
  if (userAgent.includes('android')) return 'Android';
  return 'Unknown';
}

function detectTabletBrand(userAgent: string): string {
  if (userAgent.includes('ipad')) return 'Apple';
  if (userAgent.includes('kindle')) return 'Amazon';
  if (userAgent.includes('surface')) return 'Microsoft';
  if (userAgent.includes('samsung')) return 'Samsung';
  return 'Unknown';
}

function detectDesktopBrand(userAgent: string): string {
  if (userAgent.includes('mac')) return 'Apple';
  if (userAgent.includes('windows')) return 'Microsoft';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('chrome os')) return 'Google';
  return 'Unknown';
}

function extractVersion(userAgent: string, regex: RegExp): string {
  const match = userAgent.match(regex);
  return match ? match[1] : '0.0';
}