/**
 * Safe query result that can be null
 */
export type SafeElement<T extends Element = Element> = T | null;

/**
 * Safe query all result that returns an array
 */
export type SafeElements<T extends Element = Element> = T[];

/**
 * Common HTML elements with proper typing
 */
export type SafeHTMLElement = SafeElement<HTMLElement>;
export type SafeButton = SafeElement<HTMLButtonElement>;
export type SafeInput = SafeElement<HTMLInputElement>;
export type SafeForm = SafeElement<HTMLFormElement>;
export type SafeAnchor = SafeElement<HTMLAnchorElement>;
export type SafeImage = SafeElement<HTMLImageElement>;
export type SafeVideo = SafeElement<HTMLVideoElement>;
export type SafeDiv = SafeElement<HTMLDivElement>;
export type SafeSection = SafeElement<HTMLElement>;

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  once?: boolean;
}

/**
 * Reveal animation configuration
 */
export interface RevealConfig extends AnimationConfig {
  initialDelay?: number;
  staggerDelay?: number;
}

/**
 * Intersection observer configuration
 */
export interface ObserverConfig {
  callback: (entry: IntersectionObserverEntry, index: number) => void;
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Scroll configuration
 */
export interface ScrollConfig {
  behavior?: 'smooth' | 'auto';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

/**
 * Breakpoint values for responsive design
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  xl: number;
}

/**
 * Carousel slide calculation result
 */
export interface SlideCalculation {
  slidesPerView: number;
  containerWidth: number;
}