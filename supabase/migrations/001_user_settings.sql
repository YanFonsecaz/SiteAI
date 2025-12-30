create table if not exists public.user_settings (
  user_id text primary key,
  openai_key text,
  openai_model text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

