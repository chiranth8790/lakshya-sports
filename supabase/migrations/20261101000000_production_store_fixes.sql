-- =========================================================================
-- LAKSHYA SPORTS: PRODUCTION STORE FIXES & RPC AUTOMATION
-- =========================================================================

-- 1. ADD DISCOUNT_AMOUNT, UTR, PICKUP_STORE, PAYMENT_ID COLUMNS TO ORDERS (IF NOT EXISTS)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS utr_number text,
ADD COLUMN IF NOT EXISTS pickup_store text,
ADD COLUMN IF NOT EXISTS payment_id text;

-- 2. CREATE CONTACT_INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert on contact_inquiries"
    ON public.contact_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admin manage contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow authenticated admin manage contact_inquiries"
    ON public.contact_inquiries FOR ALL USING (auth.role() = 'authenticated');

-- 3. INVENTORY ATOMIC DEDUCTION RPC
CREATE OR REPLACE FUNCTION public.decrement_inventory(p_order_items jsonb)
RETURNS jsonb AS $$
DECLARE
    item jsonb;
    p_id text;
    qty integer;
    var_name text;
    current_prod record;
    new_variants jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
    LOOP
        p_id := item->>'id';
        qty := COALESCE((item->>'quantity')::integer, 1);
        var_name := item->>'selectedVariant';

        IF p_id IS NOT NULL THEN
            SELECT * INTO current_prod FROM public.products WHERE id::text = p_id FOR UPDATE;

            IF current_prod IS NOT NULL THEN
                -- Handle variants update if exists
                IF current_prod.variants IS NOT NULL AND jsonb_array_length(current_prod.variants) > 0 AND var_name IS NOT NULL THEN
                    SELECT jsonb_agg(
                        CASE 
                            WHEN v->>'name' = var_name THEN
                                jsonb_set(v, '{stock}', to_jsonb(GREATEST(0, COALESCE((v->>'stock')::integer, 0) - qty)))
                            ELSE v
                        END
                    ) INTO new_variants
                    FROM jsonb_array_elements(current_prod.variants) AS v;
                ELSE
                    new_variants := current_prod.variants;
                END IF;

                -- Update main stock count & variant array
                UPDATE public.products
                SET 
                    stock = GREATEST(0, COALESCE(stock, 0) - qty),
                    variants = COALESCE(new_variants, variants)
                WHERE id::text = p_id;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. COUPON USAGE INCREMENT RPC
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_code text)
RETURNS jsonb AS $$
BEGIN
    UPDATE public.coupons
    SET usage_count = COALESCE(usage_count, 0) + 1
    WHERE lower(code) = lower(trim(p_coupon_code));

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SECURE GUEST & AUTHENTICATED ORDER TRACKING RPC
CREATE OR REPLACE FUNCTION public.track_order(p_order_id text, p_contact text DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
    found_order record;
    clean_search_phone text;
    clean_order_phone text;
BEGIN
    SELECT * INTO found_order
    FROM public.orders
    WHERE lower(order_id) = lower(trim(p_order_id))
    LIMIT 1;

    IF found_order IS NULL THEN
        RETURN jsonb_build_object('found', false, 'error', 'ORDER_NOT_FOUND');
    END IF;

    -- If contact verification is provided
    IF p_contact IS NOT NULL AND length(trim(p_contact)) > 0 THEN
        clean_search_phone := regexp_replace(p_contact, '\D', '', 'g');
        clean_order_phone := regexp_replace(COALESCE(found_order.customer_phone, ''), '\D', '', 'g');

        IF lower(COALESCE(found_order.customer_email, '')) <> lower(trim(p_contact))
           AND (length(clean_search_phone) < 4 OR position(clean_search_phone in clean_order_phone) = 0) THEN
            RETURN jsonb_build_object('found', true, 'verified', false, 'error', 'CONTACT_MISMATCH');
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'found', true,
        'verified', true,
        'order', to_jsonb(found_order)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GRANT EXECUTE RIGHTS ON RPC FUNCTIONS TO ALL ROLES
GRANT EXECUTE ON FUNCTION public.decrement_inventory(jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated, service_role;
