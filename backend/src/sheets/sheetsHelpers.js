/**
 * Low-level Google Sheets helper utilities.
 * Ported from Code.js: safeParse, updateSheetWithData, ensureSheet.
 */
const SheetsHelpers = {
  /**
   * Safely parses a JSON string; returns null on failure.
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
   * Overwrites all data rows in a sheet with a new set of items.
   * Clears existing rows, then writes the mapped rows in one batch.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {Array<*>} items
   * @param {Object} map  Column map (unused in mapper; provided for context)
   * @param {function(*): Array<*>} rowMapper  Maps each item to a row array.
   */
  updateSheetWithData(sheet, items, map, rowMapper) {
    if (!items || !Array.isArray(items) || items.length === 0) return;

    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }

    const rows = items.map(rowMapper);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
  },

  /**
   * Ensures a named sheet exists in the spreadsheet.
   * Creates it with a header row if absent.
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
   * @param {string} name  Sheet tab name.
   * @param {string[]} headers  Header column names.
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  ensureSheet(ss, name, headers) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    return sheet;
  },
};
