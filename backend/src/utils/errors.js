/**
 * Error factory helpers and a top-level error handler.
 */
const Errors = {
  /**
   * Throws a "not found" error for a named resource.
   * @param {string} resource
   */
  notFound(resource) {
    throw new Error(`${resource} not found`);
  },

  /**
   * Throws an authorization error.
   * @param {string} [msg]
   */
  unauthorized(msg) {
    throw new Error(`Auth Error: ${msg || 'Unauthorized'}`);
  },

  /**
   * Throws a validation error.
   * @param {string} msg
   */
  badRequest(msg) {
    throw new Error(`Bad Request: ${msg}`);
  },

  /**
   * Logs the error and returns a Response.error() for the client.
   * Ported from the catch block in Code.js doPost().
   * @param {Error} error
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  handle(error) {
    console.error('API Error', error);
    // Provide a friendlier message for payload-size violations
    if (error && error.toString().includes('limit')) {
      return Response.error('Request too large. Reduce image quality or batch size.');
    }
    return Response.error(error ? error.toString() : 'Unknown error');
  },
};
