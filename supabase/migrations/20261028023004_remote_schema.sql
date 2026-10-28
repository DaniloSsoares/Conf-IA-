


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."nivel_risco" AS ENUM (
    'baixo',
    'moderado',
    'alto',
    'critico'
);


ALTER TYPE "public"."nivel_risco" OWNER TO "postgres";


CREATE TYPE "public"."origem_alerta" AS ENUM (
    'sistema_ia',
    'defesa_civil',
    'colaborativo'
);


ALTER TYPE "public"."origem_alerta" OWNER TO "postgres";


CREATE TYPE "public"."status_alerta" AS ENUM (
    'ativo',
    'expirado',
    'cancelado'
);


ALTER TYPE "public"."status_alerta" OWNER TO "postgres";


CREATE TYPE "public"."status_reporte" AS ENUM (
    'pendente',
    'validado',
    'rejeitado',
    'resolvido'
);


ALTER TYPE "public"."status_reporte" OWNER TO "postgres";


CREATE TYPE "public"."tipo_ocorrencia" AS ENUM (
    'alagamento',
    'deslizamento',
    'bloqueio_via',
    'outro',
    'fogo_em_mata',
    'queda_de_galho',
    'falta_de_luz'
);


ALTER TYPE "public"."tipo_ocorrencia" OWNER TO "postgres";


CREATE TYPE "public"."tipo_validacao" AS ENUM (
    'confirma',
    'contesta'
);


ALTER TYPE "public"."tipo_validacao" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.perfil (id, perfil_nome_completo)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."alerta_notificacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alerta_id" "uuid" NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "notificacao_canal" "text" DEFAULT 'push'::"text" NOT NULL,
    "notificacao_lida" boolean DEFAULT false NOT NULL,
    "notificacao_enviada_em" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."alerta_notificacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."alertas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alerta_tipo_ocorrencia" "public"."tipo_ocorrencia" NOT NULL,
    "alerta_nivel_risco" "public"."nivel_risco" NOT NULL,
    "alerta_titulo" "text" NOT NULL,
    "alerta_descricao" "text",
    "alerta_latitude" double precision NOT NULL,
    "alerta_longitude" double precision NOT NULL,
    "alerta_raio_km" numeric(5,2) DEFAULT 5 NOT NULL,
    "alerta_area_id" "uuid",
    "alerta_origem" "public"."origem_alerta" DEFAULT 'sistema_ia'::"public"."origem_alerta" NOT NULL,
    "alerta_emitido_por" "uuid",
    "alerta_status" "public"."status_alerta" DEFAULT 'ativo'::"public"."status_alerta" NOT NULL,
    "alerta_expira_em" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."alertas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."areas_risco" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "area_nome" "text" NOT NULL,
    "area_tipo_risco" "public"."tipo_ocorrencia" NOT NULL,
    "area_nivel_risco" "public"."nivel_risco" DEFAULT 'baixo'::"public"."nivel_risco" NOT NULL,
    "area_poligono" "jsonb" NOT NULL,
    "area_municipio" "text",
    "area_estado" "text",
    "area_fonte" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."areas_risco" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dados_climaticos" (
    "id" bigint NOT NULL,
    "clima_latitude" double precision NOT NULL,
    "clima_longitude" double precision NOT NULL,
    "clima_temperatura_c" numeric(5,2),
    "clima_precipitacao_mm" numeric(6,2),
    "clima_umidade_pct" numeric(5,2),
    "clima_vento_kmh" numeric(5,2),
    "clima_fonte" "text" NOT NULL,
    "clima_referente_a" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."dados_climaticos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."dados_climaticos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."dados_climaticos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."dados_climaticos_id_seq" OWNED BY "public"."dados_climaticos"."id";



CREATE TABLE IF NOT EXISTS "public"."perfil" (
    "id" "uuid" NOT NULL,
    "perfil_nome_completo" "text",
    "perfil_avatar_url" "text",
    "perfil_trust_score" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "perfil_telefone" "text",
    "perfil_cidade" "text",
    "perfil_estado" "text",
    "perfil_raio_notificacao_km" numeric DEFAULT 5,
    "perfil_preferencias_alertas" "jsonb" DEFAULT '{"chuva": true, "outro": true, "acidente": true, "alagamento": true, "vandalismo": true, "deslizamento": true, "falta_de_luz": true, "fogo_em_mata": true, "falta_de_agua": true, "queda_de_galho": true}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "perfil_latitude" double precision,
    "perfil_longitude" double precision
);


ALTER TABLE "public"."perfil" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfil_aceites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "versao_termo" "text" NOT NULL,
    "aceito_em" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."perfil_aceites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reporte_midias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporte_id" "uuid" NOT NULL,
    "midia_url" "text" NOT NULL,
    "midia_tipo" "text" DEFAULT 'foto'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reporte_midias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reporte_validacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporte_id" "uuid" NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "validacao_tipo" "public"."tipo_validacao" NOT NULL,
    "validacao_comentario" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reporte_validacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reportes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "reporte_tipo_ocorrencia" "public"."tipo_ocorrencia" NOT NULL,
    "reporte_descricao" "text",
    "reporte_latitude" double precision NOT NULL,
    "reporte_longitude" double precision NOT NULL,
    "reporte_endereco" "text",
    "reporte_status" "public"."status_reporte" DEFAULT 'pendente'::"public"."status_reporte" NOT NULL,
    "reporte_score_confianca" numeric(4,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reportes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."dados_climaticos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."dados_climaticos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."alerta_notificacoes"
    ADD CONSTRAINT "alerta_notificacoes_alerta_id_perfil_id_key" UNIQUE ("alerta_id", "perfil_id");



ALTER TABLE ONLY "public"."alerta_notificacoes"
    ADD CONSTRAINT "alerta_notificacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alertas"
    ADD CONSTRAINT "alertas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."areas_risco"
    ADD CONSTRAINT "areas_risco_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dados_climaticos"
    ADD CONSTRAINT "dados_climaticos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfil_aceites"
    ADD CONSTRAINT "perfil_aceites_perfil_id_versao_termo_key" UNIQUE ("perfil_id", "versao_termo");



ALTER TABLE ONLY "public"."perfil_aceites"
    ADD CONSTRAINT "perfil_aceites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfil"
    ADD CONSTRAINT "perfil_perfil_usuario_key" UNIQUE ("perfil_nome_completo");



ALTER TABLE ONLY "public"."perfil"
    ADD CONSTRAINT "perfil_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reporte_midias"
    ADD CONSTRAINT "reporte_midias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reporte_validacoes"
    ADD CONSTRAINT "reporte_validacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reporte_validacoes"
    ADD CONSTRAINT "reporte_validacoes_reporte_id_perfil_id_key" UNIQUE ("reporte_id", "perfil_id");



ALTER TABLE ONLY "public"."reportes"
    ADD CONSTRAINT "reportes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_alerta_notificacoes_perfil" ON "public"."alerta_notificacoes" USING "btree" ("perfil_id", "notificacao_enviada_em" DESC);



CREATE INDEX "idx_alertas_created" ON "public"."alertas" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_alertas_geo" ON "public"."alertas" USING "btree" ("alerta_latitude", "alerta_longitude");



CREATE INDEX "idx_alertas_status" ON "public"."alertas" USING "btree" ("alerta_status");



CREATE INDEX "idx_areas_risco_municipio" ON "public"."areas_risco" USING "btree" ("area_municipio", "area_estado");



CREATE INDEX "idx_areas_risco_nivel" ON "public"."areas_risco" USING "btree" ("area_nivel_risco");



CREATE INDEX "idx_dados_climaticos_geo_tempo" ON "public"."dados_climaticos" USING "btree" ("clima_latitude", "clima_longitude", "clima_referente_a" DESC);



CREATE INDEX "idx_reporte_midias_reporte" ON "public"."reporte_midias" USING "btree" ("reporte_id");



CREATE INDEX "idx_reporte_validacoes_reporte" ON "public"."reporte_validacoes" USING "btree" ("reporte_id");



CREATE INDEX "idx_reportes_created" ON "public"."reportes" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_reportes_geo" ON "public"."reportes" USING "btree" ("reporte_latitude", "reporte_longitude");



CREATE INDEX "idx_reportes_perfil" ON "public"."reportes" USING "btree" ("perfil_id");



CREATE INDEX "idx_reportes_status" ON "public"."reportes" USING "btree" ("reporte_status");



CREATE OR REPLACE TRIGGER "trg_alertas_updated" BEFORE UPDATE ON "public"."alertas" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_areas_risco_updated" BEFORE UPDATE ON "public"."areas_risco" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_reportes_updated" BEFORE UPDATE ON "public"."reportes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."alerta_notificacoes"
    ADD CONSTRAINT "alerta_notificacoes_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "public"."alertas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alerta_notificacoes"
    ADD CONSTRAINT "alerta_notificacoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alertas"
    ADD CONSTRAINT "alertas_alerta_area_id_fkey" FOREIGN KEY ("alerta_area_id") REFERENCES "public"."areas_risco"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."alertas"
    ADD CONSTRAINT "alertas_alerta_emitido_por_fkey" FOREIGN KEY ("alerta_emitido_por") REFERENCES "public"."perfil"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."perfil_aceites"
    ADD CONSTRAINT "perfil_aceites_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfil"
    ADD CONSTRAINT "perfil_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reporte_midias"
    ADD CONSTRAINT "reporte_midias_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "public"."reportes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reporte_validacoes"
    ADD CONSTRAINT "reporte_validacoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reporte_validacoes"
    ADD CONSTRAINT "reporte_validacoes_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "public"."reportes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reportes"
    ADD CONSTRAINT "reportes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



CREATE POLICY "Qualquer um pode ver perfis" ON "public"."perfil" FOR SELECT USING (true);



CREATE POLICY "Usuarios podem editar seu próprio perfil" ON "public"."perfil" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuarios podem inserir seu próprio perfil" ON "public"."perfil" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Usuários podem registrar seus aceites" ON "public"."perfil_aceites" FOR INSERT WITH CHECK (("auth"."uid"() = "perfil_id"));



CREATE POLICY "Usuários veem seus próprios aceites" ON "public"."perfil_aceites" FOR SELECT USING (("auth"."uid"() = "perfil_id"));



ALTER TABLE "public"."alerta_notificacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."alertas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "alertas_select_all" ON "public"."alertas" FOR SELECT USING (true);



ALTER TABLE "public"."areas_risco" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "areas_risco_select_all" ON "public"."areas_risco" FOR SELECT USING (true);



ALTER TABLE "public"."dados_climaticos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dados_climaticos_select_all" ON "public"."dados_climaticos" FOR SELECT USING (true);



CREATE POLICY "notificacoes_select_own" ON "public"."alerta_notificacoes" FOR SELECT USING (("auth"."uid"() = "perfil_id"));



CREATE POLICY "notificacoes_update_own" ON "public"."alerta_notificacoes" FOR UPDATE USING (("auth"."uid"() = "perfil_id"));



ALTER TABLE "public"."perfil" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."perfil_aceites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reporte_midias" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reporte_midias_delete_own" ON "public"."reporte_midias" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."reportes" "r"
  WHERE (("r"."id" = "reporte_midias"."reporte_id") AND ("r"."perfil_id" = "auth"."uid"())))));



CREATE POLICY "reporte_midias_insert_own" ON "public"."reporte_midias" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."reportes" "r"
  WHERE (("r"."id" = "reporte_midias"."reporte_id") AND ("r"."perfil_id" = "auth"."uid"())))));



CREATE POLICY "reporte_midias_select_all" ON "public"."reporte_midias" FOR SELECT USING (true);



CREATE POLICY "reporte_midias_update_own" ON "public"."reporte_midias" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."reportes" "r"
  WHERE (("r"."id" = "reporte_midias"."reporte_id") AND ("r"."perfil_id" = "auth"."uid"())))));



ALTER TABLE "public"."reporte_validacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reportes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reportes_delete_own" ON "public"."reportes" FOR DELETE USING (("auth"."uid"() = "perfil_id"));



CREATE POLICY "reportes_insert_own" ON "public"."reportes" FOR INSERT WITH CHECK (("auth"."uid"() = "perfil_id"));



CREATE POLICY "reportes_select_all" ON "public"."reportes" FOR SELECT USING (true);



CREATE POLICY "reportes_updates_own" ON "public"."reportes" FOR UPDATE USING (("auth"."uid"() = "perfil_id"));



CREATE POLICY "usuario edita o proprio perfil" ON "public"."perfil" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "usuario ve o proprio perfil" ON "public"."perfil" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "validacoes_insert_own" ON "public"."reporte_validacoes" FOR INSERT WITH CHECK ((("auth"."uid"() = "perfil_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."reportes" "r"
  WHERE (("r"."id" = "reporte_validacoes"."reporte_id") AND ("r"."perfil_id" = "auth"."uid"())))))));



CREATE POLICY "validacoes_select_all" ON "public"."reporte_validacoes" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."alertas";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."perfil";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."reportes";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";















































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";

















































































GRANT ALL ON TABLE "public"."alerta_notificacoes" TO "anon";
GRANT ALL ON TABLE "public"."alerta_notificacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."alerta_notificacoes" TO "service_role";



GRANT ALL ON TABLE "public"."alertas" TO "anon";
GRANT ALL ON TABLE "public"."alertas" TO "authenticated";
GRANT ALL ON TABLE "public"."alertas" TO "service_role";



GRANT ALL ON TABLE "public"."areas_risco" TO "anon";
GRANT ALL ON TABLE "public"."areas_risco" TO "authenticated";
GRANT ALL ON TABLE "public"."areas_risco" TO "service_role";



GRANT ALL ON TABLE "public"."dados_climaticos" TO "anon";
GRANT ALL ON TABLE "public"."dados_climaticos" TO "authenticated";
GRANT ALL ON TABLE "public"."dados_climaticos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dados_climaticos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dados_climaticos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dados_climaticos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."perfil" TO "anon";
GRANT ALL ON TABLE "public"."perfil" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_aceites" TO "anon";
GRANT ALL ON TABLE "public"."perfil_aceites" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_aceites" TO "service_role";



GRANT ALL ON TABLE "public"."reporte_midias" TO "anon";
GRANT ALL ON TABLE "public"."reporte_midias" TO "authenticated";
GRANT ALL ON TABLE "public"."reporte_midias" TO "service_role";



GRANT ALL ON TABLE "public"."reporte_validacoes" TO "anon";
GRANT ALL ON TABLE "public"."reporte_validacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."reporte_validacoes" TO "service_role";



GRANT ALL ON TABLE "public"."reportes" TO "anon";
GRANT ALL ON TABLE "public"."reportes" TO "authenticated";
GRANT ALL ON TABLE "public"."reportes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































