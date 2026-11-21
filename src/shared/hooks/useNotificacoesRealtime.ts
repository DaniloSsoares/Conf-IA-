import { useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { supabaseConfig } from "@/src/config/supabase";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { getAlertaById } from "../service/alertaNotificationService";
import { getCategoryMeta } from "../constants/historyStatus";
import {
  notificarAlerta,
  prepararNotificacoes,
} from "../utils/notificacoesLocais";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";

export function useNotificacoesRealtime() {
  const userId = useCurrentUser();

  useEffect(() => {
    if (!userId) return;
    prepararNotificacoes();

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

          const titulo = " Novo alerta perto de você";
          const corpo =
            alerta.alerta_titulo ||
            getCategoryMeta(alerta.alerta_tipo_ocorrencia).label;

          if (AppState.currentState === "active") {
            Toast.show({
              type: "info",
              text1: titulo,
              text2: corpo,
              visibilityTime: 6000,
              onPress: () => {
                Toast.hide();
                router.push({
                  pathname: "/(screens)/ViewHistory",
                  params: { type: "alerta", id: alerta.id },
                });
              },
            });
          } else {
            notificarAlerta(titulo, corpo, alerta.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabaseConfig.removeChannel(canal);
    };
  }, [userId]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (resposta) => {
        const alertaId = resposta.notification.request.content.data?.alertaId;
        if (alertaId) {
          router.push({
            pathname: "/(screens)/ViewHistory",
            params: { type: "alerta", id: String(alertaId) },
          });
        }
      },
    );
    return () => sub.remove();
  }, []);
}
