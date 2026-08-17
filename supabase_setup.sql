-- ============================================================
-- Cuerpo en Marea — Script de base de datos Supabase
-- Pegar completo en SQL Editor y ejecutar
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  nombre text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: tipos_clase
-- ============================================================
create table if not exists public.tipos_clase (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  color text default '#3d5afe',
  activo boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: alumnas
-- ============================================================
create table if not exists public.alumnas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  contacto text,
  fecha_alta date default current_date,
  activa boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: inscripciones (alumna ↔ tipo_clase)
-- ============================================================
create table if not exists public.inscripciones (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  alumna_id uuid references public.alumnas(id) on delete cascade not null,
  tipo_clase_id uuid references public.tipos_clase(id) on delete cascade not null,
  fecha date default current_date,
  activa boolean default true,
  unique(alumna_id, tipo_clase_id)
);

-- ============================================================
-- TABLA: pagos
-- ============================================================
create table if not exists public.pagos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  alumna_id uuid references public.alumnas(id) on delete cascade not null,
  monto numeric(10,2) not null,
  fecha date default current_date,
  periodo_mes smallint not null,
  periodo_anio smallint not null,
  metodo text default 'efectivo',
  nota text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: asistencias
-- ============================================================
create table if not exists public.asistencias (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  alumna_id uuid references public.alumnas(id) on delete cascade not null,
  tipo_clase_id uuid references public.tipos_clase(id) on delete cascade not null,
  fecha_clase date not null,
  presente boolean default false,
  created_at timestamptz default now(),
  unique(alumna_id, tipo_clase_id, fecha_clase)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.tipos_clase enable row level security;
alter table public.alumnas enable row level security;
alter table public.inscripciones enable row level security;
alter table public.pagos enable row level security;
alter table public.asistencias enable row level security;

-- profiles
create policy "Usuarios ven su perfil" on public.profiles for select using (auth.uid() = id);
create policy "Usuarios crean su perfil" on public.profiles for insert with check (auth.uid() = id);
create policy "Usuarios actualizan su perfil" on public.profiles for update using (auth.uid() = id);

-- tipos_clase
create policy "CRUD tipos_clase" on public.tipos_clase for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- alumnas
create policy "CRUD alumnas" on public.alumnas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- inscripciones
create policy "CRUD inscripciones" on public.inscripciones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pagos
create policy "CRUD pagos" on public.pagos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- asistencias
create policy "CRUD asistencias" on public.asistencias for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- FUNCIÓN Y TRIGGER: crear perfil automático al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists alumnas_user_id_idx on public.alumnas(user_id);
create index if not exists pagos_alumna_periodo_idx on public.pagos(alumna_id, periodo_anio, periodo_mes);
create index if not exists asistencias_clase_fecha_idx on public.asistencias(tipo_clase_id, fecha_clase);
create index if not exists inscripciones_alumna_idx on public.inscripciones(alumna_id);

-- ============================================================
-- FIN — Ejecutar en Supabase > SQL Editor > New Query
-- ============================================================
