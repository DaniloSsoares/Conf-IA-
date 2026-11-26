import { supabaseConfig } from "../../config/supabase";
import { Alerta, AlertNotification } from "../types/notification";
import { BoundingBox } from "../utils/haversine";

export async function getAlertaById(alertaId: string): Promise<Alerta | null> {
  try {
    const { data, error } = await supabaseConfig
      .from("alertas")
      .select("*")
      .eq("id", alertaId)
      .maybeSingle();

    if (error) throw error;
    return (data as Alerta) || null;
  } catch (error) {
    console.error("Erro ao buscar alerta:", error);
    return null;
  }
}

// null = a consulta falhou: o Histórico avisa, em vez de dizer "nenhum alerta por aqui"
export async function getUserNotifications(userId: string): Promise<AlertNotification[] | null> {
  const { data, error } = await supabaseConfig
    .from("alerta_notificacoes")
    .select("*, alertas(*)")
    .eq("perfil_id", userId)
    .order("notificacao_enviada_em", { ascending: false });

  if (error) {
    console.warn("Erro ao buscar notificações do usuário:", error.message);
    return null;
  }
  return (data as AlertNotification[]) ?? [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabaseConfig
      .from("alerta_notificacoes")
      .update({ notificacao_lida: true })
      .eq("id", notificationId);

    if (error && error.code === "PGRST205") {
      await supabaseConfig
        .from("alertas_notificacoes")
        .update({ notificacao_lida: true })
        .eq("id", notificationId);
    }
  } catch (error) {
  }
}
export async function contarNaoLidas(userId: string): Promise<number> {
  const { count, error } = await supabaseConfig
    .from("alerta_notificacoes")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", userId)
    .eq("notificacao_lida", false);

  if (error) {
    console.warn("Erro ao contar notificações não lidas:", error.message);
    return 0;
  }
  return count ?? 0;
}

// Alertas ativos e dentro da validade numa caixa geográfica, só das categorias que o
// usuário ativou. Devolve null quando a consulta falha, para a tela diferenciar
// "não há alertas" de "não deu para buscar" (e não mostrar "situação normal" sem dados)
export async function getActiveAlerts(
  bounds: BoundingBox,
  categorias: string[],
): Promise<Alerta[] | null> {
  // .in() com lista vazia derruba a consulta: sem categoria ativa, não há o que buscar
  if (categorias.length === 0) return [];

  const { data, error } = await supabaseConfig
    .from("alertas")
    .select("*")
    .eq("alerta_status", "ativo")
    // Alerta da comunidade vence em 6 h; o oficial pode não ter validade (null)
    .or(`alerta_expira_em.is.null,alerta_expira_em.gt.${new Date().toISOString()}`)
    .in("alerta_tipo_ocorrencia", categorias)
    .gte("alerta_latitude", bounds.minLat)
    .lte("alerta_latitude", bounds.maxLat)
    .gte("alerta_longitude", bounds.minLng)
    .lte("alerta_longitude", bounds.maxLng)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar alertas ativos:", error);
    return null;
  }
  return (data as Alerta[]) ?? [];
}
