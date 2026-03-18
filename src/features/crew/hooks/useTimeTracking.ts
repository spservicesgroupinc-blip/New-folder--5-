import { useState, useEffect, useCallback, useRef } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import { logCrewTime } from '../../invoice/services/invoiceApi';
import { supabase } from '../../../shared/services/supabase';
import { TimeEntry } from '../types/crew.types';

interface UseTimeTrackingResult {
  isClockedIn: boolean;
  clockInTime: string | null;
  elapsedSeconds: number;
  clockIn: () => void;
  clockOut: () => Promise<void>;
  timeEntries: TimeEntry[];
}

export function useTimeTracking(jobId: string): UseTimeTrackingResult {
  const { state } = useCalculator();
  const session = state.session;

  const estimate = state.appData.savedEstimates.find((e) => e.id === jobId);
  const workOrderUrl = estimate?.workOrderSheetUrl;

  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isClockedIn = clockInTime !== null;

  useEffect(() => {
    if (isClockedIn) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isClockedIn]);

  const clockIn = useCallback(() => {
    if (isClockedIn) return;
    setClockInTime(new Date().toISOString());
  }, [isClockedIn]);

  const clockOut = useCallback(async () => {
    if (!clockInTime) return;
    const endTime = new Date().toISOString();
    const user = session?.username ?? 'unknown';

    if (session?.companyId) {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) {
        await logCrewTime({
          company_id: session.companyId,
          estimate_id: jobId ? parseInt(jobId, 10) : undefined,
          user_id: sbUser.id,
          start_time: clockInTime,
          end_time: endTime,
        });
      }
    }

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      startTime: clockInTime,
      endTime,
      user,
      jobId,
      workOrderUrl,
    };

    setTimeEntries((prev) => [entry, ...prev]);
    setClockInTime(null);
  }, [clockInTime, workOrderUrl, session, jobId]);

  return { isClockedIn, clockInTime, elapsedSeconds, clockIn, clockOut, timeEntries };
}
