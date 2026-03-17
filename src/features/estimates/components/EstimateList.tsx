import React, { useState } from 'react';
import { PlusCircle, ClipboardList } from 'lucide-react';
import { EstimateFilters } from './EstimateFilters';
import { EstimateListItem } from './EstimateListItem';
import { useEstimates } from '../hooks/useEstimates';
import { useEstimateActions } from '../hooks/useEstimateActions';
import type { EstimateFilter } from '../types/estimates.types';
import type { EstimateRecord } from '../../../../types';

interface EstimateListProps {
  onEditEstimate: (rec: EstimateRecord) => void;
  onNewEstimate: () => void;
}

const DEFAULT_FILTER: EstimateFilter = { status: 'all', search: '' };

export function EstimateList({ onEditEstimate, onNewEstimate }: EstimateListProps) {
  const [filter, setFilter] = useState<EstimateFilter>(DEFAULT_FILTER);
  const { estimates, summary, totalCount, filteredCount } = useEstimates(filter);
  const { deleteEstimate } = useEstimateActions();

  const counts = {
    all: totalCount,
    draft: summary.drafts,
    workOrders: summary.workOrders,
    invoiced: summary.invoiced,
    paid: summary.paid,
  };

  return (
    <div className="space-y-4">
      <EstimateFilters filter={filter} onChange={setFilter} counts={counts} />

      {estimates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <ClipboardList size={40} className="text-slate-600" />
          <div>
            <p className="text-slate-400 font-medium">No estimates found</p>
            <p className="text-slate-500 text-sm mt-1">
              {totalCount === 0
                ? 'Get started by creating your first estimate.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
          {totalCount === 0 && (
            <button
              onClick={onNewEstimate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              New Estimate
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {estimates.map((record) => (
            <EstimateListItem
              key={record.id}
              record={record}
              onEdit={() => onEditEstimate(record)}
              onDelete={() => deleteEstimate(record.id)}
            />
          ))}
          {filteredCount < totalCount && (
            <p className="text-center text-xs text-slate-500 pt-2">
              Showing {filteredCount} of {totalCount} estimates
            </p>
          )}
        </div>
      )}
    </div>
  );
}
