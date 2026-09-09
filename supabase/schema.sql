create extension if not exists pgcrypto;

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[A-Za-z0-9_-]{3,32}$'),
  target_url text not null check (length(target_url) <= 4096),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  click_count bigint not null default 0
);

create table if not exists public.clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  ip_hash text,
  country text,
  city text,
  user_agent text,
  referrer text,
  device text,
  browser text,
  os text
);

create index if not exists links_slug_idx on public.links(slug);
create index if not exists links_user_id_idx on public.links(user_id);
create index if not exists clicks_link_id_clicked_at_idx on public.clicks(link_id, clicked_at desc);

alter table public.links enable row level security;
alter table public.clicks enable row level security;

create policy "public can read active links by slug" on public.links
for select using (is_active = true and (expires_at is null or expires_at > now()));

create policy "users can manage their own links" on public.links
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can read clicks for their links" on public.clicks
for select using (exists (select 1 from public.links l where l.id = link_id and l.user_id = auth.uid()));

create or replace function public.increment_click_count(p_link_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.links set click_count = click_count + 1 where id = p_link_id;
$$;
