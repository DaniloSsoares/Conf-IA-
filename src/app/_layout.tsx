import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "@/src/components/layout/Toast/toastConfig";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="features/SplashScreen/index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/Intro/index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/Login/index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/Register/index" options={{ headerShown: false }} />
        <Stack.Screen name="features/Home/index" options={{ headerShown: false }} />
        <Stack.Screen name="features/Alerts/index" options={{ headerShown: false }} />
        <Stack.Screen name="features/Profile/index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}
