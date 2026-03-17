export const ROUTES = {
  CALCULATOR: 'calculator',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  WAREHOUSE: 'warehouse',
  CUSTOMERS: 'customers',
  CUSTOMER_DETAIL: 'customer_detail',
  WORK_ORDER_STAGE: 'work_order_stage',
  INVOICE_STAGE: 'invoice_stage',
  ESTIMATE_STAGE: 'estimate_stage',
  MATERIAL_ORDER: 'material_order',
  MATERIAL_REPORT: 'material_report',
  ESTIMATE_DETAIL: 'estimate_detail',
  EQUIPMENT_TRACKER: 'equipment_tracker',
} as const;

export type ViewType = typeof ROUTES[keyof typeof ROUTES];
