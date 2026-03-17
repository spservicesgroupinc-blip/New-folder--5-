/**
 * MaterialOrderList.tsx
 *
 * Displays a list of past purchase orders with status, vendor, date, and
 * total cost.
 */

import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button, Modal } from '../../../shared/components/ui';
import { MaterialOrderStatus } from './MaterialOrderStatus';
import { MaterialOrderForm } from './MaterialOrderForm';
import { useMaterialOrders } from '../hooks/useMaterialOrders';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export function MaterialOrderList() {
  const { orders } = useMaterialOrders();
  const [showForm, setShowForm] = useState(false);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Purchase Orders</h3>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} />
          New Order
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
          <ShoppingCart size={40} strokeWidth={1.2} />
          <p className="text-sm">No purchase orders yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-white font-medium">{order.vendorName}</span>
                <span className="text-slate-400 text-xs">{formatDate(order.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MaterialOrderStatus status={order.status} />
                <span className="text-white font-mono text-sm">
                  {formatCurrency(order.totalCost)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Purchase Order"
        size="lg"
      >
        <MaterialOrderForm
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
