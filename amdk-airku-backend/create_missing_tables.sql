-- 1. SURVEY RESPONSES
CREATE TABLE public.survey_responses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sales_person_id uuid REFERENCES public.users(id),
  survey_date date NOT NULL,
  store_name text,
  store_address text,
  store_phone text,
  most_sought_products jsonb, -- Array of objects
  popular_airku_variants jsonb, -- Array of strings
  competitor_prices jsonb, -- Array of objects
  competitor_volumes jsonb, -- Array of objects
  feedback text,
  proof_of_survey_image text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read surveys" ON public.survey_responses FOR SELECT USING (true);
CREATE POLICY "Create surveys" ON public.survey_responses FOR INSERT WITH CHECK (auth.uid() = sales_person_id);

-- 2. SALES VISIT ROUTE PLANS
CREATE TABLE public.sales_visit_route_plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sales_person_id uuid REFERENCES public.users(id),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sales_visit_route_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read sales routes" ON public.sales_visit_route_plans FOR SELECT USING (true);
CREATE POLICY "Manage sales routes" ON public.sales_visit_route_plans FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'Sales')
);

-- 3. SALES VISIT ROUTE STOPS
CREATE TABLE public.sales_visit_route_stops (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  route_id uuid REFERENCES public.sales_visit_route_plans(id) ON DELETE CASCADE,
  store_id uuid REFERENCES public.stores(id),
  visit_id uuid REFERENCES public.visits(id), -- Optional link to visit record
  store_name text, -- Cache for ease
  address text, -- Cache for ease
  purpose text,
  location jsonb, 
  status text CHECK (status IN ('Akan Datang', 'Selesai', 'Dilewati/Gagal')),
  notes text,
  proof_of_visit_image text,
  distance_from_prev numeric(10, 2),
  stop_order int
);

ALTER TABLE public.sales_visit_route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read sales stops" ON public.sales_visit_route_stops FOR SELECT USING (true);
CREATE POLICY "Manage sales stops" ON public.sales_visit_route_stops FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'Sales')
);
