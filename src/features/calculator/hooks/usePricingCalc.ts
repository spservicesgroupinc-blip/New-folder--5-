// ---------------------------------------------------------------------------
// usePricingCalc — total cost / value for both pricing modes.
// Ports step 10 from utils/calculatorHelpers.ts calculateResults().
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { CalculatorFormState } from '../types/calculator.types';
import type { DimensionCalcResult } from './useDimensionCalc';
import type { MaterialCalcResult } from './useMaterialCalc';
import type { LaborCalcResult } from './useLaborCalc';

// ── Return type ──────────────────────────────────────────────────────────────

export interface PricingCalcResult {
  /** Revenue / price charged to the customer. */
  totalCost: number;
  /**
   * Total value used when saving an estimate.
   * For level_pricing this equals totalCost.
   * For sqft_pricing this is also totalCost (sqft is the revenue model).
   */
  totalValue: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePricingCalc(
  dims: Pick<DimensionCalcResult, 'totalWallArea' | 'totalRoofArea'>,
  materials: MaterialCalcResult,
  labor: LaborCalcResult,
  fields: Pick<CalculatorFormState, 'pricingMode' | 'sqFtRates'>,
): PricingCalcResult {
  return useMemo(() => {
    const { pricingMode, sqFtRates } = fields;
    const { totalWallArea, totalRoofArea } = dims;
    const { materialCost, inventoryCost } = materials;
    const { laborCost, miscExpenses } = labor;

    let totalCost = 0;

    if (pricingMode === 'sqft_pricing') {
      const wallRevenue = totalWallArea * (sqFtRates?.wall || 0);
      const roofRevenue = totalRoofArea * (sqFtRates?.roof || 0);
      totalCost = wallRevenue + roofRevenue + inventoryCost + miscExpenses;
    } else {
      // level_pricing: material COGS + labor + misc
      totalCost = materialCost + laborCost + miscExpenses;
    }

    return {
      totalCost,
      totalValue: totalCost,
    };
  }, [
    dims.totalWallArea,
    dims.totalRoofArea,
    materials.materialCost,
    materials.inventoryCost,
    labor.laborCost,
    labor.miscExpenses,
    fields.pricingMode,
    fields.sqFtRates,
  ]);
}
