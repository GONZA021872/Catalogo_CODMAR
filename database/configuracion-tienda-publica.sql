-- CODMAR: configuración mínima para identidad visual de la tienda pública.
-- La tienda no recibe permisos para leer controles internos de administración.
drop policy if exists "permitir lectura configuracion" on public.configuracion_inicio;
create policy "La tienda pública puede leer configuración CODMAR"
on public.configuracion_inicio
for select
to anon
using (cliente_id = 1);

revoke all on table public.configuracion_inicio from anon;
grant select (
  id,
  cliente_id,
  nombre_comercial,
  nombre_comercial_escritorio,
  nombre_comercial_movil,
  mostrar_nombre_comercial,
  logotipo_url_escritorio,
  logotipo_url_movil,
  mostrar_logotipo,
  color_franjas_escritorio,
  color_franjas_movil
) on public.configuracion_inicio to anon;

create or replace view public.configuracion_tienda_codmar_publica
with (security_invoker = true)
as
select
  nombre_comercial,
  nombre_comercial_escritorio,
  nombre_comercial_movil,
  mostrar_nombre_comercial,
  logotipo_url_escritorio,
  logotipo_url_movil,
  mostrar_logotipo,
  color_franjas_escritorio,
  color_franjas_movil
from public.configuracion_inicio
where cliente_id = 1;

grant usage on schema public to anon;
grant select on public.configuracion_tienda_codmar_publica to anon;
