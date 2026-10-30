-- Applied to Daystead as daystead_planner_preferences and daystead_alarm_mode.
-- Run once when provisioning another environment; no data is removed.
alter table public.daystead_schedules drop constraint daystead_schedules_kind_check;
alter table public.daystead_schedules add constraint daystead_schedules_kind_check check (kind in ('bill','medicine','appointment','todo'));
alter table public.daystead_schedules add column priority boolean not null default false;
alter table public.daystead_schedules add column reminder_mode text not null default 'gentle' check (reminder_mode in ('gentle','alarm'));
create table public.daystead_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
 payday date, dismissed text[] not null default '{}', check(cardinality(dismissed)<=500)
);
alter table public.daystead_preferences enable row level security;
revoke all on public.daystead_preferences from anon, authenticated;
grant select,insert,update,delete on public.daystead_preferences to authenticated;
create policy owner_preferences on public.daystead_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
