/**
 * Response helpers — wraps ContentService for consistent JSON responses.
 * Mirrors the original sendResponse() from Code.js.
 */
const Response = {
  /**
   * Sends a success response with a data payload.
   * @param {*} data
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  success(data) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data }))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Sends an error response with a human-readable message.
   * @param {string} msg
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  error(msg) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: msg }))
      .setMimeType(ContentService.MimeType.JSON);
  },
};
