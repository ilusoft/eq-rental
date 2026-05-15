import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEquipment } from '@/hooks/useEquipment'
import { useCreateBooking } from '@/hooks/useBookings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { differenceInDays, addDays } from 'date-fns'

export function NewBookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const equipmentId = searchParams.get('equipmentId') || ''

  const { data: equipment, isLoading } = useEquipment(equipmentId)
  const createBooking = useCreateBooking()

  const [formData, setFormData] = useState({
    start_date: addDays(new Date(), 1).toISOString().split('T')[0],
    end_date: addDays(new Date(), 2).toISOString().split('T')[0],
    pickup_location: '',
    dropoff_location: '',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Equipment not found</p>
            <Button onClick={() => navigate('/catalog')} className="mt-4">
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const startDate = new Date(formData.start_date)
  const endDate = new Date(formData.end_date)
  const days = differenceInDays(endDate, startDate) + 1
  const minDays = equipment.min_rental_days || 1

  let totalPrice: number
  if (days >= 7 && equipment.weekly_rate) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    totalPrice = (weeks * equipment.weekly_rate) + (remainingDays * equipment.daily_rate)
  } else {
    totalPrice = days * equipment.daily_rate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (days < minDays) {
      setError(`Minimum rental period is ${minDays} days`)
      return
    }

    setLoading(true)

    try {
      const booking = await createBooking.mutateAsync({
        equipment_id: equipmentId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        pickup_location: formData.pickup_location || equipment.pickup_location,
        dropoff_location: formData.dropoff_location || undefined,
        notes: formData.notes || undefined,
      })

      navigate(`/booking/${booking.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(`/equipment/${equipmentId}`)} className="mb-4">
          ← Back to Equipment
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Book Equipment</CardTitle>
            <CardDescription>{equipment.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <span className="font-medium">{formatCurrency(equipment.daily_rate)}</span>
                </div>
                {equipment.weekly_rate && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Weekly Rate</span>
                    <span className="font-medium">{formatCurrency(equipment.weekly_rate)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-medium">{formatCurrency(equipment.deposit_amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={addDays(new Date(), 1).toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {days} day{days !== 1 ? 's' : ''} rental (minimum {minDays} day{minDays !== 1 ? 's' : ''})
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_location">Pickup Location *</Label>
                <Input
                  id="pickup_location"
                  placeholder={equipment.pickup_location}
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Default: {equipment.pickup_location}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoff_location">Dropoff Location</Label>
                <Input
                  id="dropoff_location"
                  placeholder={equipment.dropoff_location || 'Same as pickup'}
                  value={formData.dropoff_location}
                  onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Any special requests or questions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Plus {formatCurrency(equipment.deposit_amount)} security deposit
                </p>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}