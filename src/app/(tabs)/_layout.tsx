import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Platform, useColorScheme } from "react-native";
import { colors, darkTheme, lightTheme } from "../../constants/theme";

export default function TabLayout() {
  const deviceTheme = useColorScheme();
  const currentTheme = deviceTheme === "dark" ? darkTheme : lightTheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.azulClaro,
        tabBarInactiveTintColor: colors.azulClaro,

        tabBarStyle: {
          backgroundColor: deviceTheme === "dark" ? "#0F172A" : "#FFFFFF",
          height: 70,
          marginVertical: '5%',
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
        },

        tabBarItemStyle: {
          marginHorizontal: 15,
          marginVertical: 10,
          borderRadius: 25,
          marginTop: 15,
          overflow: "hidden",
        },

        tabBarActiveBackgroundColor: "#EFF6FF",

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginBottom: 10,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Alerts/index"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
      name="Profile/index"
      options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="profile" size={size || 24} color={color} />
        ),
      }}/>
    </Tabs>
  );
}
