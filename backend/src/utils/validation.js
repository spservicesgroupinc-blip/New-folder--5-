/**
 * Validation helpers — shared input validation utilities.
 */
const Validation = {
  /**
   * Asserts that a value is present (non-null, non-undefined, non-empty string).
   * Throws a descriptive Error if the value is missing.
   * @param {*} value
   * @param {string} name  Human-readable field name used in the error message.
   * @returns {*} The validated value, for chaining.
   */
  required(value, name) {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${name} is required`);
    }
    return value;
  },

  /**
   * Safely parses a JSON string.
   * Returns null on any parse failure rather than throwing.
   * Ported from Code.js safeParse().
   * @param {string} str
   * @returns {*|null}
   */
  safeParse(str) {
    if (!str || str === '') return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  },

  /**
   * Validates that a spreadsheet ID is present in the payload.
   * @param {{ spreadsheetId?: string }} payload
   * @returns {string} The spreadsheet ID.
   */
  requireSpreadsheetId(payload) {
    if (!payload || !payload.spreadsheetId) {
      throw new Error('Auth Error: Missing Sheet ID');
    }
    return payload.spreadsheetId;
  },

  /**
   * Sanitises a company/customer name for safe use as a file or folder name.
   * @param {string} name
   * @returns {string}
   */
  safeName(name) {
    return (name || '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  },
};
