# PhotoGear Rental Platform - Agent Guidelines

## Project Overview
This is a multi-phase project to build a photography equipment rental platform using:
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS) + Edge Functions (Deno)
- **Source Control**: GitHub

## Phase Breakdown

### Phase 1: Project Setup
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS
3. Install and configure shadcn/ui
4. Set up Supabase project
5. Create database migrations
6. Configure RLS policies
7. Initialize Git repository (DONE)

### Phase 2: Authentication
1. Configure Supabase Auth
2. Create auth UI components
3. Implement login/register flows
4. Create profile management
5. Set up protected routes

### Phase 3: Equipment Catalog
1. Create equipment listing page
2. Implement search/filter by dates, location
3. Create equipment detail page
4. Implement equipment images gallery
5. Create category browsing

### Phase 4: Equipment Owner Features
1. Create equipment registration form
2. Implement availability calendar
3. Create owner dashboard
4. Implement equipment management
5. Add checkout/return validation

### Phase 5: Booking System
1. Create booking flow
2. Implement availability checking (Edge Function)
3. Create booking confirmation
4. Implement booking tracking
5. Add booking extension requests

### Phase 6: System Owner Features
1. Create admin dashboard
2. Implement equipment approval workflow
3. Create user management
4. Implement booking management
5. Add reporting features

### Phase 7: Polish & Deploy
1. Error handling and validation
2. Loading states and skeletons
3. Mobile responsiveness
4. Deploy to production
5. Push to GitHub

## Tech Stack Details

### Frontend
- React 18 with TypeScript (strict mode)
- Vite as build tool
- Tailwind CSS for styling
- shadcn/ui for UI components
- React Router for routing
- React Query (TanStack Query) for data fetching

### Backend
- Supabase PostgreSQL database
- Supabase Auth for authentication
- Row Level Security (RLS) for data access control
- Edge Functions (Deno) for server-side logic

### Database Tables
- `profiles` - User profiles with roles
- `equipment` - Equipment listings
- `equipment_images` - Equipment photos
- `equipment_availability` - Date-based availability
- `bookings` - Rental bookings
- `booking_extensions` - Booking extensions
- `booking_adjustments` - Price/service adjustments
- `equipment_checkout` - Checkout/return tracking
- `categories` - Equipment categories

## User Roles
1. **RENTER** - Browse, book, track rentals (anonymous browse allowed)
2. **EQUIPMENT OWNER** - Always authenticated, manage equipment
3. **SYSTEM OWNER** - Full system access

## Git Workflow
- Feature branches for each component
- Commit messages: `feat:`, `fix:`, `docs:`, `refactor:`
- Pull requests for reviews
- Never commit `.env` files or secrets

## Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

## File Structure
```
/
├── src/                    # React frontend
├── supabase/
│   └── migrations/        # Database migrations
├── .env.example           # Environment template
├── README.md              # This file
├── AGENTS.md              # Agent guidelines
└── .gitignore
```