import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useAppTheme } from "../../shared/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,

        tabBarStyle: {
          backgroundColor: theme.background,
          position: "absolute",
          bottom: Math.max(insets.bottom + 2, 16),
          height: 85,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          paddingTop: 12,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,

        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: -3,
        },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(255,255,255,0.1)' : 'transparent',
              marginBottom: 4,
              borderRadius: 10

            }}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Alerts/index"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(255,255,255,0.1)' : 'transparent',
              marginBottom: 4
            }}>
              <Ionicons name={focused ? "notifications" : "notifications-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(255,255,255,0.1)' : 'transparent',
              marginBottom: 4
            }}>
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
