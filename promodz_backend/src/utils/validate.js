// src/utils/validate.js
// Shared input validation helpers

/**
 * Validate password strength.
 * At least 8 chars, 1 letter, 1 number.
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password.length > 128) {
    return 'Password must not exceed 128 characters';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null; // valid
}

/**
 * Trim and validate a string field.
 * Returns { value, error }.
 */
export function sanitizeString(value, fieldName, { minLength = 1, maxLength = 500 } = {}) {
  if (value === undefined || value === null) {
    return { value: null, error: null };
  }
  if (typeof value !== 'string') {
    return { value: null, error: `${fieldName} must be a string` };
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return { value: trimmed, error: `${fieldName} must be at least ${minLength} character(s)` };
  }
  if (trimmed.length > maxLength) {
    return { value: trimmed, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return { value: trimmed, error: null };
}

/**
 * Validate numeric range.
 */
export function validateNumber(value, fieldName, { min, max } = {}) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { value: NaN, error: `${fieldName} must be a valid number` };
  }
  if (min !== undefined && num < min) {
    return { value: num, error: `${fieldName} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { value: num, error: `${fieldName} must not exceed ${max}` };
  }
  return { value: num, error: null };
}
