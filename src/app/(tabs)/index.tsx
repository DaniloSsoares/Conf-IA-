import React from 'react';
import { useRouter } from 'expo-router';
import DashboardScreen from '@/src/features/Home';

export default function TabIndex() {
  const router = useRouter();

  const navigationShim = {
    navigate: (route: string) => {
      if (route === 'Alertas') router.push('/(tabs)/Alerts');
      else if (route === 'Report') router.push('/(tabs)/Alerts');
      else if (route === 'Profile') router.push('/(tabs)/Profile');
      else router.push(`/(tabs)/${route}`);
    },
  };

  return <DashboardScreen navigation={navigationShim as any} />;
}
