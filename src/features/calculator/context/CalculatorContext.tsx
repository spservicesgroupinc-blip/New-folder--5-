// ---------------------------------------------------------------------------
// Calculator feature context — owns CalculatorFormState only.
// Session, savedEstimates, customers, and warehouse live in other features.
// ---------------------------------------------------------------------------

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
} from 'react';

import { CalculatorFormState } from '../types/calculator.types';
import { CalculatorAction } from './calculatorActions';
import {
  calculatorReducer,
  INITIAL_CALCULATOR_STATE,
} from './calculatorReducer';

// ── Context shape ────────────────────────────────────────────────────────────

interface CalculatorContextValue {
  state: CalculatorFormState;
  dispatch: React.Dispatch<CalculatorAction>;
}

const CalculatorContext = createContext<CalculatorContextValue | undefined>(
  undefined,
);

// ── Provider ─────────────────────────────────────────────────────────────────

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    calculatorReducer,
    INITIAL_CALCULATOR_STATE,
  );

  return (
    <CalculatorContext.Provider value={{ state, dispatch }}>
      {children}
    </CalculatorContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCalculatorContext(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error(
      'useCalculatorContext must be used inside <CalculatorProvider>.',
    );
  }
  return ctx;
}
