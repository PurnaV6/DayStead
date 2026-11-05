-- DayStead: give the store reviewers' test account access, so Apple and Google can test the app.
--
-- Why: reviewers subscribe with test (sandbox) purchases, which the server never counts as paid.
-- Once require-subscription.sql is live, their saves would be refused without this.
--
-- RUN IN THE SUPABASE SQL EDITOR just before submitting for review, after creating the review account
-- in the app. Replace REVIEW_EMAIL with that account's email (it must not be a real customer).
-- Access lasts 90 days. updated_at is set to the same future date on purpose: the webhook and the sync
-- function never overwrite a row with a newer updated_at, so a test purchase by the reviewer cannot
-- replace this access with 'expired'.

insert into public.daystead_subscriptions(user_id,provider,status,access_until,updated_at)
select id,'revenuecat','active',now()+interval '90 days',now()+interval '90 days'
from auth.users where email='REVIEW_EMAIL'
on conflict(user_id) do update set status='active',access_until=excluded.access_until,updated_at=excluded.updated_at;

-- Check it worked (should show one row, status active):
-- select s.status,s.access_until from public.daystead_subscriptions s join auth.users u on u.id=s.user_id where u.email='REVIEW_EMAIL';

-- Remove access after review is approved (it also ends by itself after 90 days):
-- delete from public.daystead_subscriptions where user_id=(select id from auth.users where email='REVIEW_EMAIL');
