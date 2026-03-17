import React from 'react';
import { ArrowLeft, User, MapPin, Phone, Mail } from 'lucide-react';
import { Button, Card } from '../../../shared/components/ui';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { EstimateRecord } from '../../../../types';
import { InvoicePaymentStatus } from './InvoicePaymentStatus';
import { InvoiceLineItems } from './InvoiceLineItems';
import { InvoiceActions } from './InvoiceActions';
import { InvoiceStatus, InvoiceLine } from '../types/invoice.types';

interface InvoiceDetailProps {
  record: EstimateRecord;
  onMarkPaid: () => void;
  onGeneratePdf: () => void;
  onBack: () => void;
}

export function InvoiceDetail({ record, onMarkPaid, onGeneratePdf, onBack }: InvoiceDetailProps) {
  const { customer } = record;
  const lines: InvoiceLine[] = record.invoiceLines ?? record.estimateLines ?? [];
  const total = lines.length > 0
    ? lines.reduce((s, l) => s + l.amount, 0)
    : record.totalValue;

  const invoiceStatus: InvoiceStatus =
    record.status === 'Paid' ? 'Paid' :
    record.status === 'Invoiced' ? 'Sent' :
    record.status === 'Archived' ? 'Void' : 'Draft';

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <h2 className="text-lg font-semibold text-white flex-1">
          Invoice #{record.invoiceNumber ?? record.id.slice(-6).toUpperCase()}
        </h2>
        <InvoicePaymentStatus
          status={invoiceStatus}
          invoiceDate={record.invoiceDate}
          paymentTerms={record.paymentTerms}
        />
      </div>

      <Card className="bg-slate-800 border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Customer
        </h3>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-white">
            <User size={14} className="text-slate-400 shrink-0" />
            <span>{customer.name}</span>
          </div>
          {customer.address && (
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>{customer.address}{customer.city ? `, ${customer.city}` : ''}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span>{customer.email}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-slate-800 border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Line Items
        </h3>
        {lines.length > 0 ? (
          <InvoiceLineItems lines={lines} onChange={() => {}} readOnly />
        ) : (
          <div className="flex justify-end pt-2 border-t border-slate-700">
            <span className="text-slate-400 mr-4 text-sm font-medium">Total</span>
            <span className="text-white font-semibold">{formatCurrency(total)}</span>
          </div>
        )}
      </Card>

      {record.invoiceDate && (
        <p className="text-xs text-slate-500">
          Invoice date: {formatDate(record.invoiceDate)}
          {record.paymentTerms ? ` · ${record.paymentTerms}` : ''}
        </p>
      )}

      {invoiceStatus !== 'Paid' && invoiceStatus !== 'Void' && (
        <InvoiceActions onGeneratePdf={onGeneratePdf} onMarkPaid={onMarkPaid} />
      )}
    </div>
  );
}
