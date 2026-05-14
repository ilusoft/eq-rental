-- PhotoGear Rental Platform - Initial Schema
-- Phase 1: Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('renter', 'owner', 'system_owner');
CREATE TYPE equipment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE deposit_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'renter',
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    condition TEXT NOT NULL DEFAULT 'good',
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_rate DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_rental_days INTEGER NOT NULL DEFAULT 1,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    status equipment_status NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment images table
CREATE TABLE equipment_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment availability table
CREATE TABLE equipment_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deposit_status deposit_status NOT NULL DEFAULT 'pending',
    status booking_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_booking_dates CHECK (end_date >= start_date)
);

-- Booking extensions table
CREATE TABLE booking_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    new_end_date DATE NOT NULL,
    additional_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking adjustments table
CREATE TABLE booking_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    adjustment_type TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment checkout table
CREATE TABLE equipment_checkout (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    checkout_time TIMESTAMPTZ,
    checkout_notes TEXT,
    checkout_by UUID REFERENCES profiles(id),
    return_time TIMESTAMPTZ,
    return_notes TEXT,
    return_by UUID REFERENCES profiles(id)
);

-- Create indexes for performance
CREATE INDEX idx_equipment_owner ON equipment(owner_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_equipment_availability_equipment ON equipment_availability(equipment_id);
CREATE INDEX idx_equipment_availability_dates ON equipment_availability(start_date, end_date);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
    ('Cameras', 'DSLR, Mirrorless, Film cameras', 'camera'),
    ('Lenses', 'Prime, Zoom, Macro lenses', 'aperture'),
    ('Lighting', 'Strobe, LED, Continuous lights', 'sun'),
    ('Tripods', 'Video, Photo tripods and supports', 'triangle'),
    ('Audio', 'Microphones, Recorders, Mixers', 'mic'),
    ('Accessories', 'Bags, Filters, Memory cards', 'package');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'renter'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();