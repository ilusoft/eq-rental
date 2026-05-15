import { useState } from 'react'
import { useAdminAllBookings, useAdminUpdateBooking } from '@/hooks/useAdmin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, User } from 'lucide-react'

export function AdminBookingsPage() {
  const { data: bookings, isLoading } = useAdminAllBookings()
  const updateBooking = useAdminUpdateBooking()
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'>('all')

  const filteredBookings = bookings?.filter(booking =>
    filter === 'all' ? true : booking.status === filter
  ) || []

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (window.confirm(`Change booking status to ${newStatus}?`)) {
      try {
        await updateBooking.mutateAsync({ bookingId, updates: { status: newStatus as any } })
      } catch (err) {
        console.error('Failed to update booking:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <p className="opacity-90">Monitor and manage all bookings</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{booking.equipment?.name || 'Unknown'}</h3>
                        <Badge
                          variant={
                            booking.status === 'active' ? 'default' :
                            booking.status === 'completed' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' :
                            'outline'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{booking.renter?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.start_date} to {booking.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.pickup_location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatCurrency(booking.total_price)}</p>
                      <p className="text-sm text-muted-foreground">
                        Deposit: {formatCurrency(booking.deposit_amount)} ({booking.deposit_status})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {booking.id.slice(0, 8)}
                      </p>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        disabled={updateBooking.isPending}
                        className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}