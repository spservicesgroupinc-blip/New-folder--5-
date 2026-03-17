// ---------------------------------------------------------------------------
// Step2_FoamSpecs — renders FoamSpecPanel + drum/set count summary.
// ---------------------------------------------------------------------------

import React from 'react';
import { FoamSpecPanel } from '../panels/FoamSpecPanel';
import { useCalculatorForm } from '../../hooks/useCalculatorForm';
import { useDimensionCalc } from '../../hooks/useDimensionCalc';
import { useFoamCalc } from '../../hooks/useFoamCalc';

function StatItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-slate-100">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export function Step2_FoamSpecs() {
  const { fields } = useCalculatorForm();

  const dims = useDimensionCalc({
    mode: fields.mode,
    length: fields.length,
    width: fields.width,
    wallHeight: fields.wallHeight,
    roofPitch: fields.roofPitch,
    includeGables: fields.includeGables,
    isMetalSurface: fields.isMetalSurface,
    additionalAreas: fields.additionalAreas,
  });

  const foam = useFoamCalc(dims, {
    wallSettings: fields.wallSettings,
    roofSettings: fields.roofSettings,
    yields: fields.yields,
  });

  const hasOpenCell = foam.totalOpenCellBdFt > 0;
  const hasClosedCell = foam.totalClosedCellBdFt > 0;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-700">
        <h2 className="text-base font-semibold text-slate-100">Foam Specifications</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select foam type, thickness, and waste percentage for walls and roof.
        </p>
      </div>

      {/* Form */}
      <FoamSpecPanel />

      {/* Foam usage summary */}
      <div className="mx-4 mb-4 p-3 rounded-lg bg-slate-900/60 border border-slate-700">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Material Requirements
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          {/* Board feet */}
          <StatItem
            label="Wall BF"
            value={`${fmt(foam.wallBdFt)} BF`}
          />
          <StatItem
            label="Roof BF"
            value={`${fmt(foam.roofBdFt)} BF`}
          />

          {/* Sets by foam type */}
          {hasOpenCell && (
            <StatItem
              label="Open Cell Sets"
              value={fmt(foam.openCellSets)}
              sub={`${fmt(foam.totalOpenCellBdFt)} BF`}
            />
          )}
          {hasClosedCell && (
            <StatItem
              label="Closed Cell Sets"
              value={fmt(foam.closedCellSets)}
              sub={`${fmt(foam.totalClosedCellBdFt)} BF`}
            />
          )}

          {/* Stroke counts */}
          {hasOpenCell && foam.openCellStrokes > 0 && (
            <StatItem
              label="OC Strokes"
              value={fmt(foam.openCellStrokes, 0)}
            />
          )}
          {hasClosedCell && foam.closedCellStrokes > 0 && (
            <StatItem
              label="CC Strokes"
              value={fmt(foam.closedCellStrokes, 0)}
            />
          )}
        </div>

        {!hasOpenCell && !hasClosedCell && (
          <p className="text-xs text-slate-500 italic">
            Enter dimensions on Step 1 to see material requirements.
          </p>
        )}
      </div>
    </div>
  );
}
