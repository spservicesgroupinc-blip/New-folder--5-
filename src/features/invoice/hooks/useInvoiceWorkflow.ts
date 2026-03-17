import { useCallback } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import {
  WorkflowStage,
  STATUS_TO_STAGE,
  STAGE_LABELS,
  STAGE_DESCRIPTIONS,
  NEXT_STATUS,
} from '../types/invoice.types';

interface UseInvoiceWorkflowResult {
  currentStage: WorkflowStage;
  canAdvance: boolean;
  advanceStage: () => void;
  stageLabel: string;
  stageDescription: string;
}

export function useInvoiceWorkflow(estimateId: string | null): UseInvoiceWorkflowResult {
  const { state, dispatch } = useCalculator();

  const estimate = estimateId
    ? state.appData.savedEstimates.find((e) => e.id === estimateId) ?? null
    : null;

  const currentStage: WorkflowStage =
    estimate ? (STATUS_TO_STAGE[estimate.status] ?? 'estimate') : 'estimate';

  const canAdvance = currentStage !== 'paid';

  const advanceStage = useCallback(() => {
    if (!estimate || !canAdvance) return;

    const nextStatus = NEXT_STATUS[currentStage] as
      | 'Draft'
      | 'Work Order'
      | 'Invoiced'
      | 'Paid'
      | 'Archived';

    dispatch({
      type: 'UPDATE_SAVED_ESTIMATE',
      payload: { ...estimate, status: nextStatus },
    });
  }, [estimate, canAdvance, currentStage, dispatch]);

  return {
    currentStage,
    canAdvance,
    advanceStage,
    stageLabel: STAGE_LABELS[currentStage],
    stageDescription: STAGE_DESCRIPTIONS[currentStage],
  };
}
