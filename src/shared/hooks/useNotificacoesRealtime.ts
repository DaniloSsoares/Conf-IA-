import { useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { supabaseConfig } from "@/src/config/supabase";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { getAlertaById } from "../service/alertaNotificationService";
import { getCategoryMeta } from "../constants/historyStatus";

export function useNotificacoesRealtime() {
  const userId = useCurrentUser();

  useEffect(() => {
    if (!userId) return;

    const canal = supabaseConfig
      .channel(`notificacoes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerta_notificacoes",
          filter: `perfil_id=eq.${userId}`,
        },
        async (payload) => {
          const notificacao = payload.new as { id: string; alerta_id: string };
          const alerta = await getAlertaById(notificacao.alerta_id);
          if (!alerta) {
            return;
          }
          Toast.show({
            type: "info",
            text1: "Novo alerta perto de você",
            text2:
              alerta.alerta_titulo ||
              getCategoryMeta(alerta.alerta_tipo_ocorrencia).label,
            visibilityTime: 6000,
            onPress: () => {
              Toast.hide();
              router.push({
                pathname: "/(screens)/ViewHistory",
                params: { type: "alerta", id: alerta.id },
              });
            },
          });
        },
      )
      .subscribe();

    return () => {
      supabaseConfig.removeChannel(canal);
    };
  }, [userId]);
}
