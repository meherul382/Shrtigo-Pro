-- Shrtigo Pro: manual bKash/Nagad subscription system
-- Run this AFTER supabase/schema.sql in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_bdt numeric(12,2) not null check (price_bdt >= 0),
  duration_days integer not null check (duration_days > 0),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  amount_bdt numeric(12,2) not null check (amount_bdt >= 0),
  payment_method text not null check (payment_method in ('bkash','nagad')),
  sender_phone text not null check (sender_phone ~ '^[0-9+ -]{8,20}$'),
  transaction_id text not null check (length(trim(transaction_id)) between 4 and 100),
  payment_note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null unique references public.subscription_orders(id),
  plan_id uuid not null references public.subscription_plans(id),
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists subscription_orders_user_idx on public.subscription_orders(user_id, created_at desc);
create index if not exists subscription_orders_status_idx on public.subscription_orders(status, created_at desc);
create index if not exists user_subscriptions_user_idx on public.user_subscriptions(user_id, ends_at desc);

alter table public.subscription_plans enable row level security;
alter table public.admin_users enable row level security;
alter table public.subscription_orders enable row level security;
alter table public.user_subscriptions enable row level security;

create policy "anyone can read active plans" on public.subscription_plans
for select using (is_active = true);

create policy "users can create their own orders" on public.subscription_orders
for insert with check (auth.uid() = user_id);

create policy "users can read their own orders" on public.subscription_orders
for select using (auth.uid() = user_id);

create policy "users can read their own subscriptions" on public.user_subscriptions
for select using (auth.uid() = user_id);

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = p_user_id);
$$;

create or replace function public.approve_subscription_order(
  p_order_id uuid,
  p_rejection_reason text default null
)
returns void language plpgsql security definer set search_path = public as $$
 declare
  v_order public.subscription_orders%rowtype;
  v_days integer;
  v_start timestamptz;
 begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Not authorized';
  end if;

  select * into v_order
  from public.subscription_orders
  where id = p_order_id
  for update;

  if v_order.id is null then raise exception 'Order not found'; end if;
  if v_order.status <> 'pending' then raise exception 'Order is not pending'; end if;

  if p_rejection_reason is not null then
    update public.subscription_orders
    set status = 'rejected', rejection_reason = p_rejection_reason,
        reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
    where id = p_order_id;
    return;
  end if;

  select duration_days into v_days from public.subscription_plans where id = v_order.plan_id;
  if v_days is null then raise exception 'Plan not found'; end if;

  v_start := greatest(now(), coalesce((select max(ends_at) from public.user_subscriptions where user_id = v_order.user_id and status = 'active'), now()));

  update public.subscription_orders
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  where id = p_order_id;

  insert into public.user_subscriptions(user_id, order_id, plan_id, status, starts_at, ends_at)
  values (v_order.user_id, v_order.id, v_order.plan_id, 'active', v_start, v_start + make_interval(days => v_days));
 end;
$$;

revoke all on function public.approve_subscription_order(uuid, text) from public;
grant execute on function public.approve_subscription_order(uuid, text) to authenticated;

-- Example custom plans. Edit/remove these rows before production if needed.
-- insert into public.subscription_plans(name, description, price_bdt, duration_days, features)
-- values
-- ('Starter Pro', 'For individual creators', 199, 30, '["Advanced analytics", "Custom slugs"]'),
-- ('Business Pro', 'For growing teams', 499, 30, '["Unlimited projects", "Advanced analytics", "Priority support"]');
