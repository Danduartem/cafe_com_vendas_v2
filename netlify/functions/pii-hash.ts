/**
 * PII Hashing Utility for Privacy Compliance
 * Implements 2025 GDPR-compliant data protection patterns
 * Used for server-side attribution while maintaining user privacy
 */

import { createHash, randomBytes } from 'crypto';

/**
 * PII Hashing Configuration
 */
interface PIIHashConfig {
  salt: string;
  algorithm: 'sha256' | 'sha512';
  encoding: 'hex' | 'base64';
}

/**
 * Hashable PII Data Structure
 */
interface PIIData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  address?: {
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
}

/**
 * Hashed PII Data Structure (for server-side tracking)
 */
interface HashedPIIData {
  email_address?: string;
  phone_number?: string;
  address?: {
    first_name?: string;
    last_name?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
}

/**
 * PII Hashing Service
 * Provides consistent, secure hashing for privacy-compliant attribution
 */
export class PIIHasher {
  private config: PIIHashConfig;
  
  constructor(config?: Partial<PIIHashConfig>) {
    this.config = {
      salt: config?.salt || this.getOrCreateSalt(),
      algorithm: config?.algorithm || 'sha256',
      encoding: config?.encoding || 'hex'
    };
  }

  /**
   * Hash email address for server-side attribution
   * Follows GA4 Enhanced Conversions requirements
   */
  hashEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email required for hashing');
    }

    // Normalize email (lowercase, trim whitespace)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format
    if (!this.isValidEmail(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    return this.hashValue(normalizedEmail);
  }

  /**
   * Hash phone number for server-side attribution
   * Normalizes international format before hashing
   */
  hashPhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Valid phone required for hashing');
    }

    // Normalize phone (remove non-digits, ensure + prefix for international)
    const normalizedPhone = this.normalizePhone(phone);
    
    return this.hashValue(normalizedPhone);
  }

  /**
   * Hash personal name (first/last name)
   * Normalizes case and whitespace before hashing
   */
  hashName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new Error('Valid name required for hashing');
    }

    // Normalize name (lowercase, trim, single spaces)
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    return this.hashValue(normalizedName);
  }

  /**
   * Hash complete PII data object for server-side attribution
   * Returns structure compatible with GA4 Enhanced Conversions
   */
  hashPIIData(piiData: PIIData): HashedPIIData {
    const hashedData: HashedPIIData = {};

    // Hash email if provided
    if (piiData.email) {
      try {
        hashedData.email_address = this.hashEmail(piiData.email);
      } catch (error) {
        console.warn('Failed to hash email:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Hash phone if provided  
    if (piiData.phone) {
      try {
        hashedData.phone_number = this.hashPhone(piiData.phone);
      } catch (error) {
        console.warn('Failed to hash phone:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Hash name and address data
    if (piiData.first_name || piiData.last_name || piiData.address) {
      hashedData.address = {};

      if (piiData.first_name) {
        try {
          hashedData.address.first_name = this.hashName(piiData.first_name);
        } catch (error) {
          console.warn('Failed to hash first name:', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      if (piiData.last_name) {
        try {
          hashedData.address.last_name = this.hashName(piiData.last_name);
        } catch (error) {
          console.warn('Failed to hash last name:', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      // Address components (hashed for enhanced attribution)
      if (piiData.address) {
        if (piiData.address.city) {
          hashedData.address.city = this.hashValue(piiData.address.city.toLowerCase().trim());
        }
        if (piiData.address.region) {
          hashedData.address.region = this.hashValue(piiData.address.region.toLowerCase().trim());
        }
        if (piiData.address.postal_code) {
          hashedData.address.postal_code = this.hashValue(piiData.address.postal_code.trim());
        }
        if (piiData.address.country) {
          // Country codes should be uppercase (ISO standard)
          hashedData.address.country = this.hashValue(piiData.address.country.toUpperCase().trim());
        }
      }

      // Remove empty address object
      if (Object.keys(hashedData.address).length === 0) {
        delete hashedData.address;
      }
    }

    return hashedData;
  }

  /**
   * Core hashing function with salt
   */
  private hashValue(value: string): string {
    const saltedValue = this.config.salt + value;
    const hash = createHash(this.config.algorithm);
    hash.update(saltedValue, 'utf8');
    return hash.digest(this.config.encoding);
  }

  /**
   * Get or create consistent salt for hashing
   */
  private getOrCreateSalt(): string {
    // Use environment variable if available (for consistent hashing across deployments)
    const envSalt = process.env.PII_HASH_SALT;
    if (envSalt) {
      return envSalt;
    }

    // Generate salt if not configured (warn in production)
    if (process.env.NODE_ENV === 'production') {
      console.warn('PII_HASH_SALT not configured - using generated salt (may cause inconsistent hashing)');
    }

    return randomBytes(32).toString('hex');
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Normalize phone number to international format
   */
  private normalizePhone(phone: string): string {
    // Remove all non-digit characters
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Ensure international format with + prefix
    if (!normalized.startsWith('+')) {
      // Default to Portuguese country code if no international prefix
      // This can be made configurable based on business needs
      if (normalized.length >= 9 && normalized.length <= 10) {
        normalized = '+351' + normalized;
      } else {
        // Assume already international format, just add +
        normalized = '+' + normalized;
      }
    }
    
    return normalized;
  }
}

/**
 * Singleton instance with default configuration
 */
let defaultHasher: PIIHasher | null = null;

/**
 * Get default PII hasher instance
 */
export function getDefaultPIIHasher(): PIIHasher {
  if (!defaultHasher) {
    defaultHasher = new PIIHasher();
  }
  return defaultHasher;
}

/**
 * Convenience functions using default hasher
 */
export function hashEmail(email: string): string {
  return getDefaultPIIHasher().hashEmail(email);
}

export function hashPhone(phone: string): string {
  return getDefaultPIIHasher().hashPhone(phone);
}

export function hashPIIData(piiData: PIIData): HashedPIIData {
  return getDefaultPIIHasher().hashPIIData(piiData);
}

/**
 * Test utility for validating hashing consistency
 * Only available in non-production environments
 */
export function testHashingConsistency(): boolean {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Hash testing not available in production');
    return false;
  }

  const hasher = new PIIHasher({ salt: 'test-salt' });
  const testEmail = 'test@example.com';
  
  const hash1 = hasher.hashEmail(testEmail);
  const hash2 = hasher.hashEmail(testEmail);
  
  const consistent = hash1 === hash2;
  
  if (!consistent) {
    console.error('PII hashing inconsistency detected!');
  }
  
  return consistent;
}

// Export types
export type { PIIData, HashedPIIData, PIIHashConfig };