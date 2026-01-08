-- FIX SCHEMA ISSUES & ENSURE TRIGGERS

-- 1. FIX ROUTE_STOPS SCHEMA - Remove stop_order if exists, ensure sequence exists
BEGIN;

ALTER TABLE public.route_stops DROP COLUMN IF EXISTS stop_order;

ALTER TABLE public.route_stops
ADD COLUMN IF NOT EXISTS sequence integer;

-- 2. CREATE DRIVER NOTIFICATIONS TABLE (for sending route alerts to drivers)
CREATE TABLE IF NOT EXISTS public.driver_notifications (
    id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    driver_id uuid REFERENCES public.users (id) ON DELETE CASCADE,
    route_id uuid REFERENCES public.route_plans (id) ON DELETE CASCADE,
    message text NOT NULL,
    type text CHECK (
        type IN (
            'new_route',
            'route_update',
            'delivery_complete',
            'alert'
        )
    ),
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);

ALTER TABLE public.driver_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers read own notifications" ON public.driver_notifications;

CREATE POLICY "Drivers read own notifications" ON public.driver_notifications FOR
SELECT USING (driver_id = auth.uid ());

DROP POLICY IF EXISTS "Drivers update own notifications" ON public.driver_notifications;

CREATE POLICY "Drivers update own notifications" ON public.driver_notifications FOR
UPDATE USING (driver_id = auth.uid ());

DROP POLICY IF EXISTS "Admins manage all notifications" ON public.driver_notifications;

CREATE POLICY "Admins manage all notifications" ON public.driver_notifications FOR ALL USING (
    coalesce(
        auth.jwt () -> 'user_metadata' ->> 'role',
        ''
    ) IN ('Admin', 'Super Admin')
);

-- 3. ENSURE INVENTORY TRIGGER IS CREATED & WORKING
CREATE OR REPLACE FUNCTION public.manage_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: Reserve stock (tidak kurangi stock, hanya reserve)
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.products
    SET reserved_stock = COALESCE(reserved_stock, 0) + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
  
  -- Handle DELETE: Unreserve stock (kembalikan reserved ke available)
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.products
    SET reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - OLD.quantity)
    WHERE id = OLD.product_id;
    RETURN OLD;
  
  -- Handle UPDATE: Adjust reserved stock by the difference
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Calculate difference: New Qty - Old Qty
    UPDATE public.products
    SET reserved_stock = COALESCE(reserved_stock, 0) + (NEW.quantity - OLD.quantity)
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's active
DROP TRIGGER IF EXISTS trg_manage_inventory ON public.order_items;

CREATE TRIGGER trg_manage_inventory
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.manage_inventory();

-- 4. ENSURE ORDER_ITEMS TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products (id),
    quantity integer NOT NULL CHECK (quantity > 0),
    original_price numeric(12, 2),
    special_price numeric(12, 2),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- 5. FIX PRODUCTS TABLE - Ensure reserved_stock column exists
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS reserved_stock integer DEFAULT 0;

-- 6. VERIFY DATA CONSISTENCY - Reset orders without routed status
UPDATE public.orders
SET
    status = 'Pending'
WHERE
    status NOT IN(
        'Pending',
        'Routed',
        'Completed',
        'Failed',
        'Cancelled'
    );

COMMIT;