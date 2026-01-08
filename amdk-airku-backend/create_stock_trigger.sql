-- Function to manage inventory based on changes in order_items
CREATE OR REPLACE FUNCTION public.manage_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: Decrease stock
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
  
  -- Handle DELETE: Increase stock (Restock)
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.products
    SET stock = stock + OLD.quantity
    WHERE id = OLD.product_id;
    RETURN OLD;
  
  -- Handle UPDATE: Adjust stock by the difference
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Calculate difference: New Qty - Old Qty
    -- If New is 10, Old was 5. Diff is 5. We need to DECREASE stock by 5 more.
    -- Formula: stock = stock - (new_qty - old_qty)
    -- If New is 2, Old was 5. Diff is -3. Stock - (-3) = Stock + 3. Correct.
    UPDATE public.products
    SET stock = stock - (NEW.quantity - OLD.quantity)
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trg_manage_inventory ON public.order_items;

CREATE TRIGGER trg_manage_inventory
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.manage_inventory();
