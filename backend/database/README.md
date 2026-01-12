# Database Schema

This directory contains the database schema definitions for the Learning Tracker application.

## Author: Sourav Kumar Das

## Schema File

- **schema.sql** - Complete database schema with all table definitions

## How to Apply the Schema

Since this project uses **Supabase (PostgreSQL)**, you have several options to apply the schema:

### Option 1: Supabase Dashboard SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and run the SQL in the editor

### Option 2: Supabase CLI (if installed)
```bash
supabase db reset
# or
psql -h <your-supabase-host> -U postgres -d postgres -f schema.sql
```

### Option 3: Supabase Migration (for version control)
If you want to use Supabase migrations:
```bash
supabase migration new initial_schema
# Copy schema.sql content to the new migration file
supabase db push
```

## Database Tables

The schema includes the following tables:

1. **admin** - Admin user accounts
2. **users** - Regular user accounts
3. **courses** - Course definitions
4. **modules** - Course modules
5. **user_courses** - User course enrollments
6. **user_module_progress** - User progress tracking per module

## Notes

- All tables use UUID primary keys with `gen_random_uuid()` default
- Foreign key relationships are set up with appropriate CASCADE options
- Timestamps use `TIMESTAMP DEFAULT now()` for automatic timestamping
- The schema uses `CREATE TABLE IF NOT EXISTS` for idempotency
