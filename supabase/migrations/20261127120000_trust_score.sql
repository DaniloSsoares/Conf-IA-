-- Score de confiança (reputação) do usuário, calculado no banco.
--
-- Antes: perfil_trust_score existia, mas nada o calculava (ficava sempre 0).
-- O trigger protect_perfil_trust_score impede que o USUÁRIO altere o score direto
-- (pg_trigger_depth() = 1); as atualizações feitas por outros triggers (depth > 1)
-- passam. É por esse caminho que os triggers abaixo gravam o score.
--
-- Regra:
--   reporte validado pela comunidade (e não ocultado) ....... +10
--   reporte rejeitado ........................................ -5
--   reporte ocultado por denúncias ........................... -5
--   voto que acertou o resultado final ....................... +2
--     (confirmou um validado ou contestou um rejeitado)
--   voto que errou o resultado final ......................... -1
--   votos em reportes ainda pendentes não contam; o score nunca fica abaixo de 0
--
-- O score é sempre recalculado do zero a partir do histórico (não soma/subtrai por
-- evento): se o status de um reporte oscilar, o resultado continua certo.


-- 1) Cálculo: soma os pontos dos reportes e dos votos do usuário
CREATE OR REPLACE FUNCTION public.calcular_trust_score(p_perfil uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0,
    -- Pontos como autor
    COALESCE((
      SELECT 10 * COUNT(*) FILTER (WHERE r.reporte_status = 'validado' AND NOT r.reporte_oculto)
           -  5 * COUNT(*) FILTER (WHERE r.reporte_status = 'rejeitado')
           -  5 * COUNT(*) FILTER (WHERE r.reporte_oculto)
        FROM reportes r
       WHERE r.perfil_id = p_perfil
    ), 0)
    +
    -- Pontos como votante (só reportes já decididos)
    COALESCE((
      SELECT 2 * COUNT(*) FILTER (WHERE
               (v.validacao_tipo = 'confirma' AND r.reporte_status = 'validado') OR
               (v.validacao_tipo = 'contesta' AND r.reporte_status = 'rejeitado'))
           - 1 * COUNT(*) FILTER (WHERE
               (v.validacao_tipo = 'confirma' AND r.reporte_status = 'rejeitado') OR
               (v.validacao_tipo = 'contesta' AND r.reporte_status = 'validado'))
        FROM reporte_validacoes v
        JOIN reportes r ON r.id = v.reporte_id
       WHERE v.perfil_id = p_perfil
    ), 0)
  )::integer;
$$;


-- 2) Grava o score recalculado no perfil
CREATE OR REPLACE FUNCTION public.recalcular_trust_score(p_perfil uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE perfil
     SET perfil_trust_score = calcular_trust_score(p_perfil)
   WHERE id = p_perfil;
END;
$$;


-- 3) Reporte mudou de status ou foi ocultado: recalcula o autor e todos que votaram nele
CREATE OR REPLACE FUNCTION public.trust_score_ao_mudar_reporte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recalcular_trust_score(NEW.perfil_id);
  PERFORM recalcular_trust_score(v.perfil_id)
     FROM reporte_validacoes v
    WHERE v.reporte_id = NEW.id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_trust_score_reporte ON public.reportes;
CREATE TRIGGER trg_trust_score_reporte
AFTER UPDATE OF reporte_status, reporte_oculto ON public.reportes
FOR EACH ROW
WHEN (OLD.reporte_status IS DISTINCT FROM NEW.reporte_status
      OR OLD.reporte_oculto IS DISTINCT FROM NEW.reporte_oculto)
EXECUTE FUNCTION public.trust_score_ao_mudar_reporte();


-- 4) Voto criado, trocado ou apagado: recalcula quem votou.
--    Roda depois do trg_recalculate_score (os triggers rodam em ordem alfabética),
--    então já enxerga o status novo do reporte.
CREATE OR REPLACE FUNCTION public.trust_score_ao_votar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recalcular_trust_score(COALESCE(NEW.perfil_id, OLD.perfil_id));
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_trust_score_voto ON public.reporte_validacoes;
CREATE TRIGGER trg_trust_score_voto
AFTER INSERT OR UPDATE OR DELETE ON public.reporte_validacoes
FOR EACH ROW
EXECUTE FUNCTION public.trust_score_ao_votar();


-- 5) Ninguém chama essas funções pela API (o Supabase dá EXECUTE para todos em
--    funções novas): só os triggers, que rodam como o dono do banco
REVOKE ALL ON FUNCTION public.calcular_trust_score(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalcular_trust_score(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trust_score_ao_mudar_reporte() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trust_score_ao_votar() FROM PUBLIC, anon, authenticated;


-- 6) Carga inicial: calcula o score de quem já existe.
--    Rodando direto (fora de um trigger), o protect_perfil_trust_score desfaria a
--    atualização; por isso ele fica desligado só durante este UPDATE.
ALTER TABLE public.perfil DISABLE TRIGGER trg_protect_trust_score;
UPDATE public.perfil SET perfil_trust_score = public.calcular_trust_score(id);
ALTER TABLE public.perfil ENABLE TRIGGER trg_protect_trust_score;
