-- CODMAR: acceso público de sólo lectura para la tienda
-- La tienda sólo podrá consultar productos activos del cliente CODMAR (cliente_id = 1).
-- Se publica el precio de venta bajo el alias "precio".
-- No se concede acceso a existencia ni caducidad.

drop policy if exists "Publico puede consultar catalogo de tienda CODMAR"
on public.catalogo_codmar;

create policy "Publico puede consultar catalogo de tienda CODMAR"
on public.catalogo_codmar
for select
to anon
using (activo = true and cliente_id = 1);

revoke all on table public.catalogo_codmar from anon;

grant select (
    id,
    nombre,
    presentacion,
    categoria,
    precio_publico,
    tachar_precio_publico,
    imagen_url,
    precio_codmar,
    activo,
    cliente_id
)
on table public.catalogo_codmar
to anon;

create or replace view public.catalogo_codmar_publico
with (security_invoker = true)
as
select
    id,
    nombre,
    presentacion,
    categoria,
    precio_publico,
    tachar_precio_publico,
    imagen_url,
    precio_codmar as precio
from public.catalogo_codmar
where activo = true
  and cliente_id = 1;

grant usage on schema public to anon;
grant select on public.catalogo_codmar_publico to anon;
