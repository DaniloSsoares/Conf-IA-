import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/constants/theme';
import { supabaseConfig } from '@/src/config/supabase';
import { getUserReports } from '@/src/shared/service/reportService';
import { getUserNotifications, markNotificationAsRead } from '@/src/shared/service/alertaNotificationService';
import { Report } from '@/src/shared/types/report';
import { AlertNotification } from '@/src/shared/types/notification';
import { getStyles } from './styles';
import { getStatusStyle, getRiskStyle, getCategoryMeta, formatRelativeTime } from '@/src/shared/constants/historyStatus';
import ButtonBack from '@/src/components/ui/ButtonBack';
import { HelpModal } from '@/src/components/ui';

type Tab = 'notificações' | 'reportes';
export default function HistoryScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const styles = getStyles(theme);
  const [tab, setTab] = useState<Tab>('notificações');
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const primaryColor = theme.primary || "#0047FF";

  const iconColor = isDarkMode ? "rgba(255,255,255,0.6)" : (theme.primary || "#0047FF");

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
    if (notification.notificacao_lida) {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, notificacao_lida: true } : n))
      );
    }
    router.push({
      pathname: '/(screens)/ViewHistory',
      params: {
        type: 'alerta', data: JSON.stringify(notification.alertas)
      }
    });
  }

  const renderEmpty = (message: string) => (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={40} color={iconColor} />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
 <View style={styles.header}>
         <ButtonBack/>
          <Text style={styles.headerTitle}>Histórico</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHelpModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={26} color={primaryColor} />
          </TouchableOpacity>
        </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, tab === 'notificações' && styles.segmentButtonActive]}
          onPress={() => setTab('notificações')}
        >
          <Text style={[styles.segmentText, tab === 'notificações' && styles.segmentTextActive]}>Notificações</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, tab === 'reportes' && styles.segmentButtonActive]}
          onPress={() => setTab('reportes')}
        >
          <Text style={[styles.segmentText, tab === 'reportes' && styles.segmentTextActive]}>Meus reportes</Text>
        </TouchableOpacity>
      </View>

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title='Histórico de alertas'
        description='Aqui você pode acompanhar todos os alertas que foram enviados e receber notificações de novos alertas na sua região.'
        buttonText='Entendi'
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary || "#3AA77A"} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {tab === 'notificações' ? (
            notifications.length === 0 ? (
              renderEmpty('Nenhum alerta por aqui ainda.')
            ) : (
              notifications.map((notification) => {
                const meta = getCategoryMeta(notification.alertas?.alerta_tipo_ocorrencia);
                const risk = getRiskStyle(notification.alertas?.alerta_nivel_risco, theme);
                const borderColor = notification.notificacao_lida ? (isDarkMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0') : risk.border;

                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[styles.card, { borderLeftColor: borderColor }]}
                    onPress={() => handleOpenNotification(notification)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardDateText}>
                        {formatRelativeTime(notification.notificacao_enviada_em)}
                      </Text>
                      <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                        <Text style={styles.riskBadgeText}>{risk.label}</Text>
                      </View>
                    </View>

                    <Text style={[styles.cardTitle, !notification.notificacao_lida && styles.cardTitleUnread]}>
                      {notification.alertas?.alerta_titulo || meta.label}
                    </Text>

                    {notification.alertas?.alerta_descricao ? (
                      <View style={styles.cardLocationRow}>
                        <Ionicons name="information-circle-outline" size={14} color={iconColor} />
                        <Text style={styles.cardLocationText} numberOfLines={1}>
                          {notification.alertas.alerta_descricao}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.cardFooter}>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: notification.notificacao_lida ? '#64748B' : (theme.second || '#3B82F6') },
                          ]}
                        />
                        <Text style={styles.statusBadgeText}>
                          {notification.notificacao_lida ? 'Lida' : 'Nova notificação'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={iconColor} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          ) : reports.length === 0 ? (
            renderEmpty('Você ainda não fez nenhum reporte.')
          ) : (
            reports.map((report) => {
              const meta = getCategoryMeta(report.reporte_tipo_ocorrencia);
              const statusStyle = getStatusStyle(report.reporte_status, theme);

              return (
                <TouchableOpacity
                  key={report.id}
                  style={[styles.card, { borderLeftColor: statusStyle.border }]}
                  onPress={() => { router.push({ pathname: '/(screens)/ViewHistory', params: { type: 'reporte', data: JSON.stringify(report) } }) }}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardDateText}>
                      {formatRelativeTime(report.created_at)}
                    </Text>
                    <View style={[styles.riskBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(58,167,122,0.12)' }]}>
                      <Text style={[styles.riskBadgeText, { color: isDarkMode ? 'rgba(255,255,255,0.9)' : (theme.primary || '#3AA77A') }]}>
                        {meta.label.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>
                    {report.reporte_descricao || meta.label}
                  </Text>

                  {report.reporte_endereco ? (
                    <View style={styles.cardLocationRow}>
                      <Ionicons name="location-sharp" size={14} color={iconColor} />
                      <Text style={styles.cardLocationText} numberOfLines={1}>
                        {report.reporte_endereco}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusStyle.border }]} />
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={iconColor} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}


