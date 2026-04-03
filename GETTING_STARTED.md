# Local Service Management System - Getting Started

## Overview
A full-stack local service marketplace platform built with Next.js 16, React 19, PostgreSQL (Neon), and modern web technologies.

## Features

### For Customers
- Browse and search services by category
- View detailed service information with reviews and ratings
- Book services with date/time selection
- Manage upcoming and past bookings
- Leave reviews and ratings
- Add services to favorites

### For Service Providers (Vendors)
- Create and manage service offerings
- View booking requests and analytics
- Track earnings and customer reviews
- Manage service availability
- View performance metrics (bookings, ratings, revenue)

### For All Users
- Secure user authentication with JWT tokens
- Role-based access control (Customer/Vendor/Admin)
- Profile management
- Responsive design across all devices

## Tech Stack

- **Frontend**: Next.js 16.2, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT with PBKDF2 password hashing
- **State Management**: React hooks (useAuth, useApi)

## Project Structure

```
app/
├── api/                          # API Routes
│   ├── auth/                     # Authentication endpoints
│   │   ├── login/
│   │   └── register/
│   ├── services/                 # Service management
│   ├── bookings/                 # Booking management
│   ├── reviews/                  # Review system
│   ├── favorites/                # Favorites management
│   ├── categories/               # Service categories
│   ├── users/                    # User management
│   └── vendors/                  # Vendor analytics
├── customer/
│   └── dashboard/                # Customer dashboard
├── vendor/
│   └── dashboard/                # Vendor dashboard
├── services/                      # Public service browsing
├── page.tsx                       # Home page
└── layout.tsx                     # Root layout

components/
├── auth/                          # Authentication components
└── ui/                           # shadcn/ui components

hooks/
├── useAuth.ts                    # Authentication hook
└── useApi.ts                     # API request hook

lib/
├── db.ts                         # Database client
├── auth.ts                       # Authentication utilities
├── validators.ts                 # Input validation
└── middleware.ts                 # Request middleware

scripts/
└── setup-db.js                   # Database setup script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Services
- `GET /api/services` - List services with filters
- `POST /api/services` - Create new service (vendor only)
- `GET /api/services/[id]` - Get service details
- `PUT /api/services/[id]` - Update service (vendor only)
- `DELETE /api/services/[id]` - Deactivate service (vendor only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status

### Reviews
- `GET /api/reviews` - Get reviews for a service
- `POST /api/reviews` - Create review

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites` - Remove from favorites

### Other
- `GET /api/categories` - List service categories
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/vendors/stats` - Get vendor analytics

## Database Schema

### Users
- id, email, password_hash, name, phone, role, bio, avatar_url, address
- Roles: customer, vendor, admin

### Services
- id, vendor_id, category_id, name, description, price, duration
- image_url, is_active, created_at, updated_at

### Bookings
- id, customer_id, service_id, booking_date, notes, status
- Statuses: pending, accepted, completed, cancelled

### Reviews
- id, service_id, customer_id, booking_id, rating, comment, created_at

### Categories
- id, name, description, icon_url

### Favorites
- id, customer_id, service_id, created_at

### Additional Tables
- Messages (for customer-vendor communication)
- ServiceSlots (availability management)
- Payments (payment tracking)
- Analytics (usage statistics)

## Authentication Flow

1. User registers with email, password, name, and role
2. Password is hashed using PBKDF2 with random salt
3. JWT token issued on successful login/registration
4. Token stored in localStorage (client-side)
5. Token sent in Authorization header for authenticated requests
6. Token verified on server using JWT signature

## Environment Variables

Required:
- `DATABASE_URL` - Neon PostgreSQL connection string (set automatically with Neon integration)
- `JWT_SECRET` - Secret key for JWT signing (defaults to 'your-secret-key-change-in-production')

## Getting Started

1. The database has already been set up with `setup-db.js`
2. Visit the home page to register as a customer or service provider
3. Browse services, create bookings, or list your services
4. Access your dashboard to manage your activity

## Color Scheme

- **Primary**: Deep Blue (#4338ca) - Main actions and highlights
- **Secondary**: Teal/Cyan (#0891b2) - Accents and alternate actions
- **Background**: Off-white with slight blue tint
- **Text**: Dark gray for readability
- **Neutral**: Grays for borders and secondary elements

## Development Notes

- All API routes require authentication headers: `Authorization: Bearer {token}`
- Role-based access is enforced on protected endpoints
- Passwords must meet requirements (8+ chars, uppercase, lowercase, number)
- Email must be unique per user
- Services use soft delete (is_active flag) rather than hard delete

## Future Enhancements

- Real-time messaging between customers and vendors
- Payment integration (Stripe)
- Image uploads for services (Cloudinary/Blob storage)
- Admin dashboard with platform analytics
- Email notifications
- SMS reminders for bookings
- Service provider verification/rating system
- Advanced search with maps integration
