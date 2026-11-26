import { LogBox, Platform } from "react-native";

// No Expo Go (SDK 53+), só importar o expo-notifications já gera um ERROR avisando que o
// push REMOTO não existe no Expo Go. O app usa só notificação LOCAL, que funciona normalmente,
// então o aviso é silenciado. O require vem DEPOIS do ignoreLogs de propósito: um import
// normal seria executado antes desta linha. No APK o aviso nem aparece.
LogBox.ignoreLogs(["expo-notifications: Android Push notifications"]);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require("expo-notifications") as typeof import("expo-notifications");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepararNotificacoes(): Promise<boolean> {
const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alertas", {
      name: "Alertas da região",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
   return status === "granted";
}

export async function notificarAlerta(titulo: string, corpo: string, alertaId: string){
    await Notifications.scheduleNotificationAsync({
        content:{
            title: titulo,
            body: corpo,
            data: {alertaId},
        },
        trigger: null,
    });
}

// Abre o alerta quando a pessoa toca na notificação. Fica aqui para que só este arquivo
// importe o expo-notifications (ver o comentário do topo). Devolve a função de limpeza
// Id da última notificação já aberta: o "último toque" continua guardado pelo sistema,
// e sem isto o mesmo alerta seria aberto de novo a cada login
let ultimaRespostaTratada: string | null = null;

export function aoTocarNaNotificacao(abrirAlerta: (alertaId: string) => void): () => void {
  const tratar = (resposta: import("expo-notifications").NotificationResponse | null) => {
    if (!resposta) return;
    const id = resposta.notification.request.identifier;
    if (id === ultimaRespostaTratada) return;
    ultimaRespostaTratada = id;
    const alertaId = resposta.notification.request.content.data?.alertaId;
    if (alertaId) abrirAlerta(String(alertaId));
  };

  // Toque com o app aberto ou minimizado
  const sub = Notifications.addNotificationResponseReceivedListener(tratar);
  // Toque que ABRIU o app (o Android tinha encerrado o app): o listener acima ainda não
  // existia nesse momento, então o toque é lido aqui
  Notifications.getLastNotificationResponseAsync().then(tratar).catch(() => {});

  return () => sub.remove();
}
