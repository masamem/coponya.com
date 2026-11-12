-- Applied to project fkevfvficgwnumkirpar on 2026-11-12. Public "تواصل معنا" messages; anon may insert only, admins read/update/delete.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','read','replied','closed')),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 120),
  phone text check (phone is null or phone ~ '^[0-9+ ()-]{7,20}$'),
  subject text not null check (char_length(btrim(subject)) between 2 and 120),
  message text not null check (char_length(btrim(message)) between 5 and 3000)
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant insert (name, email, phone, subject, message) on public.contact_messages to anon, authenticated;
grant select, update (status), delete on public.contact_messages to authenticated;
create policy "Anyone can send a message" on public.contact_messages for insert to anon, authenticated with check (status = 'new');
create policy "Admins read messages" on public.contact_messages for select to authenticated using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create policy "Admins update messages" on public.contact_messages for update to authenticated using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
