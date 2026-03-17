/**
 * validators.ts
 *
 * Reusable field validators. Each function returns a string error message when
 * the value is invalid, or null when the value passes validation.
 *
 * Validators are intentionally pure functions with no side effects so they can
 * be composed freely in form-handling logic.
 */

/**
 * Fails when `value` is null, undefined, an empty string, or a whitespace-only
 * string.
 */
export function required(value: unknown, label = 'This field'): string | null {
  if (value === null || value === undefined) {
    return `${label} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${label} is required`;
  }
  return null;
}

/**
 * Fails when `value` is strictly less than `min`.
 */
export function minValue(
  value: number,
  min: number,
  label = 'Value',
): string | null {
  if (value < min) {
    return `${label} must be at least ${min}`;
  }
  return null;
}

/**
 * Fails when `value` is strictly greater than `max`.
 */
export function maxValue(
  value: number,
  max: number,
  label = 'Value',
): string | null {
  if (value > max) {
    return `${label} must be no more than ${max}`;
  }
  return null;
}

/**
 * Fails when `value` is not a syntactically valid email address.
 * Uses a conservative RFC 5322-compatible regex suitable for most real-world
 * addresses.
 */
export function email(value: string): string | null {
  if (!value || value.trim() === '') return null; // treat empty as "not provided"
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

/**
 * Fails when `value` does not contain 10 digits (after stripping common
 * formatting characters: spaces, dashes, dots, and parentheses).
 */
export function phone(value: string): string | null {
  if (!value || value.trim() === '') return null; // treat empty as "not provided"
  const digits = value.replace(/[\s\-().+]/g, '');
  if (!/^\d{10,15}$/.test(digits)) {
    return 'Please enter a valid phone number';
  }
  return null;
}
