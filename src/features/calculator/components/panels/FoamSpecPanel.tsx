// ---------------------------------------------------------------------------
// FoamSpecPanel — foam type selector, thickness, and waste percentage inputs.
// ---------------------------------------------------------------------------

import React from 'react';
import { useCalculatorForm } from '../../hooks/useCalculatorForm';
import { FoamType } from '../../types/calculator.types';
import { Input } from '../../../../shared/components/ui/Input';
import { Select } from '../../../../shared/components/ui/Select';

const FOAM_TYPE_OPTIONS = Object.values(FoamType).map((v) => ({
  value: v,
  label: v,
}));

interface FoamSectionProps {
  sectionLabel: string;
  foamType: FoamType;
  thickness: number;
  wastePercentage: number;
  onTypeChange: (type: FoamType) => void;
  onThicknessChange: (thickness: number) => void;
  onWasteChange: (waste: number) => void;
}

function FoamSection({
  sectionLabel,
  foamType,
  thickness,
  wastePercentage,
  onTypeChange,
  onThicknessChange,
  onWasteChange,
}: FoamSectionProps) {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-slate-750 border border-slate-700">
      <h4 className="text-sm font-semibold text-slate-200">{sectionLabel}</h4>

      <Select
        label="Foam Type"
        options={FOAM_TYPE_OPTIONS}
        value={foamType}
        onChange={(e) => onTypeChange(e.target.value as FoamType)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Thickness (in)"
          type="number"
          min={0.5}
          step={0.5}
          value={thickness}
          onChange={(e) => onThicknessChange(parseFloat(e.target.value) || 0)}
        />

        <Input
          label="Waste %"
          type="number"
          min={0}
          max={50}
          step={1}
          value={wastePercentage}
          onChange={(e) => onWasteChange(parseFloat(e.target.value) || 0)}
          suffix="%"
        />
      </div>
    </div>
  );
}

export function FoamSpecPanel() {
  const form = useCalculatorForm();
  const { fields } = form;

  return (
    <div className="flex flex-col gap-4 p-4">
      <FoamSection
        sectionLabel="Wall Foam"
        foamType={fields.wallSettings.type}
        thickness={fields.wallSettings.thickness}
        wastePercentage={fields.wallSettings.wastePercentage}
        onTypeChange={(type) => form.setWallSettings({ type })}
        onThicknessChange={(thickness) => form.setWallSettings({ thickness })}
        onWasteChange={(wastePercentage) => form.setWallSettings({ wastePercentage })}
      />

      <FoamSection
        sectionLabel="Roof Foam"
        foamType={fields.roofSettings.type}
        thickness={fields.roofSettings.thickness}
        wastePercentage={fields.roofSettings.wastePercentage}
        onTypeChange={(type) => form.setRoofSettings({ type })}
        onThicknessChange={(thickness) => form.setRoofSettings({ thickness })}
        onWasteChange={(wastePercentage) => form.setRoofSettings({ wastePercentage })}
      />

      {/* Yield & cost reference */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Input
          label="Open Cell Yield (BF/set)"
          type="number"
          min={1}
          step={100}
          value={fields.yields.openCell}
          onChange={(e) =>
            // yields live in form state — patch via raw setDimensions isn't right;
            // we update via a direct context dispatch through useCalculatorContext
            // For now, display-only hint until yields gets its own setter.
            void 0
          }
          hint="Read-only — configure in Settings"
          readOnly
        />

        <Input
          label="Closed Cell Yield (BF/set)"
          type="number"
          min={1}
          step={100}
          value={fields.yields.closedCell}
          onChange={() => void 0}
          hint="Read-only — configure in Settings"
          readOnly
        />
      </div>
    </div>
  );
}
