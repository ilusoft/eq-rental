import { useState } from 'react'
import { useAdminAllEquipment, useApproveEquipment, useRejectEquipment } from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, Camera } from 'lucide-react'

export function AdminEquipmentPage() {
  const { user } = useAuth()
  const { data: equipment, isLoading } = useAdminAllEquipment()
  const approveEquipment = useApproveEquipment()
  const rejectEquipment = useRejectEquipment()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const filteredEquipment = equipment?.filter(item =>
    filter === 'all' ? true : item.status === filter
  ) || []

  const handleApprove = async (equipmentId: string) => {
    if (!user?.id) return
    try {
      await approveEquipment.mutateAsync({ equipmentId, approvedBy: user.id })
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  const handleReject = async (equipmentId: string) => {
    if (window.confirm('Are you sure you want to reject this equipment?')) {
      try {
        await rejectEquipment.mutateAsync(equipmentId)
      } catch (err) {
        console.error('Failed to reject:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">Equipment Management</h1>
          <p className="opacity-90">Review and manage all equipment listings</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
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
        ) : filteredEquipment.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No equipment found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEquipment.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-md" />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.brand} {item.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-sm font-semibold mt-2">
                          {formatCurrency(item.daily_rate)}/day
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner: {item.profiles?.full_name || item.profiles?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          item.status === 'approved' ? 'default' :
                          item.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(item.id)}
                            disabled={rejectEquipment.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            disabled={approveEquipment.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
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