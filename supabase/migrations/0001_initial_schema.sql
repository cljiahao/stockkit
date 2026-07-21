-- ── Tables ──────────────────────────────────────────────────────────────────

-- Vendors: one row per auth user who tracks stock in stockkit.
CREATE TABLE stockkit.vendors (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products: what a vendor stocks. on_hand is the live running balance,
-- mutated only through stockkit.record_stock_movement (0002) or a direct
-- insert alongside a product's own creation (the 'initial' balance).
CREATE TABLE stockkit.products (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id            UUID        NOT NULL REFERENCES stockkit.vendors(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,
  unit                 TEXT        NOT NULL DEFAULT 'unit',
  unit_cost_cents      INTEGER     NOT NULL DEFAULT 0 CHECK (unit_cost_cents >= 0),
  on_hand              NUMERIC     NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  low_stock_threshold  NUMERIC     NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
  is_active            BOOLEAN     NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock movements: an append-only ledger. Never updated or deleted — see the
-- deliberate lack of update/delete RLS policies below, which is what actually
-- enforces the append-only rule.
CREATE TABLE stockkit.stock_movements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        UUID        NOT NULL REFERENCES stockkit.vendors(id) ON DELETE CASCADE,
  product_id       UUID        NOT NULL REFERENCES stockkit.products(id) ON DELETE CASCADE,
  delta            NUMERIC     NOT NULL CHECK (delta <> 0),
  reason           TEXT        NOT NULL CHECK (reason IN ('restock', 'waste', 'adjustment', 'initial')),
  note             TEXT,
  unit_cost_cents  INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every product update.
CREATE OR REPLACE FUNCTION stockkit.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON stockkit.products
  FOR EACH ROW EXECUTE FUNCTION stockkit.update_updated_at();

-- Schema-level USAGE is already granted in 0000_create_stockkit_schema.sql.
-- RLS + policy alone is not enough — Postgres also checks the table-level
-- privilege grant before it ever evaluates a policy, so without these an
-- authenticated vendor's insert/select/update fails with "permission denied
-- for table ..." even though the policies below would allow it. Matches the
-- grant pattern used in 0004_feedback.sql (grant the exact operations each
-- table's policies actually allow; service_role always gets `all`).
grant select, insert, update on stockkit.vendors to authenticated;
grant all on stockkit.vendors to service_role;

grant select, insert, update, delete on stockkit.products to authenticated;
grant all on stockkit.products to service_role;

grant select, insert on stockkit.stock_movements to authenticated;
grant all on stockkit.stock_movements to service_role;

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE stockkit.vendors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stockkit.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stockkit.stock_movements ENABLE ROW LEVEL SECURITY;

-- vendors: each vendor only sees and edits their own row. No public read —
-- unlike qkit's booths, none of this data ever needs to be public.
CREATE POLICY "vendors_self_select" ON stockkit.vendors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "vendors_self_insert" ON stockkit.vendors
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "vendors_self_update" ON stockkit.vendors
  FOR UPDATE USING (auth.uid() = id);

-- products: a vendor fully manages their own products. WITH CHECK on top of
-- USING closes the "re-point a row at another vendor_id" escalation an
-- USING-only policy would otherwise leave open on UPDATE.
CREATE POLICY "products_vendor_all" ON stockkit.products
  FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- stock_movements: a vendor reads and inserts their own ledger rows.
-- Deliberately no UPDATE/DELETE policy — default-deny keeps this an
-- immutable audit trail, even for the row's own owner.
CREATE POLICY "stock_movements_vendor_select" ON stockkit.stock_movements
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "stock_movements_vendor_insert" ON stockkit.stock_movements
  FOR INSERT WITH CHECK (vendor_id = auth.uid());
