export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Void';
export type WorkflowStage = 'estimate' | 'work_order' | 'invoice' | 'paid';

export interface InvoiceLine {
  id: string;
  item: string;
  description: string;
  qty: string;
  amount: number;
}

export interface InvoiceData {
  estimateId: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentTerms: string;
  lines: InvoiceLine[];
  totalAmount: number;
  status: InvoiceStatus;
}

export const STAGE_LABELS: Record<WorkflowStage, string> = {
  estimate: 'Estimate',
  work_order: 'Work Order',
  invoice: 'Invoice',
  paid: 'Paid',
};

export const STAGE_DESCRIPTIONS: Record<WorkflowStage, string> = {
  estimate: 'Estimate created — ready to send or convert to a Work Order.',
  work_order: 'Work Order issued — job is scheduled or in progress.',
  invoice: 'Job complete — invoice generated, awaiting payment.',
  paid: 'Invoice paid — job is fully closed.',
};

export const STATUS_TO_STAGE: Record<string, WorkflowStage> = {
  Draft: 'estimate',
  'Work Order': 'work_order',
  Invoiced: 'invoice',
  Paid: 'paid',
  Archived: 'paid',
};

export const NEXT_STATUS: Record<WorkflowStage, string> = {
  estimate: 'Work Order',
  work_order: 'Invoiced',
  invoice: 'Paid',
  paid: 'Paid',
};
