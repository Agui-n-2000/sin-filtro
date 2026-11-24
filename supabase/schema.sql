-- SIN FILTRO: esquema inicial para Supabase PostgreSQL.
-- Ejecutar en Supabase > SQL Editor. Revisar las políticas antes de producción.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  host_id uuid not null references public.profiles(id),
  status text not null default 'waiting' check (status in ('waiting','active','finished')),
  current_level smallint not null default 1 check (current_level between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  is_connected boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key (room_id, player_id)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  level smallint not null check (level between 1 and 5),
  category text not null,
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  player_id uuid not null references public.profiles(id),
  status text not null default 'answering' check (status in ('answering','voting','completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  player_id uuid not null references public.profiles(id),
  content text,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  unique (round_id, player_id)
);

create table if not exists public.game_votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  round_id uuid references public.rounds(id) on delete cascade,
  voter_id uuid not null references public.profiles(id),
  vote_type text not null check (vote_type in ('next_level','special_round','challenge')),
  choice text not null,
  created_at timestamptz not null default now(),
  unique (room_id, round_id, voter_id, vote_type)
);

-- Crear perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), 'Jugador')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.questions enable row level security;
alter table public.rounds enable row level security;
alter table public.answers enable row level security;
alter table public.game_votes enable row level security;

-- Helper SECURITY DEFINER para evitar recursión de RLS al comprobar membresías.
create or replace function public.is_room_member(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.room_members
    where room_id = _room_id and player_id = auth.uid()
  );
$$;
revoke all on function public.is_room_member(uuid) from public;
grant execute on function public.is_room_member(uuid) to authenticated;

-- Perfiles: usuarios autenticados pueden ver apodos; solo el dueño modifica su perfil.
create policy "Authenticated users can view profiles"
on public.profiles for select to authenticated using (true);
create policy "Users can update own profile"
on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Salas: solo miembros pueden consultar; solo el anfitrión crea/actualiza.
create policy "Members can view their rooms"
on public.rooms for select to authenticated
using (public.is_room_member(id) or host_id = auth.uid());
create policy "Authenticated users can create rooms"
on public.rooms for insert to authenticated with check (host_id = auth.uid());
create policy "Host can update room"
on public.rooms for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());

create policy "Members can view room members"
on public.room_members for select to authenticated
using (public.is_room_member(room_id));
create policy "Players can join as themselves"
on public.room_members for insert to authenticated with check (player_id = auth.uid());
create policy "Players can update own membership"
on public.room_members for update to authenticated using (player_id = auth.uid()) with check (player_id = auth.uid());

create policy "Authenticated users can read active questions"
on public.questions for select to authenticated using (is_active = true);

create policy "Room members can view rounds"
on public.rounds for select to authenticated
using (public.is_room_member(room_id));
create policy "Room host can create rounds"
on public.rounds for insert to authenticated
with check (exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid()));

create policy "Players can view answers in their room"
on public.answers for select to authenticated
using (exists (
  select 1 from public.rounds rd
  where rd.id = round_id and public.is_room_member(rd.room_id)
));
create policy "Players can submit own answer"
on public.answers for insert to authenticated
with check (player_id = auth.uid() and exists (
  select 1 from public.rounds rd
  where rd.id = round_id and public.is_room_member(rd.room_id)
));

create policy "Room members can read votes"
on public.game_votes for select to authenticated
using (public.is_room_member(room_id));
create policy "Members can cast own vote"
on public.game_votes for insert to authenticated
with check (voter_id = auth.uid() and public.is_room_member(room_id));

-- Habilitar Realtime para tablas que sincronizarán el lobby y las rondas.
alter publication supabase_realtime add table public.room_members;
alter publication supabase_realtime add table public.rounds;
alter publication supabase_realtime add table public.game_votes;
