CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id text UNIQUE NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    shipping_address jsonb NOT NULL,
    items jsonb NOT NULL,
    subtotal numeric NOT NULL,
    shipping_fee numeric NOT NULL,
    total_amount numeric NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'Processing'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert an order (Guest checkout)
CREATE POLICY "Allow public inserts on orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated admins to view all orders
CREATE POLICY "Allow admin to view all orders"
    ON public.orders
    FOR SELECT
    USING ( auth.role() = 'authenticated' );
