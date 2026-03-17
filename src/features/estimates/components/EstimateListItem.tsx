import React from 'react';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { EstimateStatusBadge } from './EstimateStatusBadge';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import type { EstimateRecord } from '../../../../types';

interface EstimateListItemProps {
  record: EstimateRecord;
  onEdit: () => void;
  onDelete: () => void;
  onViewInvoice?: () => void;
}

export function EstimateListItem({
  record,
  onEdit,
  onDelete,
  onViewInvoice,
}: EstimateListItemProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white truncate">{record.customer.name}</span>
          <EstimateStatusBadge status={record.status} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
          <span>{formatDate(record.date)}</span>
          {record.invoiceNumber && (
            <span className="text-slate-500">{record.invoiceNumber}</span>
          )}
          {record.customer.city && (
            <span className="truncate hidden sm:inline">
              {record.customer.city}
              {record.customer.state ? `, ${record.customer.state}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-white font-semibold text-sm">
          {formatCurrency(record.totalValue)}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onViewInvoice && (
            <button
              className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
              onClick={onViewInvoice}
              title="View Invoice"
            >
              <FileText size={15} />
            </button>
          )}
          <button
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
