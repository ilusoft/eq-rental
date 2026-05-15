import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCategories, useEquipment } from '@/hooks/useEquipment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export function EditEquipmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()
  const { data: equipment, isLoading } = useEquipment(id!)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    condition: 'good',
    daily_rate: '',
    weekly_rate: '',
    deposit_amount: '',
    min_rental_days: '1',
    pickup_location: '',
    dropoff_location: '',
    is_available: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        category: equipment.category || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        condition: equipment.condition || 'good',
        daily_rate: equipment.daily_rate?.toString() || '',
        weekly_rate: equipment.weekly_rate?.toString() || '',
        deposit_amount: equipment.deposit_amount?.toString() || '',
        min_rental_days: equipment.min_rental_days?.toString() || '1',
        pickup_location: equipment.pickup_location || '',
        dropoff_location: equipment.dropoff_location || '',
        is_available: equipment.is_available ?? true,
      })
    }
  }, [equipment])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value ? Number(value) : '') : value,
    })
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          serial_number: formData.serial_number || undefined,
          condition: formData.condition,
          daily_rate: Number(formData.daily_rate),
          weekly_rate: formData.weekly_rate ? Number(formData.weekly_rate) : undefined,
          deposit_amount: Number(formData.deposit_amount) || 0,
          min_rental_days: Number(formData.min_rental_days) || 1,
          pickup_location: formData.pickup_location,
          dropoff_location: formData.dropoff_location || undefined,
          is_available: formData.is_available,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'equipment'] })
      navigate('/owner/dashboard')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await updateMutation.mutateAsync()
    } catch (err: any) {
      setError(err.message || 'Failed to update equipment')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/owner/dashboard')} className="mb-4">
          ← Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Equipment</CardTitle>
                <CardDescription>Update your equipment details</CardDescription>
              </div>
              {equipment?.status && (
                <Badge
                  variant={equipment.status === 'approved' ? 'default' : equipment.status === 'pending' ? 'secondary' : 'destructive'}
                >
                  {equipment.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_rate">Daily Rate ($) *</Label>
                  <Input
                    id="daily_rate"
                    name="daily_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.daily_rate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly_rate">Weekly Rate ($)</Label>
                  <Input
                    id="weekly_rate"
                    name="weekly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weekly_rate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit_amount">Security Deposit ($)</Label>
                  <Input
                    id="deposit_amount"
                    name="deposit_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_rental_days">Minimum Rental (days)</Label>
                  <Input
                    id="min_rental_days"
                    name="min_rental_days"
                    type="number"
                    min="1"
                    value={formData.min_rental_days}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_location">Pickup Location *</Label>
                <Input
                  id="pickup_location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoff_location">Dropoff Location (if different)</Label>
                <Input
                  id="dropoff_location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_available">Available for rental</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/owner/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}