/**
 * Google Apps Script entry point.
 * Only doPost and doGet are defined here; all logic lives in src/ modules.
 *
 * Load order in appsscript.json (or clasp push) must be:
 *   utils/response.js, utils/validation.js, utils/errors.js
 *   sheets/sheetNames.js, sheets/sheetsHelpers.js, sheets/sheetsClient.js
 *   auth/permissions.js, auth/authHandler.js
 *   features/estimates/estimatesService.js
 *   features/files/filesService.js
 *   router.js
 *   index.js  (last)
 */

// eslint-disable-next-line no-unused-vars
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return Response.error('Server busy. Please try again.');

  try {
    if (!e || !e.postData) throw new Error('No payload.');
    const req = JSON.parse(e.postData.contents);
    const { payload } = req;

    let ss = null;
    if (payload && payload.spreadsheetId) {
      ss = SheetsClient.openById(payload.spreadsheetId);
    }

    const result = Router.dispatch(req, ss);
    return Response.success(result);
  } catch (err) {
    return Errors.handle(err);
  } finally {
    lock.releaseLock();
  }
}

// eslint-disable-next-line no-unused-vars
function doGet(e) {
  return Response.success({ status: 'ok', version: '9.0' });
}
