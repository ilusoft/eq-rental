import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">Rent Photography Equipment</h1>
          <p className="text-xl mb-8 opacity-90">
            Find the perfect gear for your next shoot
          </p>
          <Link to="/catalog">
            <Button size="lg" variant="secondary" className="font-semibold">
              Browse Equipment
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Browse Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Search through our catalog of cameras, lenses, lighting, and more.
                  Filter by dates and location to find what's available.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Book Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Select your dates, review pricing, and make a booking.
                  Create an account to track your rentals.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Pick Up & Shoot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Collect your equipment from the owner location and start shooting.
                  Return when done - it's that simple.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">Have Equipment to Rent?</h2>
          <p className="text-muted-foreground mb-6">
            Join our community of equipment owners and earn from your gear.
          </p>
          <Link to="/register">
            <Button>Register as Owner</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}