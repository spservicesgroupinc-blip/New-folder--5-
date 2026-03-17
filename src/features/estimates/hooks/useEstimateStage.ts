/**
 * useEstimateStage.ts
 *
 * Handles estimate lifecycle transitions: save, confirm work order,
 * create purchase order, and mark paid.
 * Uses the legacy useCalculator() context.
 */

import { useCalculator } from '../../../../context/CalculatorContext';
import { apiSaveEstimate, apiCreateWorkOrderSheet } from '../services/estimatesApi';
import { markJobPaid, syncUp } from '../../../shared/services/api/sheetsApi';
import { generateWorkOrderPDF, generateDocumentPDF } from '../../../../utils/pdfGenerator';
import type {
  EstimateRecord,
  CalculationResults,
  InvoiceLineItem,
  PurchaseOrder,
} from '../../../../types';

export function useEstimateStage() {
  const { state, dispatch } = useCalculator();
  const { appData, ui, session } = state;

  const saveEstimate = async (
    results: CalculationResults,
    targetStatus?: EstimateRecord['status'],
    extraData?: Partial<EstimateRecord>,
    shouldRedirect: boolean = true,
  ): Promise<EstimateRecord | null> => {
    if (!appData.customerProfile.name) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Customer Name Required to Save' },
      });
      return null;
    }

    const estimateId = ui.editingEstimateId || Math.random().toString(36).substr(2, 9);
    const existingRecord = appData.savedEstimates.find((e) => e.id === estimateId);

    const newStatus: EstimateRecord['status'] =
      targetStatus || existingRecord?.status || 'Draft';

    let invoiceNumber = appData.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = existingRecord?.invoiceNumber;
      if (newStatus === 'Invoiced' && !invoiceNumber) {
        invoiceNumber = `INV-${Math.floor(Math.random() * 100000)}`;
      }
    }

    const newEstimate: EstimateRecord = {
      id: estimateId,
      customerId: appData.customerProfile.id || Math.random().toString(36).substr(2, 9),
      date: existingRecord?.date || new Date().toISOString(),
      scheduledDate: appData.scheduledDate,
      invoiceDate: appData.invoiceDate,
      paymentTerms: appData.paymentTerms,
      status: newStatus,
      invoiceNumber,
      customer: { ...appData.customerProfile },
      inputs: {
        mode: appData.mode,
        length: appData.length,
        width: appData.width,
        wallHeight: appData.wallHeight,
        roofPitch: appData.roofPitch,
        includeGables: appData.includeGables,
        isMetalSurface: appData.isMetalSurface,
        additionalAreas: appData.additionalAreas,
      },
      results: { ...results },
      materials: {
        openCellSets: results.openCellSets,
        closedCellSets: results.closedCellSets,
        inventory: [...appData.inventory],
        equipment: [...appData.jobEquipment],
      },
      totalValue: results.totalCost,
      wallSettings: { ...appData.wallSettings },
      roofSettings: { ...appData.roofSettings },
      expenses: { ...appData.expenses },
      notes: appData.jobNotes,
      pricingMode: appData.pricingMode,
      sqFtRates: appData.sqFtRates,
      executionStatus: existingRecord?.executionStatus || 'Not Started',
      actuals: existingRecord?.actuals,
      financials: existingRecord?.financials,
      workOrderSheetUrl: existingRecord?.workOrderSheetUrl,
      invoiceLines: extraData?.invoiceLines || existingRecord?.invoiceLines,
      workOrderLines: extraData?.workOrderLines || existingRecord?.workOrderLines,
      estimateLines: extraData?.estimateLines || existingRecord?.estimateLines,
      ...extraData,
    };

    const updatedEstimates = [...appData.savedEstimates];
    const idx = updatedEstimates.findIndex((e) => e.id === estimateId);
    if (idx >= 0) updatedEstimates[idx] = newEstimate;
    else updatedEstimates.unshift(newEstimate);

    dispatch({ type: 'UPDATE_DATA', payload: { savedEstimates: updatedEstimates } });
    dispatch({ type: 'SET_EDITING_ESTIMATE', payload: estimateId });

    // Implicit customer creation
    if (!appData.customers.find((c) => c.id === appData.customerProfile.id)) {
      const newCustomer = {
        ...appData.customerProfile,
        id: appData.customerProfile.id || Math.random().toString(36).substr(2, 9),
      };
      const updatedCustomers = [...appData.customers, newCustomer];
      dispatch({ type: 'UPDATE_DATA', payload: { customers: updatedCustomers } });
    }

    if (shouldRedirect) {
      dispatch({ type: 'SET_VIEW', payload: 'estimate_detail' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const actionLabel =
      targetStatus === 'Work Order'
        ? 'Job Sold! Moved to Work Order'
        : targetStatus === 'Invoiced'
        ? 'Invoice Generated'
        : targetStatus === 'Paid'
        ? 'Payment Recorded'
        : 'Estimate Saved';
    dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: actionLabel } });

    return newEstimate;
  };

  const handleMarkPaid = async (id: string): Promise<void> => {
    const estimate = appData.savedEstimates.find((e) => e.id === id);
    if (!estimate) return;

    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { type: 'success', message: 'Processing Payment & P&L...' },
    });
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

    const result = await markJobPaid(id, session?.spreadsheetId || '');
    if (result.success && result.estimate) {
      const updatedEstimates = appData.savedEstimates.map((e) =>
        e.id === id ? result.estimate! : e,
      );
      dispatch({ type: 'UPDATE_DATA', payload: { savedEstimates: updatedEstimates } });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'success', message: 'Paid! Profit Calculated.' },
      });
      generateDocumentPDF(appData, estimate.results, 'RECEIPT', result.estimate);
    } else {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Failed to update P&L.' },
      });
    }
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' });
  };

  const confirmWorkOrder = async (
    results: CalculationResults,
    workOrderLines?: InvoiceLineItem[],
  ): Promise<void> => {
    const requiredOpen = Number(results.openCellSets) || 0;
    const requiredClosed = Number(results.closedCellSets) || 0;

    const newWarehouse = { ...appData.warehouse };
    newWarehouse.openCellSets = newWarehouse.openCellSets - requiredOpen;
    newWarehouse.closedCellSets = newWarehouse.closedCellSets - requiredClosed;

    if (appData.inventory.length > 0) {
      newWarehouse.items = newWarehouse.items.map((item) => {
        const used = appData.inventory.find((i) => i.name === item.name);
        if (used) {
          return { ...item, quantity: item.quantity - (Number(used.quantity) || 0) };
        }
        return item;
      });
    }

    dispatch({ type: 'UPDATE_DATA', payload: { warehouse: newWarehouse } });

    const record = await saveEstimate(results, 'Work Order', { workOrderLines }, false);
    if (!record) return;

    dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { type: 'success', message: 'Work Order Created. Processing in background...' },
    });

    generateWorkOrderPDF(appData, record);

    // Fire-and-forget background sync
    _handleBackgroundWorkOrderGeneration(record, newWarehouse);
  };

  const _handleBackgroundWorkOrderGeneration = async (
    record: EstimateRecord,
    currentWarehouse: typeof appData.warehouse,
  ): Promise<void> => {
    if (!session?.spreadsheetId) return;

    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

    try {
      const woUrl = await apiCreateWorkOrderSheet(
        record,
        session.folderId,
        session.spreadsheetId,
      );

      let finalRecord = record;
      if (woUrl) {
        finalRecord = { ...record, workOrderSheetUrl: woUrl };
        dispatch({ type: 'UPDATE_SAVED_ESTIMATE', payload: finalRecord });
      }

      let currentCustomers = [...appData.customers];
      if (!currentCustomers.find((c) => c.id === record.customer.id)) {
        currentCustomers.push(record.customer);
      }

      let freshEstimates = [...appData.savedEstimates];
      const recIdx = freshEstimates.findIndex((e) => e.id === record.id);
      if (recIdx >= 0) freshEstimates[recIdx] = finalRecord;
      else freshEstimates.unshift(finalRecord);

      const updatedState = {
        ...appData,
        customers: currentCustomers,
        warehouse: currentWarehouse,
        savedEstimates: freshEstimates,
      };

      await syncUp(updatedState, session.spreadsheetId);

      dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'success', message: 'Work Order & Sheet Synced Successfully' },
      });
    } catch (e) {
      console.error('Background WO Sync Error', e);
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Background Sync Failed. Check Connection.' },
      });
    }
  };

  const createPurchaseOrder = async (po: PurchaseOrder): Promise<void> => {
    const newWarehouse = { ...appData.warehouse };
    po.items.forEach((item) => {
      if (item.type === 'open_cell') newWarehouse.openCellSets += item.quantity;
      if (item.type === 'closed_cell') newWarehouse.closedCellSets += item.quantity;
      if (item.type === 'inventory' && item.inventoryId) {
        const invItem = newWarehouse.items.find((i) => i.id === item.inventoryId);
        if (invItem) invItem.quantity += item.quantity;
      }
    });

    const updatedPOs = [...(appData.purchaseOrders || []), po];

    dispatch({ type: 'UPDATE_DATA', payload: { warehouse: newWarehouse, purchaseOrders: updatedPOs } });
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { type: 'success', message: 'Order Saved & Stock Updated' },
    });
    dispatch({ type: 'SET_VIEW', payload: 'warehouse' });

    if (session?.spreadsheetId) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      const updatedState = { ...appData, warehouse: newWarehouse, purchaseOrders: updatedPOs };
      await syncUp(updatedState, session.spreadsheetId);
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' });
    }
  };

  return {
    saveEstimate,
    confirmWorkOrder,
    createPurchaseOrder,
    handleMarkPaid,
  };
}
