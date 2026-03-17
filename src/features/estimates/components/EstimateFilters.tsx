import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../../shared/utils/classNames';
import type { EstimateFilter, EstimateStatus } from '../types/estimates.types';

interface EstimateFiltersProps {
  filter: EstimateFilter;
  onChange: (f: EstimateFilter) => void;
  counts?: {
    all: number;
    draft: number;
    workOrders: number;
    invoiced: number;
    paid: number;
  };
}

type TabOption = { value: EstimateFilter['status']; label: string; countKey?: keyof NonNullable<EstimateFiltersProps['counts']> };

const TABS: TabOption[] = [
  { value: 'all', label: 'All', countKey: 'all' },
  { value: 'Draft', label: 'Drafts', countKey: 'draft' },
  { value: 'Work Order', label: 'Work Orders', countKey: 'workOrders' },
  { value: 'Invoiced', label: 'Invoiced', countKey: 'invoiced' },
  { value: 'Paid', label: 'Paid', countKey: 'paid' },
];

export function EstimateFilters({ filter, onChange, counts }: EstimateFiltersProps) {
  const setStatus = (status: EstimateFilter['status']) =>
    onChange({ ...filter, status });

  const setSearch = (search: string) =>
    onChange({ ...filter, search });

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = counts && tab.countKey ? counts[tab.countKey] : undefined;
          const isActive = filter.status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700',
              )}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by customer, address, invoice…"
          value={filter.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
