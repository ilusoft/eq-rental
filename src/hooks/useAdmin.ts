import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Profile, Equipment, Booking } from '@/types'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [equipmentCount, bookingsCount, usersCount, pendingEquipment] = await Promise.all([
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ])

      return {
        totalEquipment: equipmentCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        totalUsers: usersCount.count || 0,
        pendingEquipment: pendingEquipment.data || [],
      }
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Profile[]
    },
  })
}

export function useAdminAllEquipment() {
  return useQuery({
    queryKey: ['admin', 'equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Equipment & { profiles: Profile })[]
    },
  })
}

export function useAdminAllBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment:equipment_id(name, category),
          renter:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useApproveEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ equipmentId, approvedBy }: { equipmentId: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({ status: 'approved', approved_by: approvedBy })
        .eq('id', equipmentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['owner', 'equipment'] })
    },
  })
}

export function useRejectEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({ status: 'rejected' })
        .eq('id', equipmentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['owner', 'equipment'] })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'renter' | 'owner' | 'system_owner' }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: Partial<Booking> }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
    },
  })
}

export function useCreateBookingAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bookingId,
      adjustmentType,
      amount,
      reason,
      createdBy,
    }: {
      bookingId: string
      adjustmentType: string
      amount: number
      reason: string
      createdBy: string
    }) => {
      const { data, error } = await supabase
        .from('booking_adjustments')
        .insert({
          booking_id: bookingId,
          adjustment_type: adjustmentType,
          amount,
          reason,
          created_by: createdBy,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
    },
  })
}