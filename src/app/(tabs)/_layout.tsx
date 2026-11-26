import { router, Tabs } from 'expo-router';
import CustomTabBar from '@/src/components/layout/CustomTabBar';
import { useEffect, useState } from 'react';
import { supabaseConfig } from '@/src/config/supabase';
import { getTerms } from '@/src/shared/service/termsService';
import Toast from 'react-native-toast-message';
import { TermsModal } from '@/src/components/ui';
import { useNotificacoesRealtime } from '@/src/shared/hooks/useNotificacoesRealtime';

export default function TabLayout() {
  const [precisaAceitar, setPrecisaAceitar] = useState(false);
  const naoLidas = useNotificacoesRealtime();
  
  // Ao entrar nas abas: confere se há sessão e se os termos da versão atual foram aceitos.
  // getSession lê do aparelho: sem internet, o usuário logado continua no app
  useEffect(() => {
    const verificarTermos = async () => {
      const { data: { session } } = await supabaseConfig.auth.getSession();
      // Sem sessão (link direto para uma aba, ou sessão encerrada): volta para o Login
      if (!session) {
        router.replace('/Login');
        return;
      }
      const aceito = await getTerms(session.user.id);
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
        text1: 'Erro',
        text2: 'Erro ao sair',
      });
      return;
    }
    setPrecisaAceitar(false);
    Toast.show({
      type: 'info',
      text1: 'Termos não aceitos',
      text2: 'Para usar o app, é preciso aceitar os termos de uso.',
    });
    router.replace('/Login');
  };
  return (
    <>
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} naoLidas={naoLidas} />}
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

    <TermsModal
        visible={precisaAceitar}
        obrigatorio
        onAccept={() => setPrecisaAceitar(false)}
        onRecusar={handleRecusar}
      />
      </>
  );
}