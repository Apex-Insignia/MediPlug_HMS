# HMS Database SQL Initialization

This directory contains the SQL files required to initialize the PostgreSQL database for the AI Claim Bridge Hospital Management System (HMS).

## Execution Order
Execute the files strictly in the following order:

1. `001_extensions.sql` (Creates required Postgres extensions like UUIDs)
2. `002_schema.sql` (Creates all tables)
3. `003_indexes.sql` (Creates indexes for performance)
4. `004_constraints.sql` (Adds constraints)

## Supabase Setup Instructions
1. Create a new Supabase project.
2. Go to the SQL Editor in Supabase.
3. Run each file one by one in the order specified above.
4. Go to Supabase Storage and create a bucket (e.g., `medical-documents`).
5. Copy your Supabase URL and keys into the `.env` files of both frontend and backend.
6. Import your CSV seed data into the respective tables through the Supabase Table Editor or via the SQL Editor using `COPY`.
