import { useState } from 'react'
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { useEquipmentList, useCategories } from '@/hooks/useEquipment'
import { EquipmentCard } from '@/components/equipment/EquipmentCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  })

  const { data: categories } = useCategories()
  const { data: equipment, isLoading } = useEquipmentList({
    search: search || undefined,
    location: location || undefined,
    category: category || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
  })

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setCategory('')
    setFilters({ minPrice: '', maxPrice: '' })
  }

  const hasActiveFilters = search || location || category || filters.minPrice || filters.maxPrice

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-4">Equipment Catalog</h1>
          <p className="opacity-90">Find the perfect gear for your next shoot</p>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cameras, lenses, lighting..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Min Price (/day)</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price (/day)</Label>
                  <Input
                    type="number"
                    placeholder="$500"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && <Badge variant="secondary">Search: {search}</Badge>}
            {location && <Badge variant="secondary">Location: {location}</Badge>}
            {category && <Badge variant="secondary">Category: {category}</Badge>}
            {filters.minPrice && <Badge variant="secondary">Min: ${filters.minPrice}/day</Badge>}
            {filters.maxPrice && <Badge variant="secondary">Max: ${filters.maxPrice}/day</Badge>}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading equipment...</div>
        ) : equipment?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No equipment found</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipment?.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}