-- Shrtigo Pro access control
-- Run after supabase/schema.sql and supabase/subscriptions.sql.

-- Weekly/monthly billing labels for custom plans.
alter table public.subscription_plans
  add column if not exists billing_period text not null default 'monthly'
  check (billing_period in ('weekly','monthly'));

-- One free-link entitlement per authenticated user.
-- The entitlement starts when the first free link is created and locks after 2 hours.
create table if not exists public.free_link_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  link_id uuid unique references public.links(id) on delete set null,
  started_at timestamptz not null default now(),
  locks_at timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now()
);

create index if not exists free_link_entitlements_lock_idx
  on public.free_link_entitlements(locks_at);

alter table public.free_link_entitlements enable row level security;

create policy "users can read own free entitlement"
  on public.free_link_entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Returns whether a user can create/use links.
-- A current active subscription overrides the two-hour free lock.
create or replace function public.has_active_subscription(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_subscriptions
    where user_id = p_user_id
      and status = 'active'
      and ends_at > now()
  );
$$;

create or replace function public.free_link_is_unlocked(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_subscription(p_user_id)
    or exists (
      select 1
      from public.free_link_entitlements
      where user_id = p_user_id
        and now() < locks_at
    );
$$;

-- Atomically reserve the single free link. The API must call this function
-- before inserting the free link, then update link_id in the same transaction
-- or use a server-side transaction strategy.
create or replace function public.reserve_free_link(p_user_id uuid default auth.uid())
returns public.free_link_entitlements
language plpgsql
security definer
set search_path = public
as $$
  declare v_entitlement public.free_link_entitlements;
  begin
    if p_user_id is null or p_user_id <> auth.uid() then
      raise exception 'Not authorized';
    end if;

    if public.has_active_subscription(p_user_id) then
      raise exception 'Active subscription does not need a free-link reservation';
    end if;

    insert into public.free_link_entitlements(user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select * into v_entitlement
    from public.free_link_entitlements
    where user_id = p_user_id;

    if v_entitlement.link_id is not null then
      raise exception 'Free link already used';
    end if;

    if now() >= v_entitlement.locks_at then
      raise exception 'Free link is locked; subscribe to unlock access';
    end if;

    return v_entitlement;
  end;
$$;

revoke all on function public.has_active_subscription(uuid) from public;
revoke all on function public.free_link_is_unlocked(uuid) from public;
revoke all on function public.reserve_free_link(uuid) from public;
grant execute on function public.has_active_subscription(uuid) to authenticated;
grant execute on function public.free_link_is_unlocked(uuid) to authenticated;
grant execute on function public.reserve_free_link(uuid) to authenticated;

-- Example custom plans. Set your own prices and features in the dashboard.
-- insert into public.subscription_plans
-- (name, description, price_bdt, duration_days, billing_period, features)
-- values
-- ('Weekly Pro', '7-day access', 99, 7, 'weekly', '["Advanced analytics", "Premium links"]'),
-- ('Monthly Pro', '30-day access', 299, 30, 'monthly', '["Advanced analytics", "Premium links", "Priority support"]');
