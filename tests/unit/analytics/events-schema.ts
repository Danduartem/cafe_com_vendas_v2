/**
 * Central analytics events schema for contract testing
 * Defines all valid GTM events that can be tracked
 */

import type { AnalyticsEvent } from '../../../src/types/components/analytics.ts';

/**
 * All valid GTM event names used in the application
 */
export type ValidEventName =
  | 'page_view'
  | 'section_view'
  | 'component_interaction'
  | 'whatsapp_click'
  | 'form_submission'
  | 'scroll_depth'
  | 'cta_click'
  | 'faq_toggle'
  | 'video_play'
  | 'pricing_interaction'
  | 'social_click'
  | 'error'
  | 'performance_metric'
  | 'app_initialized'
  | 'components_initialized';

/**
 * Valid section IDs for analytics tracking
 */
export type ValidSectionId =
  | 'top-banner'
  | 'hero'
  | 'problem'
  | 'solution'
  | 'about'
  | 'social-proof'
  | 'offer'
  | 'faq'
  | 'final-cta'
  | 'footer';

/**
 * Valid element types for interaction tracking
 */
export type ValidElementType =
  | 'button'
  | 'link'
  | 'section'
  | 'component'
  | 'form'
  | 'video'
  | 'image'
  | 'text';

/**
 * Page view event contract
 */
export interface PageViewEvent extends AnalyticsEvent {
  event: 'page_view';
  page_title: string;
  page_location: string;
  page_language: 'pt-PT';
}

/**
 * Section view event contract
 */
export interface SectionViewEvent extends AnalyticsEvent {
  event: 'section_view';
  section_id: ValidSectionId;
  section_variant?: string;
  viewport_percentage?: number;
}

/**
 * CTA click event contract
 */
export interface CTAClickEvent extends AnalyticsEvent {
  event: 'cta_click';
  cta_text: string;
  cta_location: ValidSectionId;
  cta_type: 'primary' | 'secondary' | 'tertiary';
  cta_destination?: string;
}

/**
 * FAQ interaction event contract
 */
export interface FAQToggleEvent extends AnalyticsEvent {
  event: 'faq_toggle';
  faq_id: string;
  faq_question: string;
  action: 'expand' | 'collapse';
}

/**
 * WhatsApp click event contract
 */
export interface WhatsAppClickEvent extends AnalyticsEvent {
  event: 'whatsapp_click';
  link_url: string;
  link_text: string;
  location: ValidSectionId;
}

/**
 * Social media click event contract
 */
export interface SocialClickEvent extends AnalyticsEvent {
  event: 'social_click';
  platform: 'instagram' | 'facebook' | 'linkedin' | 'youtube';
  url: string;
  location: ValidSectionId;
}

/**
 * Video interaction event contract
 */
export interface VideoPlayEvent extends AnalyticsEvent {
  event: 'video_play';
  video_id: string;
  video_title?: string;
  location: ValidSectionId;
}

/**
 * Pricing interaction event contract
 */
export interface PricingInteractionEvent extends AnalyticsEvent {
  event: 'pricing_interaction';
  pricing_tier: 'first_lot' | 'second_lot';
  action: 'view' | 'select' | 'purchase_intent';
  price: number;
  currency: 'EUR';
}

/**
 * Form submission event contract
 */
export interface FormSubmissionEvent extends AnalyticsEvent {
  event: 'form_submission';
  form_name: string;
  form_location: ValidSectionId;
  success: boolean;
  error_message?: string;
}

/**
 * Union type of all valid analytics events
 */
export type ValidAnalyticsEvent =
  | PageViewEvent
  | SectionViewEvent
  | CTAClickEvent
  | FAQToggleEvent
  | WhatsAppClickEvent
  | SocialClickEvent
  | VideoPlayEvent
  | PricingInteractionEvent
  | FormSubmissionEvent;

/**
 * Required GTM keys that must exist in configuration
 */
export const REQUIRED_GTM_KEYS = [
  'GTM-XXXXXXX' // Replace with actual GTM container ID
] as const;

/**
 * Required dataLayer events that must be configured in GTM
 */
export const REQUIRED_GTM_EVENTS: ValidEventName[] = [
  'page_view',
  'section_view',
  'cta_click',
  'whatsapp_click',
  'form_submission',
  'error'
];

/**
 * Validate that an event conforms to our analytics contract
 */
export function validateAnalyticsEvent(event: unknown): event is ValidAnalyticsEvent {
  if (!event || typeof event !== 'object') {
    return false;
  }

  const eventObj = event as Record<string, unknown>;

  // Check that event name is valid
  if (!eventObj.event || typeof eventObj.event !== 'string') {
    return false;
  }

  const eventName = eventObj.event as ValidEventName;
  const validEventNames: ValidEventName[] = [
    'page_view', 'section_view', 'component_interaction', 'whatsapp_click',
    'form_submission', 'scroll_depth', 'cta_click', 'faq_toggle', 'video_play',
    'pricing_interaction', 'social_click', 'error', 'performance_metric',
    'app_initialized', 'components_initialized'
  ];

  if (!validEventNames.includes(eventName)) {
    return false;
  }

  // Validate event-specific properties
  switch (eventName) {
  case 'section_view':
    return typeof eventObj.section_id === 'string' &&
             ['top-banner', 'hero', 'problem', 'solution', 'about', 'social-proof', 'offer', 'faq', 'final-cta', 'footer'].includes(eventObj.section_id);

  case 'cta_click':
    return typeof eventObj.cta_text === 'string' &&
             typeof eventObj.cta_location === 'string' &&
             ['primary', 'secondary', 'tertiary'].includes(eventObj.cta_type as string);

  case 'whatsapp_click':
    return typeof eventObj.link_url === 'string' &&
             typeof eventObj.link_text === 'string' &&
             typeof eventObj.location === 'string';

  case 'faq_toggle':
    return typeof eventObj.faq_id === 'string' &&
             typeof eventObj.faq_question === 'string' &&
             ['expand', 'collapse'].includes(eventObj.action as string);

  default:
    return true; // Basic validation passed
  }
}

/**
 * Get expected properties for an event type
 */
export function getExpectedEventProperties(eventName: ValidEventName): string[] {
  const baseProperties = ['event'];

  switch (eventName) {
  case 'page_view':
    return [...baseProperties, 'page_title', 'page_location', 'page_language'];

  case 'section_view':
    return [...baseProperties, 'section_id', 'section_variant', 'viewport_percentage'];

  case 'cta_click':
    return [...baseProperties, 'cta_text', 'cta_location', 'cta_type', 'cta_destination'];

  case 'whatsapp_click':
    return [...baseProperties, 'link_url', 'link_text', 'location'];

  case 'faq_toggle':
    return [...baseProperties, 'faq_id', 'faq_question', 'action'];

  case 'form_submission':
    return [...baseProperties, 'form_name', 'form_location', 'success', 'error_message'];

  default:
    return baseProperties;
  }
}