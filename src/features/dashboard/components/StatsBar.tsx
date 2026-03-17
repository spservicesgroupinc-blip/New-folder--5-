import React from 'react';
import { Briefcase, DollarSign, ClipboardCheck, FileText } from 'lucide-react';
import { StatsTile } from './StatsTile';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatCurrency } from '../../../shared/utils/formatters';

export function StatsBar() {
  const { totalEstimates, totalRevenue, pendingWorkOrders, draftCount } =
    useDashboardStats();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatsTile
        label="Total Jobs"
        value={totalEstimates}
        icon={<Briefcase size={18} />}
        colorClass="text-blue-400"
      />
      <StatsTile
        label="Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<DollarSign size={18} />}
        colorClass="text-emerald-400"
      />
      <StatsTile
        label="Work Orders"
        value={pendingWorkOrders}
        icon={<ClipboardCheck size={18} />}
        colorClass="text-amber-400"
      />
      <StatsTile
        label="Drafts"
        value={draftCount}
        icon={<FileText size={18} />}
        colorClass="text-slate-400"
      />
    </div>
  );
}
