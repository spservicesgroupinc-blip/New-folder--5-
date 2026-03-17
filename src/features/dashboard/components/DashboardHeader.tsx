import React from 'react';
import { PlusCircle } from 'lucide-react';
import { formatDate } from '../../../shared/utils/formatters';

interface DashboardHeaderProps {
  title: string;
  onNewEstimate: () => void;
}

export function DashboardHeader({ title, onNewEstimate }: DashboardHeaderProps) {
  const today = formatDate(new Date().toISOString());

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-sm text-slate-400 mt-0.5">{today}</p>
      </div>
      <button
        onClick={onNewEstimate}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
      >
        <PlusCircle size={16} />
        <span className="hidden sm:inline">New Estimate</span>
        <span className="sm:hidden">New</span>
      </button>
    </div>
  );
}
