-- DayStead: only accounts with a free month or a paid subscription can add or change records.
--
-- RUN THIS ONLY AT LAUNCH, AFTER:
--   1. the RevenueCat webhook (supabase/functions/revenuecat-webhook) is deployed and connected, and
--   2. a test purchase has created a row in public.daystead_subscriptions with status 'trialing' or 'active'.
--      Play test purchases are sandbox: set REVENUECAT_ALLOW_SANDBOX=true on the webhook for this test ONLY,
--      then unset it and confirm the row goes back to 'expired'. Never leave sandbox on in production.
--   3. supabase/functions/sync-subscription is deployed as sync-daystead-subscription, so a new subscriber
--      is not refused for the first minutes while the store confirms the purchase.
-- Running it earlier blocks everyone from adding records, because no subscription rows exist yet.
--
-- What it does:
--   * Reading, exporting and deleting your own records always keep working (people keep access to
--     their own data; account deletion runs on the server and is not affected).
--   * Adding or changing schedules and completions needs status 'trialing', 'active' or 'grace'
--     with access_until in the future, as written by the RevenueCat webhook.
--   * Uses RESTRICTIVE policies, so it adds to the existing per-user policies without replacing them.
--
-- To undo: drop the four policies below and the function.

create or replace function public.daystead_has_access()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.daystead_subscriptions s
  where s.user_id = (select auth.uid())
    and s.status in ('trialing','active','grace')
    -- A 3-day margin covers the store's renewal message arriving late, so paying users are not
    -- blocked around each renewal. The app's own store check is what users see day to day.
    and s.access_until + interval '3 days' > now()
 );
$$;
revoke all on function public.daystead_has_access() from public, anon;

-- Subscription rows are written only by the server (the RevenueCat webhook, as service_role).
-- Make sure no signed-in user can write their own row to get past this check.
revoke insert, update, delete on public.daystead_subscriptions from anon, authenticated;
grant execute on function public.daystead_has_access() to authenticated;

drop policy if exists daystead_schedules_insert_needs_access on public.daystead_schedules;
create policy daystead_schedules_insert_needs_access on public.daystead_schedules
 as restrictive for insert to authenticated with check ((select public.daystead_has_access()));

drop policy if exists daystead_schedules_update_needs_access on public.daystead_schedules;
create policy daystead_schedules_update_needs_access on public.daystead_schedules
 as restrictive for update to authenticated using ((select public.daystead_has_access())) with check ((select public.daystead_has_access()));

drop policy if exists daystead_completions_insert_needs_access on public.daystead_completions;
create policy daystead_completions_insert_needs_access on public.daystead_completions
 as restrictive for insert to authenticated with check ((select public.daystead_has_access()));

drop policy if exists daystead_completions_update_needs_access on public.daystead_completions;
create policy daystead_completions_update_needs_access on public.daystead_completions
 as restrictive for update to authenticated using ((select public.daystead_has_access())) with check ((select public.daystead_has_access()));

-- Undo:
-- drop policy if exists daystead_schedules_insert_needs_access on public.daystead_schedules;
-- drop policy if exists daystead_schedules_update_needs_access on public.daystead_schedules;
-- drop policy if exists daystead_completions_insert_needs_access on public.daystead_completions;
-- drop policy if exists daystead_completions_update_needs_access on public.daystead_completions;
-- drop function if exists public.daystead_has_access();
