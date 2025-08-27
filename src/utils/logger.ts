/**
 * Centralized Logger Utility
 * Environment-aware logging that only shows debug messages in development
 */

/* eslint-disable no-console */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  private isDevelopment: boolean;
  private isTest: boolean;
  
  constructor() {
    // Check environment - only show debug logs in development
    this.isDevelopment = typeof window !== 'undefined' && 
      (window.location?.hostname === 'localhost' || 
       window.location?.hostname === '127.0.0.1' ||
       window.location?.hostname.includes('local'));
    
    this.isTest = typeof window !== 'undefined' && 
      (window.navigator?.webdriver === true ||
       window.location?.port === '8888');
  }

  error(message: string, ...args: unknown[]): void {
    // Always show errors in all environments
    console.error(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    // Always show warnings in all environments
    console.warn(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    // Only show info in development/test
    if (this.isDevelopment || this.isTest) {
      console.info(message, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    // Only show debug in development
    if (this.isDevelopment) {
      console.debug(message, ...args);
    }
  }

  // Convenience method for logging groups in development only
  group(label: string, fn: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing purposes
export { Logger, LOG_LEVELS };