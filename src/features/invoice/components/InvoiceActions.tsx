import React from 'react';
import { FileText, CheckCircle, Send } from 'lucide-react';
import { Button } from '../../../shared/components/ui';

interface InvoiceActionsProps {
  onGeneratePdf: () => void;
  onMarkPaid: () => void;
  onSend?: () => void;
  loading?: boolean;
}

export function InvoiceActions({
  onGeneratePdf,
  onMarkPaid,
  onSend,
  loading = false,
}: InvoiceActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={onGeneratePdf}
        loading={loading}
        disabled={loading}
      >
        <FileText size={14} />
        Generate PDF
      </Button>

      {onSend && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onSend}
          disabled={loading}
        >
          <Send size={14} />
          Send to Customer
        </Button>
      )}

      <Button
        variant="primary"
        size="sm"
        onClick={onMarkPaid}
        loading={loading}
        disabled={loading}
      >
        <CheckCircle size={14} />
        Mark Paid
      </Button>
    </div>
  );
}
