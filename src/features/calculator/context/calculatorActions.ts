// ---------------------------------------------------------------------------
// Action type constants and typed action creators for the calculator reducer.
// ---------------------------------------------------------------------------

import type {
  CalculationMode,
  FoamSettings,
  AdditionalArea,
  CalculatorFormState,
} from '../types/calculator.types';

import type {
  InventoryItem,
  EquipmentItem,
  CustomerProfile,
  EstimateExpenses,
} from '../../../../types';

// ── Action type string constants ─────────────────────────────────────────────

export const CALCULATOR_ACTIONS = {
  SET_MODE:           'calculator/SET_MODE',
  SET_DIMENSIONS:     'calculator/SET_DIMENSIONS',
  SET_WALL_SETTINGS:  'calculator/SET_WALL_SETTINGS',
  SET_ROOF_SETTINGS:  'calculator/SET_ROOF_SETTINGS',
  SET_INVENTORY:      'calculator/SET_INVENTORY',
  SET_JOB_EQUIPMENT:  'calculator/SET_JOB_EQUIPMENT',
  SET_EXPENSES:       'calculator/SET_EXPENSES',
  SET_PRICING_MODE:   'calculator/SET_PRICING_MODE',
  SET_SQFT_RATES:     'calculator/SET_SQFT_RATES',
  SET_ADDITIONAL_AREAS: 'calculator/SET_ADDITIONAL_AREAS',
  SET_CUSTOMER:       'calculator/SET_CUSTOMER',
  SET_JOB_NOTES:      'calculator/SET_JOB_NOTES',
  SET_SCHEDULED_DATE: 'calculator/SET_SCHEDULED_DATE',
  RESET:              'calculator/RESET',
} as const;

// ── Dimension fields ──────────────────────────────────────────────────────────

export type DimensionFields = Partial<{
  length: number;
  width: number;
  wallHeight: number;
  roofPitch: string;
  includeGables: boolean;
  isMetalSurface: boolean;
}>;

// ── Discriminated union of all calculator actions ────────────────────────────

export type CalculatorAction =
  | { type: typeof CALCULATOR_ACTIONS.SET_MODE;            payload: CalculationMode }
  | { type: typeof CALCULATOR_ACTIONS.SET_DIMENSIONS;      payload: DimensionFields }
  | { type: typeof CALCULATOR_ACTIONS.SET_WALL_SETTINGS;   payload: Partial<FoamSettings> }
  | { type: typeof CALCULATOR_ACTIONS.SET_ROOF_SETTINGS;   payload: Partial<FoamSettings> }
  | { type: typeof CALCULATOR_ACTIONS.SET_INVENTORY;       payload: InventoryItem[] }
  | { type: typeof CALCULATOR_ACTIONS.SET_JOB_EQUIPMENT;   payload: EquipmentItem[] }
  | { type: typeof CALCULATOR_ACTIONS.SET_EXPENSES;        payload: Partial<EstimateExpenses> }
  | { type: typeof CALCULATOR_ACTIONS.SET_PRICING_MODE;    payload: CalculatorFormState['pricingMode'] }
  | { type: typeof CALCULATOR_ACTIONS.SET_SQFT_RATES;      payload: { wall: number; roof: number } }
  | { type: typeof CALCULATOR_ACTIONS.SET_ADDITIONAL_AREAS; payload: AdditionalArea[] }
  | { type: typeof CALCULATOR_ACTIONS.SET_CUSTOMER;        payload: CustomerProfile }
  | { type: typeof CALCULATOR_ACTIONS.SET_JOB_NOTES;       payload: string }
  | { type: typeof CALCULATOR_ACTIONS.SET_SCHEDULED_DATE;  payload: string }
  | { type: typeof CALCULATOR_ACTIONS.RESET };

// ── Typed action creators ────────────────────────────────────────────────────

export const calculatorActionCreators = {
  setMode: (mode: CalculationMode): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_MODE, payload: mode }),

  setDimensions: (dims: DimensionFields): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_DIMENSIONS, payload: dims }),

  setWallSettings: (settings: Partial<FoamSettings>): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_WALL_SETTINGS, payload: settings }),

  setRoofSettings: (settings: Partial<FoamSettings>): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_ROOF_SETTINGS, payload: settings }),

  setInventory: (items: InventoryItem[]): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_INVENTORY, payload: items }),

  setJobEquipment: (items: EquipmentItem[]): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_JOB_EQUIPMENT, payload: items }),

  setExpenses: (expenses: Partial<EstimateExpenses>): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_EXPENSES, payload: expenses }),

  setPricingMode: (mode: CalculatorFormState['pricingMode']): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_PRICING_MODE, payload: mode }),

  setSqFtRates: (rates: { wall: number; roof: number }): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_SQFT_RATES, payload: rates }),

  setAdditionalAreas: (areas: AdditionalArea[]): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_ADDITIONAL_AREAS, payload: areas }),

  setCustomer: (customer: CustomerProfile): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_CUSTOMER, payload: customer }),

  setJobNotes: (notes: string): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_JOB_NOTES, payload: notes }),

  setScheduledDate: (date: string): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.SET_SCHEDULED_DATE, payload: date }),

  reset: (): CalculatorAction =>
    ({ type: CALCULATOR_ACTIONS.RESET }),
};
