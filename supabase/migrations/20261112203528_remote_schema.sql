
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.gerar_notificacoes_alerta()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.alerta_status <> 'ativo'
     OR NEW.alerta_latitude IS NULL
     OR NEW.alerta_longitude IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO alerta_notificacoes
    (alerta_id, perfil_id, notificacao_canal, notificacao_lida, notificacao_enviada_em)
  SELECT NEW.id, p.id, 'app', false, NOW()
  FROM perfil p
  WHERE p.perfil_latitude IS NOT NULL
    AND p.perfil_longitude IS NOT NULL
    -- preferência ausente = ativa (mesmo padrão do DEFAULT_ALERT_PREFERENCES do app)
    AND COALESCE((p.perfil_preferencias_alertas ->> NEW.alerta_tipo_ocorrencia::text)::boolean, true)
    -- Haversine em km
    AND 6371 * 2 * ASIN(LEAST(1, SQRT(
          POWER(SIN(RADIANS(NEW.alerta_latitude - p.perfil_latitude) / 2), 2) +
          COS(RADIANS(p.perfil_latitude)) * COS(RADIANS(NEW.alerta_latitude)) *
          POWER(SIN(RADIANS(NEW.alerta_longitude - p.perfil_longitude) / 2), 2)
        ))) <= COALESCE(p.perfil_raio_notificacao_km, 5) + COALESCE(NEW.alerta_raio_km, 0);

  RETURN NEW;
END;
$function$
;

CREATE TRIGGER trg_gerar_notificacoes AFTER INSERT ON public.alertas FOR EACH ROW EXECUTE FUNCTION public.gerar_notificacoes_alerta();

