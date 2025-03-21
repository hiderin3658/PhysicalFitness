-- ユーザーテーブル
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  last_name text not null,
  first_name text not null,
  gender text not null,
  birth_date date not null,
  medical_history text[] default '{}',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 測定データテーブル
create table if not exists public.measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  measurement_date date not null,
  height numeric,
  weight numeric,
  tug jsonb not null default json_build_object('first', 0, 'second', 0, 'best', 0),
  walking_speed jsonb not null default json_build_object('first', 0, 'second', 0, 'best', 0),
  fr jsonb not null default json_build_object('first', 0, 'second', 0, 'best', 0),
  cs10 numeric,
  bi numeric,
  notes text default '',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- RLSポリシー
alter table public.users enable row level security;
alter table public.measurements enable row level security;

-- すべてのユーザーに読み取り権限を付与
create policy "Anyone can read users"
  on public.users
  for select
  to authenticated
  using (true);

create policy "Anyone can read measurements"
  on public.measurements
  for select
  to authenticated
  using (true);

-- 権限のあるユーザーに書き込み権限を付与
create policy "Anyone can insert users"
  on public.users
  for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can insert measurements"
  on public.measurements
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update users"
  on public.users
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can update measurements"
  on public.measurements
  for update
  to authenticated
  using (true)
  with check (true);

-- 更新日時を自動更新するトリガー
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger update_users_timestamp
before update on public.users
for each row execute procedure public.update_timestamp();

create trigger update_measurements_timestamp
before update on public.measurements
for each row execute procedure public.update_timestamp();