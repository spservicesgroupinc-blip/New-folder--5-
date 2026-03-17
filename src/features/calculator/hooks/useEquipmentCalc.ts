// ---------------------------------------------------------------------------
// useEquipmentCalc — derived values for the equipment step.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import type { EquipmentItem } from '../../../../types';
import { CalculatorFormState } from '../types/calculator.types';

// ── Return type ──────────────────────────────────────────────────────────────

export interface EquipmentCalcResult {
  equipmentCount: number;
  equipmentList: EquipmentItem[];
  availableCount: number;
  inUseCount: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useEquipmentCalc(
  fields: Pick<CalculatorFormState, 'jobEquipment'>,
): EquipmentCalcResult {
  return useMemo(() => {
    const { jobEquipment } = fields;

    const equipmentCount = jobEquipment.length;

    const availableCount = jobEquipment.filter(
      (e) => e.status === 'Available',
    ).length;

    const inUseCount = jobEquipment.filter(
      (e) => e.status === 'In Use',
    ).length;

    return {
      equipmentCount,
      equipmentList: jobEquipment,
      availableCount,
      inUseCount,
    };
  }, [fields.jobEquipment]);
}
