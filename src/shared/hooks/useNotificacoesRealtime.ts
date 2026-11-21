import { useEffect, useState } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { supabaseConfig } from "@/src/config/supabase";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { contarNaoLidas, getAlertaById } from "../service/alertaNotificationService";
import { getCategoryMeta } from "../constants/historyStatus";
import {
  aoTocarNaNotificacao,
  notificarAlerta,
  prepararNotificacoes,
} from "../utils/notificacoesLocais";
import { AppState } from "react-native";

export function useNotificacoesRealtime() {
  const userId = useCurrentUser();
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (!userId) return;
    prepararNotificacoes();

    // Número inicial vem do banco; depois o realtime mantém atualizado
    const atualizarContador = () => contarNaoLidas(userId).then(setNaoLidas);
    atualizarContador();

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
          
          setNaoLidas((n) => n + 1);

          const titulo = "Novo alerta perto de você";
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
      // Notificação marcada como lida (no Histórico): reconta
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "alerta_notificacoes",
          filter: `perfil_id=eq.${userId}`,
        },
        () => {
          atualizarContador();
        },
      )
      .subscribe();

    // Ao sair (logout) ou trocar de usuário, fecha o canal antigo
    return () => {
      supabaseConfig.removeChannel(canal);
    };
  }, [userId]);

  useEffect(() => {
    // Tocar na notificação da barra do Android abre o alerta
    return aoTocarNaNotificacao((alertaId) => {
      router.push({
        pathname: "/(screens)/ViewHistory",
        params: { type: "alerta", id: alertaId },
      });
    });
  }, []);

  return naoLidas;
}
