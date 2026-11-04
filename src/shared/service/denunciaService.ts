import { supabaseConfig } from "@/src/config/supabase";
import { AlvoDenuncia, DenunciaMotivo } from "../types/denuncia";

/**
 * Registra a denúncia. As regras ficam no banco (Anexo A.9):
 * - RLS: só como si mesmo, nunca o próprio reporte/comentário
 * - UNIQUE: uma denúncia por pessoa por conteúdo (erro 23505 na repetição)
 * - trigger: com 3 denúncias o conteúdo é ocultado
 */
export async function denunciar(
  userId: string,
  alvo: AlvoDenuncia,
  motivo: DenunciaMotivo,
): Promise<{ error: any }> {
  const { error } = await supabaseConfig.from("denuncias").insert({
    perfil_id: userId,
    denuncia_motivo: motivo,
    reporte_id: alvo.tipo === "reporte" ? alvo.id : null,
    validacao_id: alvo.tipo === "comentario" ? alvo.id : null,
  });
  return { error };
}

/**
 * Ids de reportes e comentários que o usuário já denunciou
 * (a policy denuncias_select_own só devolve as denúncias dele).
 */
export async function getMyReportedIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabaseConfig
    .from("denuncias")
    .select("reporte_id, validacao_id")
    .eq("perfil_id", userId);

  if (error) {
    console.warn("Erro ao buscar denúncias do usuário:", error);
    return new Set();
  }

  const ids = new Set<string>();
  for (const d of data ?? []) {
    if (d.reporte_id) ids.add(d.reporte_id);
    if (d.validacao_id) ids.add(d.validacao_id);
  }
  return ids;
}
