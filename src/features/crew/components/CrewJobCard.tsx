import React from 'react';
import { MapPin, Calendar, User, Package } from 'lucide-react';
import { Badge, Card } from '../../../shared/components/ui';
import { formatDate } from '../../../shared/utils/formatters';
import { EstimateRecord } from '../../../../types';
import { JobAssignment } from '../types/crew.types';

interface CrewJobCardProps {
  job: JobAssignment;
  estimate: EstimateRecord | undefined;
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_VARIANT: Record<JobAssignment['status'], BadgeVariant> = {
  'Not Started': 'default',
  'In Progress': 'warning',
  Completed: 'success',
};

export function CrewJobCard({ job, estimate }: CrewJobCardProps) {
  const openCellSets = estimate?.materials.openCellSets ?? 0;
  const closedCellSets = estimate?.materials.closedCellSets ?? 0;
  const inventoryCount = estimate?.materials.inventory.length ?? 0;

  return (
    <Card className="bg-slate-800 border border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <User size={16} className="text-slate-400 shrink-0" />
          <span className="text-white font-semibold truncate">{job.customerName}</span>
        </div>
        <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
      </div>

      {job.address && (
        <div className="flex items-start gap-2 text-slate-300 text-sm">
          <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <span>{job.address}</span>
        </div>
      )}

      {job.scheduledDate && (
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span>{formatDate(job.scheduledDate)}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-slate-400 text-xs pt-1 border-t border-slate-700">
        <Package size={12} className="shrink-0" />
        <span>
          {openCellSets > 0 ? `${openCellSets} open-cell set${openCellSets !== 1 ? 's' : ''}` : ''}
          {openCellSets > 0 && closedCellSets > 0 ? ' · ' : ''}
          {closedCellSets > 0 ? `${closedCellSets} closed-cell set${closedCellSets !== 1 ? 's' : ''}` : ''}
          {(openCellSets === 0 && closedCellSets === 0) ? 'No foam sets' : ''}
          {inventoryCount > 0 ? ` · ${inventoryCount} inventory item${inventoryCount !== 1 ? 's' : ''}` : ''}
        </span>
      </div>
    </Card>
  );
}
