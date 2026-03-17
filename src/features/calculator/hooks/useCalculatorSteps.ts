// ---------------------------------------------------------------------------
// useCalculatorSteps — wizard navigation state for the multi-step calculator.
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react';
import {
  StepId,
  StepConfig,
  CALCULATOR_STEPS,
} from '../types/steps.types';

export interface CalculatorStepsAPI {
  currentStep: StepId;
  currentStepIndex: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goNext(): void;
  goPrev(): void;
  goTo(step: StepId): void;
  isFirst: boolean;
  isLast: boolean;
  steps: StepConfig[];
}

export function useCalculatorSteps(): CalculatorStepsAPI {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSteps = CALCULATOR_STEPS.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  const goNext = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback(
    (step: StepId) => {
      const idx = CALCULATOR_STEPS.findIndex((s) => s.id === step);
      if (idx !== -1) setCurrentStepIndex(idx);
    },
    [],
  );

  return {
    currentStep: CALCULATOR_STEPS[currentStepIndex].id,
    currentStepIndex,
    totalSteps,
    canGoNext: !isLast,
    canGoPrev: !isFirst,
    goNext,
    goPrev,
    goTo,
    isFirst,
    isLast,
    steps: CALCULATOR_STEPS,
  };
}
