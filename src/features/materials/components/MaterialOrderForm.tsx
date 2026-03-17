/**
 * MaterialOrderForm.tsx
 *
 * Form to create a new purchase order.
 */

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input, Select, Button } from '../../../shared/components/ui';
import { useMaterialOrders } from '../hooks/useMaterialOrders';
import { DEFAULT_SUPPLIERS } from '../types/materials.types';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { PurchaseOrderItem } from '../../../../types';

interface MaterialOrderFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const ITEM_TYPE_OPTIONS = [
  { value: 'open_cell', label: 'Open Cell Foam' },
  { value: 'closed_cell', label: 'Closed Cell Foam' },
  { value: 'inventory', label: 'Other Inventory' },
];

const SUPPLIER_OPTIONS = DEFAULT_SUPPLIERS.map((s) => ({
  value: s.name,
  label: s.name,
}));

function emptyItem(): PurchaseOrderItem {
  return {
    description: '',
    quantity: 1,
    unitCost: 0,
    total: 0,
    type: 'inventory',
  };
}

export function MaterialOrderForm({ onCancel, onSuccess }: MaterialOrderFormProps) {
  const { createOrder } = useMaterialOrders();

  const [vendor, setVendor] = useState(DEFAULT_SUPPLIERS[0].name);
  const [customVendor, setCustomVendor] = useState('');
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  const effectiveVendor = vendor === 'Other' ? customVendor : vendor;

  function updateItem(idx: number, field: keyof PurchaseOrderItem, value: unknown) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value } as PurchaseOrderItem;
        updated.total = updated.quantity * updated.unitCost;
        return updated;
      });
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const totalCost = items.reduce((sum, item) => sum + item.total, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveVendor.trim() || items.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder({
        id: crypto.randomUUID(),
        date: orderDate,
        vendorName: effectiveVendor,
        status: 'Draft',
        items,
        totalCost,
        notes: notes || undefined,
      });
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Supplier */}
      <Select
        label="Supplier"
        value={vendor}
        options={SUPPLIER_OPTIONS}
        onChange={(e) => setVendor(e.target.value)}
      />
      {vendor === 'Other' && (
        <Input
          label="Custom Supplier Name"
          value={customVendor}
          onChange={(e) => setCustomVendor(e.target.value)}
          required
        />
      )}

      <Input
        label="Order Date"
        type="date"
        value={orderDate}
        onChange={(e) => setOrderDate(e.target.value)}
        required
      />

      {/* Line Items */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Line Items</span>
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>
            <Plus size={13} /> Add Line
          </Button>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="bg-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="text-red-400 shrink-0"
              >
                <Trash2 size={13} />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select
                options={ITEM_TYPE_OPTIONS}
                value={item.type}
                onChange={(e) =>
                  updateItem(
                    idx,
                    'type',
                    e.target.value as PurchaseOrderItem['type'],
                  )
                }
              />
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
              />
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="Unit Cost"
                prefix="$"
                value={item.unitCost}
                onChange={(e) => updateItem(idx, 'unitCost', Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-slate-400 text-right">
              Line total: {formatCurrency(item.total)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t border-slate-700 pt-3">
        <span className="text-white font-semibold">Total: {formatCurrency(totalCost)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Notes</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Create Order
        </Button>
      </div>
    </form>
  );
}
