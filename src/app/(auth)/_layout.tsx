import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro/index" />
      <Stack.Screen name="Login/index" />
      <Stack.Screen name="Register/index" />
    </Stack>
  );
}
