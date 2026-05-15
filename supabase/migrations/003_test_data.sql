-- PhotoGear Rental Platform - Test Data
-- Phase 7: Test Data for Validation

-- IMPORTANT: This migration requires auth.users to exist first
-- Run this AFTER creating users in Supabase Auth dashboard or via signup

-- Test users created via auth.users (IDs are placeholders for reference):
-- owner@test.com     - a0000000-0000-0000-0000-000000000001 (role: owner)
-- renter@test.com    - a0000000-0000-0000-0000-000000000002 (role: renter)
-- admin@test.com     - a0000000-0000-0000-0000-000000000003 (role: system_owner)

-- Update profiles with correct roles (trigger may have set them to 'renter')
UPDATE profiles SET role = 'owner' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE profiles SET role = 'renter' WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE profiles SET role = 'system_owner' WHERE id = 'a0000000-0000-0000-0000-000000000003';

-- Insert test equipment for the owner
INSERT INTO equipment (id, owner_id, name, description, category, brand, model, serial_number, condition, daily_rate, weekly_rate, deposit_amount, min_rental_days, pickup_location, dropoff_location, is_available, status, approved_by) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Canon EOS R5', 'Professional mirrorless camera with 45MP full-frame sensor, 8K video recording, and advanced autofocus system. Perfect for professional photographers and videographers.', 'Cameras', 'Canon', 'EOS R5', 'CNR5-2024-001', 'excellent', 150.00, 900.00, 500.00, 1, '123 Photography St, New York, NY 10001', 'Same as pickup', true, 'approved', 'a0000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Sony A7 IV', 'High-resolution full-frame mirrorless camera with 33MP sensor, excellent autofocus, and 4K 60p video. Great for hybrid shooters.', 'Cameras', 'Sony', 'A7 IV', 'SNY-A7IV-2024-002', 'good', 125.00, 750.00, 400.00, 1, '123 Photography St, New York, NY 10001', NULL, true, 'approved', 'a0000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Canon RF 70-200mm f/2.8L IS USM', 'Professional telephoto zoom lens with constant f/2.8 aperture. Excellent for portraits, events, and wildlife photography.', 'Lenses', 'Canon', 'RF 70-200mm f/2.8L IS USM', 'CNL-70200-2024-003', 'excellent', 75.00, 450.00, 200.00, 1, '123 Photography St, New York, NY 10001', 'Same as pickup', true, 'approved', 'a0000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Profoto B10 Plus', 'Powerful 500Ws portable flash with TTL and HSS support. Perfect for location and studio work.', 'Lighting', 'Profoto', 'B10 Plus', 'PRF-B10P-2024-004', 'good', 100.00, 600.00, 300.00, 1, '123 Photography St, New York, NY 10001', NULL, true, 'approved', 'a0000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'DJI RS 3 Pro', 'Professional 3-axis gimbal stabilizer for mirrorless and cinema cameras. Supports cameras up to 4.5kg.', 'Accessories', 'DJI', 'RS 3 Pro', 'DJI-RS3P-2024-005', 'excellent', 60.00, 360.00, 150.00, 1, '123 Photography St, New York, NY 10001', 'Same as pickup', true, 'approved', 'a0000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Sony FE 24-70mm f/2.8 GM II', 'Premium standard zoom lens with outstanding sharpness and bokeh. Essential for any professional kit.', 'Lenses', 'Sony', 'FE 24-70mm f/2.8 GM II', 'SNY-2470GM2-2024-006', 'excellent', 65.00, 390.00, 175.00, 1, '123 Photography St, New York, NY 10001', NULL, true, 'pending', NULL),
('10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Sennheiser MKH 416', 'Industry-standard shotgun microphone for film and broadcast. Excellent off-axis rejection and natural sound.', 'Audio', 'Sennheiser', 'MKH 416', 'SEN-MKH416-2024-007', 'good', 45.00, 270.00, 100.00, 1, '123 Photography St, New York, NY 10001', 'Same as pickup', true, 'approved', 'a0000000-0000-0000-0000-000000000003');

-- Insert equipment images
INSERT INTO equipment_images (equipment_id, url, is_primary) VALUES
('10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', true),
('10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1510127031890-67b2f4b9f2b1?w=800', true),
('10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800', true),
('10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1604525198858-c5b9e72e2ad6?w=800', true),
('10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1589872307379-0ffdf7d3f7f3?w=800', true),
('10000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1612815154858-60aa4c5e1e91?w=800', true),
('10000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800', true);

-- Insert equipment availability
INSERT INTO equipment_availability (equipment_id, start_date, end_date, is_available) VALUES
('10000000-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('10000000-0000-0000-0000-000000000002', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('10000000-0000-0000-0000-000000000003', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('10000000-0000-0000-0000-000000000004', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('10000000-0000-0000-0000-000000000005', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('10000000-0000-0000-0000-000000000006', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('10000000-0000-0000-0000-000000000007', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true);

-- Insert test bookings
INSERT INTO bookings (id, equipment_id, renter_id, start_date, end_date, pickup_location, dropoff_location, total_price, deposit_amount, deposit_status, status, notes) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '8 days', '123 Photography St, New York, NY 10001', 'Same as pickup', 450.00, 500.00, 'paid', 'confirmed', 'Planning a commercial shoot'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', '123 Photography St, New York, NY 10001', NULL, 150.00, 200.00, 'pending', 'pending', 'Event photography'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '3 days', '123 Photography St, New York, NY 10001', 'Same as pickup', 500.00, 400.00, 'refunded', 'completed', 'Wedding shoot - completed successfully');

-- Insert equipment checkout records
INSERT INTO equipment_checkout (booking_id, checkout_time, checkout_notes, checkout_by, return_time, return_notes, return_by) VALUES
('20000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '9 hours', 'Camera in excellent condition, all accessories present', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '18 hours', 'Returned in perfect condition', 'a0000000-0000-0000-0000-000000000001');