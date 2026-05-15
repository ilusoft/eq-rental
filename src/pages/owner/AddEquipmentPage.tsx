import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateEquipment } from '@/hooks/useEquipmentOwner'
import { useCategories } from '@/hooks/useEquipment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AddEquipmentPage() {
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const createEquipment = useCreateEquipment()

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await createEquipment.mutateAsync({
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
        is_available: true,
        status: 'pending',
      })

      navigate('/owner/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/owner/dashboard')} className="mb-4">
          ← Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Equipment</CardTitle>
            <CardDescription>
              Enter the details of your equipment for rental. All equipment must be approved before it appears in the catalog.
            </CardDescription>
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
                  placeholder="e.g., Canon EOS R5"
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
                  placeholder="Describe your equipment..."
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
                    onChange={handleChange as any}
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
                    onChange={handleChange as any}
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
                    placeholder="e.g., Canon"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="e.g., EOS R5"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number (optional)</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  placeholder="For your own tracking"
                  value={formData.serial_number}
                  onChange={handleChange}
                />
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
                    placeholder="75.00"
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
                    placeholder="400.00"
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
                    placeholder="200.00"
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
                  placeholder="123 Main St, City, State"
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
                  placeholder="Same as pickup or different address"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Add Equipment'}
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