-- CODMAR: reducir exposición innecesaria de funciones SECURITY DEFINER.
-- obtener_cliente_id no tiene dependencias en políticas, vistas ni funciones de la app.
-- La aplicación obtiene el cliente desde public.usuarios usando su sesión autenticada.
revoke execute on function public.obtener_cliente_id() from public, anon, authenticated;

-- provisionar_nuevo_negocio es un trigger interno de auth.users, no una RPC pública.
revoke execute on function public.provisionar_nuevo_negocio() from public, anon, authenticated;
