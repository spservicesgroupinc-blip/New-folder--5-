// ---------------------------------------------------------------------------
// Wizard step configuration for the multi-step calculator UI.
// ---------------------------------------------------------------------------

export enum StepId {
  DIMENSIONS = 'dimensions',
  FOAM_SPECS = 'foam_specs',
  MATERIALS = 'materials',
  EQUIPMENT = 'equipment',
  LABOR = 'labor',
  PRICING = 'pricing',
}

export interface StepConfig {
  id: StepId;
  label: string;
  description: string;
}

export const CALCULATOR_STEPS: StepConfig[] = [
  {
    id: StepId.DIMENSIONS,
    label: 'Dimensions',
    description: 'Building measurements',
  },
  {
    id: StepId.FOAM_SPECS,
    label: 'Foam Specs',
    description: 'Foam type and thickness',
  },
  {
    id: StepId.MATERIALS,
    label: 'Materials',
    description: 'Inventory and prep items',
  },
  {
    id: StepId.EQUIPMENT,
    label: 'Equipment',
    description: 'Job equipment',
  },
  {
    id: StepId.LABOR,
    label: 'Labor & Expenses',
    description: 'Hours and costs',
  },
  {
    id: StepId.PRICING,
    label: 'Pricing',
    description: 'Review and price',
  },
];
