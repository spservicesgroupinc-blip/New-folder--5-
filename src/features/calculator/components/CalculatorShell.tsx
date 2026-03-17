// ---------------------------------------------------------------------------
// CalculatorShell — main shell. Renders the stepper + the active step panel.
// ---------------------------------------------------------------------------

import React from 'react';
import { useCalculatorSteps } from '../hooks/useCalculatorSteps';
import { CalculatorStepper } from './CalculatorStepper';
import { StepId } from '../types/steps.types';
import { Step1_BuildingDimensions } from './steps/Step1_BuildingDimensions';
import { Step2_FoamSpecs } from './steps/Step2_FoamSpecs';

interface CalculatorShellProps {
  onSave: () => void;
}

// Placeholder panel used for steps not yet implemented.
function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
        <span className="text-2xl">🔧</span>
      </div>
      <h3 className="text-slate-200 font-semibold text-lg">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
      <p className="text-xs text-slate-600 mt-2">Coming in next task</p>
    </div>
  );
}

export function CalculatorShell({ onSave }: CalculatorShellProps) {
  // Single steps instance — shared with CalculatorStepper via prop
  const stepsApi = useCalculatorSteps();
  const { currentStep, steps, currentStepIndex } = stepsApi;
  const stepConfig = steps[currentStepIndex];

  function renderStep() {
    switch (currentStep) {
      case StepId.DIMENSIONS:
        return <Step1_BuildingDimensions />;
      case StepId.FOAM_SPECS:
        return <Step2_FoamSpecs />;
      case StepId.MATERIALS:
        return (
          <PlaceholderPanel
            title={stepConfig.label}
            description={stepConfig.description}
          />
        );
      case StepId.EQUIPMENT:
        return (
          <PlaceholderPanel
            title={stepConfig.label}
            description={stepConfig.description}
          />
        );
      case StepId.LABOR:
        return (
          <PlaceholderPanel
            title={stepConfig.label}
            description={stepConfig.description}
          />
        );
      case StepId.PRICING:
        return (
          <PlaceholderPanel
            title={stepConfig.label}
            description={stepConfig.description}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Step content */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <CalculatorStepper stepsApi={stepsApi} onSave={onSave} />
      </div>
    </div>
  );
}
