
import { supabase } from '../src/shared/services/supabase/supabaseClient';
import { CalculatorState, EstimateRecord, UserSession } from '../types';

/**
 * Fetches the full application state from Supabase
 */
export const syncDown = async (): Promise<Partial<CalculatorState> | null> => {
  try {
    const [settingsRes, estimatesRes, customersRes, inventoryRes, equipmentRes] = await Promise.all([
      supabase.from('company_settings').select('key, value'),
      supabase.from('estimates').select('*').order('date', { ascending: false }),
      supabase.from('customers').select('*').order('name'),
      supabase.from('inventory_items').select('*').order('name'),
      supabase.from('equipment').select('*').order('name'),
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (estimatesRes.error) throw estimatesRes.error;
    if (customersRes.error) throw customersRes.error;
    if (inventoryRes.error) throw inventoryRes.error;
    if (equipmentRes.error) throw equipmentRes.error;

    // Build settings map
    const settings: Record<string, any> = {};
    for (const row of settingsRes.data ?? []) {
      settings[row.key] = row.value;
    }

    // Map DB estimates to frontend EstimateRecord format
    const savedEstimates: EstimateRecord[] = (estimatesRes.data ?? []).map((e: any) => ({
      id: String(e.id),
      customerId: String(e.customer_id ?? ''),
      date: e.date,
      status: e.status,
      executionStatus: e.execution_status,
      totalValue: Number(e.total_value),
      customer: e.inputs?.customer ?? { name: '', address: '', city: '', state: '', zip: '', phone: '', email: '', notes: '', status: 'Active', id: String(e.customer_id ?? '') },
      inputs: e.inputs ?? {},
      results: e.results ?? {},
      materials: e.materials ?? {},
      wallSettings: e.wall_settings ?? {},
      roofSettings: e.roof_settings ?? {},
      expenses: e.expenses ?? {},
      notes: e.job_notes,
      pricingMode: e.pricing_mode,
      sqFtRates: e.sqft_rates,
      scheduledDate: e.scheduled_date,
      invoiceDate: e.invoice_date,
      invoiceNumber: e.invoice_number,
      paymentTerms: e.payment_terms,
      estimateLines: e.estimate_lines,
      invoiceLines: e.invoice_lines,
      workOrderLines: e.work_order_lines,
      actuals: e.actuals,
      financials: e.financials,
      workOrderSheetUrl: e.work_order_url,
      pdfLink: e.pdf_url,
      sitePhotos: e.site_photos,
      inventoryProcessed: e.inventory_processed,
      lastModified: e.updated_at,
    }));

    // Map DB customers to frontend format
    const customers = (customersRes.data ?? []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      address: c.address,
      city: c.city,
      state: c.state,
      zip: c.zip,
      phone: c.phone,
      email: c.email,
      notes: c.notes,
      status: c.status,
    }));

    // Map DB inventory to frontend format
    const warehouseItems = (inventoryRes.data ?? []).map((i: any) => ({
      id: String(i.id),
      name: i.name,
      quantity: Number(i.quantity),
      unit: i.unit,
      unitCost: Number(i.unit_cost),
    }));

    // Map DB equipment to frontend format
    const equipment = (equipmentRes.data ?? []).map((eq: any) => ({
      id: String(eq.id),
      name: eq.name,
      status: eq.status,
      lastSeen: eq.last_seen,
    }));

    return {
      companyProfile: settings.companyProfile ?? undefined,
      warehouse: {
        openCellSets: settings.warehouse_counts?.openCellSets ?? 0,
        closedCellSets: settings.warehouse_counts?.closedCellSets ?? 0,
        items: warehouseItems,
      },
      lifetimeUsage: settings.lifetime_usage ?? undefined,
      costs: settings.costs ?? undefined,
      yields: settings.yields ?? undefined,
      expenses: settings.expenses ?? undefined,
      savedEstimates,
      customers,
      equipment,
    };
  } catch (error) {
    console.error("syncDown error:", error);
    return null;
  }
};

/**
 * Pushes application settings to Supabase
 */
export const syncUp = async (state: CalculatorState): Promise<boolean> => {
  try {
    const { data: company } = await supabase.from('companies').select('id').single();
    if (!company) throw new Error('Company not found');
    const companyId = company.id;

    const settingsToSync: Record<string, any> = {
      companyProfile: state.companyProfile,
      warehouse_counts: { openCellSets: state.warehouse.openCellSets, closedCellSets: state.warehouse.closedCellSets },
      lifetime_usage: state.lifetimeUsage,
      costs: state.costs,
      yields: state.yields,
      expenses: state.expenses,
    };

    const upserts = Object.entries(settingsToSync).map(([key, value]) => ({
      company_id: companyId,
      key,
      value,
    }));

    const { error } = await supabase
      .from('company_settings')
      .upsert(upserts, { onConflict: 'company_id,key' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("syncUp error:", error);
    return false;
  }
};

/**
 * Marks job as paid via server-side RPC
 */
export const markJobPaid = async (estimateId: string): Promise<{success: boolean, estimate?: EstimateRecord}> => {
    try {
      const { data, error } = await supabase.rpc('mark_job_paid', {
        p_estimate_id: parseInt(estimateId, 10),
      });
      if (error) throw error;

      // Fetch the updated estimate
      const { data: est, error: fetchErr } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', parseInt(estimateId, 10))
        .single();
      
      if (fetchErr) throw fetchErr;
      
      const estimate: EstimateRecord = {
        id: String(est.id),
        customerId: String(est.customer_id ?? ''),
        date: est.date,
        status: est.status,
        executionStatus: est.execution_status,
        totalValue: Number(est.total_value),
        customer: est.inputs?.customer ?? {},
        inputs: est.inputs ?? {},
        results: est.results ?? {},
        materials: est.materials ?? {},
        wallSettings: est.wall_settings ?? {},
        roofSettings: est.roof_settings ?? {},
        expenses: est.expenses ?? {},
        notes: est.job_notes,
        actuals: est.actuals,
        financials: est.financials,
        invoiceNumber: est.invoice_number,
        pdfLink: est.pdf_url,
        workOrderSheetUrl: est.work_order_url,
        inventoryProcessed: est.inventory_processed,
      };

      return { success: true, estimate };
    } catch (error) {
      console.error("markJobPaid error:", error);
      return { success: false };
    }
};

/**
 * Marks job as complete via server-side RPC (handles inventory delta atomically)
 */
export const completeJob = async (estimateId: string, actuals: any): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('complete_job', {
        p_estimate_id: parseInt(estimateId, 10),
        p_actuals: actuals,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("completeJob error:", error);
      return false;
    }
};

/**
 * Deletes an estimate
 */
export const deleteEstimate = async (estimateId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', parseInt(estimateId, 10));
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("deleteEstimate error:", error);
      return false;
    }
};

/**
 * Uploads a PDF to Supabase Storage
 */
export const savePdfToStorage = async (fileName: string, base64Data: string, estimateId?: string): Promise<string | null> => {
  try {
    // Convert base64 to blob
    const byteString = atob(base64Data.split(',')[1] || base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: 'application/pdf' });

    const { data: company } = await supabase.from('companies').select('id').single();
    const path = `${company?.id}/pdfs/${fileName}`;

    const { error } = await supabase.storage.from('company-files').upload(path, blob, { upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('company-files').getPublicUrl(path);
    const url = urlData.publicUrl;

    // Update estimate with PDF URL if provided
    if (estimateId) {
      await supabase.from('estimates').update({ pdf_url: url }).eq('id', parseInt(estimateId, 10));
    }

    return url;
  } catch (error) {
    console.error("savePdfToStorage error:", error);
    return null;
  }
};

/**
 * Uploads an image to Supabase Storage and returns the public URL
 */
export const uploadImage = async (base64Data: string, fileName: string = 'image.jpg'): Promise<string | null> => {
  try {
    const byteString = atob(base64Data.split(',')[1] || base64Data);
    const mimeMatch = base64Data.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeType });

    const { data: company } = await supabase.from('companies').select('id').single();
    const path = `${company?.id}/images/${fileName}`;

    const { error } = await supabase.storage.from('company-files').upload(path, blob, { upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('company-files').getPublicUrl(path);
    return urlData.publicUrl;
  } catch (error) {
    console.error("uploadImage error:", error);
    return null;
  }
};
};

/**
 * Creates a new company account
 */
export const signupUser = async (username: string, password: string, companyName: string): Promise<UserSession | null> => {
    const result = await apiRequest({ action: 'SIGNUP', payload: { username, password, companyName } });
    if (result.status === 'success') return result.data;
    throw new Error(result.message || "Signup failed");
};

/**
 * Submits lead for trial access
 */
export const submitTrial = async (name: string, email: string, phone: string): Promise<boolean> => {
    const result = await apiRequest({ action: 'SUBMIT_TRIAL', payload: { name, email, phone } });
    return result.status === 'success';
};
