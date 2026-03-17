/**
 * useCustomers.ts
 *
 * Read-only hook that derives a filtered customer list and aggregate stats
 * from the legacy CalculatorContext.
 */

import { useMemo, useState } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import type { CustomerFilter, CustomerStats } from '../types/customer.types';
import type { CustomerProfile } from '../../../../types';

export function useCustomers() {
  const { state } = useCalculator();
  const customers: CustomerProfile[] = state.appData.customers ?? [];

  const [filter, setFilter] = useState<CustomerFilter>({
    status: 'all',
    search: '',
  });

  const filteredCustomers = useMemo<CustomerProfile[]>(() => {
    let result = [...customers];

    if (filter.status !== 'all') {
      result = result.filter((c) => c.status === filter.status);
    }

    if (filter.search.trim()) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term),
      );
    }

    return result;
  }, [customers, filter.status, filter.search]);

  const stats = useMemo<CustomerStats>(() => {
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'Active').length,
      leads: customers.filter((c) => c.status === 'Lead').length,
      archived: customers.filter((c) => c.status === 'Archived').length,
    };
  }, [customers]);

  return { customers, filteredCustomers, stats, filter, setFilter };
}
