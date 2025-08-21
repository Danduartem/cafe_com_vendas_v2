/**
 * DOM utilities for safe element queries and manipulation
 */

import { CONFIG } from '@/config/constants.js';
import type { SafeElement, SafeElements, SlideCalculation } from '@/types/dom.js';

/**
 * Safe element query with error handling and proper typing
 */
export function safeQuery<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): SafeElement<T> {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safe element query all with error handling and proper typing
 */
export function safeQueryAll<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): SafeElements<T> {
  try {
    const nodeList = context.querySelectorAll<T>(selector);
    return Array.from(nodeList);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Calculate responsive slides per view for carousel
 */
export function calculateSlidesPerView(containerWidth: number): number {
  if (containerWidth >= CONFIG.breakpoints.xl) return 3;
  if (containerWidth >= CONFIG.breakpoints.desktop) return 2.5;
  if (containerWidth >= CONFIG.breakpoints.tablet) return 2;
  if (containerWidth >= CONFIG.breakpoints.mobile) return 1.5;
  return 1;
}

/**
 * Calculate slides per view with additional metadata
 */
export function calculateSlidesPerViewDetailed(containerWidth: number): SlideCalculation {
  return {
    slidesPerView: calculateSlidesPerView(containerWidth),
    containerWidth
  };
}

/**
 * Generate unique ID for tracking
 */
export function generateId(): string {
  return `id_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if element is currently visible in viewport
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get element's distance from top of page
 */
export function getElementOffset(element: Element): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft
  };
}