import { useParams, useNavigate } from 'react-router-dom'
import { useEquipment } from '@/hooks/useEquipment'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, MapPin, DollarSign, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EquipmentImage } from '@/types'
import { formatCurrency } from '@/lib/utils'

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { data: equipment, isLoading, error } = useEquipment(id!)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !equipment) {
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

  const primaryImage = equipment.images?.find((img: EquipmentImage) => img.is_primary) || equipment.images?.[0]
  const rentalDays = equipment.min_rental_days

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        <Button variant="ghost" onClick={() => navigate('/catalog')} className="mb-4">
          ← Back to Catalog
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={equipment.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>
            {equipment.images && equipment.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {equipment.images.map((img: EquipmentImage) => (
                  <div
                    key={img.id}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${img.is_primary ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{equipment.name}</h1>
                  <p className="text-muted-foreground">{equipment.brand} {equipment.model}</p>
                </div>
                <Badge variant="secondary">{equipment.category}</Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Daily Rate
                  </span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(equipment.daily_rate)}
                  </span>
                </div>
                {equipment.weekly_rate && (
                  <div className="flex items-center justify-between">
                    <span>Weekly Rate</span>
                    <span>{formatCurrency(equipment.weekly_rate)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Deposit
                  </span>
                  <span>{formatCurrency(equipment.deposit_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Minimum Rental</span>
                  <span>{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Condition</h4>
                    <p className="text-sm text-muted-foreground capitalize">{equipment.condition}</p>
                  </div>
                  {equipment.serial_number && (
                    <div>
                      <h4 className="font-medium mb-1">Serial Number</h4>
                      <p className="text-sm text-muted-foreground">{equipment.serial_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{equipment.pickup_location}</p>
                {equipment.dropoff_location && (
                  <p className="text-sm text-muted-foreground">
                    Drop-off: {equipment.dropoff_location}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {isAuthenticated ? (
                <Button className="w-full" size="lg" onClick={() => navigate(`/booking/new?equipmentId=${id}`)}>
                  Book Now
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                  Sign in to Book
                </Button>
              )}
              <p className="text-xs text-center text-muted-foreground">
                No charges will be made until you confirm the booking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}