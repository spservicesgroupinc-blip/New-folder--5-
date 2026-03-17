/**
 * Canonical sheet/tab names and 0-based column index maps.
 * Ported from the CONSTANTS and COL_MAPS objects in Code.js.
 */
const SHEET_NAMES = {
  ESTIMATES:  'Estimates_DB',
  CUSTOMERS:  'Customers_DB',
  SETTINGS:   'Settings_DB',
  INVENTORY:  'Inventory_DB',
  EQUIPMENT:  'Equipment_DB',
  PNL:        'Profit_Loss_DB',
  LOGS:       'Material_Log_DB',
  USERS:      'Users_DB',
};

/**
 * 0-based column index maps for each sheet.
 * Add 1 to get the 1-based column number used in Sheet.getRange().
 */
const COL_MAPS = {
  ESTIMATES: {
    ID: 0, DATE: 1, CUSTOMER: 2, VALUE: 3, STATUS: 4,
    INVOICE: 5, COST: 6, PDF: 7, JSON: 8,
  },
  CUSTOMERS: {
    ID: 0, NAME: 1, ADDR: 2, CITY: 3, STATE: 4,
    ZIP: 5, PHONE: 6, EMAIL: 7, STATUS: 8, JSON: 9,
  },
  INVENTORY: {
    ID: 0, NAME: 1, QTY: 2, UNIT: 3, COST: 4, JSON: 5,
  },
  EQUIPMENT: {
    ID: 0, NAME: 1, STATUS: 2, JSON: 3,
  },
};
