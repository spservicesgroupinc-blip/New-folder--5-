/**
 * Google Sheets / Drive client utilities.
 * Ported from Code.js: getRootFolder, getMasterSpreadsheet, setupUserSheetSchema.
 */
const CONSTANTS = {
  ROOT_FOLDER_NAME: 'RFE App Data',
  MASTER_DB_NAME:   'RFE Master Login DB',
};

const SheetsClient = {
  /**
   * Opens a spreadsheet by ID.
   * @param {string} id
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  openById(id) {
    return SpreadsheetApp.openById(id);
  },

  /**
   * Returns the root Drive folder, creating it if it doesn't exist.
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getRootFolder() {
    const folders = DriveApp.getFoldersByName(CONSTANTS.ROOT_FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(CONSTANTS.ROOT_FOLDER_NAME);
  },

  /**
   * Returns the master login spreadsheet, creating it if it doesn't exist.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  getMasterSpreadsheet() {
    const root = SheetsClient.getRootFolder();
    const files = root.getFilesByName(CONSTANTS.MASTER_DB_NAME);
    if (files.hasNext()) return SpreadsheetApp.open(files.next());

    const ss = SpreadsheetApp.create(CONSTANTS.MASTER_DB_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(root);
    SheetsHelpers.ensureSheet(ss, 'Users_DB',
      ['Username', 'PasswordHash', 'CompanyName', 'SpreadsheetID', 'FolderID', 'CreatedAt', 'CrewCode', 'Email']);
    SheetsHelpers.ensureSheet(ss, 'Trial_Memberships',
      ['Name', 'Email', 'Phone', 'Timestamp']);
    return ss;
  },

  /**
   * Ensures all required tabs exist in a company spreadsheet.
   * Populates default settings if the Settings tab is newly created.
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
   * @param {Object|null} initialProfile  Company profile for first-time setup.
   */
  setupUserSheetSchema(ss, initialProfile) {
    SheetsHelpers.ensureSheet(ss, SHEET_NAMES.CUSTOMERS,
      ['ID', 'Name', 'Address', 'City', 'State', 'Zip', 'Phone', 'Email', 'Status', 'JSON_DATA']);
    SheetsHelpers.ensureSheet(ss, SHEET_NAMES.ESTIMATES,
      ['ID', 'Date', 'Customer', 'Total Value', 'Status', 'Invoice #', 'Material Cost', 'PDF Link', 'JSON_DATA']);
    SheetsHelpers.ensureSheet(ss, SHEET_NAMES.INVENTORY,
      ['ID', 'Name', 'Quantity', 'Unit', 'Unit Cost', 'JSON_DATA']);
    SheetsHelpers.ensureSheet(ss, SHEET_NAMES.EQUIPMENT,
      ['ID', 'Name', 'Status', 'JSON_DATA']);
    SheetsHelpers.ensureSheet(ss, SHEET_NAMES.PNL,
      ['Date Paid', 'Job ID', 'Customer', 'Invoice #', 'Revenue', 'Chem Cost', 'Labor Cost', 'Inv Cost', 'Misc Cost', 'Total COGS', 'Net Profit', 'Margin %']);
    SheetsHelpers.ensureSheet(ss, SHEET_NAMES.LOGS,
      ['Date', 'Job ID', 'Customer', 'Material Name', 'Quantity', 'Unit', 'Logged By', 'JSON_DATA']);

    const settingsSheet = SheetsHelpers.ensureSheet(ss, SHEET_NAMES.SETTINGS,
      ['Config_Key', 'JSON_Value']);

    if (initialProfile && settingsSheet.getLastRow() === 1) {
      settingsSheet.appendRow(['companyProfile', JSON.stringify(initialProfile)]);
      settingsSheet.appendRow(['warehouse_counts', JSON.stringify({ openCellSets: 0, closedCellSets: 0 })]);
      settingsSheet.appendRow(['lifetime_usage', JSON.stringify({ openCell: 0, closedCell: 0 })]);
      settingsSheet.appendRow(['costs', JSON.stringify({ openCell: 2000, closedCell: 2600, laborRate: 85 })]);
      settingsSheet.appendRow(['yields', JSON.stringify({ openCell: 16000, closedCell: 4000, openCellStrokes: 6600, closedCellStrokes: 6600 })]);
    }

    const sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1) ss.deleteSheet(sheet1);
  },
};
