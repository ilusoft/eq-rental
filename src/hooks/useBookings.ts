import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useBookings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment:equipment_id(name, description, daily_rate, weekly_rate, pickup_location, dropoff_location, category, brand, model, images:equipment_images(url, is_primary)),
          profiles:profiles(full_name, email, phone)
        `)
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment:equipment_id(name, description, daily_rate, weekly_rate, pickup_location, dropoff_location, category, brand, model, images:equipment_images(url, is_primary)),
          profiles:profiles(full_name, email, phone),
          checkout:equipment_checkout(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (booking: {
      equipment_id: string
      start_date: string
      end_date: string
      pickup_location: string
      dropoff_location?: string
      notes?: string
    }) => {
      if (!user?.id) throw new Error('Not authenticated')

      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('daily_rate, weekly_rate, deposit_amount, min_rental_days')
        .eq('id', booking.equipment_id)
        .single()

      if (equipmentError) throw equipmentError

      const startDate = new Date(booking.start_date)
      const endDate = new Date(booking.end_date)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      let totalPrice: number
      if (days >= 7 && equipment.weekly_rate) {
        const weeks = Math.floor(days / 7)
        const remainingDays = days % 7
        totalPrice = (weeks * equipment.weekly_rate) + (remainingDays * equipment.daily_rate)
      } else {
        totalPrice = days * equipment.daily_rate
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          equipment_id: booking.equipment_id,
          renter_id: user.id,
          start_date: booking.start_date,
          end_date: booking.end_date,
          pickup_location: booking.pickup_location,
          dropoff_location: booking.dropoff_location || null,
          total_price: totalPrice,
          deposit_amount: equipment.deposit_amount,
          deposit_status: 'pending',
          status: 'pending',
          notes: booking.notes || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useBookingExtensions(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId, 'extensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_extensions')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!bookingId,
  })
}

export function useRequestExtension() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, newEndDate }: { bookingId: string; newEndDate: string }) => {
      const { data: booking } = await supabase
        .from('bookings')
        .select('equipment_id, end_date, total_price')
        .eq('id', bookingId)
        .single()

      if (!booking) throw new Error('Booking not found')

      const { data: equipment } = await supabase
        .from('equipment')
        .select('daily_rate')
        .eq('id', booking.equipment_id)
        .single()

      if (!equipment) throw new Error('Equipment not found')

      const oldEnd = new Date(booking.end_date)
      const newEnd = new Date(newEndDate)
      const extraDays = Math.ceil((newEnd.getTime() - oldEnd.getTime()) / (1000 * 60 * 60 * 24))
      const additionalCost = extraDays * equipment.daily_rate

      const { data, error } = await supabase
        .from('booking_extensions')
        .insert({
          booking_id: bookingId,
          new_end_date: newEndDate,
          additional_cost: additionalCost,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId, 'extensions'] })
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] })
    },
  })
}