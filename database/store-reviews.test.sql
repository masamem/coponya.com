-- Run on a disposable database after schema.sql and store-reviews.sql.
begin;
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
insert into public.admin_users values ('00000000-0000-0000-0000-000000000002');
insert into public.stores (id, name, initial, website_url, active)
values ('00000000-0000-0000-0000-000000000003', 'Review test', 'R', 'https://example.com', true);
set local role anon;
do $$
begin
  begin
    perform public.submit_store_review('00000000-0000-0000-0000-000000000003', 4, 'An ordinary review');
    raise exception 'Anonymous submission succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$
declare shop constant uuid := '00000000-0000-0000-0000-000000000003';
begin
  assert public.submit_store_review(shop, 4, 'See https://example.com') = 'pending_review';
  assert public.submit_store_review(shop, 1, 'Second submission') = 'pending_review';
  assert public.my_store_review(shop) = 'pending_review';
  assert (select count(*) from public.list_store_reviews(shop)) = 0;
  begin
    perform public.store_review_queue();
    raise exception 'Non-admin read the queue';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.store_reviews set status = 'published';
    raise exception 'Direct write bypassed screening';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
do $$
declare
  shop constant uuid := '00000000-0000-0000-0000-000000000003';
  review uuid;
begin
  select id into strict review from public.store_review_queue();
  assert not public.moderate_store_review(review, 'published', 0, 'published');
  assert public.moderate_store_review(review, 'pending_review', 0, 'published');
  assert (select rating from public.list_store_reviews(shop)) = 4;
  assert public.report_store_review(review, 'spam') = 'reported';
  assert public.report_store_review(review, 'spam') = 'reported';
  assert (select report_count from public.store_review_queue()) = 1;
  assert not public.moderate_store_review(review, 'published', 0, 'rejected');
  assert public.moderate_store_review(review, 'published', 1, 'rejected');
  assert (select count(*) from public.store_review_queue()) = 0;
  assert (select count(*) from public.list_store_reviews(shop)) = 0;
end;
$$;
reset role;
do $$
begin
  assert (select count(*) from public.store_review_decisions) = 2;
end;
$$;
rollback;
