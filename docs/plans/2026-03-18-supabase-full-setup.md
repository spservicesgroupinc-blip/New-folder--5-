# Supabase Full Setup — RFE Foam Pro Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verify and fully connect the RFE Foam Pro React/Vite app to Supabase project `uygjdlbvipbjhldtlgin` — applying the pending migration, confirming all tables exist, regenerating TypeScript types from live schema, and running a connectivity smoke test.

**Architecture:** The app uses `@supabase/supabase-js` v2 via `src/shared/services/supabase/supabaseClient.ts`, typed against a hand-written `src/shared/types/database.types.ts`. The `.env` already points to the correct project. We will use the MCP `mcp__665f077d-cc78-4232-9702-9406acca7579` tools to operate directly on the live DB, then regenerate TypeScript types via the MCP or CLI.

**Tech Stack:** React 18, Vite, TypeScript, @supabase/supabase-js v2.99.2, Supabase MCP tools, npx supabase CLI (type gen only)

---

## Task 1: Verify MCP is Connected to the Correct Project

**Goal:** Confirm that the `mcp__665f077d` MCP instance actually talks to `uygjdlbvipbjhldtlgin` (not a different project).

**Files:** None modified.

**Step 1: Get project URL via MCP**

Call tool: `mcp__665f077d-cc78-4232-9702-9406acca7579__get_project_url`
*(No parameters needed — it returns the URL of the project the MCP is scoped to.)*

Expected output: `https://uygjdlbvipbjhldtlgin.supabase.co`

**Step 2: If wrong project — fall back to `mcp__supabase__get_project_url`**

Call tool: `mcp__supabase__get_project_url`

If neither returns `uygjdlbvipbjhldtlgin`, skip MCP-driven DB tasks and use only the Supabase CLI (Task 2 alternative).

**Step 3: Record which MCP alias is correct**

Note it as `CORRECT_MCP` (either `mcp__665f077d-cc78-4232-9702-9406acca7579` or `mcp__supabase`). Use that alias for all subsequent MCP calls.

---

## Task 2: Confirm Migrations 001–003 Are Already Applied

**Goal:** Check the live DB to see which tables exist before applying migration 004.

**Step 1: List existing tables**

Call tool: `CORRECT_MCP__list_tables`
*(Use whichever alias was confirmed in Task 1.)*

Expected tables (from 001_schema.sql):
- `companies`
- `company_members`
- `customers`
- `estimates`
- `inventory_items`
- `equipment`
- `company_settings`
- `profit_loss`
- `material_logs`
- `time_entries`
- `purchase_orders`
- `purchase_order_items`

**Step 2: If tables are missing — apply migrations 001, 002, 003 first**

Only do this step if the tables above are absent. Run each migration file's SQL via `CORRECT_MCP__execute_sql`:

```sql
-- Paste full contents of supabase/migrations/001_schema.sql
-- then 002_rls_policies.sql
-- then 003_triggers.sql
```

If tables exist, skip to Task 3.

**Step 3: Verify `trial_leads` table does NOT yet exist**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select exists (
  select 1 from information_schema.tables
  where table_schema = 'public'
    and table_name = 'trial_leads'
);
```

Expected: `false` (meaning 004 has not been applied yet).
If `true`, skip Task 3 and go straight to Task 4.

---

## Task 3: Apply Migration 004 — `trial_leads` Table

**Goal:** Create the `public.trial_leads` table on the live production DB.

**Files:**
- Reference: `supabase/migrations/004_trial_leads.sql`

**Step 1: Apply the migration via MCP**

Call tool: `CORRECT_MCP__apply_migration` with:
- `name`: `004_trial_leads`
- `query`:
```sql
-- ─── Trial Leads (public signup form) ────────────────────────────────────────

create table public.trial_leads (
  id         bigint generated always as identity primary key,
  name       text        not null,
  email      text        not null,
  phone      text        not null default '',
  created_at timestamptz not null default now()
);
```

Expected: Success response with no errors.

**Step 2: Verify the table was created**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'trial_leads'
order by ordinal_position;
```

Expected: 4 rows — `id`, `name`, `email`, `phone`, `created_at` with correct types.

**Step 3: Verify no RLS is set on trial_leads (intentional — public inserts)**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select relrowsecurity
from pg_class
where relname = 'trial_leads' and relnamespace = 'public'::regnamespace;
```

Expected: `false` (RLS disabled — this is intentional per migration comment).

---

## Task 4: Run Full Schema Smoke Test

**Goal:** Confirm the complete schema matches all 4 migration files. Catch any drift.

**Step 1: Verify all 12 expected tables exist**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
```

Expected tables (13 total including `trial_leads`):
```
companies, company_members, company_settings, customers, equipment,
estimates, inventory_items, material_logs, profit_loss,
purchase_order_items, purchase_orders, time_entries, trial_leads
```

**Step 2: Verify RLS helper functions exist**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_type = 'FUNCTION'
  and routine_name in (
    'get_user_company_id',
    'is_company_admin',
    'handle_updated_at',
    'handle_company_member_change',
    'complete_job',
    'mark_job_paid'
  )
order by routine_name;
```

Expected: 6 rows.

**Step 3: Verify storage bucket exists**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select id, name, public
from storage.buckets
where id = 'company-files';
```

Expected: 1 row — `company-files`, `public = false`.

**Step 4: Verify Realtime publication includes key tables**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by tablename;
```

Expected: `estimates`, `equipment`, `inventory_items`, `time_entries` are present.

---

## Task 5: Regenerate TypeScript Types from Live Schema

**Goal:** Replace the hand-written `src/shared/types/database.types.ts` with auto-generated types that include the new `trial_leads` table.

**Files:**
- Modify: `src/shared/types/database.types.ts`

**Step 1: Check if Supabase CLI is available**

Run in terminal:
```bash
npx supabase --version
```

Expected: Any version number (e.g., `2.x.x`). If it fails, install it:
```bash
npm install --save-dev supabase
```

**Step 2: Generate TypeScript types from the live project**

Run:
```bash
npx supabase gen types typescript \
  --project-id uygjdlbvipbjhldtlgin \
  > src/shared/types/database.types.ts
```

This uses the Supabase Management API and requires the project to be reachable. No local Supabase instance needed.

Expected: `src/shared/types/database.types.ts` is overwritten with auto-generated content.

**Step 3: Verify the generated file includes `trial_leads`**

Run:
```bash
grep -n "trial_leads" src/shared/types/database.types.ts
```

Expected: At least 3 matches — `Row`, `Insert`, `Update` type blocks for `trial_leads`.

**Step 4: Alternative — use MCP to generate types**

If the CLI fails, use:

Call tool: `CORRECT_MCP__generate_typescript_types`

Then paste the output into `src/shared/types/database.types.ts`, replacing all contents.

**Step 5: Verify TypeScript still compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors. If there are errors related to `trial_leads`, they're type mismatches in app code that reference the old hand-written types. Fix them by aligning to the new generated types.

---

## Task 6: Verify `.env` and Supabase Client

**Goal:** Confirm the app's environment variables and client are wired correctly.

**Files:**
- Read: `.env`
- Read: `src/shared/services/supabase/supabaseClient.ts`

**Step 1: Confirm `.env` values**

File `.env` should contain:
```
VITE_SUPABASE_URL=https://uygjdlbvipbjhldtlgin.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Both values must be non-empty. The URL must match `uygjdlbvipbjhldtlgin`.

**Step 2: Confirm `.env.local` doesn't override with wrong values**

Read `.env.local`. If it contains `VITE_SUPABASE_URL` pointing to a different project, update it to match `.env`.

**Step 3: Confirm client instantiation**

`src/shared/services/supabase/supabaseClient.ts` must read:
```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables...');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

This is already correct — no changes needed unless `.env.local` was overriding.

---

## Task 7: Connectivity Smoke Test

**Goal:** Prove the live app can actually read data from the DB (end-to-end, not just config).

**Step 1: Test anon-key read against `trial_leads` (no auth required)**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
-- Simulate what the client does: insert a test lead, then delete it
insert into public.trial_leads (name, email, phone)
values ('__smoke_test__', 'smoke@test.dev', '000-000-0000')
returning id;
```

Expected: Returns a row with an auto-generated `id`.

**Step 2: Clean up test row**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
delete from public.trial_leads where email = 'smoke@test.dev';
```

Expected: 1 row deleted.

**Step 3: Test authenticated table access (RLS check)**

Call tool: `CORRECT_MCP__execute_sql` with:
```sql
-- Verify RLS is active on companies table
select relrowsecurity from pg_class
where relname = 'companies' and relnamespace = 'public'::regnamespace;
```

Expected: `true`.

**Step 4: Run a quick build to confirm no broken imports**

```bash
npx vite build --mode development 2>&1 | tail -20
```

Expected: Build completes without TypeScript or import errors.

---

## Task 8: Final Verification Checklist

Run through each item and confirm ✅:

- [ ] MCP connected to `uygjdlbvipbjhldtlgin` — confirmed in Task 1
- [ ] All 13 tables exist in `public` schema — confirmed in Task 4
- [ ] All 6 DB functions exist — confirmed in Task 4
- [ ] `company-files` storage bucket exists — confirmed in Task 4
- [ ] Realtime enabled on 4 tables — confirmed in Task 4
- [ ] `trial_leads` table created (migration 004 applied) — confirmed in Task 3
- [ ] `database.types.ts` regenerated and includes `trial_leads` — confirmed in Task 5
- [ ] TypeScript compiles clean — confirmed in Task 5
- [ ] `.env` points to correct project — confirmed in Task 6
- [ ] Insert/delete smoke test on `trial_leads` passes — confirmed in Task 7
- [ ] Vite build succeeds — confirmed in Task 7

**Commit when all boxes are checked:**
```bash
git add src/shared/types/database.types.ts
git commit -m "chore: regenerate database.types.ts from live schema (adds trial_leads)"
```
