import { Link } from 'react-router-dom'
import { useAdminStats } from '@/hooks/useAdmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Camera, Calendar, AlertCircle } from 'lucide-react'

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-destructive text-destructive-foreground py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="opacity-90">System management and oversight</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalEquipment || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Equipment</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="bg-yellow-500/10 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.pendingEquipment?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/admin/equipment" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Equipment
                    </Button>
                  </Link>
                  <Link to="/admin/users" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Users
                    </Button>
                  </Link>
                  <Link to="/admin/bookings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Bookings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {stats?.pendingEquipment && stats.pendingEquipment.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Equipment Approvals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.pendingEquipment.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <Link to={`/admin/equipment?highlight=${item.id}`}>
                            <Button size="sm" variant="outline">Review</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}