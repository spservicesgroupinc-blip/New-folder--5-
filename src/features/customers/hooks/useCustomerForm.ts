/**
 * useCustomerForm.ts
 *
 * Local form state for creating or editing a CustomerProfile. Dispatches
 * to the legacy CalculatorContext to persist changes.
 */

import { useState, useCallback } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import type { CustomerProfile } from '../../../../types';

const EMPTY_CUSTOMER: CustomerProfile = {
  id: '',
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  email: '',
  phone: '',
  notes: '',
  status: 'Active',
};

export function useCustomerForm(initial?: CustomerProfile) {
  const { state, dispatch } = useCalculator();
  const isNew = !initial?.id;

  const [fields, setFields] = useState<CustomerProfile>(
    initial ?? { ...EMPTY_CUSTOMER, id: crypto.randomUUID() },
  );
  const [originalFields] = useState<CustomerProfile>(
    initial ?? { ...EMPTY_CUSTOMER },
  );

  const isDirty =
    JSON.stringify(fields) !== JSON.stringify(originalFields);

  const setField = useCallback(
    <K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) => {
      setFields((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const save = useCallback(() => {
    const existing = state.appData.customers ?? [];
    const updated = isNew
      ? [...existing, fields]
      : existing.map((c) => (c.id === fields.id ? fields : c));
    dispatch({ type: 'UPDATE_DATA', payload: { customers: updated } });
  }, [dispatch, fields, isNew, state.appData.customers]);

  const reset = useCallback(() => {
    setFields(initial ?? { ...EMPTY_CUSTOMER, id: crypto.randomUUID() });
  }, [initial]);

  return { fields, setField, save, reset, isNew, isDirty };
}
