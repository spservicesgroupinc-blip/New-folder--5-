import React, { ReactNode } from 'react';
import { CalculatorProvider } from '../../context/CalculatorContext';

/**
 * Stacks all React context providers used by the application.
 *
 * Add new providers here as features are built — wrap them around
 * `{children}` in the order that outer providers should supply context to
 * inner ones.
 */
export const AppProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <CalculatorProvider>
    {children}
  </CalculatorProvider>
);
