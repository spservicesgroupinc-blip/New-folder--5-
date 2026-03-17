// ---------------------------------------------------------------------------
// DimensionsPanel — inputs for building dimensions and mode selection.
// ---------------------------------------------------------------------------

import React from 'react';
import { useCalculatorForm } from '../../hooks/useCalculatorForm';
import { CalculationMode, AreaType, AdditionalArea } from '../../types/calculator.types';
import { Input } from '../../../../shared/components/ui/Input';
import { Select } from '../../../../shared/components/ui/Select';

const CALCULATION_MODE_OPTIONS = Object.values(CalculationMode).map((v) => ({
  value: v,
  label: v,
}));

const AREA_TYPE_OPTIONS = [
  { value: AreaType.WALL, label: 'Wall' },
  { value: AreaType.ROOF, label: 'Roof' },
];

export function DimensionsPanel() {
  const form = useCalculatorForm();
  const { fields } = form;

  function handleAddArea() {
    form.setAdditionalAreas([
      ...fields.additionalAreas,
      { type: AreaType.WALL, length: 0, width: 0 },
    ]);
  }

  function handleRemoveArea(index: number) {
    form.setAdditionalAreas(fields.additionalAreas.filter((_, i) => i !== index));
  }

  function handleAreaChange(
    index: number,
    key: keyof AdditionalArea,
    value: string,
  ) {
    const updated = fields.additionalAreas.map((area, i) => {
      if (i !== index) return area;
      if (key === 'type') {
        return { ...area, type: value as AreaType };
      }
      return { ...area, [key]: parseFloat(value) || 0 };
    });
    form.setAdditionalAreas(updated);
  }

  const showWallHeight =
    fields.mode === CalculationMode.BUILDING ||
    fields.mode === CalculationMode.WALLS_ONLY;

  const showRoofPitch =
    fields.mode === CalculationMode.BUILDING ||
    fields.mode === CalculationMode.FLAT_AREA;

  const showWidth =
    fields.mode !== CalculationMode.WALLS_ONLY;

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Calculation Mode */}
      <Select
        label="Calculation Mode"
        options={CALCULATION_MODE_OPTIONS}
        value={fields.mode}
        onChange={(e) => form.setMode(e.target.value as CalculationMode)}
      />

      {/* Primary dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={fields.mode === CalculationMode.WALLS_ONLY ? 'Linear Feet' : 'Length (ft)'}
          type="number"
          min={0}
          step="0.1"
          value={fields.length}
          onChange={(e) =>
            form.setDimensions({ length: parseFloat(e.target.value) || 0 })
          }
        />

        {showWidth && (
          <Input
            label="Width (ft)"
            type="number"
            min={0}
            step="0.1"
            value={fields.width}
            onChange={(e) =>
              form.setDimensions({ width: parseFloat(e.target.value) || 0 })
            }
          />
        )}

        {showWallHeight && (
          <Input
            label="Wall Height (ft)"
            type="number"
            min={0}
            step="0.5"
            value={fields.wallHeight}
            onChange={(e) =>
              form.setDimensions({ wallHeight: parseFloat(e.target.value) || 0 })
            }
          />
        )}

        {showRoofPitch && (
          <Input
            label="Roof Pitch"
            type="text"
            placeholder="e.g. 4/12 or 20deg"
            value={fields.roofPitch}
            onChange={(e) =>
              form.setDimensions({ roofPitch: e.target.value })
            }
          />
        )}
      </div>

      {/* Toggles */}
      {fields.mode === CalculationMode.BUILDING && (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fields.includeGables}
              onChange={(e) => form.setDimensions({ includeGables: e.target.checked })}
              className="w-4 h-4 accent-brand rounded"
            />
            <span className="text-sm text-slate-300">Include Gable Ends</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fields.isMetalSurface}
              onChange={(e) => form.setDimensions({ isMetalSurface: e.target.checked })}
              className="w-4 h-4 accent-brand rounded"
            />
            <span className="text-sm text-slate-300">
              Metal Surface (+15% corrugation)
            </span>
          </label>
        </div>
      )}

      {/* Additional areas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-300">Additional Areas</h4>
          <button
            onClick={handleAddArea}
            className="text-xs px-2 py-1 rounded-md bg-slate-700 text-brand hover:bg-slate-600 transition-colors"
          >
            + Add Area
          </button>
        </div>

        {fields.additionalAreas.length === 0 && (
          <p className="text-xs text-slate-500 italic">No additional areas added.</p>
        )}

        {fields.additionalAreas.map((area, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end"
          >
            <Select
              label={idx === 0 ? 'Type' : undefined}
              options={AREA_TYPE_OPTIONS}
              value={area.type}
              onChange={(e) => handleAreaChange(idx, 'type', e.target.value)}
            />
            <Input
              label={idx === 0 ? 'Length (ft)' : undefined}
              type="number"
              min={0}
              step="0.1"
              value={area.length}
              onChange={(e) => handleAreaChange(idx, 'length', e.target.value)}
            />
            <Input
              label={idx === 0 ? 'Width (ft)' : undefined}
              type="number"
              min={0}
              step="0.1"
              value={area.width}
              onChange={(e) => handleAreaChange(idx, 'width', e.target.value)}
            />
            <button
              onClick={() => handleRemoveArea(idx)}
              className="pb-0.5 text-red-400 hover:text-red-300 text-lg leading-none"
              aria-label="Remove area"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
