// ---------------------------------------------------------------------------
// useLaborCalc — labor cost and misc expenses.
// Ports step 9 from utils/calculatorHelpers.ts calculateResults().
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { CalculatorFormState } from '../types/calculator.types';

// ── Return type ──────────────────────────────────────────────────────────────

export interface LaborCalcResult {
  activeLaborRate: number;
  laborCost: number;
  miscExpenses: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLaborCalc(
  fields: Pick<CalculatorFormState, 'expenses' | 'costs'>,
): LaborCalcResult {
  return useMemo(() => {
    const { expenses, costs } = fields;

    // expenses.laborRate overrides the global costs.laborRate when set
    const activeLaborRate =
      expenses.laborRate !== undefined && expenses.laborRate !== null
        ? expenses.laborRate
        : costs.laborRate || 0;

    const laborCost = (expenses.manHours || 0) * activeLaborRate;

    const miscExpenses =
      (expenses.tripCharge || 0) +
      (expenses.fuelSurcharge || 0) +
      (expenses.other?.amount || 0);

    return { activeLaborRate, laborCost, miscExpenses };
  }, [fields.expenses, fields.costs]);
}
