import { useState } from 'react'
import { useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { UserRole } from '@/types'

export function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers()
  const updateUserRole = useUpdateUserRole()
  const [filter, setFilter] = useState<'all' | UserRole>('all')

  const filteredUsers = users?.filter(user =>
    filter === 'all' ? true : user.role === filter
  ) || []

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        await updateUserRole.mutateAsync({ userId, role: newRole })
      } catch (err) {
        console.error('Failed to update role:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="opacity-90">Manage user accounts and roles</p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="flex gap-2">
          {(['all', 'renter', 'owner', 'system_owner'] as const).map((role) => (
            <Button
              key={role}
              variant={filter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(role)}
            >
              {role === 'all' ? 'All' : role === 'system_owner' ? 'System Owner' : role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          user.role === 'system_owner' ? 'default' :
                          user.role === 'owner' ? 'secondary' :
                          'outline'
                        }
                      >
                        {user.role === 'system_owner' ? 'System Owner' : user.role}
                      </Badge>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={updateUserRole.isPending}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="renter">Renter</option>
                        <option value="owner">Equipment Owner</option>
                        <option value="system_owner">System Owner</option>
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