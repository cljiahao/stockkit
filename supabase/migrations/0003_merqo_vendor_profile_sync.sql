-- Shared vendor identity: registers a stockkit vendor's stall name into the
-- shared merqo.vendor_profile table so it's known ecosystem-wide, matching
-- the documented pattern of "own signup + write into merqo.vendor_profile"
-- (see merqo/supabase/migrations/0009_vendor_profile.sql for
-- merqo.upsert_vendor_profile's signature). This is a same-instance SQL
-- wrapper inside the stockkit schema so a plain Postgres cross-schema call
-- reaches it, sidestepping any PostgREST schema-exposure question since this
-- is a native SQL call, not an HTTP one.
CREATE OR REPLACE FUNCTION stockkit.sync_vendor_profile(p_stall_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stockkit, merqo
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  PERFORM merqo.upsert_vendor_profile(auth.uid(), p_stall_name, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION stockkit.sync_vendor_profile(text) TO authenticated;
