/**
 * Safe query result that can be null
 */
export type SafeElement<T extends Element = Element> = T | null;

/**
 * Safe query all result that returns an array
 */
export type SafeElements<T extends Element = Element> = T[];

/**
 * Common HTML element type for type safety
 */
export type SafeHTMLElement = SafeElement<HTMLElement>;

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