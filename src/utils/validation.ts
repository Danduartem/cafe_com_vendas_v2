/**
 * Shared validation utilities for email and phone validation
 * Centralizes validation logic to avoid duplication across frontend and backend
 */

// Email validation regex - consistent pattern across all components
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex - supports international formats with optional + prefix
// Allows digits, spaces, dashes, parentheses with 7-20 character length
export const PHONE_REGEX = /^[+]?[0-9][\d\s\-()]{7,20}$/;

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Clean phone number by removing common separators
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  return PHONE_REGEX.test(cleanPhone);
}

/**
 * Clean phone number by removing non-numeric characters except + prefix
 */
export function cleanPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Keep only digits and + prefix
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Validate full name (non-empty string with reasonable length)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
}