import React from 'react';
import { CheckCircle, Clock, Send, XCircle } from 'lucide-react';
import { Badge } from '../../../shared/components/ui';
import { formatDate } from '../../../shared/utils/formatters';
import { InvoiceStatus } from '../types/invoice.types';

interface InvoicePaymentStatusProps {
  status: InvoiceStatus;
  invoiceDate?: string;
  paymentTerms?: string;
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { variant: BadgeVariant; Icon: React.ElementType; label: string }
> = {
  Draft: { variant: 'default', Icon: Clock, label: 'Draft' },
  Sent: { variant: 'info', Icon: Send, label: 'Sent' },
  Paid: { variant: 'success', Icon: CheckCircle, label: 'Paid' },
  Void: { variant: 'error', Icon: XCircle, label: 'Void' },
};

export function InvoicePaymentStatus({
  status,
  invoiceDate,
  paymentTerms,
}: InvoicePaymentStatusProps) {
  const config = STATUS_CONFIG[status];
  const { Icon } = config;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-slate-400" />
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
      {invoiceDate && (
        <p className="text-xs text-slate-400">
          Invoice date: <span className="text-slate-300">{formatDate(invoiceDate)}</span>
        </p>
      )}
      {paymentTerms && (
        <p className="text-xs text-slate-400">
          Terms: <span className="text-slate-300">{paymentTerms}</span>
        </p>
      )}
    </div>
  );
}
