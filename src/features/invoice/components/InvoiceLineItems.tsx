import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button, Input } from '../../../shared/components/ui';
import { formatCurrency } from '../../../shared/utils/formatters';
import { InvoiceLine } from '../types/invoice.types';

interface InvoiceLineItemsProps {
  lines: InvoiceLine[];
  onChange: (lines: InvoiceLine[]) => void;
  readOnly?: boolean;
}

function newLine(): InvoiceLine {
  return { id: crypto.randomUUID(), item: '', description: '', qty: '1', amount: 0 };
}

export function InvoiceLineItems({ lines, onChange, readOnly = false }: InvoiceLineItemsProps) {
  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  function updateLine(id: string, field: keyof InvoiceLine, value: string | number) {
    onChange(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    onChange([...lines, newLine()]);
  }

  function removeLine(id: string) {
    onChange(lines.filter((l) => l.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="pb-2 pr-3 font-medium">Item</th>
              <th className="pb-2 pr-3 font-medium">Description</th>
              <th className="pb-2 pr-3 font-medium w-16">Qty</th>
              <th className="pb-2 pr-3 font-medium w-28 text-right">Amount</th>
              {!readOnly && <th className="pb-2 w-8" />}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-slate-800">
                <td className="py-1.5 pr-3">
                  {readOnly ? (
                    <span className="text-white">{line.item}</span>
                  ) : (
                    <Input
                      value={line.item}
                      onChange={(e) => updateLine(line.id, 'item', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Item"
                    />
                  )}
                </td>
                <td className="py-1.5 pr-3">
                  {readOnly ? (
                    <span className="text-slate-300">{line.description}</span>
                  ) : (
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Description"
                    />
                  )}
                </td>
                <td className="py-1.5 pr-3">
                  {readOnly ? (
                    <span className="text-slate-300">{line.qty}</span>
                  ) : (
                    <Input
                      value={line.qty}
                      onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="1"
                    />
                  )}
                </td>
                <td className="py-1.5 pr-3 text-right">
                  {readOnly ? (
                    <span className="text-white">{formatCurrency(line.amount)}</span>
                  ) : (
                    <Input
                      type="number"
                      value={line.amount}
                      onChange={(e) => updateLine(line.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm text-right"
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="py-1.5 text-center">
                    <button
                      onClick={() => removeLine(line.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      aria-label="Remove line"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <Button variant="ghost" size="sm" onClick={addLine} className="self-start">
          <PlusCircle size={14} />
          Add Line
        </Button>
      )}

      <div className="flex justify-end pt-2 border-t border-slate-700">
        <span className="text-slate-400 mr-4 text-sm font-medium">Total</span>
        <span className="text-white font-semibold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
