-- stockkit lives in its own schema so the shared Merqo project reads merqo.* / stockkit.*
-- per kit. auth.* and extensions.* are Supabase-managed and untouched.
CREATE SCHEMA IF NOT EXISTS stockkit;

-- Data API roles need USAGE on the schema before any table grant resolves.
-- Per-table/per-function grants (and the deliberate revokes) stay in the
-- migrations that own each object.
GRANT USAGE ON SCHEMA stockkit TO anon, authenticated, service_role;
