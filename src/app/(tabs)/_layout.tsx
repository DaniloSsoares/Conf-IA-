import { router, Tabs } from 'expo-router';
import CustomTabBar from '@/src/components/layout/CustomTabBar';
import { useEffect, useState } from 'react';
import { supabaseConfig } from '@/src/config/supabase';
import { getTerms } from '@/src/shared/service/termsService';
import Toast from 'react-native-toast-message';
import { TermsModal } from '@/src/components/ui';

export default function TabLayout() {
  const [precisaAceitar, setPrecisaAceitar] = useState(false);

  useEffect(() => {
    const verificarTermos = async () => {
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) return;
      const aceito = await getTerms(user.id);
      if (!aceito) {
        setPrecisaAceitar(true);
      }
    };
    verificarTermos();
  }, []);

  const handleRecusar = async () => {
    const { error } = await supabaseConfig.auth.signOut();
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error signing out',
      });
      return;
    }
    setPrecisaAceitar(false);
    Toast.show({
      type: 'info',
      text1: 'Terms not accepted',
      text2: 'To use the app, you need to accept the terms of use.',
    });
    router.replace('/Login');
  };
  return (
    <>
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
          title: 'Map',
        }}
      />

      <Tabs.Screen
        name="Report/index"
        options={{
          title: 'Alerts',
        }}
      />

      <Tabs.Screen
        name="History/index"
        options={{
          title: 'History',
        }}
      />

      <Tabs.Screen
        name="Profile/index"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>

    <TermsModal
        visible={precisaAceitar}
        obrigatorio
        onAccept={() => setPrecisaAceitar(false)}
        onRecusar={handleRecusar}
      />
      </>
  );
}