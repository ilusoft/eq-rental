import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useOwnerBookings } from '@/hooks/useEquipmentOwner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, RotateCcw } from 'lucide-react'

export function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: bookings } = useOwnerBookings()
  const booking = bookings?.find(b => b.id === bookingId)

  const [checkoutNotes, setCheckoutNotes] = useState('')
  const [returnNotes, setReturnNotes] = useState('')

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('equipment_checkout')
        .insert({
          booking_id: bookingId,
          checkout_time: new Date().toISOString(),
          checkout_notes: checkoutNotes || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'bookings'] })
      navigate('/owner/dashboard')
    },
  })

  const returnMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('equipment_checkout')
        .update({
          return_time: new Date().toISOString(),
          return_notes: returnNotes || null,
        })
        .eq('booking_id', bookingId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'bookings'] })
      navigate('/owner/dashboard')
    },
  })

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p>Booking not found</p>
            <Button onClick={() => navigate('/owner/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
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
            <CardTitle>Equipment Checkout/Return</CardTitle>
            <CardDescription>
              {booking.equipment?.name} - {booking.renter?.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Rental Period</p>
                <p className="font-medium">{booking.start_date} to {booking.end_date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Price</p>
                <p className="font-medium">{formatCurrency(booking.total_price)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="secondary">{booking.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Deposit</p>
                <p className="font-medium">{formatCurrency(booking.deposit_amount)} ({booking.deposit_status})</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Check Out Equipment</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout_notes">Condition Notes</Label>
                  <Textarea
                    id="checkout_notes"
                    placeholder="Note any existing damage or conditions..."
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="w-full gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {checkoutMutation.isPending ? 'Processing...' : 'Confirm Check Out'}
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Return Equipment</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="return_notes">Return Notes</Label>
                  <Textarea
                    id="return_notes"
                    placeholder="Note any damage or issues upon return..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => returnMutation.mutate()}
                  disabled={returnMutation.isPending}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {returnMutation.isPending ? 'Processing...' : 'Confirm Return'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}