import React, { useEffect, useRef } from 'react';
import { Text, ScrollView, StatusBar, KeyboardAvoidingView, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Load } from '@/src/components/ui';
import { useCurrentUser } from '@/src/shared/hooks/useCurrentUser';
import { Alerta } from '@/src/shared/types/notification';
import { Report } from '@/src/shared/types/report';
import { useViewHistoryStyles } from './styles';
import { HistoryItemType, useHistoryItem } from './useHistoryItem';
import { useReportVoting } from './useReportVoting';
import { DetailsHeader } from './components/DetailsHeader';
import { AlertaDetails } from './components/AlertaDetails';
import { ReporteDetails } from './components/ReporteDetails';

export default function ViewHistoryScreen() {
  const { styles, theme, isDarkMode } = useViewHistoryStyles();
  const { type, id, data } = useLocalSearchParams<{ type: HistoryItemType; id?: string; data?: string }>();

  const userId = useCurrentUser();
  const { item, loading, reload } = useHistoryItem(type, id, data);
  // Hook sempre chamado (regra dos hooks); em alerta recebe undefined e não faz nada
  const voting = useReportVoting(type === 'reporte' ? item?.id : undefined, userId, reload);

  // O campo de comentário fica no fim da tela: quando o teclado abre, rola até ele
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => sub.remove();
  }, []);

  const isAlerta = type === 'alerta';
  const statusBar = (
    <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
  );

  if (loading && !item) {
    return (
      <LinearGradient colors={theme.primaryGradient} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {statusBar}
        <Load />
      </LinearGradient>
    );
  }

  if (!item) {
    return (
      <LinearGradient colors={theme.primaryGradient} style={styles.container}>
        {statusBar}
        <DetailsHeader title="Detalhes" />
        <Text style={styles.errorText}>Não foi possível carregar os detalhes.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      {statusBar}
      {/* Com edgeToEdge (app.json) o Android não redimensiona a tela quando o teclado abre:
          sem isso o teclado cobre o campo de comentário. 'padding' funciona nas duas plataformas */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <DetailsHeader title={isAlerta ? 'Detalhes da notificação' : 'Detalhes do reporte'} />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          // Sem isso, com o teclado aberto o 1º toque em Confirmar/Contestar só fecha o teclado
          keyboardShouldPersistTaps="handled"
        >
          {isAlerta ? (
            <AlertaDetails alerta={item as Alerta} />
          ) : (
            <ReporteDetails
              reporte={item as Report}
              isOwner={Boolean(userId && (item as Report).perfil_id === userId)}
              currentUserId={userId}
              voting={voting}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
