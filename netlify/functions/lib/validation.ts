import type { PaymentIntentRequest, ValidationResult, ValidationRules } from '../types';

export const VALIDATION_RULES: ValidationRules = {
  required_fields: ['event_id', 'user_session_id', 'full_name', 'email', 'phone'],
  email_regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone_regex: /^[+]?[0-9][\d\s\-()]{7,20}$/,
  name_min_length: 2,
  name_max_length: 100,
  amount_min: 50,
  amount_max: 1000000,
  currency_allowed: ['eur', 'usd', 'gbp'],
  utm_params: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
};

export function validatePaymentRequest(requestBody: PaymentIntentRequest): ValidationResult {
  const errors: string[] = [];

  for (const field of VALIDATION_RULES.required_fields) {
    const value = requestBody[field];
    if (!value || typeof value !== 'string' || !value.trim()) {
      errors.push(`Missing or invalid required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const { lead_id, full_name, email, phone, amount, currency = 'eur' } = requestBody;

  const event_id = requestBody.event_id;
  const user_session_id = requestBody.user_session_id;

  const uuidV4 = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/;
  if (!event_id || !uuidV4.test(event_id.trim())) {
    errors.push('Invalid event_id format (expected UUID v4)');
  }
  if (!user_session_id || !uuidV4.test(user_session_id.trim())) {
    errors.push('Invalid user_session_id format (expected UUID v4)');
  }

  // Name
  const cleanName = full_name.trim();
  if (cleanName.length < VALIDATION_RULES.name_min_length || cleanName.length > VALIDATION_RULES.name_max_length) {
    errors.push(`Name must be between ${VALIDATION_RULES.name_min_length} and ${VALIDATION_RULES.name_max_length} characters`);
  }
  if (!/^[a-zA-ZÀ-ÿ\u0100-\u017F\s\-'.]+$/.test(cleanName)) {
    errors.push('Name contains invalid characters');
  }

  // Email
  const cleanEmail = email.toLowerCase().trim();
  if (!VALIDATION_RULES.email_regex.test(cleanEmail)) {
    errors.push('Invalid email format');
  }
  if (cleanEmail.length > 254) {
    errors.push('Email address too long');
  }

  // Phone
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    errors.push('Phone number must be between 7 and 15 digits');
  } else if (!/^[+]?[0-9]+$/.test(cleanPhone)) {
    errors.push('Phone number contains invalid characters');
  }

  // Amount
  if (amount !== undefined) {
    const numAmount = parseInt(amount.toString());
    if (isNaN(numAmount) || numAmount < VALIDATION_RULES.amount_min || numAmount > VALIDATION_RULES.amount_max) {
      errors.push(`Amount must be between ${VALIDATION_RULES.amount_min} and ${VALIDATION_RULES.amount_max} cents`);
    }
  }

  // Currency
  if (!VALIDATION_RULES.currency_allowed.includes(currency.toLowerCase())) {
    errors.push(`Currency must be one of: ${VALIDATION_RULES.currency_allowed.join(', ')}`);
  }

  // UTM length checks
  for (const utmParam of VALIDATION_RULES.utm_params) {
    const v = requestBody[utmParam];
    if (v && (typeof v !== 'string' || v.length > 255)) {
      errors.push(`Invalid ${utmParam}: must be string under 255 characters`);
    }
  }

  const suspicious = [/<script/i, /javascript:/i, /on\w+=/i, /\bselect\b.*\bfrom\b/i];
  const allValues = [full_name, email, phone, ...(requestBody.utm_source ? [requestBody.utm_source] : [])];
  for (const v of allValues) {
    for (const p of suspicious) {
      if (p.test(v)) {
        errors.push('Request contains potentially malicious content');
        break;
      }
    }
  }

  if (errors.length) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      event_id: event_id.trim(),
      user_session_id: user_session_id.trim(),
      lead_id: lead_id ? lead_id.trim() : event_id.trim(),
      full_name: cleanName,
      email: cleanEmail,
      phone: phone.trim(),
      amount: amount ? parseInt(amount.toString()) : 18000,
      currency: currency.toLowerCase()
    }
  };
}

