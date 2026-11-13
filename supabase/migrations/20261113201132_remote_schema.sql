
drop policy "Qualquer um pode ver perfis" on "public"."perfil";

drop policy "usuario edita o proprio perfil" on "public"."perfil";

drop policy "alertas_select_all" on "public"."alertas";

drop policy "areas_risco_select_all" on "public"."areas_risco";

drop policy "dados_climaticos_select_all" on "public"."dados_climaticos";

drop policy "reporte_midias_select_all" on "public"."reporte_midias";

drop policy "validacoes_select_all" on "public"."reporte_validacoes";

drop policy "reportes_select_all" on "public"."reportes";

alter table "public"."perfil" drop constraint "perfil_perfil_usuario_key";

drop index if exists "public"."perfil_perfil_usuario_key";

  create policy "alertas_select_all"
  on "public"."alertas"
  as permissive
  for select
  to authenticated
using (true);

  create policy "areas_risco_select_all"
  on "public"."areas_risco"
  as permissive
  for select
  to authenticated
using (true);

  create policy "dados_climaticos_select_all"
  on "public"."dados_climaticos"
  as permissive
  for select
  to authenticated
using (true);

  create policy "reporte_midias_select_all"
  on "public"."reporte_midias"
  as permissive
  for select
  to authenticated
using (true);

  create policy "validacoes_select_all"
  on "public"."reporte_validacoes"
  as permissive
  for select
  to authenticated
using (true);

  create policy "reportes_select_all"
  on "public"."reportes"
  as permissive
  for select
  to authenticated
using (true);

