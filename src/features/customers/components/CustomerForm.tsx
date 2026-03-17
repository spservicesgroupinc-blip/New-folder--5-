/**
 * CustomerForm.tsx
 *
 * Form for creating or editing a CustomerProfile.
 */

import React from 'react';
import { Input, Select, Button } from '../../../shared/components/ui';
import { useCustomerForm } from '../hooks/useCustomerForm';
import type { CustomerProfile } from '../../../../types';

interface CustomerFormProps {
  initial?: CustomerProfile;
  onSave?: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Archived', label: 'Archived' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
].map((s) => ({ value: s, label: s }));

const STATE_OPTIONS = [{ value: '', label: 'State' }, ...US_STATES];

export function CustomerForm({ initial, onSave, onCancel }: CustomerFormProps) {
  const { fields, setField, save, isNew } = useCustomerForm(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    save();
    onSave?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        value={fields.name}
        onChange={(e) => setField('name', e.target.value)}
        required
      />

      <Input
        label="Address"
        value={fields.address}
        onChange={(e) => setField('address', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          value={fields.city}
          onChange={(e) => setField('city', e.target.value)}
        />
        <Select
          label="State"
          value={fields.state}
          options={STATE_OPTIONS}
          onChange={(e) => setField('state', e.target.value)}
        />
      </div>

      <Input
        label="ZIP"
        value={fields.zip}
        onChange={(e) => setField('zip', e.target.value)}
      />

      <Input
        label="Phone"
        type="tel"
        value={fields.phone}
        onChange={(e) => setField('phone', e.target.value)}
      />

      <Input
        label="Email"
        type="email"
        value={fields.email}
        onChange={(e) => setField('email', e.target.value)}
      />

      <Select
        label="Status"
        value={fields.status}
        options={STATUS_OPTIONS}
        onChange={(e) =>
          setField('status', e.target.value as CustomerProfile['status'])
        }
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Notes</label>
        <textarea
          rows={3}
          value={fields.notes}
          onChange={(e) => setField('notes', e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isNew ? 'Create Customer' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
