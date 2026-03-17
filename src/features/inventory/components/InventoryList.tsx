/**
 * InventoryList.tsx
 *
 * Full warehouse view showing foam set counts and inventory items.
 */

import React from 'react';
import { Plus, Minus, Package } from 'lucide-react';
import { Button } from '../../../shared/components/ui';
import { InventoryItem } from './InventoryItem';
import { StockLevelIndicator } from './StockLevelIndicator';
import { useInventory } from '../hooks/useInventory';

export function InventoryList() {
  const {
    openCellSets,
    closedCellSets,
    items,
    addItem,
    removeItem,
    updateItem,
    updateSetCount,
  } = useInventory();

  function handleAddItem() {
    addItem({ name: '', unit: 'unit', quantity: 0, unitCost: 0 });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Foam Set Counts */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-white font-semibold mb-4">Foam Sets on Hand</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Open Cell */}
          <div className="flex flex-col gap-2">
            <span className="text-slate-300 text-sm font-medium">Open Cell Sets</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateSetCount('openCellSets', openCellSets - 1)}
              >
                <Minus size={14} />
              </Button>
              <span className="text-white font-mono text-lg w-10 text-center">
                {openCellSets}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateSetCount('openCellSets', openCellSets + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
            <StockLevelIndicator quantity={openCellSets} />
          </div>

          {/* Closed Cell */}
          <div className="flex flex-col gap-2">
            <span className="text-slate-300 text-sm font-medium">Closed Cell Sets</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateSetCount('closedCellSets', closedCellSets - 1)}
              >
                <Minus size={14} />
              </Button>
              <span className="text-white font-mono text-lg w-10 text-center">
                {closedCellSets}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateSetCount('closedCellSets', closedCellSets + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
            <StockLevelIndicator quantity={closedCellSets} />
          </div>
        </div>
      </div>

      {/* Warehouse Items */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Other Inventory</h3>
          <Button variant="secondary" size="sm" onClick={handleAddItem}>
            <Plus size={14} />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-2">
            <Package size={36} strokeWidth={1.2} />
            <p className="text-sm">No inventory items yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <InventoryItem
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
