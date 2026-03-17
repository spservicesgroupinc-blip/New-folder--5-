// ---------------------------------------------------------------------------
// Calculator-feature-scoped types
// Enums and interfaces that belong to the calculator domain only.
// Cross-cutting types (InventoryItem, EquipmentItem, CustomerProfile, etc.)
// are intentionally kept in the root types.ts until they are migrated.
// ---------------------------------------------------------------------------

export enum CalculationMode {
  BUILDING = 'Building',
  WALLS_ONLY = 'Walls Only',
  FLAT_AREA = 'Flat Area',
  CUSTOM = 'Custom',
}

export enum FoamType {
  OPEN_CELL = 'Open Cell',
  CLOSED_CELL = 'Closed Cell',
}

export enum AreaType {
  WALL = 'Wall',
  ROOF = 'Roof',
}

export interface FoamSettings {
  type: FoamType;
  thickness: number;
  wastePercentage: number;
}

export interface AdditionalArea {
  type: AreaType;
  length: number;
  width: number;
}

export interface CalculationResults {
  perimeter: number;
  slopeFactor: number;
  baseWallArea: number;
  gableArea: number;
  totalWallArea: number;
  baseRoofArea: number;
  totalRoofArea: number;

  wallBdFt: number;
  roofBdFt: number;

  totalOpenCellBdFt: number;
  totalClosedCellBdFt: number;

  openCellSets: number;
  closedCellSets: number;

  openCellStrokes: number;
  closedCellStrokes: number;

  openCellCost: number;
  closedCellCost: number;

  inventoryCost: number;
  laborCost: number;
  miscExpenses: number;
  materialCost: number;
  totalCost: number;
}

// ---------------------------------------------------------------------------
// CalculatorFormState — the editable fields owned by the calculator feature.
// Does NOT include savedEstimates, customers, warehouse, companyProfile, or
// session — those belong to separate features.
// ---------------------------------------------------------------------------

import type {
  InventoryItem,
  EquipmentItem,
  CustomerProfile,
  EstimateExpenses,
} from '../../../../types';

export interface CalculatorFormState {
  mode: CalculationMode;
  length: number;
  width: number;
  wallHeight: number;
  roofPitch: string;
  includeGables: boolean;
  isMetalSurface: boolean;

  wallSettings: FoamSettings;
  roofSettings: FoamSettings;

  yields: {
    openCell: number;
    closedCell: number;
    openCellStrokes: number;
    closedCellStrokes: number;
  };

  costs: {
    openCell: number;
    closedCell: number;
    laborRate: number;
  };

  additionalAreas: AdditionalArea[];
  inventory: InventoryItem[];
  jobEquipment: EquipmentItem[];

  customerProfile: CustomerProfile;

  pricingMode: 'level_pricing' | 'sqft_pricing';
  sqFtRates: {
    wall: number;
    roof: number;
  };

  expenses: EstimateExpenses;

  jobNotes: string;
  scheduledDate: string;
  invoiceDate: string;
  invoiceNumber: string;
  paymentTerms: string;
}
