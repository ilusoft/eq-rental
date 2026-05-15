import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Equipment, EquipmentImage } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface EquipmentCardProps {
  equipment: Equipment & {
    equipment_images?: EquipmentImage[]
    profiles?: { full_name: string }
  }
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const primaryImage = equipment.equipment_images?.find(img => img.is_primary)
    || equipment.equipment_images?.[0]

  return (
    <Link to={`/equipment/${equipment.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={equipment.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
          <Badge className="absolute top-2 right-2" variant="secondary">
            {equipment.category}
          </Badge>
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-lg line-clamp-1">{equipment.name}</CardTitle>
          {equipment.brand && (
            <p className="text-sm text-muted-foreground">{equipment.brand} {equipment.model}</p>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {formatCurrency(equipment.daily_rate)}/day
            </span>
            {equipment.deposit_amount > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(equipment.deposit_amount)} deposit
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
            {equipment.pickup_location}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          Listed by {equipment.profiles?.full_name || 'Unknown'}
        </CardFooter>
      </Card>
    </Link>
  )
}