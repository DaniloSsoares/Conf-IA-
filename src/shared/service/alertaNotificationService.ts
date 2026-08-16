import { supabaseConfig } from "../../config/supabase";
import { AlertNotification } from "../types/notification";

export async function getUserNotifications(userId: string): Promise<AlertNotification[]> {
  try {

    let { data, error } = await supabaseConfig
      .from("alerta_notificacoes")
      .select("*, alertas(*)")
      .eq("perfil_id", userId)
      .order("notificacao_enviada_em", { ascending: false });


    if (error && error.code === "PGRST205") {
      const fallback = await supabaseConfig
        .from("alertas_notificacoes")
        .select("*, alertas(*)")
        .eq("perfil_id", userId)
        .order("notificacao_enviada_em", { ascending: false });

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      if (error.code !== "PGRST205") {
        console.warn("Erro ao buscar notificações do usuário:", error.message || error);
      }
      return [];
    }

    return (data as AlertNotification[]) || [];
  } catch (error: any) {
    if (error?.code !== "PGRST205") {
      console.warn("Erro ao buscar notificações do usuário:", error);
    }
    return [];
  }
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
