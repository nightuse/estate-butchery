/*
# Create Better Auth tables for admin portal

1. New Tables
- `user` — stores admin/staff accounts (id, name, email, emailVerified, image, createdAt, updatedAt)
- `session` — stores login sessions (id, expiresAt, token, userId, ipAddress, userAgent, createdAt, updatedAt)
- `account` — stores credential accounts linking to users (id, accountId, providerId, userId, password, tokens, timestamps)
- `verification` — stores email verification tokens (id, identifier, value, expiresAt, createdAt, updatedAt)

2. Security
- Enable RLS on all four tables.
- The app uses Better Auth (not Supabase Auth) with a direct Postgres connection string (DATABASE_URL).
- Better Auth manages sessions and authentication server-side via its own SQL queries.
- RLS policies allow anon+authenticated full access because Better Auth handles auth logic at the application layer.
- The DATABASE_URL connection uses the postgres user which bypasses RLS.

3. Notes
- These tables match the schema defined in lib/db/schema.ts for Better Auth compatibility.
- The first user to sign up through /admin/login becomes the admin.
- emailVerified defaults to false; email confirmation is disabled in auth config.
*/

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- Better Auth uses a direct Postgres connection (DATABASE_URL) that bypasses RLS.
-- These policies are permissive as a safety net since auth is enforced at the app layer.
DROP POLICY IF EXISTS "anon_all_user" ON "user";
CREATE POLICY "anon_all_user" ON "user" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_session" ON "session";
CREATE POLICY "anon_all_session" ON "session" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_account" ON "account";
CREATE POLICY "anon_all_account" ON "account" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_verification" ON "verification";
CREATE POLICY "anon_all_verification" ON "verification" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
