// ---------------------------------------------------------------------------
// Step1_BuildingDimensions — renders DimensionsPanel + computed area summary.
// ---------------------------------------------------------------------------

import React from 'react';
import { DimensionsPanel } from '../panels/DimensionsPanel';
import { useCalculatorForm } from '../../hooks/useCalculatorForm';
import { useDimensionCalc } from '../../hooks/useDimensionCalc';

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

export function Step1_BuildingDimensions() {
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

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-700">
        <h2 className="text-base font-semibold text-slate-100">Building Dimensions</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Enter your building measurements to calculate spray area.
        </p>
      </div>

      {/* Form */}
      <DimensionsPanel />

      {/* Computed area summary */}
      <div className="mx-4 mb-4 p-3 rounded-lg bg-slate-900/60 border border-slate-700">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Computed Areas
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          <StatItem
            label="Perimeter"
            value={`${fmt(dims.perimeter)} ft`}
          />
          <StatItem
            label="Pitch"
            value={dims.pitchDisplay}
          />
          {dims.surfaceFactor > 1 && (
            <StatItem
              label="Surface Factor"
              value={`×${dims.surfaceFactor.toFixed(2)} (metal)`}
            />
          )}
          <StatItem
            label="Wall Area"
            value={`${fmt(dims.totalWallArea)} ft²`}
          />
          {dims.gableArea > 0 && (
            <StatItem
              label="Gable Area"
              value={`${fmt(dims.gableArea)} ft²`}
            />
          )}
          <StatItem
            label="Roof Area"
            value={`${fmt(dims.totalRoofArea)} ft²`}
          />
          <StatItem
            label="Total Area"
            value={`${fmt(dims.totalWallArea + dims.totalRoofArea)} ft²`}
          />
        </div>
      </div>
    </div>
  );
}
