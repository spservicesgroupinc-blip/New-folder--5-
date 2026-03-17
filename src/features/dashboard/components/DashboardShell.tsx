import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { StatsBar } from './StatsBar';
import { AlertsBanner } from './AlertsBanner';
import { EstimateList } from '../../estimates/components/EstimateList';
import type { EstimateRecord } from '../../../../types';

interface DashboardShellProps {
  onEditEstimate: (rec: EstimateRecord) => void;
  onNewEstimate: () => void;
}

export function DashboardShell({ onEditEstimate, onNewEstimate }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeader title="Dashboard" onNewEstimate={onNewEstimate} />
        <StatsBar />
        <AlertsBanner />
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-3">Estimates</h2>
          <EstimateList
            onEditEstimate={onEditEstimate}
            onNewEstimate={onNewEstimate}
          />
        </div>
      </div>
    </div>
  );
}
