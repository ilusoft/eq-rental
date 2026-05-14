# PhotoGear Rental Platform - Technical Specification

## Overview

A web portal for photography equipment rental connecting Equipment Owners with Renters, managed by System Owners.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database & Auth | Supabase (PostgreSQL, RLS, Auth) |
| Backend Logic | Supabase Edge Functions (Deno) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Source Control | GitHub |

---

## User Roles & Permissions

### 1. RENTER
- Browse equipment catalog (anonymous allowed)
- Search by dates and location
- Create account/login to book
- Book equipment for specified dates
- Track booking status
- Request booking extensions

### 2. EQUIPMENT OWNER
- Always authenticated
- Register equipment with conditions
- Set availability dates
- Set pickup/dropoff locations
- Configure pricing, minimum rental period, deposit
- Mark equipment as available/unavailable
- Validate equipment pickup (check-out)
- Validate equipment return (check-in)

### 3. SYSTEM OWNER
- Manage all users
- Approve equipment listings
- Manage booking schedules
- Extend/modify bookings
- Handle booking adjustments
- View system-wide reports

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | FK to auth.users |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| role | ENUM | 'renter' / 'owner' / 'system_owner' |
| phone | TEXT | Contact number |
| address | TEXT | Default address |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### `equipment`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| owner_id | UUID | FK to profiles |
| name | TEXT | Equipment name |
| description | TEXT | Full description |
| category | TEXT | Equipment category |
| brand | TEXT | Manufacturer |
| model | TEXT | Model name |
| serial_number | TEXT | Serial (optional) |
| condition | TEXT | Equipment condition |
| daily_rate | DECIMAL | Price per day |
| weekly_rate | DECIMAL | Price per week (optional) |
| deposit_amount | DECIMAL | Security deposit |
| min_rental_days | INTEGER | Minimum rental period |
| pickup_location | TEXT | Pickup address |
| dropoff_location | TEXT | Dropoff address |
| is_available | BOOLEAN | General availability flag |
| status | ENUM | 'pending' / 'approved' / 'rejected' |
| approved_by | UUID | FK to profiles (system_owner) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### `equipment_images`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| equipment_id | UUID | FK to equipment |
| url | TEXT | Image URL |
| is_primary | BOOLEAN | Primary image flag |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `equipment_availability`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| equipment_id | UUID | FK to equipment |
| start_date | DATE | Available from |
| end_date | DATE | Available until |
| is_available | BOOLEAN | Available flag |

#### `bookings`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| equipment_id | UUID | FK to equipment |
| renter_id | UUID | FK to profiles |
| start_date | DATE | Rental start |
| end_date | DATE | Rental end |
| pickup_location | TEXT | Actual pickup address |
| dropoff_location | TEXT | Actual dropoff address |
| total_price | DECIMAL | Total rental cost |
| deposit_amount | DECIMAL | Deposit amount |
| deposit_status | ENUM | 'pending' / 'paid' / 'refunded' |
| status | ENUM | 'pending' / 'confirmed' / 'active' / 'completed' / 'cancelled' |
| notes | TEXT | Special requests |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### `booking_extensions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK to bookings |
| new_end_date | DATE | Extended end date |
| additional_cost | DECIMAL | Extra cost |
| approved_by | UUID | FK to profiles |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `booking_adjustments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK to bookings |
| adjustment_type | TEXT | Type of adjustment |
| amount | DECIMAL | Adjustment amount |
| reason | TEXT | Reason for adjustment |
| created_by | UUID | FK to profiles |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `equipment_checkout`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK to bookings |
| checkout_time | TIMESTAMPTZ | Actual checkout |
| checkout_notes | TEXT | Condition notes |
| checkout_by | UUID | FK to profiles (owner) |
| return_time | TIMESTAMPTZ | Actual return |
| return_notes | TEXT | Return condition notes |
| return_by | UUID | FK to profiles (owner) |

#### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name |
| description | TEXT | Category description |
| icon | TEXT | Icon identifier |

---

## Row Level Security (RLS) Policies

### profiles
- Users can read own profile
- System owners can read all profiles
- Owners can read their own

### equipment
- Public can read approved equipment
- Owners can read/update own equipment
- System owners can read/update all

### bookings
- Renters can read own bookings
- Owners can read bookings for their equipment
- System owners can read all

---

## Edge Functions

### 1. `check-availability`
Checks equipment availability for date range.

### 2. `create-booking`
Validates and creates booking with transaction.

### 3. `calculate-price`
Calculates total price including extensions.

### 4. `send-notification`
Sends email notifications for booking events.

### 5. `process-deposit`
Handles deposit payment/refund logic.

### 6. `generate-report`
Generates booking/revenue reports for system owners.

---

## Frontend Application Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── equipment/      # Equipment-related components
│   ├── booking/         # Booking-related components
│   └── shared/          # Shared components
├── pages/
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── EquipmentDetail.tsx
│   ├── Search.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── MyBookings.tsx
│   ├── OwnerDashboard.tsx
│   ├── AddEquipment.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useEquipment.ts
│   ├── useBookings.ts
│   └── ...
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── constants.ts
├── types/
│   └── index.ts
└── App.tsx
```

---

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up Supabase project
- [ ] Create database tables
- [ ] Configure RLS policies
- [ ] Initialize Git repository

### Phase 2: Authentication
- [ ] Configure Supabase Auth
- [ ] Create auth UI components
- [ ] Implement login/register flows
- [ ] Create profile management
- [ ] Set up protected routes

### Phase 3: Equipment Catalog
- [ ] Create equipment listing page
- [ ] Implement search/filter by dates, location
- [ ] Create equipment detail page
- [ ] Implement equipment images gallery
- [ ] Create category browsing

### Phase 4: Equipment Owner Features
- [ ] Create equipment registration form
- [ ] Implement availability calendar
- [ ] Create owner dashboard
- [ ] Implement equipment management
- [ ] Add checkout/return validation

### Phase 5: Booking System
- [ ] Create booking flow
- [ ] Implement availability checking
- [ ] Create booking confirmation
- [ ] Implement booking tracking
- [ ] Add booking extension requests

### Phase 6: System Owner Features
- [ ] Create admin dashboard
- [ ] Implement equipment approval workflow
- [ ] Create user management
- [ ] Implement booking management
- [ ] Add reporting features

### Phase 7: Polish & Deploy
- [ ] Error handling and validation
- [ ] Loading states and skeletons
- [ ] Mobile responsiveness
- [ ] Deploy to production
- [ ] Push to GitHub

---

## API Endpoints (Edge Functions)

| Function | Method | Purpose |
|----------|--------|---------|
| `/check-availability` | POST | Check dates/location availability |
| `/create-booking` | POST | Create new booking |
| `/calculate-price` | POST | Calculate booking total |
| `/extend-booking` | POST | Request booking extension |
| `/cancel-booking` | POST | Cancel booking |
| `/equipment-stats` | GET | Get owner equipment statistics |

---

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- GitHub account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Configure Supabase credentials in `.env`
5. Run database migrations (see `/supabase/migrations`)
6. Start development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create Supabase project
2. Run migrations in `/supabase/migrations/`
3. Configure RLS policies
4. Set up authentication providers

---

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint/Prettier configuration
- Use functional components with hooks
- Prefer shadcn/ui components

### Git Workflow
- Feature branches for each component
- Commit messages: `feat:`, `fix:`, `docs:`, `refactor:`
- Pull requests for reviews

### Testing
- Unit tests for utilities
- Component testing with React Testing Library
- E2E testing with Playwright

---

## License

MIT
