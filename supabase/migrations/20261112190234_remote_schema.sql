
alter table "public"."alertas" add column "alerta_reporte_id" uuid;

CREATE UNIQUE INDEX alertas_reporte_id_unico ON public.alertas USING btree (alerta_reporte_id) WHERE (alerta_reporte_id IS NOT NULL);

alter table "public"."alertas" add constraint "alertas_alerta_reporte_id_fkey" FOREIGN KEY (alerta_reporte_id) REFERENCES public.reportes(id) ON DELETE SET NULL not valid;

alter table "public"."alertas" validate constraint "alertas_alerta_reporte_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.sincronizar_alerta_colaborativo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ 
declare
v_nivel nivel_risco;
begin 
IF NEW.reporte_status = 'validado' AND NOT NEW.reporte_oculto THEN
    -- O reporte não tem nível de risco próprio: deriva da categoria
    v_nivel := CASE NEW.reporte_tipo_ocorrencia
  WHEN 'deslizamento' THEN 'alto'::nivel_risco
      WHEN 'alagamento'   THEN 'alto'::nivel_risco
      WHEN 'fogo_em_mata' THEN 'alto'::nivel_risco
      WHEN 'falta_de_luz' THEN 'baixo'::nivel_risco
      ELSE 'moderado'::nivel_risco
    END;

    -- Cria o alerta; se já existir (status oscilou), só reativa
    INSERT INTO alertas (
      alerta_tipo_ocorrencia, alerta_nivel_risco, alerta_titulo, alerta_descricao,
      alerta_latitude, alerta_longitude, alerta_raio_km,
      alerta_origem, alerta_status, alerta_expira_em, alerta_reporte_id
    ) VALUES (
      NEW.reporte_tipo_ocorrencia, v_nivel,
      'Ocorrência confirmada pela comunidade',
      COALESCE(NEW.reporte_descricao, 'Reporte confirmado por moradores da região.'),
      NEW.reporte_latitude, NEW.reporte_longitude, 1,
      'colaborativo'::origem_alerta, 'ativo'::status_alerta,
      NOW() + INTERVAL '6 hours', NEW.id
    )
    ON CONFLICT (alerta_reporte_id) WHERE alerta_reporte_id IS NOT NULL
    DO UPDATE SET
      alerta_status    = 'ativo'::status_alerta,
      alerta_expira_em = EXCLUDED.alerta_expira_em;
  ELSE
    -- Deixou de valer (pendente, rejeitado, oculto, resolvido ou expirado): encerra o alerta ligado
    UPDATE alertas
       SET alerta_status = CASE
             -- ::text: funciona antes e depois de o enum ganhar o valor 'expirado' (A.11)
             WHEN NEW.reporte_status::text IN ('resolvido', 'expirado') THEN 'expirado'::status_alerta
             ELSE 'cancelado'::status_alerta
           END
     WHERE alerta_reporte_id = NEW.id
       AND alerta_status = 'ativo';
  END IF;

  RETURN NULL;
END;
$function$
;

CREATE TRIGGER trg_alerta_colaborativo AFTER UPDATE OF reporte_status, reporte_oculto ON public.reportes FOR EACH ROW WHEN (((old.reporte_status IS DISTINCT FROM new.reporte_status) OR (old.reporte_oculto IS DISTINCT FROM new.reporte_oculto))) EXECUTE FUNCTION public.sincronizar_alerta_colaborativo();






