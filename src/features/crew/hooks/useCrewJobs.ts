import { useMemo } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import { JobAssignment } from '../types/crew.types';

interface UseCrewJobsResult {
  activeJobs: JobAssignment[];
  completedJobs: JobAssignment[];
  currentJob: JobAssignment | null;
}

function toJobAssignment(
  estimateId: string,
  customerName: string,
  address: string,
  scheduledDate: string,
  executionStatus: string,
): JobAssignment {
  const status: JobAssignment['status'] =
    executionStatus === 'Completed'
      ? 'Completed'
      : executionStatus === 'In Progress'
      ? 'In Progress'
      : 'Not Started';

  return { estimateId, customerName, address, scheduledDate, status };
}

export function useCrewJobs(): UseCrewJobsResult {
  const { state } = useCalculator();
  const { savedEstimates } = state.appData;

  const allAssignments = useMemo(
    () =>
      savedEstimates
        .filter((e) => e.status === 'Work Order')
        .map((e) =>
          toJobAssignment(
            e.id,
            e.customer.name,
            `${e.customer.address}${e.customer.city ? `, ${e.customer.city}` : ''}`,
            e.scheduledDate ?? '',
            e.executionStatus,
          ),
        ),
    [savedEstimates],
  );

  const activeJobs = useMemo(
    () => allAssignments.filter((j) => j.status !== 'Completed'),
    [allAssignments],
  );

  const completedJobs = useMemo(
    () => allAssignments.filter((j) => j.status === 'Completed'),
    [allAssignments],
  );

  const currentJob = activeJobs[0] ?? null;

  return { activeJobs, completedJobs, currentJob };
}
