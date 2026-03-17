/**
 * Estimates business logic.
 * Ported from Code.js: handleSyncDown, handleSyncUp, handleCompleteJob,
 * handleMarkJobPaid, handleStartJob, handleDeleteEstimate,
 * syncEstimatesWithLogic, reconcileCompletedJobs.
 */
const EstimatesService = {
  handleSyncDown(ss, lastSyncTimestamp) {
    const ts = lastSyncTimestamp || 0;

    const getChangedData = (name, jsonCol) => {
      const s = ss.getSheetByName(name);
      if (!s || s.getLastRow() <= 1) return [];
      const values = s.getRange(2, jsonCol + 1, s.getLastRow() - 1, 1).getValues();
      return values.map(r => SheetsHelpers.safeParse(r[0])).filter(item => {
        if (!item) return false;
        const itemTime = item.lastModified ? new Date(item.lastModified).getTime() : 0;
        return itemTime > ts || itemTime === 0;
      });
    };

    SheetsClient.setupUserSheetSchema(ss, null);

    const settings = {};
    const setSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    if (setSheet && setSheet.getLastRow() > 1) {
      setSheet.getRange(2, 1, setSheet.getLastRow() - 1, 2).getValues()
        .forEach(row => { if (row[0] && row[1]) settings[row[0]] = SheetsHelpers.safeParse(row[1]); });
    }

    const foamCounts = settings['warehouse_counts'] || { openCellSets: 0, closedCellSets: 0 };
    const lifetimeUsage = settings['lifetime_usage'] || { openCell: 0, closedCell: 0 };

    return {
      ...settings,
      warehouse: {
        openCellSets: foamCounts.openCellSets || 0,
        closedCellSets: foamCounts.closedCellSets || 0,
        items: getChangedData(SHEET_NAMES.INVENTORY, COL_MAPS.INVENTORY.JSON),
      },
      lifetimeUsage,
      equipment: getChangedData(SHEET_NAMES.EQUIPMENT, COL_MAPS.EQUIPMENT.JSON),
      savedEstimates: getChangedData(SHEET_NAMES.ESTIMATES, COL_MAPS.ESTIMATES.JSON),
      customers: getChangedData(SHEET_NAMES.CUSTOMERS, COL_MAPS.CUSTOMERS.JSON),
      serverTimestamp: new Date().getTime(),
    };
  },

  handleSyncUp(ss, payload) {
    const { state } = payload;
    if (state.companyProfile && state.companyProfile.logoUrl && state.companyProfile.logoUrl.length > 40000) {
      state.companyProfile.logoUrl = '';
    }

    _reconcileCompletedJobs(ss, state);
    SheetsClient.setupUserSheetSchema(ss, null);

    const sSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    const settingsMap = new Map();
    if (sSheet.getLastRow() > 1) {
      sSheet.getDataRange().getValues().forEach(r => settingsMap.set(r[0], r[1]));
    }
    ['companyProfile', 'yields', 'costs', 'expenses', 'jobNotes', 'purchaseOrders', 'sqFtRates', 'pricingMode', 'lifetimeUsage']
      .forEach(key => { if (state[key] !== undefined) settingsMap.set(key, JSON.stringify(state[key])); });
    if (state.warehouse) {
      settingsMap.set('warehouse_counts', JSON.stringify({ openCellSets: state.warehouse.openCellSets, closedCellSets: state.warehouse.closedCellSets }));
    }
    const outSettings = Array.from(settingsMap.entries()).filter(k => k[0] !== 'Config_Key');
    if (sSheet.getLastRow() > 1) sSheet.getRange(2, 1, sSheet.getLastRow() - 1, 2).clearContent();
    if (outSettings.length > 0) sSheet.getRange(2, 1, outSettings.length, 2).setValues(outSettings);

    if (state.warehouse && state.warehouse.items) {
      SheetsHelpers.updateSheetWithData(ss.getSheetByName(SHEET_NAMES.INVENTORY), state.warehouse.items, COL_MAPS.INVENTORY,
        item => [item.id, item.name, item.quantity, item.unit, item.unitCost || 0, JSON.stringify(item)]);
    }
    if (state.equipment) {
      SheetsHelpers.updateSheetWithData(ss.getSheetByName(SHEET_NAMES.EQUIPMENT), state.equipment, COL_MAPS.EQUIPMENT,
        item => [item.id, item.name, item.status, JSON.stringify(item)]);
    }
    if (state.customers) {
      SheetsHelpers.updateSheetWithData(ss.getSheetByName(SHEET_NAMES.CUSTOMERS), state.customers, COL_MAPS.CUSTOMERS,
        c => [c.id, c.name, c.address, c.city, c.state, c.zip, c.phone, c.email, c.status || 'Active', JSON.stringify(c)]);
    }
    if (state.savedEstimates) _syncEstimatesWithLogic(ss, state.savedEstimates);
    return { synced: true };
  },

  handleCompleteJob(ss, payload) {
    const { estimateId, actuals } = payload;
    const estSheet = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
    const estData = estSheet.getDataRange().getValues();
    let rowIdx = -1, est = null;
    for (let i = 1; i < estData.length; i++) {
      if (estData[i][COL_MAPS.ESTIMATES.ID] == estimateId) {
        rowIdx = i + 1;
        est = SheetsHelpers.safeParse(estData[i][COL_MAPS.ESTIMATES.JSON]);
        break;
      }
    }
    if (!est) throw new Error('Estimate not found');
    if (est.executionStatus === 'Completed' && est.inventoryProcessed) return { success: true, message: 'Job already finalized.' };

    const setSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    const setRows = setSheet.getDataRange().getValues();
    let countRow = -1, lifeRow = -1;
    let counts = { openCellSets: 0, closedCellSets: 0 };
    let lifeStats = { openCell: 0, closedCell: 0 };
    setRows.forEach((r, i) => {
      if (r[0] === 'warehouse_counts') { counts = SheetsHelpers.safeParse(r[1]) || counts; countRow = i + 1; }
      if (r[0] === 'lifetime_usage') { lifeStats = SheetsHelpers.safeParse(r[1]) || lifeStats; lifeRow = i + 1; }
    });

    const actOc = Number(actuals.openCellSets) || 0;
    const actCc = Number(actuals.closedCellSets) || 0;
    const diffOc = actOc - Number(est.materials && est.materials.openCellSets || 0);
    const diffCc = actCc - Number(est.materials && est.materials.closedCellSets || 0);

    if (countRow !== -1) {
      counts.openCellSets = Math.max(0, (counts.openCellSets || 0) - diffOc);
      counts.closedCellSets = Math.max(0, (counts.closedCellSets || 0) - diffCc);
      setSheet.getRange(countRow, 2).setValue(JSON.stringify(counts));
    }
    lifeStats.openCell = (lifeStats.openCell || 0) + actOc;
    lifeStats.closedCell = (lifeStats.closedCell || 0) + actCc;
    if (lifeRow !== -1) setSheet.getRange(lifeRow, 2).setValue(JSON.stringify(lifeStats));
    else setSheet.appendRow(['lifetime_usage', JSON.stringify(lifeStats)]);

    est.executionStatus = 'Completed';
    est.actuals = actuals;
    est.inventoryProcessed = true;
    est.lastModified = new Date().toISOString();
    estSheet.getRange(rowIdx, COL_MAPS.ESTIMATES.JSON + 1).setValue(JSON.stringify(est));
    SpreadsheetApp.flush();
    return { success: true };
  },

  handleMarkJobPaid(ss, payload) {
    const { estimateId } = payload;
    const estSheet = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
    const data = estSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL_MAPS.ESTIMATES.ID] == estimateId) {
        const row = i + 1;
        const est = SheetsHelpers.safeParse(data[i][COL_MAPS.ESTIMATES.JSON]);
        if (!est) continue;
        const setSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
        let costs = { openCell: 0, closedCell: 0, laborRate: 0 };
        setSheet.getDataRange().getValues().forEach(r => { if (r[0] === 'costs') costs = SheetsHelpers.safeParse(r[1]) || costs; });
        const act = est.actuals || est.materials || {};
        const oc = Number(act.openCellSets || 0), cc = Number(act.closedCellSets || 0);
        const chemCost = (oc * costs.openCell) + (cc * costs.closedCell);
        const labHrs = Number(act.laborHours || (est.expenses && est.expenses.manHours) || 0);
        const labCost = labHrs * ((est.expenses && est.expenses.laborRate) || costs.laborRate || 0);
        let invCost = 0;
        (act.inventory || (est.materials && est.materials.inventory) || []).forEach(item => { invCost += Number(item.quantity) * Number(item.unitCost || 0); });
        const misc = ((est.expenses && est.expenses.tripCharge) || 0) + ((est.expenses && est.expenses.fuelSurcharge) || 0);
        const revenue = Number(est.totalValue) || 0;
        const totalCOGS = chemCost + labCost + invCost + misc;
        est.status = 'Paid';
        est.lastModified = new Date().toISOString();
        est.financials = { revenue, chemicalCost: chemCost, laborCost: labCost, inventoryCost: invCost, miscCost: misc, totalCOGS, netProfit: revenue - totalCOGS, margin: revenue ? (revenue - totalCOGS) / revenue : 0 };
        estSheet.getRange(row, COL_MAPS.ESTIMATES.STATUS + 1).setValue('Paid');
        estSheet.getRange(row, COL_MAPS.ESTIMATES.JSON + 1).setValue(JSON.stringify(est));
        ss.getSheetByName(SHEET_NAMES.PNL).appendRow([new Date(), est.id, est.customer && est.customer.name, est.invoiceNumber, revenue, chemCost, labCost, invCost, misc, totalCOGS, est.financials.netProfit, est.financials.margin]);
        return { success: true, estimate: est };
      }
    }
    throw new Error('Estimate ID not found');
  },

  handleStartJob(ss, payload) {
    const { estimateId } = payload;
    const sheet = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL_MAPS.ESTIMATES.ID] == estimateId) {
        const est = SheetsHelpers.safeParse(data[i][COL_MAPS.ESTIMATES.JSON]);
        if (est) {
          est.executionStatus = 'In Progress';
          est.actuals = est.actuals || {};
          est.actuals.lastStartedAt = new Date().toISOString();
          est.lastModified = new Date().toISOString();
          sheet.getRange(i + 1, COL_MAPS.ESTIMATES.JSON + 1).setValue(JSON.stringify(est));
          return { success: true, status: 'In Progress' };
        }
      }
    }
    return { success: false, message: 'Estimate not found' };
  },

  handleDeleteEstimate(ss, p) {
    const s = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
    const f = s.getRange('A:A').createTextFinder(p.estimateId).matchEntireCell(true).findNext();
    if (f) s.deleteRow(f.getRow());
    return { success: true };
  },
};

function _reconcileCompletedJobs(ss, incomingState) {
  if (!incomingState.savedEstimates || incomingState.savedEstimates.length === 0) return;
  const sheet = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
  const data = sheet.getDataRange().getValues();
  const dbIndex = {};
  for (let i = 1; i < data.length; i++) {
    const obj = SheetsHelpers.safeParse(data[i][COL_MAPS.ESTIMATES.JSON]);
    if (obj && obj.id) dbIndex[obj.id] = obj;
  }
  incomingState.savedEstimates.forEach((inc, idx) => {
    const dbEst = dbIndex[inc.id];
    if (dbEst && dbEst.executionStatus === 'Completed' && inc.executionStatus !== 'Completed') {
      incomingState.savedEstimates[idx] = dbEst;
    }
  });
}

function _syncEstimatesWithLogic(ss, payloadEstimates) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ESTIMATES);
  const dbMap = new Map();
  sheet.getDataRange().getValues().forEach((row, i) => {
    if (i === 0) return;
    const obj = SheetsHelpers.safeParse(row[COL_MAPS.ESTIMATES.JSON]);
    if (obj && obj.id) dbMap.set(obj.id, obj);
  });
  payloadEstimates.forEach(incoming => {
    const existing = dbMap.get(incoming.id);
    if (existing) {
      if (existing.executionStatus === 'Completed' && incoming.executionStatus !== 'Completed') { incoming.executionStatus = 'Completed'; incoming.actuals = existing.actuals; }
      if (existing.status === 'Paid') incoming.status = 'Paid';
      if (existing.pdfLink && !incoming.pdfLink) incoming.pdfLink = existing.pdfLink;
      if (existing.workOrderSheetUrl) incoming.workOrderSheetUrl = existing.workOrderSheetUrl;
      if (existing.sitePhotos && existing.sitePhotos.length > 0 && (!incoming.sitePhotos || incoming.sitePhotos.length === 0)) incoming.sitePhotos = existing.sitePhotos;
    }
    dbMap.set(incoming.id, incoming);
  });
  SheetsHelpers.updateSheetWithData(sheet, Array.from(dbMap.values()), COL_MAPS.ESTIMATES,
    e => [e.id, e.date, (e.customer && e.customer.name) || 'Unknown', e.totalValue || 0, e.status || 'Draft', e.invoiceNumber || '', (e.results && e.results.materialCost) || 0, e.pdfLink || '', JSON.stringify(e)]);
}
