-- Outbound click counts for /go/<store>. NOT YET APPLIED to project fkevfvficgwnumkirpar:
-- apply it after this change is reviewed (the /go route already works without it; clicks
-- are simply not recorded until it exists).
--
-- Nobody writes to the table directly. The public site calls log_outbound_click(), which
-- only records a click for an active store (and a coupon of that store, if given).
-- Only admins can read the table and the 30-day summary.

create table public.outbound_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  store_id uuid not null references public.stores(id) on delete cascade,
  coupon_id uuid references public.coupons(id) on delete set null,
  source text not null default 'store' check (source in ('store', 'coupon'))
);
alter table public.outbound_clicks enable row level security;
revoke all on public.outbound_clicks from anon, authenticated;
grant select on public.outbound_clicks to authenticated;
create policy "Admins read outbound clicks" on public.outbound_clicks for select to authenticated
  using (exists (select 1 from public.admin_users where admin_users.user_id = (select auth.uid())));
create index outbound_clicks_store_created_idx on public.outbound_clicks (store_id, created_at desc);
create index outbound_clicks_coupon_idx on public.outbound_clicks (coupon_id);

create function public.log_outbound_click(p_store_id uuid, p_coupon_id uuid default null, p_source text default 'store')
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.outbound_clicks (store_id, coupon_id, source)
  select s.id,
         (select c.id from public.coupons c where c.id = p_coupon_id and c.store_id = s.id),
         case when p_source = 'coupon' then 'coupon' else 'store' end
  from public.stores s
  where s.id = p_store_id and s.active;
$$;
revoke execute on function public.log_outbound_click(uuid, uuid, text) from public;
grant execute on function public.log_outbound_click(uuid, uuid, text) to anon, authenticated;

-- Runs with the caller's rights, so the select policy above limits it to admins.
create function public.outbound_click_stats(p_days integer default 30)
returns table (store_id uuid, clicks bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select oc.store_id, count(*)::bigint
  from public.outbound_clicks oc
  where oc.created_at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by oc.store_id;
$$;
revoke execute on function public.outbound_click_stats(integer) from public;
grant execute on function public.outbound_click_stats(integer) to authenticated;
