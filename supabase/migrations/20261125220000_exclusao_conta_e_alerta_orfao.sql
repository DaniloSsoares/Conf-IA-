-- Correções da auditoria de 25/11/2026 (docs/AUDITORIA_2026-11-25.md)

-- B4: excluir um reporte (pelo dono, ou junto com a conta) encerra o alerta da comunidade
-- ligado a ele. A chave alerta_reporte_id é ON DELETE SET NULL, e o trigger do alerta só
-- reage a UPDATE: sem isto, o alerta ficava ativo no mapa apontando para nada.
CREATE OR REPLACE FUNCTION public.cancelar_alerta_do_reporte_excluido()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE alertas
     SET alerta_status = 'cancelado'::status_alerta
   WHERE alerta_reporte_id = OLD.id
     AND alerta_status = 'ativo';
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_cancelar_alerta_reporte_excluido ON public.reportes;
CREATE TRIGGER trg_cancelar_alerta_reporte_excluido
BEFORE DELETE ON public.reportes
FOR EACH ROW EXECUTE FUNCTION public.cancelar_alerta_do_reporte_excluido();

-- B10: o usuário exclui a própria conta (LGPD, direito à exclusão).
-- Apaga só o usuário que está chamando (auth.uid()); o resto vai em cascata:
-- auth.users → perfil → reportes, votos, denúncias, aceites e notificações.
CREATE OR REPLACE FUNCTION public.excluir_minha_conta()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- O Supabase dá EXECUTE para todo mundo em funções novas: só usuários logados podem chamar
REVOKE ALL ON FUNCTION public.excluir_minha_conta() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.excluir_minha_conta() TO authenticated;
