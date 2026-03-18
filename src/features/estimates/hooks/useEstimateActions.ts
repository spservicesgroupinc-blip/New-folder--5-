/**
 * useEstimateActions.ts
 *
 * CRUD operations for estimates: delete, save customer, load for editing.
 * Uses the legacy useCalculator() context since estimates live in legacy state.
 */

import React from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import { deleteEstimate as apiDeleteEstimate } from '../services/estimatesApi';
import type { CustomerProfile, EstimateRecord } from '../../../../types';


export function useEstimateActions() {
  const { state, dispatch } = useCalculator();
  const { appData, ui, session } = state;

  const deleteEstimate = async (id: string, e?: React.MouseEvent): Promise<void> => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this job?')) return;

    dispatch({
      type: 'UPDATE_DATA',
      payload: { savedEstimates: appData.savedEstimates.filter((est) => est.id !== id) },
    });

    if (ui.editingEstimateId === id) {
      dispatch({ type: 'SET_EDITING_ESTIMATE', payload: null });
      dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
    }

    try {
      await apiDeleteEstimate(parseInt(id, 10));
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'success', message: 'Job Deleted' },
      });
    } catch {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: 'Local delete success, but server sync failed.' },
      });
    }
  };

  const saveCustomer = (customer: CustomerProfile): void => {
    const updatedCustomers = [...appData.customers];
    const existingIndex = updatedCustomers.findIndex((c) => c.id === customer.id);
    if (existingIndex >= 0) {
      updatedCustomers[existingIndex] = customer;
    } else {
      updatedCustomers.push(customer);
    }

    if (appData.customerProfile.id === customer.id) {
      dispatch({
        type: 'UPDATE_DATA',
        payload: { customers: updatedCustomers, customerProfile: customer },
      });
    } else {
      dispatch({ type: 'UPDATE_DATA', payload: { customers: updatedCustomers } });
    }
  };

  const loadForEditing = (record: EstimateRecord): void => {
    dispatch({
      type: 'UPDATE_DATA',
      payload: {
        mode: record.inputs.mode,
        length: record.inputs.length,
        width: record.inputs.width,
        wallHeight: record.inputs.wallHeight,
        roofPitch: record.inputs.roofPitch,
        includeGables: record.inputs.includeGables,
        isMetalSurface: record.inputs.isMetalSurface || false,
        additionalAreas: record.inputs.additionalAreas || [],
        wallSettings: record.wallSettings,
        roofSettings: record.roofSettings,
        expenses: {
          ...record.expenses,
          laborRate: record.expenses?.laborRate ?? appData.costs.laborRate,
        },
        inventory: record.materials.inventory,
        customerProfile: record.customer,
        jobNotes: record.notes || '',
        scheduledDate: record.scheduledDate || '',
        invoiceDate: record.invoiceDate || '',
        invoiceNumber: record.invoiceNumber || '',
        paymentTerms: record.paymentTerms || 'Due on Receipt',
        pricingMode: record.pricingMode || 'level_pricing',
        sqFtRates: record.sqFtRates || { wall: 0, roof: 0 },
      },
    });
    dispatch({ type: 'SET_EDITING_ESTIMATE', payload: record.id });
    dispatch({ type: 'SET_VIEW', payload: 'estimate_detail' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    deleteEstimate,
    saveCustomer,
    loadForEditing,
  };
}
