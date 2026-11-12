-- Applied to project fkevfvficgwnumkirpar on 2026-11-12.
-- Emails coponya27@gmail.com (via Resend) on every new contact message or store request.
-- Requires a Vault secret named "resend_api_key"; without it nothing is sent and inserts still succeed.
create extension if not exists pg_net with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.html_escape(t text) returns text language sql immutable set search_path = '' as $$
  select replace(replace(replace(replace(coalesce(t,''),'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;')
$$;
-- private.notify_new_submission(): see the live definition in the database (security definer,
-- reads vault.decrypted_secrets, builds an RTL HTML email, calls net.http_post to api.resend.com,
-- swallows errors so visitor inserts never fail).
-- create trigger contact_messages_notify after insert on public.contact_messages for each row execute function private.notify_new_submission();
-- create trigger store_submissions_notify after insert on public.store_submissions for each row execute function private.notify_new_submission();
