

  create table "public"."denuncias" (
    "id" uuid not null default gen_random_uuid(),
    "perfil_id" uuid not null,
    "reporte_id" uuid,
    "validacao_id" uuid,
    "denuncia_motivo" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."denuncias" enable row level security;

alter table "public"."reporte_validacoes" add column "validacao_oculta" boolean not null default false;

alter table "public"."reportes" add column "reporte_oculto" boolean not null default false;

CREATE UNIQUE INDEX denuncias_perfil_id_reporte_id_key ON public.denuncias USING btree (perfil_id, reporte_id);

CREATE UNIQUE INDEX denuncias_perfil_id_validacao_id_key ON public.denuncias USING btree (perfil_id, validacao_id);

CREATE UNIQUE INDEX denuncias_pkey ON public.denuncias USING btree (id);

alter table "public"."denuncias" add constraint "denuncias_pkey" PRIMARY KEY using index "denuncias_pkey";

alter table "public"."denuncias" add constraint "denuncias_check" CHECK (((reporte_id IS NOT NULL) <> (validacao_id IS NOT NULL))) not valid;

alter table "public"."denuncias" validate constraint "denuncias_check";

alter table "public"."denuncias" add constraint "denuncias_denuncia_motivo_check" CHECK ((denuncia_motivo = ANY (ARRAY['foto_inadequada'::text, 'comentario_ofensivo'::text, 'informacao_falsa'::text, 'spam'::text, 'outro'::text]))) not valid;

alter table "public"."denuncias" validate constraint "denuncias_denuncia_motivo_check";

alter table "public"."denuncias" add constraint "denuncias_perfil_id_fkey" FOREIGN KEY (perfil_id) REFERENCES public.perfil(id) ON DELETE CASCADE not valid;

alter table "public"."denuncias" validate constraint "denuncias_perfil_id_fkey";

alter table "public"."denuncias" add constraint "denuncias_perfil_id_reporte_id_key" UNIQUE using index "denuncias_perfil_id_reporte_id_key";

alter table "public"."denuncias" add constraint "denuncias_perfil_id_validacao_id_key" UNIQUE using index "denuncias_perfil_id_validacao_id_key";

alter table "public"."denuncias" add constraint "denuncias_reporte_id_fkey" FOREIGN KEY (reporte_id) REFERENCES public.reportes(id) ON DELETE CASCADE not valid;

alter table "public"."denuncias" validate constraint "denuncias_reporte_id_fkey";

alter table "public"."denuncias" add constraint "denuncias_validacao_id_fkey" FOREIGN KEY (validacao_id) REFERENCES public.reporte_validacoes(id) ON DELETE CASCADE not valid;

alter table "public"."denuncias" validate constraint "denuncias_validacao_id_fkey";

alter table "public"."reporte_validacoes" add constraint "validacao_comentario_tamanho" CHECK (((validacao_comentario IS NULL) OR (char_length(validacao_comentario) <= 500))) not valid;

alter table "public"."reporte_validacoes" validate constraint "validacao_comentario_tamanho";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.limitar_reportes_por_hora()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF (SELECT COUNT(*) FROM reportes
      WHERE perfil_id = NEW.perfil_id
        AND created_at > NOW() - INTERVAL '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Limite de reportes por hora atingido'
      USING ERRCODE = 'P0001', HINT = 'rate_limit';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ocultar_por_denuncias()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limite INT := 3;
BEGIN
  IF NEW.reporte_id IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM denuncias WHERE reporte_id = NEW.reporte_id) >= v_limite THEN
      UPDATE reportes SET reporte_oculto = true WHERE id = NEW.reporte_id;
    END IF;
  ELSE
    IF (SELECT COUNT(*) FROM denuncias WHERE validacao_id = NEW.validacao_id) >= v_limite THEN
      -- o voto continua contando no score; só o comentário deixa de aparecer
      UPDATE reporte_validacoes SET validacao_oculta = true WHERE id = NEW.validacao_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$function$
;

create or replace view "public"."perfil_publico" as  SELECT id,
    split_part(perfil_nome_completo, ' '::text, 1) AS primeiro_nome,
    perfil_avatar_url
   FROM public.perfil;


CREATE OR REPLACE FUNCTION public.protect_perfil_trust_score()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.perfil_trust_score := 0;  -- igual ao DEFAULT da coluna (conferido no dump)
  ELSIF pg_trigger_depth() = 1 THEN
    NEW.perfil_trust_score := OLD.perfil_trust_score;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.protect_reporte_columns()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.reporte_score_confianca := 0;
    NEW.reporte_status := 'pendente';
    NEW.reporte_oculto := false;                    -- novo
  ELSIF pg_trigger_depth() = 1 THEN
    NEW.reporte_score_confianca := OLD.reporte_score_confianca;
    NEW.reporte_oculto := OLD.reporte_oculto;       -- novo
    IF NEW.reporte_status IS DISTINCT FROM 'resolvido' THEN
      NEW.reporte_status := OLD.reporte_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_reporte_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_reporte_id UUID := COALESCE(NEW.reporte_id, OLD.reporte_id);
  v_min_votos  INT  := 3;   -- 3 para a demo, 5 em produção
  v_total      INT;
  v_confirm    INT;
  v_taxa       NUMERIC;
BEGIN
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE validacao_tipo = 'confirma')
    INTO v_total, v_confirm
    FROM reporte_validacoes
   WHERE reporte_id = v_reporte_id;

  v_taxa := CASE WHEN v_total = 0 THEN 0 ELSE v_confirm::NUMERIC / v_total END;

  UPDATE reportes SET
    -- coluna é numeric(4,2): guarda a fração 0.00–1.00
    reporte_score_confianca = ROUND(v_taxa, 2),
    reporte_status = CASE
      WHEN reporte_status = 'resolvido'             THEN 'resolvido'::status_reporte
      WHEN v_total >= v_min_votos AND v_taxa >= 0.7 THEN 'validado'::status_reporte
      WHEN v_total >= v_min_votos AND v_taxa <  0.3 THEN 'rejeitado'::status_reporte
      ELSE 'pendente'::status_reporte
    END
  WHERE id = v_reporte_id;

  RETURN NULL;
END;
$function$
;

grant delete on table "public"."denuncias" to "anon";

grant insert on table "public"."denuncias" to "anon";

grant references on table "public"."denuncias" to "anon";

grant select on table "public"."denuncias" to "anon";

grant trigger on table "public"."denuncias" to "anon";

grant truncate on table "public"."denuncias" to "anon";

grant update on table "public"."denuncias" to "anon";

grant delete on table "public"."denuncias" to "authenticated";

grant insert on table "public"."denuncias" to "authenticated";

grant references on table "public"."denuncias" to "authenticated";

grant select on table "public"."denuncias" to "authenticated";

grant trigger on table "public"."denuncias" to "authenticated";

grant truncate on table "public"."denuncias" to "authenticated";

grant update on table "public"."denuncias" to "authenticated";

grant delete on table "public"."denuncias" to "service_role";

grant insert on table "public"."denuncias" to "service_role";

grant references on table "public"."denuncias" to "service_role";

grant select on table "public"."denuncias" to "service_role";

grant trigger on table "public"."denuncias" to "service_role";

grant truncate on table "public"."denuncias" to "service_role";

grant update on table "public"."denuncias" to "service_role";


  create policy "denuncias_insert_own"
  on "public"."denuncias"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = perfil_id) AND (NOT (EXISTS ( SELECT 1
   FROM public.reportes r
  WHERE ((r.id = denuncias.reporte_id) AND (r.perfil_id = auth.uid()))))) AND (NOT (EXISTS ( SELECT 1
   FROM public.reporte_validacoes v
  WHERE ((v.id = denuncias.validacao_id) AND (v.perfil_id = auth.uid())))))));



  create policy "denuncias_select_own"
  on "public"."denuncias"
  as permissive
  for select
  to authenticated
using ((auth.uid() = perfil_id));



  create policy "validacoes_delete_own"
  on "public"."reporte_validacoes"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = perfil_id));



  create policy "validacoes_update_own"
  on "public"."reporte_validacoes"
  as permissive
  for update
  to authenticated
using ((auth.uid() = perfil_id))
with check ((auth.uid() = perfil_id));


CREATE TRIGGER trg_ocultar_por_denuncias AFTER INSERT ON public.denuncias FOR EACH ROW EXECUTE FUNCTION public.ocultar_por_denuncias();

CREATE TRIGGER trg_protect_trust_score BEFORE INSERT OR UPDATE ON public.perfil FOR EACH ROW EXECUTE FUNCTION public.protect_perfil_trust_score();

CREATE TRIGGER trg_recalculate_score AFTER INSERT OR DELETE OR UPDATE ON public.reporte_validacoes FOR EACH ROW EXECUTE FUNCTION public.recalculate_reporte_score();

CREATE TRIGGER trg_limitar_reportes BEFORE INSERT ON public.reportes FOR EACH ROW EXECUTE FUNCTION public.limitar_reportes_por_hora();

CREATE TRIGGER trg_protect_reporte BEFORE INSERT OR UPDATE ON public.reportes FOR EACH ROW EXECUTE FUNCTION public.protect_reporte_columns();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "avatar publico para leitura"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "policies_ocorrencia 1posg2d_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'fotos-ocorrencia'::text));



  create policy "policies_ocorrencia 1posg2d_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'fotos-ocorrencia'::text));



  create policy "usuario atualiza o proprio avatar"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "usuario faz upload do proprio avatar"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


