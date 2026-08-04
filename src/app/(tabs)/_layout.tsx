import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useAppTheme } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)', // Slightly lighter to contrast with background
          position: "absolute",
          bottom: Math.max(insets.bottom + 16, 16), // Accounts for system navigation bar
          left: 20,
          right: 20,
          height: 70, // Increased height to fit icon + label properly
          borderRadius: 35,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          padding: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
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
              padding: 6,
              borderRadius: 20,
              marginBottom: 4
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
              padding: 6,
              borderRadius: 20,
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
              padding: 6,
              borderRadius: 20,
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
