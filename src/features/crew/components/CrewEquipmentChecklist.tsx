import React, { useState } from 'react';
import { Wrench, CheckSquare, Square } from 'lucide-react';
import { Card, Badge } from '../../../shared/components/ui';
import { EquipmentItem } from '../../../../types';

interface CrewEquipmentChecklistProps {
  equipment: EquipmentItem[];
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_VARIANT: Record<EquipmentItem['status'], BadgeVariant> = {
  Available: 'success',
  'In Use': 'warning',
  Maintenance: 'error',
  Lost: 'error',
};

export function CrewEquipmentChecklist({ equipment }: CrewEquipmentChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <Card className="bg-slate-800 border border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-300">Equipment Checklist</h4>
        </div>
        {equipment.length > 0 && (
          <span className="text-xs text-slate-400">
            {checkedCount}/{equipment.length} verified
          </span>
        )}
      </div>

      {equipment.length === 0 ? (
        <p className="text-slate-400 text-sm">No equipment assigned to this job.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {equipment.map((item) => {
            const isChecked = checked[item.id] ?? false;
            return (
              <li
                key={item.id}
                onClick={() => toggle(item.id)}
                className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isChecked ? (
                    <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Square size={16} className="text-slate-500 shrink-0" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      isChecked ? 'line-through text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
