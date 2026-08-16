import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '@/src/shared/constants/theme';
import { supabaseConfig } from '@/src/config/supabase';
import { getUserReports } from '@/src/shared/service/reportService';
import { getUserNotifications, markNotificationAsRead } from '@/src/shared/service/alertaNotificationService';
import { REPORT_CATEGORIES } from '@/src/shared/constants/reportCategories';
import { Report } from '@/src/shared/types/report';
import { AlertNotification } from '@/src/shared/types/notification';
import { getStyles } from './styles';

type Tab = 'alertas' | 'reportes';

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pendente: { bg: '#F5A623', text: '#5C3A00', label: 'Pendente' },
  validado: { bg: '#22C55E', text: '#0B4B23', label: 'Validado' },
  rejeitado: { bg: '#EF4444', text: '#FFFFFF', label: 'Rejeitado' },
  resolvido: { bg: 'rgba(255,255,255,0.15)', text: '#FFFFFF', label: 'Resolvido' },
};

function getCategoryMeta(tipo?: string) {
  const found = REPORT_CATEGORIES.find((c) => c.id === tipo);
  return found || { label: tipo || 'Ocorrência', icon: 'help-circle-outline' };
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ontem';
  if (diffD < 7) return `${diffD} dias atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function HistoryScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [tab, setTab] = useState<Tab>('alertas');
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) return;

      const [notificationsData, reportsData] = await Promise.all([
        getUserNotifications(user.id),
        getUserReports(user.id),
      ]);

      setNotifications(notificationsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleOpenNotification = async (notification: AlertNotification) => {
    if (notification.notificacao_lida) return;
    await markNotificationAsRead(notification.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, notificacao_lida: true } : n))
    );
  };

  const renderEmpty = (message: string) => (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={40} color="rgba(255,255,255,0.4)" />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico</Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, tab === 'alertas' && styles.segmentButtonActive]}
          onPress={() => setTab('alertas')}
        >
          <Text style={[styles.segmentText, tab === 'alertas' && styles.segmentTextActive]}>Alertas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, tab === 'reportes' && styles.segmentButtonActive]}
          onPress={() => setTab('reportes')}
        >
          <Text style={[styles.segmentText, tab === 'reportes' && styles.segmentTextActive]}>Meus reportes</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {tab === 'alertas' ? (
            notifications.length === 0 ? (
              renderEmpty('Nenhum alerta por aqui ainda.')
            ) : (
              notifications.map((notification) => {
                const meta = getCategoryMeta(notification.alertas?.alerta_tipo_ocorrencia);
                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={styles.row}
                    onPress={() => handleOpenNotification(notification)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={meta.icon as any}
                      size={20}
                      color={notification.notificacao_lida ? 'rgba(255,255,255,0.6)' : '#FFFFFF'}
                    />
                    <View style={styles.rowText}>
                      <Text style={[styles.rowTitle, !notification.notificacao_lida && styles.rowTitleUnread]}>
                        {notification.alertas?.alerta_titulo || meta.label}
                      </Text>
                      <Text style={styles.rowSubtitle}>
                        {formatRelativeTime(notification.notificacao_enviada_em)}
                      </Text>
                    </View>
                    {!notification.notificacao_lida && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })
            )
          ) : 
        </ScrollView>
      )}
    </LinearGradient>
  );
}
