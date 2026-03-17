/**
 * Route dispatch — maps action strings to handler functions.
 * Unauthenticated actions run without a spreadsheet.
 * Authenticated actions receive the opened spreadsheet as first argument.
 */
const Router = {
  /**
   * Dispatches the request to the appropriate handler.
   * @param {{ action: string, payload: Object }} req
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet|null} ss  Pre-opened spreadsheet (or null for unauth).
   * @returns {*} Handler result (plain JS value).
   */
  dispatch(req, ss) {
    const { action, payload } = req;

    // --- Unauthenticated actions ---
    const unauthActions = {
      LOGIN:           () => AuthHandler.handleLogin(payload),
      SIGNUP:          () => AuthHandler.handleSignup(payload),
      CREW_LOGIN:      () => AuthHandler.handleCrewLogin(payload),
      SUBMIT_TRIAL:    () => AuthHandler.handleSubmitTrial(payload),
      UPDATE_PASSWORD: () => AuthHandler.handleUpdatePassword(payload),
    };

    if (unauthActions[action]) {
      return unauthActions[action]();
    }

    // --- Authenticated actions (require spreadsheet) ---
    if (!ss) throw new Error('Auth Error: Missing Sheet ID');

    const authActions = {
      SYNC_DOWN:        () => EstimatesService.handleSyncDown(ss, payload.lastSyncTimestamp),
      SYNC_UP:          () => EstimatesService.handleSyncUp(ss, payload),
      START_JOB:        () => EstimatesService.handleStartJob(ss, payload),
      COMPLETE_JOB:     () => EstimatesService.handleCompleteJob(ss, payload),
      MARK_JOB_PAID:    () => EstimatesService.handleMarkJobPaid(ss, payload),
      DELETE_ESTIMATE:  () => EstimatesService.handleDeleteEstimate(ss, payload),
      SAVE_PDF:         () => FilesService.handleSavePdf(ss, payload),
      UPLOAD_IMAGE:     () => FilesService.handleUploadImage(ss, payload),
      CREATE_WORK_ORDER:() => FilesService.handleCreateWorkOrder(ss, payload),
      LOG_TIME:         () => FilesService.handleLogTime(payload),
    };

    if (authActions[action]) {
      return authActions[action]();
    }

    throw new Error(`Unknown Action: ${action}`);
  },
};
