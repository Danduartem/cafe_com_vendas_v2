/**
 * DOM Utility Functions
 * Safe DOM manipulation helpers with TypeScript support
 */

/**
 * Safely query a single element with type safety
 * @param selector - CSS selector
 * @param parent - Parent element to search within (default: document)
 * @returns Element or null if not found
 */
export function safeQuery<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T | null {
  try {
    return parent.querySelector<T>(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safely query all elements with type safety
 * @param selector - CSS selector
 * @param parent - Parent element to search within (default: document)
 * @returns NodeList of elements or empty NodeList
 */
export function safeQueryAll<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): NodeListOf<T> {
  try {
    return parent.querySelectorAll<T>(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return document.querySelectorAll<T>('__non_existent__'); // Returns empty NodeList
  }
}

/**
 * Check if an element exists in the DOM
 * @param selector - CSS selector
 * @param parent - Parent element to search within
 * @returns Boolean indicating if element exists
 */
export function elementExists(
  selector: string,
  parent: Document | Element = document
): boolean {
  return safeQuery(selector, parent) !== null;
}

/**
 * Add event listener with automatic cleanup
 * @param element - Target element
 * @param event - Event name
 * @param handler - Event handler
 * @returns Cleanup function
 */
export function addListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void
): () => void {
  if (!element) {
    return () => {
      // No-op cleanup function for null elements
    };
  }

  element.addEventListener(event, handler);
  
  // Return cleanup function
  return () => {
    element.removeEventListener(event, handler);
  };
}