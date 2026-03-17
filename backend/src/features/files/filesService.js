/**
 * File, PDF, image, and work-order handling.
 * Ported from Code.js: handleSavePdf, handleUploadImage,
 * handleCreateWorkOrder, handleLogTime.
 */
const FilesService = {
  handleSavePdf(ss, p) {
    const parentFolder = p.folderId
      ? DriveApp.getFolderById(p.folderId)
      : DriveApp.getRootFolder();
    const blob = Utilities.newBlob(
      Utilities.base64Decode(p.base64Data.split(',')[1]),
      MimeType.PDF,
      p.fileName
    );
    const file = parentFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    if (p.estimateId) {
      const s = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
      const data = s.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][COL_MAPS.ESTIMATES.ID] == p.estimateId) {
          const j = SheetsHelpers.safeParse(data[i][COL_MAPS.ESTIMATES.JSON]);
          if (j) {
            j.pdfLink = file.getUrl();
            s.getRange(i + 1, COL_MAPS.ESTIMATES.PDF + 1).setValue(file.getUrl());
            s.getRange(i + 1, COL_MAPS.ESTIMATES.JSON + 1).setValue(JSON.stringify(j));
          }
          break;
        }
      }
    }
    return { success: true, url: file.getUrl() };
  },

  handleUploadImage(ss, payload) {
    const { base64Data, folderId, fileName } = payload;
    let targetFolder;
    try {
      targetFolder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    } catch (e) { /* fall through to next try */ }
    if (!targetFolder) {
      try {
        targetFolder = DriveApp.getFileById(ss.getId()).getParents().next();
      } catch (e) {
        targetFolder = DriveApp.getRootFolder();
      }
    }
    const sub = targetFolder.getFoldersByName('Job Photos');
    const photoFolder = sub.hasNext() ? sub.next() : targetFolder.createFolder('Job Photos');
    const encoded = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const blob = Utilities.newBlob(Utilities.base64Decode(encoded), MimeType.JPEG, fileName || 'photo.jpg');
    const file = photoFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return { url: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1000`, fileId: file.getId() };
  },

  handleCreateWorkOrder(ss, p) {
    let parentFolder;
    try {
      parentFolder = p.folderId ? DriveApp.getFolderById(p.folderId) : DriveApp.getRootFolder();
    } catch (e) {
      parentFolder = DriveApp.getRootFolder();
    }

    const est = p.estimateData;
    const safeName = est.customer && est.customer.name
      ? est.customer.name.replace(/[^a-zA-Z0-9 ]/g, '')
      : 'Unknown';
    const sheetName = `WO-${est.id.slice(0, 8).toUpperCase()} - ${safeName}`;
    const newSheet = SpreadsheetApp.create(sheetName);
    try { DriveApp.getFileById(newSheet.getId()).moveTo(parentFolder); } catch (e) { /* best-effort */ }

    const infoSheet = newSheet.getSheetByName('Sheet1') || newSheet.insertSheet('Job Details');
    infoSheet.setName('Job Details');

    const addKV = (r, k, v) => {
      infoSheet.getRange(r, 1).setValue(k).setFontWeight('bold');
      infoSheet.getRange(r, 2).setValue(v);
    };

    infoSheet.getRange('A1').setValue('JOB SHEET').setFontSize(14).setFontWeight('bold').setBackground('#E30613').setFontColor('white');
    addKV(3, 'Customer', est.customer && est.customer.name);
    addKV(4, 'Address', `${(est.customer && est.customer.address) || ''} ${(est.customer && est.customer.city) || ''}`);
    addKV(6, 'Scope', 'Material Requirements');

    let r = 7;
    if (est.materials && est.materials.openCellSets) addKV(r++, 'Open Cell Sets', Number(est.materials.openCellSets).toFixed(1));
    if (est.materials && est.materials.closedCellSets) addKV(r++, 'Closed Cell Sets', Number(est.materials.closedCellSets).toFixed(1));
    if (est.materials && est.materials.inventory) {
      r++;
      infoSheet.getRange(r++, 1).setValue('ADDITIONAL ITEMS').setFontWeight('bold');
      est.materials.inventory.forEach(i => addKV(r++, i.name, `${i.quantity} ${i.unit}`));
    }
    r++;
    infoSheet.getRange(r++, 1).setValue('NOTES').setFontWeight('bold');
    infoSheet.getRange(r, 1).setValue(est.notes || 'No notes.');

    const logTab = newSheet.insertSheet('Daily Crew Log');
    logTab.appendRow(['Date', 'Tech Name', 'Start', 'End', 'Duration', 'Sets Used', 'Notes']);
    logTab.setFrozenRows(1);

    return { url: newSheet.getUrl() };
  },

  handleLogTime(p) {
    const ss = SpreadsheetApp.openByUrl(p.workOrderUrl);
    const s = ss.getSheetByName('Daily Crew Log');
    s.appendRow([new Date().toLocaleDateString(), p.user, p.startTime, p.endTime || '', '', '', '']);
    return { success: true };
  },
};
