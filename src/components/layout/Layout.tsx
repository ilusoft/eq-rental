import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Layout() {
  const { isAuthenticated, profile, signOut, isOwner } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-xl">PhotoGear</Link>
            <nav className="flex gap-4">
              <Link to="/catalog" className="text-sm hover:text-primary">Catalog</Link>
              {isAuthenticated && (
                <>
                  <Link to="/my-bookings" className="text-sm hover:text-primary">My Bookings</Link>
                  {isOwner && (
                    <Link to="/owner/dashboard" className="text-sm hover:text-primary">Owner Dashboard</Link>
                  )}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {profile?.full_name || profile?.email}
                </span>
                <Link to="/profile">
                  <Button variant="outline" size="sm">Profile</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          PhotoGear Rental Platform
        </div>
      </footer>
    </div>
  )
}