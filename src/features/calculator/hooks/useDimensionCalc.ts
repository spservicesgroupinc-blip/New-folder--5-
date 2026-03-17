// ---------------------------------------------------------------------------
// useDimensionCalc — computes building geometry from form state.
// Ports steps 1-3 from utils/calculatorHelpers.ts calculateResults().
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { CalculationMode, AreaType, CalculatorFormState } from '../types/calculator.types';

// ── Pitch parser (ported from utils/calculatorHelpers.ts) ───────────────────

export function parsePitch(input: string): { factor: number; display: string } {
  if (!input) return { factor: 1, display: 'Flat (1.0)' };

  const cleanInput = input.toLowerCase().trim();

  // "X/12"
  const ratioMatch = cleanInput.match(/^(\d+(\.\d+)?)\/12$/);
  if (ratioMatch) {
    const rise = parseFloat(ratioMatch[1]);
    const factor = Math.sqrt(1 + Math.pow(rise / 12, 2));
    return { factor, display: `${rise}/12 (${factor.toFixed(3)})` };
  }

  // "Xdeg" / "X deg" / "X°"
  const degMatch = cleanInput.match(/^(\d+(\.\d+)?)\s*(deg|degrees?|°)$/);
  if (degMatch) {
    const deg = parseFloat(degMatch[1]);
    const rad = deg * (Math.PI / 180);
    const factor = 1 / Math.cos(rad);
    return { factor, display: `${deg}° (${factor.toFixed(3)})` };
  }

  // Plain number — treat as X/12 pitch (construction standard)
  const numMatch = cleanInput.match(/^(\d+(\.\d+)?)$/);
  if (numMatch) {
    const rise = parseFloat(numMatch[1]);
    const factor = Math.sqrt(1 + Math.pow(rise / 12, 2));
    return { factor, display: `${rise}/12 (${factor.toFixed(3)})` };
  }

  return { factor: 1, display: 'Invalid/Flat (1.0)' };
}

// ── Return type ──────────────────────────────────────────────────────────────

export interface DimensionCalcResult {
  slopeFactor: number;
  pitchDisplay: string;
  surfaceFactor: number;
  perimeter: number;
  baseWallArea: number;
  gableArea: number;
  totalWallArea: number;
  baseRoofArea: number;
  totalRoofArea: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDimensionCalc(
  fields: Pick<
    CalculatorFormState,
    | 'mode'
    | 'length'
    | 'width'
    | 'wallHeight'
    | 'roofPitch'
    | 'includeGables'
    | 'isMetalSurface'
    | 'additionalAreas'
  >,
): DimensionCalcResult {
  return useMemo(() => {
    const {
      mode,
      length,
      width,
      wallHeight,
      roofPitch,
      includeGables,
      isMetalSurface,
      additionalAreas,
    } = fields;

    const pitchData = parsePitch(roofPitch);
    const slopeFactor = pitchData.factor;

    // Metal surface adds 15% to account for corrugation ridges
    const surfaceFactor = isMetalSurface ? 1.15 : 1.0;

    let perimeter = 0;
    let baseWallArea = 0;
    let gableArea = 0;
    let baseRoofArea = 0;

    // Step 1 — Base geometry by mode
    switch (mode) {
      case CalculationMode.BUILDING:
        perimeter = 2 * (length + width);
        baseWallArea = perimeter * wallHeight;
        baseRoofArea = length * width * slopeFactor;
        if (includeGables) {
          const riseOver12 = Math.sqrt(Math.pow(slopeFactor, 2) - 1);
          gableArea = width * ((width / 2) * riseOver12);
        }
        break;

      case CalculationMode.WALLS_ONLY:
        perimeter = length;
        baseWallArea = length * wallHeight;
        baseRoofArea = 0;
        gableArea = 0;
        break;

      case CalculationMode.FLAT_AREA:
        perimeter = 2 * (length + width);
        baseWallArea = 0;
        baseRoofArea = length * width * slopeFactor;
        break;

      case CalculationMode.CUSTOM:
        // Custom mode: areas come entirely from additionalAreas
        break;
    }

    // Step 2 — Additional areas
    const additionalWallArea = additionalAreas
      .filter((a) => a.type === AreaType.WALL)
      .reduce((sum, a) => sum + a.length * a.width, 0);

    const additionalRoofArea = additionalAreas
      .filter((a) => a.type === AreaType.ROOF)
      .reduce((sum, a) => sum + a.length * a.width, 0);

    // Step 3 — Totals with surface factor
    const totalWallArea = (baseWallArea + gableArea + additionalWallArea) * surfaceFactor;
    const totalRoofArea = (baseRoofArea + additionalRoofArea) * surfaceFactor;

    return {
      slopeFactor,
      pitchDisplay: pitchData.display,
      surfaceFactor,
      perimeter,
      baseWallArea,
      gableArea,
      totalWallArea,
      baseRoofArea,
      totalRoofArea,
    };
  }, [
    fields.mode,
    fields.length,
    fields.width,
    fields.wallHeight,
    fields.roofPitch,
    fields.includeGables,
    fields.isMetalSurface,
    fields.additionalAreas,
  ]);
}
