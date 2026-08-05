-- Yenni Crochet — extend custom_requests for custom order flow
-- Run in Supabase Dashboard -> SQL Editor.
--
-- These columns make "Dat rieng" easier to filter/read in Supabase Dashboard
-- while keeping the original description/reference_images fields.

alter table custom_requests
add column if not exists occasion text,
add column if not exists preferred_colors text,
add column if not exists expected_date date,
add column if not exists budget_range text,
add column if not exists note text;

alter table custom_requests
drop constraint if exists custom_requests_budget_range_check;

alter table custom_requests
add constraint custom_requests_budget_range_check
check (
  budget_range is null
  or budget_range in ('under_100k', '100k_200k', '200k_500k', 'over_500k', 'need_consult')
);

create index if not exists idx_custom_requests_expected_date
on custom_requests(expected_date);

create index if not exists idx_custom_requests_occasion
on custom_requests(occasion);
