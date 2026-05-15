import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { EquipmentImage, Category } from '@/types'

export function useEquipment(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const { data: images } = await supabase
        .from('equipment_images')
        .select('*')
        .eq('equipment_id', id)
        .order('is_primary', { ascending: false })

      return { ...equipment, images: images || [] }
    },
    enabled: !!id,
  })
}

export function useEquipmentList(filters?: {
  category?: string
  search?: string
  location?: string
  startDate?: string
  endDate?: string
  minPrice?: number
  maxPrice?: number
}) {
  return useQuery({
    queryKey: ['equipment', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('equipment')
        .select('*, equipment_images(*), profiles(full_name)')
        .eq('status', 'approved')
        .eq('is_available', true)

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
      }

      if (filters?.location) {
        query = query.or(`pickup_location.ilike.%${filters.location}%,dropoff_location.ilike.%${filters.location}%`)
      }

      if (filters?.minPrice) {
        query = query.gte('daily_rate', filters.minPrice)
      }

      if (filters?.maxPrice) {
        query = query.lte('daily_rate', filters.maxPrice)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      if (filters?.startDate && filters?.endDate) {
        return data || []
      }

      return data || []
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Category[]
    },
  })
}

export function useEquipmentImages(equipmentId: string) {
  return useQuery({
    queryKey: ['equipment', equipmentId, 'images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_images')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      return data as EquipmentImage[]
    },
    enabled: !!equipmentId,
  })
}

export function useEquipmentAvailability(equipmentId: string) {
  return useQuery({
    queryKey: ['equipment', equipmentId, 'availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_availability')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date')

      if (error) throw error
      return data
    },
    enabled: !!equipmentId,
  })
}