-- ============================================================================
-- 001_schema.sql — Multi-tenant schema for RFE Foam Pro SaaS
-- ============================================================================
-- Conventions:
--   • bigint generated always as identity for PKs
--   • timestamptz for all timestamps
--   • text for strings (no varchar limits)
--   • numeric(12,2) for money
--   • jsonb for nested/flexible data
--   • company_id on every tenant-scoped table
-- ============================================================================

-- ─── Companies ─────────────────────────────────────────────────────────────

create table public.companies (
  id            bigint generated always as identity primary key,
  name          text not null,
  address_line1 text not null default '',
  address_line2 text not null default '',
  city          text not null default '',
  state         text not null default '',
  zip           text not null default '',
  phone         text not null default '',
  email         text not null default '',
  website       text not null default '',
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Company Members (users ↔ companies + roles) ──────────────────────────

create table public.company_members (
  id          bigint generated always as identity primary key,
  company_id  bigint not null references public.companies(id) on delete cascade,
  user_id     uuid   not null references auth.users(id) on delete cascade,
  role        text   not null default 'crew'
              check (role in ('admin', 'crew', 'supervisor', 'technician', 'helper')),
  invited_by  uuid   references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (company_id, user_id)
);

create index company_members_user_id_idx on public.company_members (user_id);
create index company_members_company_id_idx on public.company_members (company_id);

-- ─── Customers ─────────────────────────────────────────────────────────────

create table public.customers (
  id          bigint generated always as identity primary key,
  company_id  bigint not null references public.companies(id) on delete cascade,
  name        text   not null,
  address     text   not null default '',
  city        text   not null default '',
  state       text   not null default '',
  zip         text   not null default '',
  phone       text   not null default '',
  email       text   not null default '',
  notes       text   not null default '',
  status      text   not null default 'Active'
              check (status in ('Active', 'Archived', 'Lead')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index customers_company_id_idx on public.customers (company_id);

-- ─── Estimates (core job entity) ───────────────────────────────────────────

create table public.estimates (
  id                  bigint generated always as identity primary key,
  company_id          bigint      not null references public.companies(id) on delete cascade,
  customer_id         bigint      references public.customers(id) on delete set null,
  date                timestamptz not null default now(),
  status              text        not null default 'Draft'
                      check (status in ('Draft', 'Work Order', 'Invoiced', 'Paid', 'Archived')),
  execution_status    text        not null default 'Not Started'
                      check (execution_status in ('Not Started', 'In Progress', 'Completed')),
  total_value         numeric(12,2) not null default 0,

  -- Invoice fields
  invoice_number      text,
  invoice_date        timestamptz,
  payment_terms       text,
  scheduled_date      timestamptz,
  job_notes           text,

  -- Nested calculation data (kept as JSONB — matches existing frontend types)
  inputs              jsonb not null default '{}',
  results             jsonb not null default '{}',
  materials           jsonb not null default '{}',
  wall_settings       jsonb not null default '{}',
  roof_settings       jsonb not null default '{}',
  expenses            jsonb not null default '{}',
  pricing_mode        text,
  sqft_rates          jsonb,

  -- Line items per stage
  estimate_lines      jsonb,
  invoice_lines       jsonb,
  work_order_lines    jsonb,

  -- Job completion data
  actuals             jsonb,
  financials          jsonb,
  inventory_processed boolean not null default false,

  -- File references (Supabase Storage paths)
  pdf_url             text,
  work_order_url      text,
  site_photos         text[] not null default '{}',

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index estimates_company_id_idx  on public.estimates (company_id);
create index estimates_customer_id_idx on public.estimates (customer_id);
create index estimates_status_idx      on public.estimates (company_id, status);

-- ─── Inventory Items ───────────────────────────────────────────────────────

create table public.inventory_items (
  id          bigint generated always as identity primary key,
  company_id  bigint       not null references public.companies(id) on delete cascade,
  name        text         not null,
  quantity    numeric(12,4) not null default 0,
  unit        text         not null default '',
  unit_cost   numeric(12,2) not null default 0,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create index inventory_items_company_id_idx on public.inventory_items (company_id);

-- ─── Equipment ─────────────────────────────────────────────────────────────

create table public.equipment (
  id          bigint generated always as identity primary key,
  company_id  bigint      not null references public.companies(id) on delete cascade,
  name        text        not null,
  status      text        not null default 'Available'
              check (status in ('Available', 'In Use', 'Maintenance', 'Lost')),
  last_seen   jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index equipment_company_id_idx on public.equipment (company_id);

-- ─── Company Settings (key-value per company) ─────────────────────────────

create table public.company_settings (
  id          bigint generated always as identity primary key,
  company_id  bigint      not null references public.companies(id) on delete cascade,
  key         text        not null,
  value       jsonb       not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (company_id, key)
);

create index company_settings_company_id_idx on public.company_settings (company_id);

-- ─── Profit & Loss (append-only) ──────────────────────────────────────────

create table public.profit_loss (
  id              bigint generated always as identity primary key,
  company_id      bigint        not null references public.companies(id) on delete cascade,
  estimate_id     bigint        references public.estimates(id) on delete set null,
  date_paid       timestamptz   not null default now(),
  customer_name   text          not null default '',
  invoice_number  text,
  revenue         numeric(12,2) not null default 0,
  chemical_cost   numeric(12,2) not null default 0,
  labor_cost      numeric(12,2) not null default 0,
  inventory_cost  numeric(12,2) not null default 0,
  misc_cost       numeric(12,2) not null default 0,
  total_cogs      numeric(12,2) not null default 0,
  net_profit      numeric(12,2) not null default 0,
  margin          numeric(5,2)  not null default 0,
  created_at      timestamptz   not null default now()
);

create index profit_loss_company_id_idx  on public.profit_loss (company_id);
create index profit_loss_estimate_id_idx on public.profit_loss (estimate_id);

-- ─── Material Logs (append-only) ──────────────────────────────────────────

create table public.material_logs (
  id              bigint generated always as identity primary key,
  company_id      bigint       not null references public.companies(id) on delete cascade,
  estimate_id     bigint       references public.estimates(id) on delete set null,
  date            timestamptz  not null default now(),
  customer_name   text         not null default '',
  material_name   text         not null,
  quantity        numeric(12,4) not null default 0,
  unit            text         not null default '',
  logged_by       uuid         references auth.users(id),
  created_at      timestamptz  not null default now()
);

create index material_logs_company_id_idx  on public.material_logs (company_id);
create index material_logs_estimate_id_idx on public.material_logs (estimate_id);

-- ─── Time Entries (crew clock in/out) ─────────────────────────────────────

create table public.time_entries (
  id          bigint generated always as identity primary key,
  company_id  bigint      not null references public.companies(id) on delete cascade,
  estimate_id bigint      references public.estimates(id) on delete set null,
  user_id     uuid        not null references auth.users(id),
  start_time  timestamptz not null,
  end_time    timestamptz,
  created_at  timestamptz not null default now()
);

create index time_entries_company_id_idx  on public.time_entries (company_id);
create index time_entries_estimate_id_idx on public.time_entries (estimate_id);
create index time_entries_user_id_idx     on public.time_entries (user_id);

-- ─── Purchase Orders ──────────────────────────────────────────────────────

create table public.purchase_orders (
  id          bigint       generated always as identity primary key,
  company_id  bigint       not null references public.companies(id) on delete cascade,
  date        timestamptz  not null default now(),
  vendor_name text         not null default '',
  status      text         not null default 'Draft'
              check (status in ('Draft', 'Sent', 'Received', 'Cancelled')),
  total_cost  numeric(12,2) not null default 0,
  notes       text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create index purchase_orders_company_id_idx on public.purchase_orders (company_id);

-- ─── Purchase Order Items ─────────────────────────────────────────────────

create table public.purchase_order_items (
  id                bigint        generated always as identity primary key,
  purchase_order_id bigint        not null references public.purchase_orders(id) on delete cascade,
  description       text          not null default '',
  quantity          numeric(12,4) not null default 0,
  unit_cost         numeric(12,2) not null default 0,
  total             numeric(12,2) not null default 0,
  type              text          not null default 'inventory'
                    check (type in ('open_cell', 'closed_cell', 'inventory')),
  inventory_id      bigint        references public.inventory_items(id) on delete set null,
  created_at        timestamptz   not null default now()
);

create index po_items_purchase_order_id_idx on public.purchase_order_items (purchase_order_id);


-- ─── Enable Supabase Realtime on key tables ───────────────────────────────

alter publication supabase_realtime add table public.estimates;
alter publication supabase_realtime add table public.time_entries;
alter publication supabase_realtime add table public.inventory_items;
alter publication supabase_realtime add table public.equipment;
