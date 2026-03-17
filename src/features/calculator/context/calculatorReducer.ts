// ---------------------------------------------------------------------------
// Pure reducer for CalculatorFormState.
// All form-editable calculator fields; no session, savedEstimates, customers,
// warehouse, or companyProfile (those live in other feature slices).
// ---------------------------------------------------------------------------

import {
  CalculationMode,
  FoamType,
  CalculatorFormState,
} from '../types/calculator.types';

import { CALCULATOR_ACTIONS, CalculatorAction } from './calculatorActions';

// ── Initial state (mirrors DEFAULT_STATE form-editable fields) ───────────────

export const INITIAL_CALCULATOR_STATE: CalculatorFormState = {
  mode: CalculationMode.BUILDING,
  length: 40,
  width: 30,
  wallHeight: 10,
  roofPitch: '4/12',
  includeGables: true,
  isMetalSurface: false,

  wallSettings: {
    type: FoamType.CLOSED_CELL,
    thickness: 1.0,
    wastePercentage: 5,
  },
  roofSettings: {
    type: FoamType.OPEN_CELL,
    thickness: 4.0,
    wastePercentage: 5,
  },

  yields: {
    openCell: 16000,
    closedCell: 4000,
    openCellStrokes: 6600,
    closedCellStrokes: 6600,
  },

  costs: {
    openCell: 2000,
    closedCell: 2600,
    laborRate: 85,
  },

  additionalAreas: [],
  inventory: [],
  jobEquipment: [],

  customerProfile: {
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
    notes: '',
    status: 'Active',
  },

  pricingMode: 'level_pricing',
  sqFtRates: {
    wall: 0,
    roof: 0,
  },

  expenses: {
    manHours: 0,
    tripCharge: 0,
    fuelSurcharge: 0,
    other: {
      description: 'Misc',
      amount: 0,
    },
  },

  jobNotes: '',
  scheduledDate: '',
  invoiceDate: '',
  invoiceNumber: '',
  paymentTerms: 'Due on Receipt',
};

// ── Reducer ──────────────────────────────────────────────────────────────────

export function calculatorReducer(
  state: CalculatorFormState,
  action: CalculatorAction,
): CalculatorFormState {
  switch (action.type) {
    case CALCULATOR_ACTIONS.SET_MODE:
      return { ...state, mode: action.payload };

    case CALCULATOR_ACTIONS.SET_DIMENSIONS:
      return { ...state, ...action.payload };

    case CALCULATOR_ACTIONS.SET_WALL_SETTINGS:
      return {
        ...state,
        wallSettings: { ...state.wallSettings, ...action.payload },
      };

    case CALCULATOR_ACTIONS.SET_ROOF_SETTINGS:
      return {
        ...state,
        roofSettings: { ...state.roofSettings, ...action.payload },
      };

    case CALCULATOR_ACTIONS.SET_INVENTORY:
      return { ...state, inventory: action.payload };

    case CALCULATOR_ACTIONS.SET_JOB_EQUIPMENT:
      return { ...state, jobEquipment: action.payload };

    case CALCULATOR_ACTIONS.SET_EXPENSES:
      return {
        ...state,
        expenses: { ...state.expenses, ...action.payload },
      };

    case CALCULATOR_ACTIONS.SET_PRICING_MODE:
      return { ...state, pricingMode: action.payload };

    case CALCULATOR_ACTIONS.SET_SQFT_RATES:
      return { ...state, sqFtRates: action.payload };

    case CALCULATOR_ACTIONS.SET_ADDITIONAL_AREAS:
      return { ...state, additionalAreas: action.payload };

    case CALCULATOR_ACTIONS.SET_CUSTOMER:
      return { ...state, customerProfile: action.payload };

    case CALCULATOR_ACTIONS.SET_JOB_NOTES:
      return { ...state, jobNotes: action.payload };

    case CALCULATOR_ACTIONS.SET_SCHEDULED_DATE:
      return { ...state, scheduledDate: action.payload };

    case CALCULATOR_ACTIONS.RESET:
      return { ...INITIAL_CALCULATOR_STATE };

    default:
      return state;
  }
}
