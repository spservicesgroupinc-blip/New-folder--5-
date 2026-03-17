// ---------------------------------------------------------------------------
// useMaterialCalc — chemical and inventory costs.
// Ports step 8 from utils/calculatorHelpers.ts calculateResults().
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { CalculatorFormState } from '../types/calculator.types';
import type { FoamCalcResult } from './useFoamCalc';

// ── Return type ──────────────────────────────────────────────────────────────

export interface MaterialCalcResult {
  openCellCost: number;
  closedCellCost: number;
  inventoryCost: number;
  materialCost: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMaterialCalc(
  foam: FoamCalcResult,
  fields: Pick<CalculatorFormState, 'costs' | 'inventory'>,
): MaterialCalcResult {
  return useMemo(() => {
    const { costs, inventory } = fields;

    // Step 8a — Chemical costs
    const openCellCost = foam.openCellSets * costs.openCell;
    const closedCellCost = foam.closedCellSets * costs.closedCell;

    // Step 8b — Inventory / prep items
    let inventoryCost = 0;
    if (inventory && inventory.length > 0) {
      inventory.forEach((item) => {
        if (item.unitCost && item.quantity) {
          inventoryCost += item.quantity * item.unitCost;
        }
      });
    }

    // Total material cost = chemicals + inventory
    const materialCost = openCellCost + closedCellCost + inventoryCost;

    return { openCellCost, closedCellCost, inventoryCost, materialCost };
  }, [
    foam.openCellSets,
    foam.closedCellSets,
    fields.costs,
    fields.inventory,
  ]);
}
