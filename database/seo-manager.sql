begin;
alter table public.stores add column if not exists slug text not null default '' check (slug = '' or (length(slug)<=120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'));
alter table public.stores add column if not exists previous_slugs text[] not null default '{}';
create unique index if not exists stores_slug_unique on public.stores(slug) where slug <> '';
alter table public.coupons add column if not exists seo_title text not null default '' check(length(seo_title)<=120);
alter table public.coupons add column if not exists meta_description text not null default '' check(length(meta_description)<=300);
create table public.articles (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 1 and 160),
 slug text not null unique check(length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 previous_slugs text[] not null default '{}',
 description text not null check(length(description) between 1 and 300),
 body text not null check(length(body) between 1 and 40000),
 seo_title text not null default '' check(length(seo_title)<=120),
 meta_description text not null default '' check(length(meta_description)<=300),
 keywords text not null default '' check(length(keywords)<=1000),
 store_id uuid references public.stores(id) on delete restrict,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.articles enable row level security;
revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
create policy "Public published articles" on public.articles for select to anon, authenticated using(published and (store_id is null or exists(select 1 from public.stores where id=store_id and active)));
create policy "Admin articles" on public.articles for all to authenticated using(exists(select 1 from public.admin_users where user_id=auth.uid())) with check(exists(select 1 from public.admin_users where user_id=auth.uid()));
create index articles_store_idx on public.articles(store_id);
-- Preserve old routes, reserve them against reuse, and serialize route edits.
-- Invoker privileges: existing administrator SELECT policies cover hidden rows.
create function public.preserve_seo_routes() returns trigger language plpgsql security invoker set search_path = public as $$
declare prior text; current_route text; route_conflict boolean;
begin
 perform pg_advisory_xact_lock(hashtext(TG_TABLE_NAME));
 current_route := coalesce(nullif(new.slug,''), to_jsonb(new)->>'name');
 new.previous_slugs := '{}';
 if TG_OP='UPDATE' then
  new.previous_slugs := old.previous_slugs;
  prior := coalesce(nullif(old.slug,''), to_jsonb(old)->>'name');
  if prior <> current_route then new.previous_slugs := array_append(new.previous_slugs,prior); end if;
  if TG_TABLE_NAME='stores' and (to_jsonb(old)->>'name') <> (to_jsonb(new)->>'name') then new.previous_slugs := array_append(new.previous_slugs,to_jsonb(old)->>'name'); end if;
 end if;
 execute format('select exists(select 1 from public.%I t where t.id <> $1 and (coalesce(nullif(t.slug, ''''),to_jsonb(t)->>''name'') = $2 or $2 = any(t.previous_slugs) or to_jsonb(t)->>''name'' = $2))', TG_TABLE_NAME) into route_conflict using new.id,current_route;
 if route_conflict then raise exception 'SEO route is already reserved' using errcode='23505'; end if;
 if TG_TABLE_NAME='stores' then
  execute 'select exists(select 1 from public.stores t where t.id <> $1 and (coalesce(nullif(t.slug, ''''),t.name) = $2 or $2 = any(t.previous_slugs) or t.name = $2))' into route_conflict using new.id,new.name;
  if route_conflict then raise exception 'Store name conflicts with reserved SEO route' using errcode='23505'; end if;
 end if;
 return new;
end; $$;
revoke execute on function public.preserve_seo_routes() from public, anon, authenticated;
create trigger stores_seo_routes before insert or update on public.stores for each row execute function public.preserve_seo_routes();
create trigger articles_seo_routes before insert or update on public.articles for each row execute function public.preserve_seo_routes();
commit;
