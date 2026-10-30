-- Deploy on the existing Daystead project, not the legacy root schema.
-- Only trusted backend code may call this function. Duplicate events re-fetch current
-- RevenueCat state; older concurrent observations cannot replace newer ones.
create or replace function public.apply_daystead_subscription(p_user_id uuid,p_status text,p_until timestamptz,p_observed_at timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=p_user_id) then return; end if;
 insert into public.daystead_subscriptions(user_id,provider,status,access_until,updated_at)
 values(p_user_id,'revenuecat',p_status,p_until,p_observed_at)
 on conflict(user_id) do update set provider=excluded.provider,status=excluded.status,access_until=excluded.access_until,updated_at=excluded.updated_at
 where public.daystead_subscriptions.updated_at<=excluded.updated_at;
end;
$$;
revoke all on function public.apply_daystead_subscription(uuid,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.apply_daystead_subscription(uuid,text,timestamptz,timestamptz) to service_role;
