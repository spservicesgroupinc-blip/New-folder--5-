import {
  CalculatorState,
  CalculationResults,
  EstimateRecord,
  PurchaseOrder,
} from '../../../../types';

export type PdfDocType =
  | 'ESTIMATE'
  | 'INVOICE'
  | 'RECEIPT'
  | 'WORK_ORDER'
  | 'PURCHASE_ORDER';

export interface EstimatePdfData {
  state: CalculatorState;
  results: CalculationResults;
  record?: EstimateRecord;
  type: 'ESTIMATE' | 'INVOICE' | 'RECEIPT';
}

export interface WorkOrderPdfData {
  state: CalculatorState;
  record: EstimateRecord;
}

export interface PurchaseOrderPdfData {
  state: CalculatorState;
  po: PurchaseOrder;
}
