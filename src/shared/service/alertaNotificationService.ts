import  { supabaseConfig } from "../../config/supabase";
import { AlertNotification } from "../types/notification";

export async function getUserNotifications(userId: string): Promise<AlertNotification[]> {
    try {
        const { data, error } = await supabaseConfig
            .from("alertas_notificacoes")
            .select("*, alertas(*)")
            .eq("perfil_id", userId)
            .order("notificacao_enviada_em", { ascending: false });
        if (error) throw error;
        return (data as AlertNotification[]) || [];
    } catch (error) {
        console.error("Erro ao buscar notificações do usuário:", error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabaseConfig
      .from("alertas_notificacoes")
      .update({ notificacao_lida: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
  }
}