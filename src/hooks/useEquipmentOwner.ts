import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Equipment, EquipmentImage } from '@/types'

export function useOwnerEquipment() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['owner', 'equipment', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('equipment')
        .select('*, equipment_images(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Equipment & { equipment_images: EquipmentImage[] })[]
    },
    enabled: !!user?.id,
  })
}

export function useOwnerBookings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['owner', 'bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment:name, description, daily_rate,
          renter:profiles(full_name, email, phone)
        `)
        .eq('equipment.owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (equipment: Partial<Equipment>) => {
      if (!user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('equipment')
        .insert({ ...equipment, owner_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'equipment'] })
    },
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...equipment }: Partial<Equipment> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(equipment)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'equipment'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] })
    },
  })
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'equipment'] })
    },
  })
}

export function useEquipmentCheckout(bookingId: string) {
  return useMutation({
    mutationFn: async (data: { checkout_notes?: string; return_time?: string; return_notes?: string; type: 'checkout' | 'return' }) => {
      const { type, ...updates } = data

      if (type === 'checkout') {
        const { data: result, error } = await supabase
          .from('equipment_checkout')
          .insert({
            booking_id: bookingId,
            checkout_time: new Date().toISOString(),
            checkout_notes: updates.checkout_notes,
          })
          .select()
          .single()

        if (error) throw error
        return result
      } else {
        const { data: result, error } = await supabase
          .from('equipment_checkout')
          .update({
            return_time: new Date().toISOString(),
            return_notes: updates.return_notes,
          })
          .eq('booking_id', bookingId)
          .select()
          .single()

        if (error) throw error
        return result
      }
    },
  })
}