/**
 * DOM utilities for safe element queries and manipulation
 */

/**
 * Safe element query with error handling
 */
export function safeQuery(selector: string, context: Document | Element = document): Element | null {
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
export function safeQueryAll(selector: string, context: Document | Element = document): NodeListOf<Element> {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return document.createDocumentFragment().querySelectorAll(selector); // Returns empty NodeList
  }
}

