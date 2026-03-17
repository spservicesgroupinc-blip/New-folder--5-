/**
 * CustomerList.tsx
 *
 * Filterable list of customers rendered as CustomerCards.
 */

import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Input, Select, Button, Modal } from '../../../shared/components/ui';
import { CustomerCard } from './CustomerCard';
import { CustomerForm } from './CustomerForm';
import { useCustomers } from '../hooks/useCustomers';
import { useCalculator } from '../../../../context/CalculatorContext';
import type { CustomerProfile } from '../../../../types';

interface CustomerListProps {
  onSelectCustomer: (id: string) => void;
  onStartEstimate?: (customer: CustomerProfile) => void;
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Customers' },
  { value: 'Active', label: 'Active' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Archived', label: 'Archived' },
];

export function CustomerList({ onSelectCustomer, onStartEstimate: _onStartEstimate }: CustomerListProps) {
  const { customers, filteredCustomers, filter, setFilter } = useCustomers();
  const { dispatch } = useCalculator();
  const [showForm, setShowForm] = useState(false);

  function handleArchive(customer: CustomerProfile) {
    dispatch({
      type: 'UPDATE_DATA',
      payload: {
        customers: customers.map((c) =>
          c.id === customer.id ? { ...c, status: 'Archived' as const } : c,
        ),
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search customers…"
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="flex-1"
        />
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={filter.status}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              status: e.target.value as typeof f.status,
            }))
          }
          className="sm:w-44"
        />
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={15} />
          Add Customer
        </Button>
      </div>

      {/* List */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
          <Users size={40} strokeWidth={1.2} />
          <p className="text-sm">No customers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSelect={() => onSelectCustomer(customer.id)}
              onArchive={() => handleArchive(customer)}
            />
          ))}
        </div>
      )}

      {/* New customer modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Customer"
      >
        <CustomerForm
          onSave={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
