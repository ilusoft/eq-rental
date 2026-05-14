-- PhotoGear Rental Platform - RLS Policies
-- Phase 1: Row Level Security Configuration

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_checkout ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "System owners can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

CREATE POLICY "System owners can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories"
    ON categories FOR SELECT
    USING (true);

-- Equipment policies
CREATE POLICY "Anyone can view approved equipment"
    ON equipment FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Owners can view own equipment"
    ON equipment FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert own equipment"
    ON equipment FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own equipment"
    ON equipment FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "System owners can view all equipment"
    ON equipment FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

CREATE POLICY "System owners can update any equipment"
    ON equipment FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

-- Equipment images policies
CREATE POLICY "Anyone can view images for approved equipment"
    ON equipment_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = equipment_images.equipment_id
            AND equipment.status = 'approved'
        )
    );

CREATE POLICY "Owners can manage own equipment images"
    ON equipment_images FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = equipment_images.equipment_id
            AND equipment.owner_id = auth.uid()
        )
    );

-- Equipment availability policies
CREATE POLICY "Anyone can view availability for approved equipment"
    ON equipment_availability FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = equipment_availability.equipment_id
            AND equipment.status = 'approved'
        )
    );

CREATE POLICY "Owners can manage own equipment availability"
    ON equipment_availability FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = equipment_availability.equipment_id
            AND equipment.owner_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "Renters can view own bookings"
    ON bookings FOR SELECT
    USING (renter_id = auth.uid());

CREATE POLICY "Equipment owners can view bookings for their equipment"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = bookings.equipment_id
            AND equipment.owner_id = auth.uid()
        )
    );

CREATE POLICY "Renters can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Renters can update own bookings"
    ON bookings FOR UPDATE
    USING (renter_id = auth.uid());

CREATE POLICY "Equipment owners can update bookings for their equipment"
    ON bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = bookings.equipment_id
            AND equipment.owner_id = auth.uid()
        )
    );

CREATE POLICY "System owners can view all bookings"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

CREATE POLICY "System owners can update all bookings"
    ON bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

-- Booking extensions policies
CREATE POLICY "Renters can view own booking extensions"
    ON booking_extensions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_extensions.booking_id
            AND bookings.renter_id = auth.uid()
        )
    );

CREATE POLICY "Renters can create extension requests"
    ON booking_extensions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_extensions.booking_id
            AND bookings.renter_id = auth.uid()
        )
    );

CREATE POLICY "Equipment owners can update extensions for their equipment bookings"
    ON booking_extensions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            JOIN equipment ON equipment.id = bookings.equipment_id
            WHERE bookings.id = booking_extensions.booking_id
            AND equipment.owner_id = auth.uid()
        )
    );

CREATE POLICY "System owners can manage all extensions"
    ON booking_extensions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

-- Booking adjustments policies
CREATE POLICY "Related users can view booking adjustments"
    ON booking_adjustments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_adjustments.booking_id
            AND (
                bookings.renter_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM equipment
                    WHERE equipment.id = bookings.equipment_id
                    AND equipment.owner_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "System owners can manage all adjustments"
    ON booking_adjustments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );

-- Equipment checkout policies
CREATE POLICY "Equipment owners can manage checkout for their equipment"
    ON equipment_checkout FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            JOIN equipment ON equipment.id = bookings.equipment_id
            WHERE bookings.id = equipment_checkout.booking_id
            AND equipment.owner_id = auth.uid()
        )
    );

CREATE POLICY "Renters can view checkout status for own bookings"
    ON equipment_checkout FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = equipment_checkout.booking_id
            AND bookings.renter_id = auth.uid()
        )
    );

CREATE POLICY "System owners can manage all checkouts"
    ON equipment_checkout FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'system_owner'
        )
    );