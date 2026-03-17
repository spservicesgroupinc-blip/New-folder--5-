import React from 'react';
import { LogOut, HardHat } from 'lucide-react';
import { Button } from '../../../shared/components/ui';
import { useCalculator } from '../../../../context/CalculatorContext';
import { useCrewRole } from '../hooks/useCrewRole';
import { useCrewJobs } from '../hooks/useCrewJobs';
import { CrewJobCard } from './CrewJobCard';
import { CrewTimeEntry } from './CrewTimeEntry';
import { CrewMaterialsList } from './CrewMaterialsList';
import { CrewEquipmentChecklist } from './CrewEquipmentChecklist';

interface CrewDashboardShellProps {
  onLogout: () => void;
}

export function CrewDashboardShell({ onLogout }: CrewDashboardShellProps) {
  const { state } = useCalculator();
  const { username } = useCrewRole();
  const { currentJob, activeJobs } = useCrewJobs();

  const currentEstimate = currentJob
    ? state.appData.savedEstimates.find((e) => e.id === currentJob.estimateId)
    : undefined;

  const equipment = currentEstimate?.materials.equipment ?? [];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardHat size={20} className="text-amber-400" />
          <span className="text-white font-semibold text-sm">Crew Portal</span>
          {username && (
            <span className="text-slate-400 text-xs ml-1">· {username}</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut size={14} />
          Logout
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {currentJob ? (
          <>
            <CrewJobCard job={currentJob} estimate={currentEstimate} />
            <CrewTimeEntry jobId={currentJob.estimateId} />
            <CrewMaterialsList estimate={currentEstimate} />
            {equipment.length > 0 && (
              <CrewEquipmentChecklist equipment={equipment} />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <HardHat size={40} className="text-slate-600" />
            <p className="text-slate-400 text-sm">
              {activeJobs.length === 0
                ? 'No active jobs assigned to you right now.'
                : 'No current job found.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
