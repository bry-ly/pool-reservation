# Pool Type Feature Design

## Overview

Add a pool type field to distinguish between "kids" and "adult" pools. This is a simple organizational label with no access restrictions.

## Database Schema Changes

### Pool Model

Add a `type` field to the Pool model in `prisma/schema.prisma`:

```prisma
model Pool {
  id                  String              @id @default(cuid())
  name                String
  description         String?
  address             String?
  imageUrl            String?
  isActive            Boolean             @default(true)
  type                String              @default("adult") // "kids" | "adult"
  defaultMaxDuration  Int                 @default(240)
  defaultMinAdvance   Int                 @default(2)
  defaultCancelWindow Int                 @default(1)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  reservations        Reservation[]
  schedules           ScheduleOverride[]

  @@map("pool")
}
```

## UI Changes

### Pool Forms

1. **PoolForm component** (`components/pool/pool-form.tsx`):
   - Add a select dropdown with options: "Kids Pool" and "Adult Pool"
   - Default to "Adult Pool" for new pools
   - Include `type` in form submission data

2. **CreatePoolDialog component** (`components/pool/create-pool-dialog.tsx`):
   - Add the same select dropdown
   - Include `type` in API request body

### Pool Display

1. **Reserve page** (`app/(user)/reserve/page.tsx`):
   - Add a badge next to the pool name showing "Kids" or "Adult"
   - Use different badge colors for visual distinction

2. **Admin pools page** (`app/(admin)/admin/pools/page.tsx`):
   - Show the pool type in the admin list view

## API Changes

### Admin Pools API

Update `app/api/admin/pools/route.ts` to accept the `type` field:

```typescript
const { name, description, address, imageUrl, isActive, type, defaultMaxDuration, defaultMinAdvance, defaultCancelWindow } = body;
```

Include `type` in the pool creation data.

## Migration

Run `pnpm db:push` to apply the schema changes to the database.

## Testing

1. Create a new pool with type "kids"
2. Create a new pool with type "adult"
3. Verify both types appear correctly in the reserve page
4. Verify the admin pools page shows the type
5. Edit an existing pool and change its type
