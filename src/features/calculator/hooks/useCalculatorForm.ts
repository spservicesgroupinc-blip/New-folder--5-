// ---------------------------------------------------------------------------
// useCalculatorForm — high-level form API wrapping the calculator context.
// Consumers call typed setters rather than dispatching raw actions.
// ---------------------------------------------------------------------------

import { useCalculatorContext } from '../context/CalculatorContext';
import { calculatorActionCreators } from '../context/calculatorActions';
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

export type DimensionUpdate = Partial<{
  length: number;
  width: number;
  wallHeight: number;
  roofPitch: string;
  includeGables: boolean;
  isMetalSurface: boolean;
}>;

export interface CalculatorFormAPI {
  fields: CalculatorFormState;

  setMode(mode: CalculationMode): void;
  setDimensions(dims: DimensionUpdate): void;
  setWallSettings(settings: Partial<FoamSettings>): void;
  setRoofSettings(settings: Partial<FoamSettings>): void;
  setInventory(items: InventoryItem[]): void;
  setJobEquipment(items: EquipmentItem[]): void;
  setExpenses(expenses: Partial<EstimateExpenses>): void;
  setPricingMode(mode: 'level_pricing' | 'sqft_pricing'): void;
  setSqFtRates(rates: { wall: number; roof: number }): void;
  setAdditionalAreas(areas: AdditionalArea[]): void;
  setCustomer(customer: CustomerProfile): void;
  setJobNotes(notes: string): void;
  setScheduledDate(date: string): void;
  reset(): void;
}

export function useCalculatorForm(): CalculatorFormAPI {
  const { state, dispatch } = useCalculatorContext();
  const ac = calculatorActionCreators;

  return {
    fields: state,

    setMode: (mode) => dispatch(ac.setMode(mode)),
    setDimensions: (dims) => dispatch(ac.setDimensions(dims)),
    setWallSettings: (settings) => dispatch(ac.setWallSettings(settings)),
    setRoofSettings: (settings) => dispatch(ac.setRoofSettings(settings)),
    setInventory: (items) => dispatch(ac.setInventory(items)),
    setJobEquipment: (items) => dispatch(ac.setJobEquipment(items)),
    setExpenses: (expenses) => dispatch(ac.setExpenses(expenses)),
    setPricingMode: (mode) => dispatch(ac.setPricingMode(mode)),
    setSqFtRates: (rates) => dispatch(ac.setSqFtRates(rates)),
    setAdditionalAreas: (areas) => dispatch(ac.setAdditionalAreas(areas)),
    setCustomer: (customer) => dispatch(ac.setCustomer(customer)),
    setJobNotes: (notes) => dispatch(ac.setJobNotes(notes)),
    setScheduledDate: (date) => dispatch(ac.setScheduledDate(date)),
    reset: () => dispatch(ac.reset()),
  };
}
