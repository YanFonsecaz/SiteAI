alter table public.user_settings enable row level security;

drop policy if exists "read own settings" on public.user_settings;
drop policy if exists "insert own settings" on public.user_settings;
drop policy if exists "update own settings" on public.user_settings;
drop policy if exists "delete own settings" on public.user_settings;

create policy "read own settings"
  on public.user_settings
  for select
  using (user_id = auth.uid()::text);

create policy "insert own settings"
  on public.user_settings
  for insert
  with check (user_id = auth.uid()::text);

create policy "update own settings"
  on public.user_settings
  for update
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

create policy "delete own settings"
  on public.user_settings
  for delete
  using (user_id = auth.uid()::text);
