import React from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Button, Card } from '../../../shared/components/ui';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { TimeEntry } from '../types/crew.types';

interface CrewTimeEntryProps {
  jobId: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function duration(entry: TimeEntry): string {
  if (!entry.endTime) return '—';
  const ms = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
  const totalSeconds = Math.floor(ms / 1000);
  return formatElapsed(totalSeconds);
}

export function CrewTimeEntry({ jobId }: CrewTimeEntryProps) {
  const { isClockedIn, clockInTime, elapsedSeconds, clockIn, clockOut, timeEntries } =
    useTimeTracking(jobId);

  const todayEntries = timeEntries.filter((e) => {
    const today = new Date().toDateString();
    return new Date(e.startTime).toDateString() === today;
  });

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-slate-800 border border-slate-700 p-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock size={14} />
          <span>{isClockedIn ? 'Clocked In' : 'Not Clocked In'}</span>
        </div>

        {isClockedIn && (
          <div className="text-3xl font-mono text-white tracking-widest">
            {formatElapsed(elapsedSeconds)}
          </div>
        )}

        {isClockedIn && clockInTime && (
          <p className="text-xs text-slate-400">Started at {formatTime(clockInTime)}</p>
        )}

        <div className="flex gap-3 mt-1">
          {!isClockedIn ? (
            <Button variant="primary" size="md" onClick={clockIn}>
              <LogIn size={16} />
              Clock In
            </Button>
          ) : (
            <Button variant="danger" size="md" onClick={() => clockOut()}>
              <LogOut size={16} />
              Clock Out
            </Button>
          )}
        </div>
      </Card>

      {todayEntries.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Today's Entries
          </h4>
          {todayEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-slate-300">
                {formatTime(entry.startTime)}
                {entry.endTime ? ` – ${formatTime(entry.endTime)}` : ' (active)'}
              </span>
              <span className="text-slate-400 font-mono text-xs">{duration(entry)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
