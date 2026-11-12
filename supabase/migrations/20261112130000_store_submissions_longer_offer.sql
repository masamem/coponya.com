-- 2026-11-12: offer text up to 700 chars (short add-store form puts offer, code and terms in one field)
alter table public.store_submissions drop constraint if exists store_submissions_offer_check;
alter table public.store_submissions add constraint store_submissions_offer_check check (char_length(btrim(offer)) between 3 and 700);
