-- ============================================================
-- Setup de Supabase para el Draft Premier League 2026/27
-- Pegá TODO este script en: Supabase > SQL Editor > New query > Run
-- ============================================================

-- Tabla de estado de cada jugador (mío / rival / lesionado)
create table if not exists draft_status (
  player_id text primary key,
  status text,              -- 'mine' | 'rival' | null
  injured boolean default false,
  updated_at timestamptz default now()
);

-- Tabla de jugadores agregados a mano desde la app
create table if not exists custom_players (
  id text primary key,
  name text not null,
  team text not null,
  pos text not null,
  created_at timestamptz default now()
);

-- Habilitar Row Level Security (obligatorio en Supabase)
alter table draft_status enable row level security;
alter table custom_players enable row level security;

-- Políticas abiertas: cualquiera con el link puede leer/escribir.
-- Esto es intencional para que todo el grupo pueda draftear sin login.
-- Si más adelante querés agregar autenticación, estas políticas se pueden
-- reemplazar por unas que chequeen auth.uid().
create policy "lectura publica draft_status" on draft_status
  for select using (true);
create policy "insercion publica draft_status" on draft_status
  for insert with check (true);
create policy "actualizacion publica draft_status" on draft_status
  for update using (true);

create policy "lectura publica custom_players" on custom_players
  for select using (true);
create policy "insercion publica custom_players" on custom_players
  for insert with check (true);

-- Activar Realtime para que los cambios se vean en vivo entre todos
alter publication supabase_realtime add table draft_status;
alter publication supabase_realtime add table custom_players;
