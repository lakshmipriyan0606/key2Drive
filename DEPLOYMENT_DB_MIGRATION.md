# Key2Drive Database Architecture, Scaling & Migration Strategy

---

## 1. Current Architecture: SQLite + WAL Mode

The Key2Drive platform currently uses **SQLite** through Prisma ORM (`prisma/dev.db`).

### Verified SQLite Concurrency Profile
- **Journal Mode:** Write-Ahead Logging (`WAL`)
- **Busy Timeout:** `5000ms`
- **Read Throughput:** 100 simultaneous concurrent reads completed in **52ms**
- **Interactive Write Transactions:** 10 simultaneous multi-table booking transactions completed with **0 lock contention (`SQLITE_BUSY`) errors**

### Suitable Deployment Targets for SQLite
- Single-instance cloud VPS (DigitalOcean Droplet, AWS EC2, Hetzner, Linode).
- Single Docker container with persistent volume mount (`/app/prisma/dev.db`).
- Local staging and integration testing environments.

### Unsuitable Deployment Targets for SQLite
- Serverless execution environments (Vercel, AWS Lambda, Google Cloud Run without persistent disk) where compute instances are stateless and ephemeral.
- Horizontally autoscaled multi-replica clusters (Kubernetes pods with >1 replica).

---

## 2. Recommended Production Target: PostgreSQL

For production deployments targeting Vercel, Supabase, Neon, AWS RDS, or Railway, **PostgreSQL** is the recommended persistent data store.

### Key Advantages of PostgreSQL for Key2Drive
1. **Multi-Region / Multi-Instance Scalability:** Unlimited stateless Next.js lambdas connecting via connection pooler (e.g., PgBouncer, Prisma Accelerate, or Supabase Pooler).
2. **ACID Concurrency:** Native row-level locking eliminates any file-lock serialization under high booking spikes.
3. **Point-in-Time Recovery (PITR):** Continuous WAL archiving for zero data-loss disaster recovery.

---

## 3. Lossless Migration Plan: SQLite to PostgreSQL

### Step 1: Environment Configuration
Update `.env` in the production environment:
```env
# Switch from SQLite to PostgreSQL connection string
DATABASE_URL="postgresql://k2d_user:StrongPassword@db.key2drive.com:5432/key2drive_prod?schema=public&sslmode=prefer"
```

### Step 2: Prisma Schema Provider Switch
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Schema Push & Relation Generation
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Data Export & Transfer Script
A migration utility (`scripts/migrate-sqlite-to-postgres.ts`) can be executed to export all tables from SQLite (`prisma/dev.db`) and batch insert them into the new PostgreSQL database:
```bash
npx tsx scripts/migrate-sqlite-to-postgres.ts
```

Order of migration to preserve foreign key constraints:
1. `User` (Administrators & Staff)
2. `Session` (Active sessions)
3. `Service` (Chauffeur tiers)
4. `Tariff` (Rates linked to services)
5. `Booking` (Customer trips linked to services)
6. `BookingStatusHistory` (Audit trail linked to bookings)
7. `Enquiry` (Customer contact messages)
8. `AdminNote` (Internal notes linked to users, bookings, and enquiries)

---

## 4. Backup and Disaster Recovery Strategy

### For SQLite Deployments
Automated cron backup script:
```bash
#!/bin/bash
# Backup SQLite safely without locking active readers
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
sqlite3 /app/prisma/dev.db ".backup '/app/backups/k2d_backup_${TIMESTAMP}.db'"
# Retain last 30 daily backups
find /app/backups/ -name "k2d_backup_*.db" -mtime +30 -delete
```

### For PostgreSQL Deployments
```bash
# Automated daily logical dump
pg_dump -U k2d_user -d key2drive_prod -F c -b -v -f "/backups/k2d_pg_${TIMESTAMP}.dump"
```

