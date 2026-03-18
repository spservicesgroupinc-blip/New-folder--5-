-- ─── Trial Leads (public signup form) ────────────────────────────────────────

create table public.trial_leads (
  id         bigint generated always as identity primary key,
  name       text        not null,
  email      text        not null,
  phone      text        not null default '',
  created_at timestamptz not null default now()
);

-- No RLS needed — inserts happen from unauthenticated public form.
-- To prevent spam you may add rate limiting at the API/edge function layer.
-- Read access only via service_role key (never expose to client).
