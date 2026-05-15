import { Link } from 'react-router-dom'
import { useBookings } from '@/hooks/useBookings'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Package } from 'lucide-react'

export function MyBookingsPage() {
  const { isAuthenticated } = useAuth()
  const { data: bookings, isLoading } = useBookings()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p>Please sign in to view your bookings</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeBookings = bookings?.filter(b => ['pending', 'confirmed', 'active'].includes(b.status)) || []
  const pastBookings = bookings?.filter(b => ['completed', 'cancelled'].includes(b.status)) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="opacity-90">Track your equipment rentals</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading bookings...</p>
        ) : bookings?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Link to="/catalog">
                <Button>Browse Equipment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Active Bookings</h2>
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                              {booking.equipment?.images?.[0] && (
                                <img
                                  src={booking.equipment.images[0].url}
                                  alt={booking.equipment?.name}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{booking.equipment?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.equipment?.brand} {booking.equipment?.model}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.start_date} to {booking.end_date}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.pickup_location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                booking.status === 'active' ? 'default' :
                                booking.status === 'confirmed' ? 'secondary' :
                                'outline'
                              }
                            >
                              {booking.status}
                            </Badge>
                            <p className="font-semibold mt-2">{formatCurrency(booking.total_price)}</p>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Link to={`/booking/${booking.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Past Bookings</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                              {booking.equipment?.images?.[0] && (
                                <img
                                  src={booking.equipment.images[0].url}
                                  alt={booking.equipment?.name}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{booking.equipment?.name}</h3>
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{booking.start_date} to {booking.end_date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{booking.status}</Badge>
                            <p className="font-semibold mt-2">{formatCurrency(booking.total_price)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}