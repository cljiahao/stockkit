-- The one write path for stock changes (restock/waste/adjustment). Atomic —
-- a Postgres function body is one implicit transaction, so the RAISE
-- EXCEPTION after the UPDATE rolls the whole call back, including the
-- ledger INSERT that never runs.
CREATE OR REPLACE FUNCTION stockkit.record_stock_movement(
  p_product_id uuid,
  p_delta numeric,
  p_reason text,
  p_note text DEFAULT NULL,
  p_unit_cost_cents integer DEFAULT NULL
) RETURNS stockkit.products
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = stockkit
AS $$
DECLARE
  v_product stockkit.products;
BEGIN
  UPDATE stockkit.products
  SET on_hand = on_hand + p_delta,
      updated_at = now()
  WHERE id = p_product_id AND vendor_id = auth.uid()
  RETURNING * INTO v_product;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'product not found or not owned by caller';
  END IF;

  IF v_product.on_hand < 0 THEN
    RAISE EXCEPTION 'stock movement would take % below zero', v_product.name;
  END IF;

  -- p_reason isn't re-validated here — the stock_movements.reason CHECK
  -- constraint (0001) already rejects an invalid value at this INSERT.
  INSERT INTO stockkit.stock_movements (vendor_id, product_id, delta, reason, note, unit_cost_cents)
  VALUES (v_product.vendor_id, p_product_id, p_delta, p_reason, p_note, p_unit_cost_cents);

  RETURN v_product;
END;
$$;

-- SECURITY INVOKER deliberately, not DEFINER: the caller is always the
-- authenticated vendor themselves (never an anonymous customer, unlike
-- qkit's place_order), so RLS on the UPDATE/INSERT above already does the
-- authorization — no privilege escalation is needed here.
GRANT EXECUTE ON FUNCTION stockkit.record_stock_movement(uuid, numeric, text, text, integer) TO authenticated;
