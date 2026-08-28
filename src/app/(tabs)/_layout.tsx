import { Tabs } from 'expo-router';
import CustomTabBar from '@/src/components/layout/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="Maps/index"
        options={{
          title: 'Mapa',
        }}
      />

      <Tabs.Screen
        name="Report/index"
        options={{
          title: 'Alertas',
        }}
      />

      <Tabs.Screen
        name="History/index"
        options={{
          title: 'Histórico',
        }}
      />

      <Tabs.Screen
        name="Profile/index"
        options={{
          title: 'Usuário',
        }}
      />
    </Tabs>
  );
}