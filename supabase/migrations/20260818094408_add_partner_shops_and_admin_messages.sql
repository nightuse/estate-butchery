/*
# Add partner butchery network and admin-to-admin chat tables

## Purpose
This migration adds two new tables to support the partner butchery network feature:
1. `partner_shops` — stores information about partner butcheries that this shop works with.
   Customers can browse these on a public "Partners" page, and admins can redirect
   orders to a partner when items are out of stock or the customer is closer to a partner.
2. `admin_messages` — stores messages sent between admins of different butchery shops
   in the network, enabling coordination (e.g. "can you fulfil this order?").

## New Tables

### partner_shops
- `id` (serial, primary key)
- `slug` (text, unique) — URL-friendly identifier
- `name` (text, not null) — butchery display name
- `tagline` (text) — short description
- `location` (text) — area/neighborhood
- `phone` (text) — contact phone
- `whatsapp` (text) — WhatsApp number
- `till_number` (text) — M-Pesa Till number
- `paybill_number` (text) — M-Pesa Paybill number
- `paybill_account` (text) — M-Pesa Paybill account
- `domain` (text) — website URL if available
- `logo_image` (text) — logo image URL
- `hero_image` (text) — hero image URL
- `is_active` (boolean, default true) — whether to show on public page
- `sort_order` (integer, default 0)
- `created_at` (timestamptz, default now())

### admin_messages
- `id` (serial, primary key)
- `sender_name` (text, not null) — name of the admin sending the message
- `sender_shop` (text, not null) — shop the sender belongs to
- `recipient_shop` (text, not null) — shop the message is for
- `body` (text, not null) — message content
- `is_read` (boolean, default false)
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on both tables.
- The app uses better-auth (not Supabase auth), and the frontend talks to the DB
  via drizzle-orm server actions (server-side, using the connection string).
  The public Partners page reads partner_shops through a server-side query.
  Since all DB access is server-side via the service-level connection string,
  RLS policies allow anon + authenticated read on partner_shops (public data)
  and full CRUD for authenticated users on both tables.

## Notes
1. partner_shops is intentionally public — any visitor can see active partners.
2. admin_messages is read/write by authenticated admins only.
3. Seed data includes two sample partner butcheries.
*/

CREATE TABLE IF NOT EXISTS partner_shops (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  location text,
  phone text,
  whatsapp text,
  till_number text,
  paybill_number text,
  paybill_account text,
  domain text,
  logo_image text,
  hero_image text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE partner_shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_active_partners" ON partner_shops;
CREATE POLICY "read_active_partners"
ON partner_shops FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_partners" ON partner_shops;
CREATE POLICY "insert_partners"
ON partner_shops FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_partners" ON partner_shops;
CREATE POLICY "update_partners"
ON partner_shops FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_partners" ON partner_shops;
CREATE POLICY "delete_partners"
ON partner_shops FOR DELETE
TO authenticated
USING (true);

CREATE TABLE IF NOT EXISTS admin_messages (
  id serial PRIMARY KEY,
  sender_name text NOT NULL,
  sender_shop text NOT NULL,
  recipient_shop text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_admin_messages" ON admin_messages;
CREATE POLICY "read_admin_messages"
ON admin_messages FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "insert_admin_messages" ON admin_messages;
CREATE POLICY "insert_admin_messages"
ON admin_messages FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_admin_messages" ON admin_messages;
CREATE POLICY "update_admin_messages"
ON admin_messages FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_admin_messages" ON admin_messages;
CREATE POLICY "delete_admin_messages"
ON admin_messages FOR DELETE
TO authenticated
USING (true);

-- Seed sample partner butcheries (idempotent)
INSERT INTO partner_shops (slug, name, tagline, location, phone, whatsapp, is_active, sort_order)
SELECT 'jamii-butchery', 'Jamii Butchery', 'Your community butcher — quality cuts daily', 'Zimmerman', '0712 345 678', '254712345678', true, 1
WHERE NOT EXISTS (SELECT 1 FROM partner_shops WHERE slug = 'jamii-butchery');

INSERT INTO partner_shops (slug, name, tagline, location, phone, whatsapp, is_active, sort_order)
SELECT 'fresh-cut-butchery', 'Fresh Cut Butchery', 'Farm-fresh meat at honest prices', 'Miremi', '0722 987 654', '254722987654', true, 2
WHERE NOT EXISTS (SELECT 1 FROM partner_shops WHERE slug = 'fresh-cut-butchery');