import React from 'react';
import { useRouter } from 'expo-router';
import DashboardScreen from '../features/Home/index';

export default function TabIndex() {
  const router = useRouter();

  // Compatibilidade do RN Navigation para Expo Router
  const navigationShim = {
    navigate: (route: string) => {
      if (route === 'Alertas') router.push('/features/Alerts');
      else if (route === 'Report') router.push('/features/Alerts');
      else if (route === 'Profile') router.push('/features/Profile');
      else router.push(`/features/${route}`);
    },
  };

  return <DashboardScreen navigation={navigationShim as any} />;
}
