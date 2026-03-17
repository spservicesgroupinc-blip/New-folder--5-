import React from 'react';
import { Package, FlaskConical, Box } from 'lucide-react';
import { Card } from '../../../shared/components/ui';
import { EstimateRecord } from '../../../../types';

interface CrewMaterialsListProps {
  estimate: EstimateRecord | undefined;
}

export function CrewMaterialsList({ estimate }: CrewMaterialsListProps) {
  if (!estimate) {
    return (
      <Card className="bg-slate-800 border border-slate-700 p-4">
        <p className="text-slate-400 text-sm text-center">No estimate data available.</p>
      </Card>
    );
  }

  const { openCellSets, closedCellSets, inventory } = estimate.materials;
  const hasContent = openCellSets > 0 || closedCellSets > 0 || inventory.length > 0;

  return (
    <Card className="bg-slate-800 border border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Package size={14} className="text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-300">Materials Needed</h4>
      </div>

      {!hasContent && (
        <p className="text-slate-400 text-sm">No materials listed for this job.</p>
      )}

      {openCellSets > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <FlaskConical size={14} className="text-blue-400 shrink-0" />
            <span>Open Cell Sets</span>
          </div>
          <span className="text-white font-medium">{openCellSets}</span>
        </div>
      )}

      {closedCellSets > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <FlaskConical size={14} className="text-emerald-400 shrink-0" />
            <span>Closed Cell Sets</span>
          </div>
          <span className="text-white font-medium">{closedCellSets}</span>
        </div>
      )}

      {inventory.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
        >
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Box size={14} className="text-slate-400 shrink-0" />
            <span>{item.name}</span>
          </div>
          <span className="text-white font-medium text-sm">
            {item.quantity} {item.unit}
          </span>
        </div>
      ))}
    </Card>
  );
}
