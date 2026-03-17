/**
 * MaterialOrderStatus.tsx
 *
 * Displays a status badge with an icon for a purchase order status.
 */

import React from 'react';
import { Clock, Send, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../../shared/components/ui';
import type { OrderStatus } from '../types/materials.types';

interface MaterialOrderStatusProps {
  status: OrderStatus;
}

type BadgeVariant = 'default' | 'info' | 'success' | 'error' | 'warning';

const STATUS_CONFIG: Record<
  OrderStatus,
  { variant: BadgeVariant; icon: React.ElementType }
> = {
  Draft: { variant: 'default', icon: Clock },
  Sent: { variant: 'info', icon: Send },
  Received: { variant: 'success', icon: CheckCircle },
  Cancelled: { variant: 'error', icon: XCircle },
};

export function MaterialOrderStatus({ status }: MaterialOrderStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon size={11} className="mr-1" />
      {status}
    </Badge>
  );
}
