-- ============================================================================
-- 003_triggers.sql — Database triggers for automation
-- ============================================================================

-- ─── Generic updated_at trigger function ──────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all mutable tables
create trigger set_updated_at before update on public.companies
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.company_members
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.estimates
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.inventory_items
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.equipment
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.company_settings
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.purchase_orders
  for each row execute function public.handle_updated_at();


-- ─── Sync JWT custom claims when company_members changes ──────────────────
-- Sets raw_app_meta_data.company_id and raw_app_meta_data.role on auth.users
-- so the JWT token contains tenant context without an extra query.

create or replace function public.handle_company_member_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('company_id', new.company_id)
    || jsonb_build_object('role', new.role)
  where id = new.user_id;

  return new;
end;
$$;

create trigger sync_member_claims
  after insert or update on public.company_members
  for each row execute function public.handle_company_member_change();


-- ─── complete_job RPC — Atomic job completion with inventory delta ─────────
--
-- Mirrors the original GAS handleCompleteJob logic:
-- 1. Lock estimate row
-- 2. Calculate delta between actual and estimated materials
-- 3. Deduct delta from company warehouse (company_settings key 'warehouse_counts')
-- 4. Update lifetime usage (company_settings key 'lifetime_usage')
-- 5. Delta-update individual inventory items
-- 6. Append material log entries
-- 7. Mark estimate as Completed + inventory_processed = true

create or replace function public.complete_job(
  p_estimate_id  bigint,
  p_actuals      jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id   bigint;
  v_est          record;
  v_act_oc       numeric;
  v_act_cc       numeric;
  v_est_oc       numeric;
  v_est_cc       numeric;
  v_diff_oc      numeric;
  v_diff_cc      numeric;
  v_wh           jsonb;
  v_life         jsonb;
  v_customer     text;
  v_item         jsonb;
  v_est_qty      numeric;
  v_act_qty      numeric;
begin
  -- Resolve caller's company
  v_company_id := (
    select cm.company_id from public.company_members cm
    where cm.user_id = (select auth.uid())
    limit 1
  );

  if v_company_id is null then
    raise exception 'User is not a company member';
  end if;

  -- Lock estimate row to prevent double-processing
  select * into v_est
  from public.estimates
  where id = p_estimate_id and company_id = v_company_id
  for update;

  if not found then
    raise exception 'Estimate not found or access denied';
  end if;

  -- Idempotency guard
  if v_est.execution_status = 'Completed' and v_est.inventory_processed then
    return jsonb_build_object('success', true, 'message', 'Job already finalized');
  end if;

  -- Get customer name for logs
  select c.name into v_customer
  from public.customers c
  where c.id = v_est.customer_id;
  v_customer := coalesce(v_customer, '');

  -- Delta calculation
  v_act_oc := coalesce((p_actuals->>'openCellSets')::numeric, 0);
  v_act_cc := coalesce((p_actuals->>'closedCellSets')::numeric, 0);
  v_est_oc := coalesce((v_est.materials->>'openCellSets')::numeric, 0);
  v_est_cc := coalesce((v_est.materials->>'closedCellSets')::numeric, 0);
  v_diff_oc := v_act_oc - v_est_oc;
  v_diff_cc := v_act_cc - v_est_cc;

  -- Update warehouse_counts in company_settings
  select cs.value into v_wh
  from public.company_settings cs
  where cs.company_id = v_company_id and cs.key = 'warehouse_counts';

  v_wh := coalesce(v_wh, '{"openCellSets":0,"closedCellSets":0}'::jsonb);

  insert into public.company_settings (company_id, key, value)
  values (
    v_company_id,
    'warehouse_counts',
    jsonb_build_object(
      'openCellSets',  greatest(0, (v_wh->>'openCellSets')::numeric - v_diff_oc),
      'closedCellSets', greatest(0, (v_wh->>'closedCellSets')::numeric - v_diff_cc)
    )
  )
  on conflict (company_id, key) do update
  set value = excluded.value;

  -- Update lifetime_usage in company_settings
  select cs.value into v_life
  from public.company_settings cs
  where cs.company_id = v_company_id and cs.key = 'lifetime_usage';

  v_life := coalesce(v_life, '{"openCell":0,"closedCell":0}'::jsonb);

  insert into public.company_settings (company_id, key, value)
  values (
    v_company_id,
    'lifetime_usage',
    jsonb_build_object(
      'openCell',  (v_life->>'openCell')::numeric + v_act_oc,
      'closedCell', (v_life->>'closedCell')::numeric + v_act_cc
    )
  )
  on conflict (company_id, key) do update
  set value = excluded.value;

  -- Delta-update individual inventory items
  if p_actuals ? 'inventory' then
    for v_item in select * from jsonb_array_elements(p_actuals->'inventory')
    loop
      -- Find estimated qty for this item
      v_est_qty := coalesce((
        select (el->>'quantity')::numeric
        from jsonb_array_elements(v_est.materials->'inventory') el
        where el->>'id' = v_item->>'id'
        limit 1
      ), 0);
      v_act_qty := coalesce((v_item->>'quantity')::numeric, 0);

      update public.inventory_items
      set quantity = greatest(0, quantity - (v_act_qty - v_est_qty))
      where id = (v_item->>'id')::bigint
        and company_id = v_company_id;
    end loop;
  end if;

  -- Append material log entries
  insert into public.material_logs (company_id, estimate_id, customer_name, material_name, quantity, unit, logged_by)
  values
    (v_company_id, p_estimate_id, v_customer, 'Open Cell Foam',  v_act_oc, 'Sets', (select auth.uid())),
    (v_company_id, p_estimate_id, v_customer, 'Closed Cell Foam', v_act_cc, 'Sets', (select auth.uid()));

  -- Mark estimate as completed
  update public.estimates
  set execution_status    = 'Completed',
      inventory_processed = true,
      actuals             = p_actuals
  where id = p_estimate_id and company_id = v_company_id;

  return jsonb_build_object('success', true);
end;
$$;


-- ─── mark_job_paid RPC — Financial calculation + P&L record ───────────────

create or replace function public.mark_job_paid(
  p_estimate_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id    bigint;
  v_est           record;
  v_customer_name text;
  v_revenue       numeric;
  v_chem_cost     numeric;
  v_lab_cost      numeric;
  v_inv_cost      numeric;
  v_misc_cost     numeric;
  v_total_cogs    numeric;
  v_net_profit    numeric;
  v_margin        numeric;
  v_financials    jsonb;
begin
  -- Resolve caller's company
  v_company_id := (
    select cm.company_id from public.company_members cm
    where cm.user_id = (select auth.uid())
    limit 1
  );

  if v_company_id is null then
    raise exception 'User is not a company member';
  end if;

  -- Lock estimate
  select * into v_est
  from public.estimates
  where id = p_estimate_id and company_id = v_company_id
  for update;

  if not found then
    raise exception 'Estimate not found or access denied';
  end if;

  if v_est.status = 'Paid' then
    return jsonb_build_object('success', true, 'message', 'Already paid');
  end if;

  -- Get customer name
  select c.name into v_customer_name
  from public.customers c
  where c.id = v_est.customer_id;
  v_customer_name := coalesce(v_customer_name, '');

  -- Calculate financials from estimate data
  v_revenue   := coalesce(v_est.total_value, 0);
  v_chem_cost := coalesce((v_est.results->>'materialCost')::numeric, 0);
  v_lab_cost  := coalesce((v_est.expenses->>'laborCost')::numeric,
                   coalesce((v_est.expenses->>'manHours')::numeric, 0)
                   * coalesce((v_est.expenses->>'laborRate')::numeric, 0));
  v_inv_cost  := coalesce((v_est.results->>'inventoryCost')::numeric, 0);
  v_misc_cost := coalesce((v_est.expenses->'other'->>'amount')::numeric, 0)
               + coalesce((v_est.expenses->>'tripCharge')::numeric, 0)
               + coalesce((v_est.expenses->>'fuelSurcharge')::numeric, 0);

  v_total_cogs := v_chem_cost + v_lab_cost + v_inv_cost + v_misc_cost;
  v_net_profit := v_revenue - v_total_cogs;
  v_margin     := case when v_revenue > 0 then (v_net_profit / v_revenue) * 100 else 0 end;

  v_financials := jsonb_build_object(
    'revenue',       v_revenue,
    'chemicalCost',  v_chem_cost,
    'laborCost',     v_lab_cost,
    'inventoryCost', v_inv_cost,
    'miscCost',      v_misc_cost,
    'totalCOGS',     v_total_cogs,
    'netProfit',     v_net_profit,
    'margin',        v_margin
  );

  -- Update estimate status
  update public.estimates
  set status     = 'Paid',
      financials = v_financials
  where id = p_estimate_id and company_id = v_company_id;

  -- Insert P&L record
  insert into public.profit_loss (
    company_id, estimate_id, date_paid, customer_name, invoice_number,
    revenue, chemical_cost, labor_cost, inventory_cost, misc_cost,
    total_cogs, net_profit, margin
  ) values (
    v_company_id, p_estimate_id, now(), v_customer_name, v_est.invoice_number,
    v_revenue, v_chem_cost, v_lab_cost, v_inv_cost, v_misc_cost,
    v_total_cogs, v_net_profit, v_margin
  );

  return jsonb_build_object('success', true, 'financials', v_financials);
end;
$$;
