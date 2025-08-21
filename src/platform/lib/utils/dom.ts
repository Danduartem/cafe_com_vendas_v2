/**
 * DOM utilities for safe element queries and manipulation
 */

import { CONFIG } from '../config/constants.js';

/**
 * Safe element query with error handling
 */
export function safeQuery(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safe element query all with error handling
 */
export function safeQueryAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Calculate responsive slides per view for carousel
 */
export function calculateSlidesPerView(containerWidth) {
  if (containerWidth >= CONFIG.breakpoints.xl) return 3;
  if (containerWidth >= CONFIG.breakpoints.desktop) return 2.5;
  if (containerWidth >= CONFIG.breakpoints.tablet) return 2;
  if (containerWidth >= CONFIG.breakpoints.mobile) return 1.5;
  return 1;
}

/**
 * Generate unique ID for tracking
 */
export function generateId() {
  return `id_${  Math.random().toString(36).substr(2, 9)}`;
}