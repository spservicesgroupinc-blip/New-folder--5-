/**
 * formatters.ts
 *
 * Pure, side-effect-free formatting utilities. No external dependencies.
 */

/**
 * Formats a number as a currency string.
 *
 * @example formatCurrency(1234.5)        // "$1,234.50"
 * @example formatCurrency(1234.5, '£')   // "£1,234.50"
 */
export function formatCurrency(amount: number, symbol = '$'): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${formatted}`;
}

/**
 * Formats a number with a fixed number of decimal places (default 2).
 *
 * @example formatNumber(1234.5678, 2)    // "1,234.57"
 * @example formatNumber(1234.5678, 0)    // "1,235"
 */
export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats an ISO date string as a human-readable long date.
 *
 * @example formatDate('2025-01-15')   // "Jan 15, 2025"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    // Append T00:00:00 to prevent UTC midnight shifting to the previous day
    const date = new Date(
      dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`,
    );
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO date string as a short MM/DD/YY string.
 *
 * @example formatDateShort('2025-01-15')   // "01/15/25"
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(
      dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`,
    );
    if (isNaN(date.getTime())) return dateStr;
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a number as a percentage string.
 *
 * @example formatPercent(12.5)       // "12.50%"
 * @example formatPercent(12.5, 1)    // "12.5%"
 */
export function formatPercent(n: number, decimals = 2): string {
  return `${formatNumber(n, decimals)}%`;
}

/**
 * Formats a square-footage number with a comma separator and "sq ft" suffix.
 *
 * @example formatSqFt(1234)   // "1,234 sq ft"
 */
export function formatSqFt(n: number): string {
  return `${formatNumber(n, 0)} sq ft`;
}
