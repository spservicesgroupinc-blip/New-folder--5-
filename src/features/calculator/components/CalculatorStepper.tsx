// ---------------------------------------------------------------------------
// CalculatorStepper — step indicator dots + Prev / Next / Save buttons.
// Accepts a CalculatorStepsAPI from the parent shell so both components share
// one steps state instance.
// ---------------------------------------------------------------------------

import React from 'react';
import type { CalculatorStepsAPI } from '../hooks/useCalculatorSteps';
import { cn } from '../../../shared/utils/classNames';

interface CalculatorStepperProps {
  stepsApi: CalculatorStepsAPI;
  onSave: () => void;
}

export function CalculatorStepper({ stepsApi, onSave }: CalculatorStepperProps) {
  const {
    currentStepIndex,
    totalSteps,
    steps,
    canGoPrev,
    canGoNext,
    isLast,
    goNext,
    goPrev,
    goTo,
  } = stepsApi;

  return (
    <div className="flex flex-col gap-4">
      {/* Step dots */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => goTo(step.id)}
            title={step.label}
            className={cn(
              'h-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand',
              idx === currentStepIndex
                ? 'w-6 bg-brand'
                : idx < currentStepIndex
                ? 'w-2.5 bg-brand/60'
                : 'w-2.5 bg-slate-600',
            )}
            aria-label={`Go to step: ${step.label}`}
            aria-current={idx === currentStepIndex ? 'step' : undefined}
          />
        ))}
      </div>

      {/* Step label */}
      <p className="text-center text-xs text-slate-400">
        Step {currentStepIndex + 1} of {totalSteps} —{' '}
        <span className="text-slate-200 font-medium">
          {steps[currentStepIndex].label}
        </span>
        <span className="hidden sm:inline text-slate-500">
          {' '}&mdash; {steps[currentStepIndex].description}
        </span>
      </p>

      {/* Navigation buttons */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            canGoPrev
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed',
          )}
        >
          Previous
        </button>

        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-700 text-white hover:bg-green-600 transition-colors"
          >
            Save Estimate
          </button>

          {!isLast && (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                canGoNext
                  ? 'bg-brand text-white hover:bg-brand/80'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed',
              )}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
