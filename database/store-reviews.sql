-- Apply after schema.sql to the preview database.
begin;

create table public.store_reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 2000),
  status text not null check (status in ('published', 'pending_review', 'rejected')),
  flags text[] not null,
  created_at timestamptz not null default now(),
  unique (author_id, store_id)
);

create table public.store_review_reports (
  review_id uuid not null references public.store_reviews(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam', 'personal_info', 'abuse', 'other')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  primary key (review_id, reporter_id)
);

create table public.store_review_decisions (
  id bigint generated always as identity primary key,
  review_id uuid not null references public.store_reviews(id) on delete cascade,
  moderator_id uuid references auth.users(id) on delete set null,
  previous_status text not null,
  new_status text not null,
  created_at timestamptz not null default now()
);

create index store_reviews_public_idx on public.store_reviews (store_id, created_at desc, id desc) where status = 'published';
create index store_reviews_queue_idx on public.store_reviews (created_at, id) where status = 'pending_review';
create index store_reviews_author_idx on public.store_reviews (author_id, created_at desc);
create index store_review_reports_reporter_idx on public.store_review_reports (reporter_id, created_at desc);
create index store_review_reports_open_idx on public.store_review_reports (created_at, review_id) where resolved_at is null;

alter table public.store_reviews enable row level security;
alter table public.store_review_reports enable row level security;
alter table public.store_review_decisions enable row level security;
revoke all on public.store_reviews, public.store_review_reports, public.store_review_decisions from public, anon, authenticated;

-- The RPCs expose only the fields each caller needs. Direct table writes cannot bypass screening.
create function public.submit_store_review(p_store uuid, p_rating integer, p_comment text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  body text := regexp_replace(coalesce(p_comment, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  screened text;
  flags text[] := '{}';
  result text;
begin
  if actor is null then raise insufficient_privilege; end if;
  if p_rating is null or p_rating not between 1 and 5 or char_length(body) not between 10 and 2000 then
    raise invalid_parameter_value;
  end if;
  if not exists (select 1 from public.stores where id = p_store and active for share) then
    raise invalid_parameter_value;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('store-review:' || actor, 0));
  select status into result from public.store_reviews where author_id = actor and store_id = p_store;
  if found then return result; end if;
  if (select count(*) from public.store_reviews where author_id = actor and created_at >= now() - interval '1 hour') >= 5 then
    return 'rate_limited';
  end if;

  -- Rule-based triage from PR #32, enforced where the review is written.
  screened := translate(normalize(body, NFKC), '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789');
  if screened ~* '(https?://|www\.)[^[:space:]]+' then flags := array_append(flags, 'external_link'); end if;
  if screened ~* '([[:alnum:]_.+-]+@[[:alnum:].-]+\.[a-z]{2,}|(\+?966|0)[[:space:]-]*5([[:space:]-]*[0-9]){8})' then flags := array_append(flags, 'personal_contact'); end if;
  if screened ~ '(.)\1{12,}' then flags := array_append(flags, 'repeated_text'); end if;
  if screened ~* '(سأقتلك|سوف أقتلك|اقتل|تهديد بالقتل|kill you|death threat)' then flags := array_append(flags, 'potential_threat'); end if;
  if screened ~* '(نصاب|محتال|حرامي|سرقني|تزوير|fraud|scammer|thief)' then flags := array_append(flags, 'potential_allegation'); end if;
  result := case when cardinality(flags) = 0 then 'published' else 'pending_review' end;
  insert into public.store_reviews (store_id, author_id, rating, comment, status, flags)
  values (p_store, actor, p_rating, body, result, flags);
  return result;
end;
$$;

create function public.list_store_reviews(p_store uuid, p_offset integer default 0)
returns table (id uuid, rating integer, comment text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, r.rating, r.comment, r.created_at
  from public.store_reviews r join public.stores s on s.id = r.store_id
  where r.store_id = p_store and s.active and r.status = 'published'
  order by r.created_at desc, r.id desc limit 20 offset greatest(p_offset, 0);
$$;

create function public.my_store_review(p_store uuid)
returns text language sql stable security definer set search_path = '' as $$
  select r.status from public.store_reviews r join public.stores s on s.id = r.store_id
  where r.store_id = p_store and s.active and r.author_id = auth.uid();
$$;

create function public.report_store_review(p_review uuid, p_reason text)
returns text language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise insufficient_privilege; end if;
  if p_reason is null or p_reason not in ('spam', 'personal_info', 'abuse', 'other') then raise invalid_parameter_value; end if;
  perform pg_advisory_xact_lock(hashtextextended('store-report:' || actor, 0));
  if not exists (
    select 1 from public.store_reviews r join public.stores s on s.id = r.store_id
    where r.id = p_review and r.status = 'published' and s.active and r.author_id <> actor for update of r
  ) then raise invalid_parameter_value; end if;
  if exists (select 1 from public.store_review_reports where review_id = p_review and reporter_id = actor) then
    return 'reported';
  end if;
  if (select count(*) from public.store_review_reports where reporter_id = actor and created_at >= now() - interval '1 hour') >= 10 then
    return 'rate_limited';
  end if;
  insert into public.store_review_reports (review_id, reporter_id, reason) values (p_review, actor, p_reason);
  return 'reported';
end;
$$;

create function public.store_review_queue()
returns table (id uuid, store_name text, rating integer, comment text, status text, flags text[], reports text[], report_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then raise insufficient_privilege; end if;
  return query
    with queued as (
      select r.id, r.created_at as queued_at from public.store_reviews r where r.status = 'pending_review'
      union all
      select rr.review_id, min(rr.created_at) from public.store_review_reports rr where rr.resolved_at is null group by rr.review_id
    ), next_reviews as (
      select q.id, min(q.queued_at) as queued_at from queued q group by q.id order by min(q.queued_at), q.id limit 50
    )
    select r.id, s.name, r.rating, r.comment, r.status, r.flags,
      array(select distinct rr.reason from public.store_review_reports rr where rr.review_id = r.id and rr.resolved_at is null),
      (select count(*) from public.store_review_reports rr where rr.review_id = r.id and rr.resolved_at is null)
    from next_reviews q join public.store_reviews r on r.id = q.id join public.stores s on s.id = r.store_id
    order by q.queued_at, r.id;
end;
$$;

create function public.moderate_store_review(p_review uuid, p_expected text, p_report_count bigint, p_status text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  previous text;
  open_reports bigint;
begin
  if not exists (select 1 from public.admin_users where user_id = actor) then raise insufficient_privilege; end if;
  if p_status is null or p_status not in ('published', 'rejected') then raise invalid_parameter_value; end if;
  select status into previous from public.store_reviews where id = p_review for update;
  if not found or previous is distinct from p_expected then return false; end if;
  select count(*) into open_reports from public.store_review_reports where review_id = p_review and resolved_at is null;
  if open_reports is distinct from p_report_count or (previous <> 'pending_review' and open_reports = 0) then return false; end if;
  update public.store_reviews set status = p_status where id = p_review;
  update public.store_review_reports set resolved_at = now() where review_id = p_review and resolved_at is null;
  insert into public.store_review_decisions (review_id, moderator_id, previous_status, new_status)
  values (p_review, actor, previous, p_status);
  return true;
end;
$$;

revoke all on function public.list_store_reviews(uuid, integer) from public, anon, authenticated;
revoke all on function public.submit_store_review(uuid, integer, text), public.my_store_review(uuid),
  public.report_store_review(uuid, text), public.store_review_queue(),
  public.moderate_store_review(uuid, text, bigint, text) from public, anon, authenticated;
grant execute on function public.list_store_reviews(uuid, integer) to anon, authenticated;
grant execute on function public.submit_store_review(uuid, integer, text), public.my_store_review(uuid),
  public.report_store_review(uuid, text), public.store_review_queue(),
  public.moderate_store_review(uuid, text, bigint, text) to authenticated;

commit;
