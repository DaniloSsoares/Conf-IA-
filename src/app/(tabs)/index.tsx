import React from 'react';
import { useRouter } from 'expo-router';
import DashboardScreen from '@/src/features/Home';

export default function TabIndex() {
  const router = useRouter();

  const navigationShim = {
    navigate: (route: string) => {
      if (route === 'Alerts' || route === 'Alertas' || route === 'Report' || route === 'Report/index') {
        router.push('/(tabs)/Report/index' as any);
      } else if (route === 'Profile' || route === 'Profile/index') {
        router.push('/(tabs)/Profile/index' as any);
      } else if (route === 'Maps' || route === 'Maps/index') {
        router.push('/(tabs)/Maps/index' as any);
      } else if (route === 'History' || route === 'History/index') {
        router.push('/(tabs)/History/index' as any);
      } else {
        router.push(`/(tabs)/${route}` as any);
      }
    },
  };

  return <DashboardScreen navigation={navigationShim as any} />;
}
