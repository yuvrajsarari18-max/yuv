-- 1. Create Salons Table
CREATE TABLE salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  telegram_token TEXT,
  telegram_chat_id TEXT,
  theme_color TEXT DEFAULT 'gold',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Services Table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT DEFAULT 'hair', -- 'hair', 'grooming', 'spa'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Stylists Table
CREATE TABLE stylists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- --- RLS Policies ---

-- Salons Policies:
-- Owner can do everything, public can select (to view salon details)
CREATE POLICY "Public can view salon profiles" ON salons 
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage their own salons" ON salons 
  FOR ALL USING (auth.uid() = owner_id);

-- Services Policies:
-- Public can view services, owner can manage them
CREATE POLICY "Public can view salon services" ON services 
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage their salon services" ON services 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- Stylists Policies:
-- Public can view stylists, owner can manage them
CREATE POLICY "Public can view salon stylists" ON stylists 
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage their salon stylists" ON stylists 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = stylists.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- Bookings Policies:
-- Public can create bookings, owners can view/manage their salon's bookings
CREATE POLICY "Public can book appointments" ON bookings 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can manage their bookings" ON bookings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = bookings.salon_id AND salons.owner_id = auth.uid()
    )
  );
