-- =========================================================================
-- COMPLETE BACKEND SETUP & CONSOLIDATED POLICIES FOR LAKSHYA SPORTS
-- Standard idempotent PostgreSQL script (Pure DDL)
-- =========================================================================

-- 1. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id text PRIMARY KEY,
    code text UNIQUE NOT NULL,
    type text NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED')),
    value numeric NOT NULL,
    min_order_value numeric DEFAULT 0,
    usage_count integer DEFAULT 0,
    expiry text DEFAULT 'No Expiry',
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on active coupons" ON public.coupons;
CREATE POLICY "Allow public select on active coupons"
    ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated admin full access on coupons" ON public.coupons;
CREATE POLICY "Allow authenticated admin full access on coupons"
    ON public.coupons FOR ALL USING (auth.role() = 'authenticated');

-- Seed default coupons
INSERT INTO public.coupons (id, code, type, value, min_order_value, usage_count, expiry, active)
VALUES 
    ('1', 'WELCOME10', 'PERCENTAGE', 10, 1000, 0, '2026-12-31', true),
    ('2', 'SPORT500', 'FIXED', 500, 2000, 0, '2026-10-15', true)
ON CONFLICT (code) DO NOTHING;


-- 2. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    name text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text NOT NULL,
    verified boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to read reviews" ON public.product_reviews;
CREATE POLICY "Allow public to read reviews"
    ON public.product_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone to submit review" ON public.product_reviews;
CREATE POLICY "Allow anyone to submit review"
    ON public.product_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to manage reviews" ON public.product_reviews;
CREATE POLICY "Allow admin to manage reviews"
    ON public.product_reviews FOR ALL USING (auth.role() = 'authenticated');


-- 3. USER ROLES TABLE & ADMIN HELPER FUNCTION
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'staff')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read own role" ON public.user_roles;
CREATE POLICY "Allow users to read own role"
    ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated to manage user roles" ON public.user_roles;
CREATE POLICY "Allow authenticated to manage user roles"
    ON public.user_roles FOR ALL USING (auth.role() = 'authenticated');

-- Helper function to promote any user to admin by their email address
CREATE OR REPLACE FUNCTION public.assign_admin_by_email(target_email text)
RETURNS text AS $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email LIMIT 1;
    IF target_user_id IS NULL THEN
        RETURN 'Error: User with email "' || target_email || '" not found in auth.users. Please register/sign up first.';
    END IF;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    RETURN 'Success: ' || target_email || ' has been assigned the admin role.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. ORDERS TABLE: ALLOW ADMIN UPDATES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin to update orders" ON public.orders;
CREATE POLICY "Allow admin to update orders"
    ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');


-- 5. HERO BANNERS POLICIES
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on hero_banners" ON public.hero_banners;
CREATE POLICY "Allow public read on hero_banners"
    ON public.hero_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated to manage hero_banners" ON public.hero_banners;
CREATE POLICY "Allow authenticated to manage hero_banners"
    ON public.hero_banners FOR ALL USING (auth.role() = 'authenticated');


-- 6. PRODUCTS POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products"
    ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated to manage products" ON public.products;
CREATE POLICY "Allow authenticated to manage products"
    ON public.products FOR ALL USING (auth.role() = 'authenticated');


-- 7. STORAGE BUCKET: product-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
CREATE POLICY "Public Access product-images"
    ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin Upload product-images" ON storage.objects;
CREATE POLICY "Admin Upload product-images"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin Update product-images" ON storage.objects;
CREATE POLICY "Admin Update product-images"
    ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin Delete product-images" ON storage.objects;
CREATE POLICY "Admin Delete product-images"
    ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
