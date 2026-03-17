/**
 * Authentication handlers.
 * Ported from Code.js: generateToken, validateToken, hashPassword,
 * handleLogin, handleCrewLogin, handleSignup, handleUpdatePassword, handleSubmitTrial.
 */
const SECRET_SALT = PropertiesService.getScriptProperties().getProperty('SECRET_SALT')
  || 'dev_fallback_salt_change_me';

const AuthHandler = {
  /**
   * Generates a signed, base64-encoded token valid for 7 days.
   */
  generateToken(username, role) {
    const expiry = new Date().getTime() + (1000 * 60 * 60 * 24 * 7);
    const data = `${username}:${role}:${expiry}`;
    const signature = Utilities.base64Encode(
      Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, data, SECRET_SALT)
    );
    return Utilities.base64Encode(`${data}::${signature}`);
  },

  /**
   * Validates a token. Returns { username, role } on success, null on failure.
   */
  validateToken(token) {
    if (!token) return null;
    try {
      const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
      const parts = decoded.split('::');
      if (parts.length !== 2) return null;
      const [data, signature] = parts;
      const expectedSig = Utilities.base64Encode(
        Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, data, SECRET_SALT)
      );
      if (signature !== expectedSig) return null;
      const [user, role, expiry] = data.split(':');
      if (new Date().getTime() > parseInt(expiry)) return null;
      return { username: user, role };
    } catch (e) { return null; }
  },

  /** SHA-256 + salt password hash. */
  hashPassword(p) {
    return Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, p + SECRET_SALT)
    );
  },

  handleLogin(p) {
    const ss = SheetsClient.getMasterSpreadsheet();
    const sh = ss.getSheetByName('Users_DB');
    const f = sh.getRange('A:A').createTextFinder(p.username.trim()).matchEntireCell(true).findNext();
    if (!f) throw new Error('User not found.');
    const r = f.getRow();
    const d = sh.getRange(r, 1, 1, 7).getValues()[0];
    if (String(d[1]) !== AuthHandler.hashPassword(p.password)) throw new Error('Incorrect password.');
    return { username: d[0], companyName: d[2], spreadsheetId: d[3], folderId: d[4], role: 'admin', token: AuthHandler.generateToken(d[0], 'admin') };
  },

  handleCrewLogin(p) {
    const ss = SheetsClient.getMasterSpreadsheet();
    const sh = ss.getSheetByName('Users_DB');
    const f = sh.getRange('A:A').createTextFinder(p.username.trim()).matchEntireCell(true).findNext();
    if (!f) throw new Error('Company ID not found.');
    const r = f.getRow();
    const d = sh.getRange(r, 1, 1, 7).getValues()[0];
    if (String(d[6]).trim() !== String(p.pin).trim()) throw new Error('Invalid Crew PIN.');
    return { username: d[0], companyName: d[2], spreadsheetId: d[3], folderId: d[4], role: 'crew', token: AuthHandler.generateToken(d[0], 'crew') };
  },

  handleSignup(p) {
    const ss = SheetsClient.getMasterSpreadsheet();
    const sh = ss.getSheetByName('Users_DB');
    const e = sh.getRange('A:A').createTextFinder(p.username.trim()).matchEntireCell(true).findNext();
    if (e) throw new Error('Username already taken.');
    const crewPin = Math.floor(1000 + Math.random() * 9000).toString();
    const r = _createCompanyResources(p.companyName, p.username, crewPin, p.email);
    sh.appendRow([p.username.trim(), AuthHandler.hashPassword(p.password), p.companyName, r.ssId, r.folderId, new Date(), crewPin, p.email]);
    return { username: p.username, companyName: p.companyName, spreadsheetId: r.ssId, folderId: r.folderId, role: 'admin', token: AuthHandler.generateToken(p.username, 'admin'), crewPin };
  },

  handleUpdatePassword(p) {
    const ss = SheetsClient.getMasterSpreadsheet();
    const sh = ss.getSheetByName('Users_DB');
    const f = sh.getRange('A:A').createTextFinder(p.username.trim()).matchEntireCell(true).findNext();
    if (!f) throw new Error('User not found.');
    const r = f.getRow();
    if (String(sh.getRange(r, 2).getValue()) !== AuthHandler.hashPassword(p.currentPassword)) {
      throw new Error('Incorrect current password.');
    }
    sh.getRange(r, 2).setValue(AuthHandler.hashPassword(p.newPassword));
    return { success: true };
  },

  handleSubmitTrial(p) {
    SheetsClient.getMasterSpreadsheet().getSheetByName('Trial_Memberships')
      .appendRow([p.name, p.email, p.phone, new Date()]);
    return { success: true };
  },
};

/** Private: creates company Drive folder + spreadsheet. */
function _createCompanyResources(companyName, username, crewPin, email) {
  const root = SheetsClient.getRootFolder();
  const safeName = (companyName || '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const companyFolder = root.createFolder(`${safeName} Data`);
  const ss = SpreadsheetApp.create(`${companyName} - Master Data`);
  DriveApp.getFileById(ss.getId()).moveTo(companyFolder);
  const initialProfile = {
    companyName, crewAccessPin: crewPin, email: email || '',
    phone: '', addressLine1: '', addressLine2: '', city: '', state: '', zip: '', website: '', logoUrl: '',
  };
  SheetsClient.setupUserSheetSchema(ss, initialProfile);
  return { ssId: ss.getId(), folderId: companyFolder.getId() };
}
