-- Applied to project fkevfvficgwnumkirpar on 2026-11-12. Public "أضف متجرك" requests; anon may insert only, admins read/update/delete.
create table public.store_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','reviewing','approved','rejected')),
  store_name text not null check (char_length(btrim(store_name)) between 2 and 100),
  website_url text not null check (website_url ~* '^https?://[^\s/@]+\.[^\s]+$' and char_length(website_url) <= 200),
  category text not null check (char_length(category) between 1 and 60),
  registration text check (registration is null or char_length(registration) <= 120),
  contact_name text not null check (char_length(btrim(contact_name)) between 2 and 80),
  email text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 120),
  phone text check (phone is null or phone ~ '^[0-9+ ()-]{7,20}$'),
  offer_type text not null check (offer_type in ('code','deal')),
  code text check (code is null or char_length(code) <= 60),
  offer text not null check (char_length(btrim(offer)) between 3 and 180),
  terms text check (terms is null or char_length(terms) <= 700),
  expires_on date,
  affiliate text not null default 'unsure' check (affiliate in ('yes','no','unsure')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 1000),
  constraint code_required_for_code_offers check (offer_type <> 'code' or (code is not null and char_length(btrim(code)) >= 2))
);
alter table public.store_submissions enable row level security;
revoke all on public.store_submissions from anon, authenticated;
grant insert (store_name, website_url, category, registration, contact_name, email, phone, offer_type, code, offer, terms, expires_on, affiliate) on public.store_submissions to anon, authenticated;
grant select, update (status, admin_notes), delete on public.store_submissions to authenticated;
create policy "Anyone can submit a store" on public.store_submissions for insert to anon, authenticated with check (status = 'new' and admin_notes is null);
create policy "Admins read submissions" on public.store_submissions for select to authenticated using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create policy "Admins update submissions" on public.store_submissions for update to authenticated using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create policy "Admins delete submissions" on public.store_submissions for delete to authenticated using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create index store_submissions_created_at_idx on public.store_submissions (created_at desc);
