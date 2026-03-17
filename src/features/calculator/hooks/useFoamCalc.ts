// ---------------------------------------------------------------------------
// useFoamCalc — board-feet, sets, and stroke counts from geometry + form state.
// Ports steps 4-7 from utils/calculatorHelpers.ts calculateResults().
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { FoamType, CalculatorFormState } from '../types/calculator.types';
import type { DimensionCalcResult } from './useDimensionCalc';

// ── Return type ──────────────────────────────────────────────────────────────

export interface FoamCalcResult {
  wallBdFt: number;
  roofBdFt: number;
  totalOpenCellBdFt: number;
  totalClosedCellBdFt: number;
  openCellSets: number;
  closedCellSets: number;
  openCellStrokes: number;
  closedCellStrokes: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useFoamCalc(
  dims: DimensionCalcResult,
  fields: Pick<CalculatorFormState, 'wallSettings' | 'roofSettings' | 'yields'>,
): FoamCalcResult {
  return useMemo(() => {
    const { wallSettings, roofSettings, yields } = fields;
    const { totalWallArea, totalRoofArea } = dims;

    // Step 4 — Board feet (volume × waste factor)
    const wallVolume = totalWallArea * wallSettings.thickness;
    const roofVolume = totalRoofArea * roofSettings.thickness;

    const wallBdFt = wallVolume * (1 + wallSettings.wastePercentage / 100);
    const roofBdFt = roofVolume * (1 + roofSettings.wastePercentage / 100);

    // Step 5 — Aggregate by foam type
    let totalOpenCellBdFt = 0;
    let totalClosedCellBdFt = 0;

    if (wallSettings.type === FoamType.OPEN_CELL) {
      totalOpenCellBdFt += wallBdFt;
    } else {
      totalClosedCellBdFt += wallBdFt;
    }

    if (roofSettings.type === FoamType.OPEN_CELL) {
      totalOpenCellBdFt += roofBdFt;
    } else {
      totalClosedCellBdFt += roofBdFt;
    }

    // Step 6 — Sets required
    const openCellSets =
      yields.openCell > 0 ? totalOpenCellBdFt / yields.openCell : 0;
    const closedCellSets =
      yields.closedCell > 0 ? totalClosedCellBdFt / yields.closedCell : 0;

    // Step 7 — Stroke counts
    const openCellStrokes = openCellSets * (yields.openCellStrokes || 6600);
    const closedCellStrokes = closedCellSets * (yields.closedCellStrokes || 6600);

    return {
      wallBdFt,
      roofBdFt,
      totalOpenCellBdFt,
      totalClosedCellBdFt,
      openCellSets,
      closedCellSets,
      openCellStrokes,
      closedCellStrokes,
    };
  }, [
    dims.totalWallArea,
    dims.totalRoofArea,
    fields.wallSettings,
    fields.roofSettings,
    fields.yields,
  ]);
}
