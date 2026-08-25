import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EditProfile" />
      <Stack.Screen name="EditReport" />
      <Stack.Screen name="ViewHistory" />
    </Stack>
  );
}
