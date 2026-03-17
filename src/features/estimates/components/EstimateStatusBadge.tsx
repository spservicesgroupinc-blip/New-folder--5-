import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge';
import type { EstimateStatus } from '../types/estimates.types';

interface EstimateStatusBadgeProps {
  status: EstimateStatus;
  className?: string;
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const statusConfig: Record<EstimateStatus, { variant: BadgeVariant; label: string }> = {
  Draft: { variant: 'default', label: 'Draft' },
  'Work Order': { variant: 'info', label: 'Work Order' },
  Invoiced: { variant: 'warning', label: 'Invoiced' },
  Paid: { variant: 'success', label: 'Paid' },
  Archived: { variant: 'default', label: 'Archived' },
};

export function EstimateStatusBadge({ status, className }: EstimateStatusBadgeProps) {
  const config = statusConfig[status] ?? { variant: 'default' as BadgeVariant, label: status };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
