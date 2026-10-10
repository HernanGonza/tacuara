-- Mini CRM de empresas para /enviar (pestaña "Empresas").
-- Correr en el SQL Editor de Supabase, en orden: primero este archivo y después el 0002 (datos iniciales).

-- ---------------------------------------------------------------------------
-- Empresas
-- ---------------------------------------------------------------------------
create table if not exists public.empresas (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null check (length(btrim(nombre)) > 0),
  rubro            text not null default 'Sin rubro',
  zona             text not null default 'Misiones',
  email            text not null,
  web              text,
  tamano           text not null default 'pyme' check (tamano in ('pyme', 'grande')),
  fuente           text,
  estado           text not null default 'nuevo'
                   check (estado in ('nuevo', 'contactado', 'respondio', 'visita', 'descartado')),
  notas            text not null default '',
  envios_count     integer not null default 0 check (envios_count >= 0),
  primer_envio_at  timestamptz,
  ultimo_envio_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint empresas_email_key unique (email),
  constraint empresas_email_formato check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

comment on table public.empresas is 'Empresas a contactar desde Tacuara (CRM de /enviar). Acceso solo desde el servidor con la clave secreta.';
comment on column public.empresas.estado is 'nuevo → contactado → respondio → visita; descartado = no volver a escribirle.';
comment on column public.empresas.tamano is 'pyme = prioridad; grande = cadenas/grupos grandes, poca chance de respuesta.';

create index if not exists empresas_zona_rubro_idx on public.empresas (zona, rubro, nombre);
create index if not exists empresas_estado_idx on public.empresas (estado);

-- El email se guarda siempre en minúsculas y sin espacios (así el unique no se esquiva con mayúsculas).
create or replace function public.empresas_normalizar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(btrim(new.email));
  new.nombre := btrim(new.nombre);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists empresas_normalizar on public.empresas;
create trigger empresas_normalizar
  before insert or update on public.empresas
  for each row execute function public.empresas_normalizar();

-- ---------------------------------------------------------------------------
-- Historial de envíos
-- ---------------------------------------------------------------------------
create table if not exists public.envios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas (id) on delete cascade,
  asunto      text not null,
  ok          boolean not null default true,
  error       text,
  enviado_at  timestamptz not null default now()
);

comment on table public.envios is 'Cada mail enviado (o que falló) desde el CRM.';

create index if not exists envios_empresa_idx on public.envios (empresa_id, enviado_at desc);

-- ---------------------------------------------------------------------------
-- Seguridad
-- RLS activado y SIN políticas: la clave pública (anon) y los usuarios logueados no pueden leer ni escribir.
-- Solo el servidor de la app, con la clave secreta (service_role), que se saltea RLS.
-- ---------------------------------------------------------------------------
alter table public.empresas enable row level security;
alter table public.envios   enable row level security;

revoke all on table public.empresas from anon, authenticated;
revoke all on table public.envios   from anon, authenticated;
revoke all on function public.empresas_normalizar() from public, anon, authenticated;
