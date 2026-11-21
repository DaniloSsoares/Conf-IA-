import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

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