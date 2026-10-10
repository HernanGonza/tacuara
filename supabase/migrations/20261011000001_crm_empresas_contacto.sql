-- Persona de contacto de cada empresa (pestaña "Empresas" de /panel). Se puede volver a correr.
alter table public.empresas add column if not exists contacto text not null default '';
comment on column public.empresas.contacto is 'Persona de contacto en la empresa (nombre y, si hace falta, cargo).';
