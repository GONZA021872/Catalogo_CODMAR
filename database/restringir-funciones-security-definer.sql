-- CODMAR: reducir exposición innecesaria de funciones SECURITY DEFINER.
-- obtener_cliente_id sólo queda disponible para sesiones autenticadas.
revoke execute on function public.obtener_cliente_id() from public, anon;
grant execute on function public.obtener_cliente_id() to authenticated;

-- provisionar_nuevo_negocio es un trigger interno de auth.users, no una RPC pública.
revoke execute on function public.provisionar_nuevo_negocio() from public, anon, authenticated;
