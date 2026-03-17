/**
 * CustomerCard.tsx
 *
 * Displays a summary card for a single CustomerProfile.
 */

import React from 'react';
import { Phone, Mail, MapPin, Archive } from 'lucide-react';
import { Badge, Button } from '../../../shared/components/ui';
import type { CustomerProfile } from '../../../../types';

interface CustomerCardProps {
  customer: CustomerProfile;
  onSelect: () => void;
  onArchive: () => void;
}

function statusVariant(status: CustomerProfile['status']) {
  if (status === 'Active') return 'success';
  if (status === 'Lead') return 'info';
  return 'default';
}

export function CustomerCard({ customer, onSelect, onArchive }: CustomerCardProps) {
  const location = [customer.city, customer.state].filter(Boolean).join(', ');

  return (
    <div
      className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3 hover:border-slate-500 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{customer.name}</p>
          {location && (
            <div className="flex items-center gap-1 mt-0.5 text-slate-400 text-xs">
              <MapPin size={11} />
              <span>{location}</span>
            </div>
          )}
        </div>
        <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
      </div>

      <div className="flex flex-col gap-1 text-sm text-slate-400">
        {customer.phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={13} />
            <span>{customer.phone}</span>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-1.5">
            <Mail size={13} />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
      </div>

      {customer.status !== 'Archived' && (
        <div className="flex justify-end pt-1 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="text-slate-500 hover:text-slate-300"
          >
            <Archive size={13} />
            Archive
          </Button>
        </div>
      )}
    </div>
  );
}
