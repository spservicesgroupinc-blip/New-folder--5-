import { useState } from 'react';
import { CalculatorState, CalculationResults, EstimateRecord, PurchaseOrder } from '../../../../types';
import { useCalculator } from '../../../../context/CalculatorContext';
import { generateEstimatePdf } from '../generators/estimatePdf';
import { generateWorkOrderPdf } from '../generators/workOrderPdf';
import { generatePurchaseOrderPdf } from '../generators/purchaseOrderPdf';

export function usePdfGeneration() {
  const [generating, setGenerating] = useState(false);
  const { state: contextState } = useCalculator();
  const appData = contextState.appData;

  async function generateEstimate(
    state: CalculatorState,
    results: CalculationResults,
    record?: EstimateRecord,
    type: 'ESTIMATE' | 'INVOICE' | 'RECEIPT' = 'ESTIMATE'
  ): Promise<void> {
    setGenerating(true);
    try {
      await generateEstimatePdf({ state, results, record, type });
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setGenerating(false);
    }
  }

  async function generateWorkOrder(
    state: CalculatorState,
    record: EstimateRecord
  ): Promise<void> {
    setGenerating(true);
    try {
      await generateWorkOrderPdf({ state, record });
    } catch (err) {
      console.error('Work order PDF generation failed', err);
    } finally {
      setGenerating(false);
    }
  }

  async function generatePurchaseOrder(
    state: CalculatorState,
    po: PurchaseOrder
  ): Promise<void> {
    setGenerating(true);
    try {
      await generatePurchaseOrderPdf({ state, po });
    } catch (err) {
      console.error('Purchase order PDF generation failed', err);
    } finally {
      setGenerating(false);
    }
  }

  // Convenience overloads that read state from context
  async function generateEstimateFromContext(
    results: CalculationResults,
    record?: EstimateRecord,
    type: 'ESTIMATE' | 'INVOICE' | 'RECEIPT' = 'ESTIMATE'
  ): Promise<void> {
    return generateEstimate(appData, results, record, type);
  }

  async function generateWorkOrderFromContext(record: EstimateRecord): Promise<void> {
    return generateWorkOrder(appData, record);
  }

  async function generatePurchaseOrderFromContext(po: PurchaseOrder): Promise<void> {
    return generatePurchaseOrder(appData, po);
  }

  return {
    generating,
    generateEstimate,
    generateWorkOrder,
    generatePurchaseOrder,
    generateEstimateFromContext,
    generateWorkOrderFromContext,
    generatePurchaseOrderFromContext,
  };
}
