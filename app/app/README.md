# White Day Wedding Planner - Full Stack API

> A complete backend API for the **White Day Wedding Planner** platform. Built with **tRPC + Drizzle ORM + Hono + MySQL**, with a minimal frontend scaffold ready for your frontend developer.

---

## Stack Overview

| Layer | Technology |
|-------|-----------|
| **API Server** | Hono (fast, lightweight HTTP framework) |
| **API Protocol** | tRPC 11.x (end-to-end type safety) |
| **Database ORM** | Drizzle ORM (type-safe SQL queries) |
| **Database** | MySQL (your existing `white_day` database) |
| **Auth** | JWT (email/password login & register) |
| **Frontend** | React 19 + TypeScript + Tailwind CSS + Vite |

---

## Quick Start

### 1. Prerequisites

- **Node.js** 20+ and **npm**
- **MySQL** running locally (or remote) with the `white_day` database imported

### 2. Install Dependencies

```bash
cd app
npm install
```

### 3. Configure Environment

Edit `.env` and set your MySQL connection string:

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/white_day
JWT_SECRET=your-super-secret-random-string
```

### 4. Start Development Server

```bash
npm run dev
```

The server starts at **http://localhost:3000**

- Frontend: http://localhost:3000/
- tRPC API: http://localhost:3000/api/trpc

---

## API Endpoints

All endpoints are accessible via tRPC at `/api/trpc/{router}.{procedure}`

### Authentication (`auth.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `auth.register` | mutation | public | Create new customer/provider account |
| `auth.login` | mutation | public | Login with email/password |
| `auth.me` | query | required | Get current user profile |
| `auth.logout` | mutation | required | Sign out |

**Test with curl:**
```bash
# Register
curl -X POST http://localhost:3000/api/trpc/auth.register \
  -H 'Content-Type: application/json' \
  -d '{"json":{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"0123456789","password":"123456","role":"customer"}}'

# Login
curl -X POST http://localhost:3000/api/trpc/auth.login \
  -H 'Content-Type: application/json' \
  -d '{"json":{"email":"john@example.com","password":"123456"}}'

# Get current user (use token from login)
curl http://localhost:3000/api/trpc/auth.me \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Users (`user.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `user.getById` | query | public | Get user by ID |
| `user.listProviders` | query | public | List all service providers |
| `user.listCustomers` | query | admin | List all customers |
| `user.getProviderServices` | query | public | Get services by provider |
| `user.getMyBookings` | query | required | Get logged-in user's bookings |
| `user.getMyReviews` | query | required | Get logged-in user's reviews |
| `user.profile` | query | required | Get full profile |

### Services (`service.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `service.list` | query | public | List all services (with filters) |
| `service.getById` | query | public | Get single service with details & reviews |
| `service.getByType` | query | public | Get services by category ID |
| `service.search` | query | public | Search services by name |
| `service.listTypes` | query | public | List all service categories |
| `service.getTypeById` | query | public | Get category by ID |
| `service.create` | mutation | required | Provider creates a service |
| `service.update` | mutation | required | Provider updates their service |

**Test with curl:**
```bash
# List all wedding halls (typeId=1)
curl 'http://localhost:3000/api/trpc/service.getByType?input={"json":1}'

# Search services
curl 'http://localhost:3000/api/trpc/service.search?input={"json":{"query":"Rixos"}}'

# Get service details (id=1)
curl 'http://localhost:3000/api/trpc/service.getById?input={"json":1}'
```

### Bookings (`booking.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `booking.create` | mutation | required | Create a booking |
| `booking.getById` | query | public | Get booking details |
| `booking.getMyBookings` | query | required | Customer's bookings |
| `booking.getProviderBookings` | query | required | Provider's bookings |
| `booking.updateStatus` | mutation | required | Update booking status |
| `booking.listAll` | query | admin | Admin: all bookings |

### Payments (`payment.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `payment.create` | mutation | required | Process a payment |
| `payment.getByBookingId` | query | required | Get payments for a booking |
| `payment.getMyPayments` | query | required | User's payment history |
| `payment.getPaymentHistory` | query | required | Full payment history |
| `payment.getPlatformRevenue` | query | admin | Admin: platform revenue |

### Reviews (`review.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `review.create` | mutation | required | Add a review |
| `review.getByServiceId` | query | public | Get reviews for a service |
| `review.getMyReviews` | query | required | User's reviews |
| `review.listAll` | query | admin | Admin: all reviews |

### Disputes (`dispute.*`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `dispute.create` | mutation | required | File a dispute |
| `dispute.getMyDisputes` | query | required | User's disputes |
| `dispute.listAll` | query | admin | Admin: all disputes |
| `dispute.resolve` | mutation | admin | Resolve a dispute |
| `dispute.getById` | query | admin | Get dispute details |

---

## Project Structure

```
app/
├── api/                    # Backend code
│   ├── lib/
│   │   ├── env.ts          # Environment config
│   │   ├── jwt.ts          # JWT sign/verify
│   │   └── cookies.ts      # Cookie utilities
│   ├── routers/
│   │   ├── auth.ts         # Auth router
│   │   ├── users.ts        # Users router
│   │   ├── services.ts     # Services router
│   │   ├── bookings.ts     # Bookings router
│   │   ├── payments.ts     # Payments router
│   │   ├── reviews.ts      # Reviews router
│   │   └── disputes.ts     # Disputes router
│   ├── queries/
│   │   ├── connection.ts   # Drizzle DB connection
│   │   └── users.ts        # User query helpers
│   ├── auth-router.ts      # Auth tRPC router
│   ├── router.ts           # Main tRPC router registry
│   ├── middleware.ts       # tRPC procedure types
│   ├── context.ts          # tRPC context (JWT auth)
│   └── boot.ts             # Hono server entry
├── db/
│   ├── schema.ts           # Drizzle schema (all 10 tables)
│   └── relations.ts        # Table relationships
├── contracts/              # Shared types (frontend + backend)
├── src/                    # Frontend code
│   ├── pages/
│   │   ├── Home.tsx        # Minimal homepage
│   │   ├── Login.tsx       # Login/register page
│   │   └── NotFound.tsx    # 404 page
│   ├── providers/
│   │   └── trpc.tsx        # tRPC React client
│   ├── hooks/
│   │   └── useAuth.ts      # Auth hook for frontend
│   └── main.tsx            # React entry point
├── .env                    # Environment variables
├── drizzle.config.ts       # Drizzle ORM config
└── package.json
```

---

## Database Schema

The backend connects to your existing `white_day` MySQL database with these 10 tables:

| Table | Description |
|-------|-------------|
| `users` | Customers, providers, admins |
| `service_type` | 12 categories (Halls, Dresses, Makeup, etc.) |
| `service` | 46+ services with pricing & ratings |
| `service_detail` | Key-value specs per service |
| `booking` | Customer bookings |
| `booking_includes` | Services in each booking |
| `wallet_payment` | Payment transactions |
| `review` | Customer reviews & ratings |
| `dispute` | Issue tracking |
| `platform_contact` | Platform contact info |

---

## Frontend Developer Guide

The frontend is intentionally minimal. Your frontend developer should:

1. **Build pages in `src/pages/`** — e.g., `Services.tsx`, `Booking.tsx`, `Profile.tsx`
2. **Add routes in `src/App.tsx`**
3. **Call the API using tRPC** (fully typed):

```tsx
import { trpc } from "@/providers/trpc";

function ServicesPage() {
  // Fully typed - TypeScript knows the response shape!
  const { data: services } = trpc.service.list.useQuery({ typeId: 1 });

  return (
    <div>
      {services?.map((s) => (
        <div key={s.serviceId}>
          <h3>{s.sName}</h3>
          <p>{s.price} EGP</p>
        </div>
      ))}
    </div>
  );
}
```

4. **Auth is already wired** — `useAuth()` hook gives you the current user

```tsx
import { useAuth } from "@/hooks/useAuth";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  return isAuthenticated ? <button onClick={logout}>Logout</button> : <a href="/login">Login</a>;
}
```

5. **The token is automatically sent** via the `Authorization: Bearer` header in every request

---

## Authentication

The system uses **JWT tokens** stored in `localStorage`:

- Register → returns `{ token, user }`
- Login → returns `{ token, user }`
- All subsequent requests include `Authorization: Bearer <token>`
- The `auth.me` endpoint returns the current user based on the token

**Role-based access:**
- `customer` — browse, book, review
- `provider` — manage services, view provider bookings
- `admin` — full access to all data

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | Type-check all TypeScript |
| `npm run db:push` | Sync Drizzle schema to database |

---

## Notes

- The backend connects to **your existing MySQL database** — no migration needed if `white_day` already exists
- If your MySQL uses different credentials, update `DATABASE_URL` in `.env`
- The `JWT_SECRET` should be a long random string in production
- All tRPC endpoints have Zod validation for type safety
