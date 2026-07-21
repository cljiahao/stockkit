-- stockkit/supabase/migrations/0004_feedback.sql
-- Vendor NPS feedback table: allows authenticated vendors to submit feedback
-- via FeedbackForm component. RLS policy enforces self-insert only.

create table stockkit.feedback (
  id bigint generated always as identity primary key,
  vendor_id uuid not null references auth.users(id) on delete cascade,
  nps smallint not null check (nps between 0 and 10),
  message text,
  created_at timestamptz not null default now()
);

alter table stockkit.feedback enable row level security;

create policy feedback_self_insert on stockkit.feedback
  for insert
  to authenticated
  with check (vendor_id = auth.uid());

-- RLS + policy alone is not enough — Postgres also checks the table-level
-- privilege grant before it ever evaluates a policy, so without this an
-- authenticated vendor's insert fails with "permission denied for table
-- feedback" even though the policy above would allow it. Matches the grant
-- pattern used for sibling kits' feedback tables (paykit 0002_feedback.sql,
-- loopkit 0029_feedback.sql). Schema-level USAGE is already granted in
-- 0000_create_stockkit_schema.sql; only the table-specific grants are needed
-- here.
grant insert on stockkit.feedback to authenticated;
grant all on stockkit.feedback to service_role;
