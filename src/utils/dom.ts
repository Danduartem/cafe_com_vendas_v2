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
    return document.createDocumentFragment().querySelectorAll<T>('*');
  }
}

