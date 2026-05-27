# Pool Reservation System

## Overview

Multi-pool reservation system for a residential community with mixed users (members and public). Users book custom time blocks during pool operating hours. Free for all. Built into existing Next.js admin app with Better Auth.

## Architecture

### Route Structure (Approach A: Dual Route Groups)

```
app/
├── (auth)/
│   ├── layout.tsx         ← Centered card layout, no sidebar
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (user)/
│   ├── layout.tsx         ← User shell (top nav, pool-related nav items)
│   ├── page.tsx           ← Redirect to /reserve
│   └── reserve/
│       ├── page.tsx       ← Browse pools + date/time picker
│       └── [id]/page.tsx  ← Specific pool detail / booking
├── (admin)/
│   ├── layout.tsx         ← Existing AppShell with full sidebar
│   └── admin/
│       ├── page.tsx       ← Dashboard placeholder
│       └── pools/
│           ├── page.tsx   ← List pools (table)
│           ├── new/
│           │   └── page.tsx  ← Create pool form
│           └── [id]/
│               ├── page.tsx       ← Edit pool
│               ├── schedule/
│               │   └── page.tsx   ← Manage daily hours
│               └── reservations/
│                   └── page.tsx   ← View reservations for this pool
├── api/
│   ├── auth/[...all]/route.ts
│   └── reservations/route.ts  ← API for reservation CRUD
└── layout.tsx (existing)
```

### Auth Guards

- Middleware checks session for all routes. Unauthenticated → redirect to `/login`.
- `(admin)/` additionally checks `role === "admin"`. Non-admin → 404.
- User model extended with `role` field (`"user" | "admin"`, default `"user"`).

## Data Model

### Pool

```prisma
model Pool {
  id                   String   @id @default(cuid())
  name                 String
  description          String?
  address              String?
  isActive             Boolean  @default(true)
  defaultMaxDuration   Int      @default(240)  // minutes
  defaultMinAdvance    Int      @default(2)    // hours
  defaultCancelWindow  Int      @default(1)    // hours before start
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  reservations ScheduleOverride[]
  schedules    Reservation[]
}
```

### ScheduleOverride

```prisma
model ScheduleOverride {
  id        String   @id @default(cuid())
  poolId    String
  date      DateTime // date only (no time component)
  openTime  DateTime? // null if closed
  closeTime DateTime? // null if closed
  isClosed  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  pool Pool @relation(fields: [poolId], references: [id], onDelete: Cascade)

  @@unique([poolId, date])
}
```

- No default weekly schedule. If no override exists for a date, pool is closed.
- Admins set hours per date via the schedule management UI.
- Batch creation: when setting hours, admin can enter time range and apply to a date range.

### Reservation

```prisma
model Reservation {
  id                 String    @id @default(cuid())
  poolId             String
  userId             String
  startTime          DateTime
  endTime            DateTime
  status             String    @default("confirmed") // confirmed | cancelled
  cancelledAt        DateTime?
  cancellationReason String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  pool Pool @relation(fields: [poolId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([poolId, startTime])
  @@index([userId, status])
}
```

### User (extend existing)

```prisma
model User {
  // ...existing fields...
  role String @default("user") // user | admin
}
```

## User-Facing Flow

### Browse Pools (`/reserve`)

- Card grid showing all active pools.
- Each card: photo placeholder, name, description, today's hours, Select button.

### Book a Time (`/reserve/[id]`)

1. **Date picker** — calendar widget showing available dates.
2. **Time selector** — dropdown or time inputs for start/end, constrained by:
   - Pool's operating hours for that date (from ScheduleOverride).
   - Maximum duration limit (defaultMaxDuration).
   - Minimum advance booking time (defaultMinAdvance).
3. **Confirm** — creates reservation, shows success toast, redirects to My Reservations.

### My Reservations

- Tabbed list: Upcoming / Past / Cancelled.
- Each row: pool name, date, time, status badge.
- Cancel button on upcoming reservations (respects cancellation window).

## Admin Flow

### Pool Management (`/admin/pools`)

- Table: name, status (active/inactive), max duration, today's hours, reservations count, actions.
- CRUD: create/edit pool form with name, description, address, rules (duration, advance, cancel window), active toggle.

### Schedule Management (`/admin/pools/[id]/schedule`)

- Date picker + time range inputs.
- Table of upcoming dates with hours and status (Open / Modified / Closed).
- Edit any date, or mark entire date as closed.
- UI for applying hours to a date range.

### Reservation Overview (`/admin/pools/[id]/reservations`)

- Filterable by pool, date range, status.
- Table: user, pool, date, time, status, when booked.
- No cancellation from admin side (soft-delete if needed).

## Advanced Rules

Enforced at the application layer in service functions:

| Rule | Implementation |
|---|---|
| Max duration | Check `endTime - startTime <= pool.defaultMaxDuration` |
| Min advance | Check `startTime - now >= pool.defaultMinAdvance` |
| Cancellation window | Allow cancel if `startTime - now >= pool.defaultCancelWindow` |
| Pool blackout dates | Mark pool closed on a date via ScheduleOverride (isClosed) |
| Overlapping bookings | Prevent booking if user already has overlapping reservation |

## Implementation Order

1. **Database** — Add Pool, ScheduleOverride, Reservation models + User.role. Run migration.
2. **Auth middleware** — Role-based guards, login/signup pages.
3. **Admin: Pool CRUD** — List, create, edit pools.
4. **Admin: Schedule management** — Set daily hours per pool.
5. **User: Reservation flow** — Browse pools, book time, my reservations, cancel.
6. **Admin: Reservation overview** — View all reservations with filters.
