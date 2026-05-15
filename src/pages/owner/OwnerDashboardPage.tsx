import { Link } from 'react-router-dom'
import { Plus, Camera, Calendar, DollarSign, Package } from 'lucide-react'
import { useOwnerEquipment, useOwnerBookings } from '@/hooks/useEquipmentOwner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export function OwnerDashboardPage() {
  const { data: equipment, isLoading: equipmentLoading } = useOwnerEquipment()
  const { data: bookings } = useOwnerBookings()

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || []
  const activeBookings = bookings?.filter(b => b.status === 'active' || b.status === 'confirmed') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="opacity-90">Manage your equipment and bookings</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <Link to="/owner/add-equipment">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{equipment?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Equipment</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
                <p className="text-sm text-muted-foreground">Pending Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    equipment?.reduce((sum, e) => sum + (e.daily_rate || 0), 0) || 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{booking.equipment?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.renter?.profiles?.full_name} • {booking.start_date} to {booking.end_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatCurrency(booking.total_price)}</Badge>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>My Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {equipmentLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : equipment?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No equipment listed yet</p>
                <Link to="/owner/add-equipment">
                  <Button>Add Your First Equipment</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment?.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <Badge
                        variant={item.status === 'approved' ? 'default' : item.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.brand} {item.model}</p>
                    <p className="text-sm font-semibold mt-2">{formatCurrency(item.daily_rate)}/day</p>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/owner/equipment/${item.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}