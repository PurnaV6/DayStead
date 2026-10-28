-- DayStead backend schema (not yet wired in — the MVP app runs on local
-- AsyncStorage, see src/storage/repository.ts). This is the target schema
-- for when multi-device sync and the Plus subscription move server-side.

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  payday_day_of_month smallint not null default 28,
  cash_buffer numeric(10,2) not null default 0,
  plan text not null default 'free' check (plan in ('free', 'plus')),
  created_at timestamptz not null default now()
);

create table if not exists bills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('rent', 'credit_card', 'utility', 'subscription', 'other')),
  amount numeric(10,2) not null,
  amount_is_estimate boolean not null default false,
  frequency text not null check (frequency in ('once', 'weekly', 'monthly', 'yearly')),
  next_due_date date not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'paid', 'overdue')),
  reminders_enabled boolean not null default true,
  reminder_days_before smallint not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bills_user_due_idx on bills(user_id, next_due_date);

create table if not exists medications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  dosage text not null default '',
  doses jsonb not null default '[]', -- [{ "time": "09:00" }, ...]
  course_start_date date not null default current_date,
  course_end_date date,
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists medication_log (
  id uuid primary key default uuid_generate_v4(),
  medication_id uuid not null references medications(id) on delete cascade,
  scheduled_for timestamptz not null,
  taken_at timestamptz
);
create index if not exists medication_log_med_idx on medication_log(medication_id, scheduled_for);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  location text not null default '',
  date_time timestamptz not null,
  notes text not null default '',
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_user_time_idx on appointments(user_id, date_time);

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  category text not null default 'other',
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_date_idx on expenses(user_id, date);

-- Row Level Security: every table is scoped to its owning user.
alter table users enable row level security;
alter table bills enable row level security;
alter table medications enable row level security;
alter table medication_log enable row level security;
alter table appointments enable row level security;
alter table expenses enable row level security;

create policy "own row" on users for all using (id = auth.uid());
create policy "own bills" on bills for all using (user_id = auth.uid());
create policy "own medications" on medications for all using (user_id = auth.uid());
create policy "own medication log" on medication_log for all using (
  medication_id in (select id from medications where user_id = auth.uid())
);
create policy "own appointments" on appointments for all using (user_id = auth.uid());
create policy "own expenses" on expenses for all using (user_id = auth.uid());
