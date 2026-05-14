export type UserRole = 'renter' | 'owner' | 'system_owner'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  owner_id: string
  name: string
  description: string
  category: string
  brand: string
  model: string
  serial_number: string | null
  condition: string
  daily_rate: number
  weekly_rate: number | null
  deposit_amount: number
  min_rental_days: number
  pickup_location: string
  dropoff_location: string
  is_available: boolean
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface EquipmentImage {
  id: string
  equipment_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface EquipmentAvailability {
  id: string
  equipment_id: string
  start_date: string
  end_date: string
  is_available: boolean
}

export interface Booking {
  id: string
  equipment_id: string
  renter_id: string
  start_date: string
  end_date: string
  pickup_location: string
  dropoff_location: string
  total_price: number
  deposit_amount: number
  deposit_status: 'pending' | 'paid' | 'refunded'
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BookingExtension {
  id: string
  booking_id: string
  new_end_date: string
  additional_cost: number
  approved_by: string | null
  created_at: string
}

export interface BookingAdjustment {
  id: string
  booking_id: string
  adjustment_type: string
  amount: number
  reason: string
  created_by: string
  created_at: string
}

export interface EquipmentCheckout {
  id: string
  booking_id: string
  checkout_time: string | null
  checkout_notes: string | null
  checkout_by: string | null
  return_time: string | null
  return_notes: string | null
  return_by: string | null
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
}