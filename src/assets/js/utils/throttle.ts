/**
 * Performance utilities for throttling and debouncing
 */

/**
 * Generic function type for throttle and debounce
 */
type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

/**
 * Throttle function for performance optimization
 * Limits function execution to once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ThrottledFunction<T> {
  let inThrottle = false;

  return function(this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Debounce function for user input
 * Delays function execution until after wait time has elapsed since last call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ThrottledFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: unknown, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a throttled version of a function that also tracks call count
 */
export function throttleWithCounter<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ThrottledFunction<T> & { getCallCount: () => number } {
  let inThrottle = false;
  let callCount = 0;

  const throttledFunc = function(this: unknown, ...args: Parameters<T>): void {
    callCount++;
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };

  throttledFunc.getCallCount = () => callCount;

  return throttledFunc;
}

/**
 * Advanced throttle that can be cancelled
 */
export function cancellableThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ThrottledFunction<T> & { cancel: () => void } {
  let inThrottle = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttledFunc = function(this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      timeoutId = setTimeout(() => {
        inThrottle = false;
        timeoutId = null;
      }, limit);
    }
  };

  throttledFunc.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      inThrottle = false;
    }
  };

  return throttledFunc;
}