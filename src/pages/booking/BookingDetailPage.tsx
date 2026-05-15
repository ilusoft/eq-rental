import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBooking, useCancelBooking } from '@/hooks/useBookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Clock } from 'lucide-react'

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(id!)
  const cancelBooking = useCancelBooking()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Booking not found</p>
            <Button onClick={() => navigate('/my-bookings')} className="mt-4">
              Back to My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const primaryImage = booking.equipment?.images?.find((img: any) => img.is_primary) || booking.equipment?.images?.[0]
  const isPending = booking.status === 'pending'
  const isActive = booking.status === 'active' || booking.status === 'confirmed'

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking.mutateAsync(id!)
        navigate('/my-bookings')
      } catch (err) {
        alert('Failed to cancel booking')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/my-bookings')} className="mb-4">
          ← Back to My Bookings
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <Badge
                  variant={
                    booking.status === 'active' ? 'default' :
                    booking.status === 'confirmed' ? 'secondary' :
                    booking.status === 'pending' ? 'outline' :
                    booking.status === 'completed' ? 'secondary' :
                    'destructive'
                  }
                >
                  {booking.status}
                </Badge>
              </div>
              <CardDescription>Booking ID: {booking.id.slice(0, 8)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="w-48 h-36 bg-muted rounded-md overflow-hidden">
                  {primaryImage && (
                    <img
                      src={primaryImage.url}
                      alt={booking.equipment?.name}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{booking.equipment?.name}</h3>
                  <p className="text-muted-foreground">
                    {booking.equipment?.brand} {booking.equipment?.model}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{booking.equipment?.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rental Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg">{booking.start_date} to {booking.end_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Created {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Pickup</p>
                  <p className="text-sm text-muted-foreground">{booking.pickup_location}</p>
                </div>
              </div>
              {booking.dropoff_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dropoff</p>
                    <p className="text-sm text-muted-foreground">{booking.dropoff_location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Rental Total</span>
                <span className="font-medium">{formatCurrency(booking.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit</span>
                <span className="font-medium">{formatCurrency(booking.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(booking.total_price + booking.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Deposit Status</span>
                <Badge variant="secondary">{booking.deposit_status}</Badge>
              </div>
            </CardContent>
          </Card>

          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

          {booking.checkout && (
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.checkout.checkout_time && (
                  <div>
                    <p className="font-medium">Checked Out</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.checkout.checkout_time).toLocaleString()}
                    </p>
                    {booking.checkout.checkout_notes && (
                      <p className="text-sm mt-1">Notes: {booking.checkout.checkout_notes}</p>
                    )}
                  </div>
                )}
                {booking.checkout.return_time && (
                  <div>
                    <p className="font-medium">Returned</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.checkout.return_time).toLocaleString()}
                    </p>
                    {booking.checkout.return_notes && (
                      <p className="text-sm mt-1">Notes: {booking.checkout.return_notes}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            {isPending && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelBooking.isPending}
                >
                  {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
                <Link to={`/booking/${id}/extend`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Request Extension
                  </Button>
                </Link>
              </>
            )}
            {isActive && (
              <Link to={`/booking/${id}/extend`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Request Extension
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}