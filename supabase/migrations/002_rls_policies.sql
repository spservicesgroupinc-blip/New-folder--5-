-- ============================================================================
-- 002_rls_policies.sql — Row Level Security for multi-tenant isolation
-- ============================================================================
-- Pattern: every tenant table uses company_id = (select get_user_company_id())
-- The subselect wrapper ensures auth.uid() is called once per query, not per row.
-- ============================================================================

-- ─── Helper: resolve current user's company_id (cached per query) ─────────

create or replace function public.get_user_company_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select cm.company_id
  from public.company_members cm
  where cm.user_id = (select auth.uid())
  limit 1
$$;

-- ─── Helper: check if current user is admin in their company ──────────────

create or replace function public.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_members cm
    where cm.user_id = (select auth.uid())
      and cm.role = 'admin'
  )
$$;

-- ─── companies ────────────────────────────────────────────────────────────

alter table public.companies enable row level security;

-- Members can read their own company
create policy "companies_select" on public.companies
  for select to authenticated
  using (id = (select public.get_user_company_id()));

-- Only admins can update company profile
create policy "companies_update" on public.companies
  for update to authenticated
  using (id = (select public.get_user_company_id()) and (select public.is_company_admin()));

-- Insert: handled by Edge Function with service_role key (no user policy needed)
-- Delete: not allowed through client

-- ─── company_members ──────────────────────────────────────────────────────

alter table public.company_members enable row level security;

-- Members can see all members in their company
create policy "company_members_select" on public.company_members
  for select to authenticated
  using (company_id = (select public.get_user_company_id()));

-- Only admins can add new members
create policy "company_members_insert" on public.company_members
  for insert to authenticated
  with check (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
  );

-- Only admins can update member roles
create policy "company_members_update" on public.company_members
  for update to authenticated
  using (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
  );

-- Only admins can remove members (but not themselves)
create policy "company_members_delete" on public.company_members
  for delete to authenticated
  using (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
    and user_id != (select auth.uid())
  );

-- ─── customers ────────────────────────────────────────────────────────────

alter table public.customers enable row level security;

create policy "customers_all" on public.customers
  for all to authenticated
  using (company_id = (select public.get_user_company_id()))
  with check (company_id = (select public.get_user_company_id()));

-- ─── estimates ────────────────────────────────────────────────────────────

alter table public.estimates enable row level security;

create policy "estimates_all" on public.estimates
  for all to authenticated
  using (company_id = (select public.get_user_company_id()))
  with check (company_id = (select public.get_user_company_id()));

-- ─── inventory_items ──────────────────────────────────────────────────────

alter table public.inventory_items enable row level security;

create policy "inventory_items_all" on public.inventory_items
  for all to authenticated
  using (company_id = (select public.get_user_company_id()))
  with check (company_id = (select public.get_user_company_id()));

-- ─── equipment ────────────────────────────────────────────────────────────

alter table public.equipment enable row level security;

create policy "equipment_all" on public.equipment
  for all to authenticated
  using (company_id = (select public.get_user_company_id()))
  with check (company_id = (select public.get_user_company_id()));

-- ─── company_settings ─────────────────────────────────────────────────────

alter table public.company_settings enable row level security;

-- All members can read settings
create policy "company_settings_select" on public.company_settings
  for select to authenticated
  using (company_id = (select public.get_user_company_id()));

-- Only admins can modify settings
create policy "company_settings_insert" on public.company_settings
  for insert to authenticated
  with check (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
  );

create policy "company_settings_update" on public.company_settings
  for update to authenticated
  using (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
  );

create policy "company_settings_delete" on public.company_settings
  for delete to authenticated
  using (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
  );

-- ─── profit_loss ──────────────────────────────────────────────────────────

alter table public.profit_loss enable row level security;

-- All members can read P&L
create policy "profit_loss_select" on public.profit_loss
  for select to authenticated
  using (company_id = (select public.get_user_company_id()));

-- Insert only via Edge Function (service_role) or admin
create policy "profit_loss_insert" on public.profit_loss
  for insert to authenticated
  with check (
    company_id = (select public.get_user_company_id())
    and (select public.is_company_admin())
  );

-- ─── material_logs ────────────────────────────────────────────────────────

alter table public.material_logs enable row level security;

-- All members can read
create policy "material_logs_select" on public.material_logs
  for select to authenticated
  using (company_id = (select public.get_user_company_id()));

-- All members can insert (crew logs materials on job completion)
create policy "material_logs_insert" on public.material_logs
  for insert to authenticated
  with check (company_id = (select public.get_user_company_id()));

-- ─── time_entries ─────────────────────────────────────────────────────────

alter table public.time_entries enable row level security;

-- All members can read time entries for their company
create policy "time_entries_select" on public.time_entries
  for select to authenticated
  using (company_id = (select public.get_user_company_id()));

-- Members can insert their own time entries
create policy "time_entries_insert" on public.time_entries
  for insert to authenticated
  with check (
    company_id = (select public.get_user_company_id())
    and user_id = (select auth.uid())
  );

-- Members can update their own time entries (e.g., clock out)
create policy "time_entries_update" on public.time_entries
  for update to authenticated
  using (
    company_id = (select public.get_user_company_id())
    and user_id = (select auth.uid())
  );

-- ─── purchase_orders ──────────────────────────────────────────────────────

alter table public.purchase_orders enable row level security;

create policy "purchase_orders_all" on public.purchase_orders
  for all to authenticated
  using (company_id = (select public.get_user_company_id()))
  with check (company_id = (select public.get_user_company_id()));

-- ─── purchase_order_items ─────────────────────────────────────────────────

alter table public.purchase_order_items enable row level security;

-- Access through parent PO's company check
create policy "po_items_select" on public.purchase_order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_id
        and po.company_id = (select public.get_user_company_id())
    )
  );

create policy "po_items_insert" on public.purchase_order_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_id
        and po.company_id = (select public.get_user_company_id())
    )
  );

create policy "po_items_update" on public.purchase_order_items
  for update to authenticated
  using (
    exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_id
        and po.company_id = (select public.get_user_company_id())
    )
  );

create policy "po_items_delete" on public.purchase_order_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_id
        and po.company_id = (select public.get_user_company_id())
    )
  );


-- ─── Supabase Storage: company-files bucket ───────────────────────────────

insert into storage.buckets (id, name, public)
values ('company-files', 'company-files', false)
on conflict (id) do nothing;

-- Storage RLS: users can only access their company's folder
create policy "company_files_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'company-files'
    and (storage.foldername(name))[1] = (select public.get_user_company_id())::text
  );

create policy "company_files_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'company-files'
    and (storage.foldername(name))[1] = (select public.get_user_company_id())::text
  );

create policy "company_files_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'company-files'
    and (storage.foldername(name))[1] = (select public.get_user_company_id())::text
  );

create policy "company_files_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'company-files'
    and (storage.foldername(name))[1] = (select public.get_user_company_id())::text
  );
