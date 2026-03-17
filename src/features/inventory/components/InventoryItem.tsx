/**
 * InventoryItem.tsx
 *
 * Single warehouse item row with inline edit controls.
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Input, Button } from '../../../shared/components/ui';
import { StockLevelIndicator } from './StockLevelIndicator';
import type { WarehouseItem } from '../../../../types';

interface InventoryItemProps {
  item: WarehouseItem;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onRemove: (id: string) => void;
}

export function InventoryItem({ item, onUpdate, onRemove }: InventoryItemProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={item.name}
          placeholder="Item name"
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-red-400 hover:text-red-300 shrink-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Input
          label="Unit"
          value={item.unit}
          placeholder="e.g. drum"
          onChange={(e) => onUpdate(item.id, 'unit', e.target.value)}
        />
        <Input
          label="Qty"
          type="number"
          min={0}
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, 'quantity', Number(e.target.value))}
        />
        <Input
          label="Unit Cost"
          type="number"
          min={0}
          step={0.01}
          prefix="$"
          value={item.unitCost}
          onChange={(e) => onUpdate(item.id, 'unitCost', Number(e.target.value))}
        />
      </div>

      <StockLevelIndicator quantity={item.quantity} />
    </div>
  );
}
