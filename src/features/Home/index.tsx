import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabaseConfig } from '@/src/config/supabase';
import { getProfile } from '@/src/shared/service/profileService';
import { getCurrentWeather, saveWeatherReading } from '@/src/shared/service/weatherService';
import { getActiveReports } from '@/src/shared/service/reportService';
import { WeatherData } from '@/src/shared/types/weather';
import { Profile } from '@/src/shared/types/profile';
import { useAppTheme } from '@/src/shared/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import styles from './style';
import { NivelRisco } from '@/src/shared/types/notification';

// Valores do enum nivel_risco do banco -> texto exibido na tela
const RISK_LABEL: Record<NivelRisco, string> = {
  baixo: 'Baixo',
  moderado: 'Moderado',
  alto: 'Alto',
  critico: 'Crítico',
};

export default function DashboardScreen({ navigation }: any) {
  const { isDarkMode, theme } = useAppTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  
  // Dados do Usuário
  const [userName, setUserName] = useState('Usuário');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userInitials, setUserInitials] = useState('U');

  // Dados do Clima
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Alertas e Risco
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [riskLevel, setRiskLevel] = useState<NivelRisco>('baixo');
  const [riskDescription, setRiskDescription] = useState('Situação normal. Nenhum risco relevante identificado no momento.');

  // Data Formatada
  const getFormattedDate = () => {
    try {
      const now = new Date();
      const optionsDay: Intl.DateTimeFormatOptions = { weekday: 'long' };
      const dayName = now.toLocaleDateString('pt-BR', optionsDay);
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      return `Hoje - ${capitalizedDay}`;
    } catch {
      return 'Hoje';
    }
  };

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadUserDataAndWeather(),
      loadActiveAlerts(),
    ]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  const loadUserDataAndWeather = async () => {
    try {
      setLoadingWeather(true);
      const { data: { user } } = await supabaseConfig.auth.getUser();

      let profileData: Profile | null = null;
      let name = 'Usuário';
      let initials = 'U';

      if (user) {
        profileData = await getProfile(user.id);
        if (profileData) {
          setUserProfile(profileData);
          if (profileData.perfil_nome_completo) {
            name = profileData.perfil_nome_completo;
          }
        }

        if (name === 'Usuário') {
          const metadata = user.user_metadata || {};
          name =
            metadata.nome ||
            metadata.name ||
            metadata.full_name ||
            metadata.display_name ||
            user.email?.split('@')[0] ||
            'Usuário';
        }

        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
          initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
        } else if (nameParts[0]) {
          initials = nameParts[0].substring(0, 2).toUpperCase();
        }
      }

      setUserName(name);
      setUserInitials(initials);

      // Obter Localização para WeatherAPI
      let lat = profileData?.perfil_latitude || -23.5505;
      let lon = profileData?.perfil_longitude || -46.6333;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        }
      } catch (locErr) {
        console.warn('Não foi possível obter localização atual via GPS:', locErr);
      }

      // Buscar Dados do WeatherAPI / OpenWeather
      const weatherRes = await getCurrentWeather(lat, lon);
      if (weatherRes) {
        setWeather(weatherRes);
        saveWeatherReading(weatherRes).catch(() => {});
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário e clima:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadActiveAlerts = async () => {
    try {
      // 1. Buscar Alertas Oficiais Ativos da tabela alertas
      const { data: dbAlerts, error } = await supabaseConfig
        .from('alertas')
        .select('*')
        .eq('alerta_status', 'ativo')
        .order('created_at', { ascending: false });

      let list = dbAlerts || [];

      // 2. Buscar também reportes comunitários ativos para calcular o nível de risco
      const communityReports = await getActiveReports();

      if (!error && list.length > 0) {
        setActiveAlerts(list);
      } else if (communityReports.length > 0) {
        setActiveAlerts(
          communityReports.slice(0, 3).map((rep) => ({
            id: rep.id,
            alerta_titulo: rep.reporte_tipo_ocorrencia || 'Ocorrência Comunitária',
            alerta_descricao: rep.reporte_descricao || 'Reportado por usuário próximo',
            created_at: rep.created_at,
            alerta_nivel_risco: 'moderado',
          }))
        );
      } else {
        setActiveAlerts([]);
      }

      // 3. Calcular Nível de Risco Dinâmico
      const hasCritical = list.some((a) => a.alerta_nivel_risco === 'critico');
      const hasHigh = list.some((a) => a.alerta_nivel_risco === 'alto');
      const totalEvents = list.length + communityReports.length;

      if (hasCritical) {
        setRiskLevel('critico');
        setRiskDescription('Alerta crítico na sua região! Siga as orientações de segurança.');
      } else if (hasHigh) {
        setRiskLevel('alto');
        setRiskDescription('Atenção elevada. Risco de chuva forte ou alagamento detectado.');
      } else if (totalEvents > 0) {
        setRiskLevel('moderado');
        setRiskDescription('Risco moderado. Ocorrências ativas registradas na região.');
      } else {
        setRiskLevel('baixo');
        setRiskDescription('Situação normal. Nenhum risco relevante identificado no momento.');
      }
    } catch (err) {
      console.error('Erro ao buscar alertas ativos:', err);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData().finally(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    });
  }, []);

  // Cores adaptativas de Risco (Modo Claro vs Modo Escuro)
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critico':
        return isDarkMode ? '#FF6B81' : '#E11D48';
      case 'alto':
        return isDarkMode ? '#FF9D5C' : '#F97316';
      case 'moderado':
        return isDarkMode ? '#FBBF24' : '#F59E0B';
      case 'baixo':
      default:
        return isDarkMode ? '#34D399' : '#10B981';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'critico':
        return isDarkMode ? 'rgba(225, 29, 72, 0.22)' : '#FFE4E6';
      case 'alto':
        return isDarkMode ? 'rgba(249, 115, 22, 0.22)' : '#FFEDD5';
      case 'moderado':
        return isDarkMode ? 'rgba(245, 158, 11, 0.22)' : '#FEF3C7';
      case 'baixo':
      default:
        return isDarkMode ? 'rgba(16, 185, 129, 0.22)' : '#D1FAE5';
    }
  };

  const riskColor = getRiskColor(riskLevel);
  const riskBackground = getRiskBgColor(riskLevel);

  // Icone do Clima
  const weatherIconName = (weather?.icone_ionicon as any) || 'sunny';
  const isSunny = weatherIconName === 'sunny' || weatherIconName === 'partly-sunny';

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode && { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#60A5FA' : '#4F8EF7'}
          />
        }
      >
        {/* =========================
            CARD DE PERFIL DO USUÁRIO
        ========================= */}
        <TouchableOpacity
          style={[
            styles.userTopCard,
            isDarkMode && {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Profile')}
        >
          {userProfile?.perfil_avatar_url ? (
            <Image
              source={{ uri: userProfile.perfil_avatar_url }}
              style={styles.userAvatarImage}
            />
          ) : (
            <View
              style={[
                styles.userAvatar,
                isDarkMode && { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.userAvatarText}>{userInitials}</Text>
            </View>
          )}

          <View style={styles.userMetaContainer}>
            <Text
              style={[
                styles.userMetaName,
                isDarkMode && { color: theme.text },
              ]}
              numberOfLines={1}
            >
              {userName}
            </Text>

            <View style={styles.userBadgesRow}>
              {(userProfile?.perfil_cidade || weather?.cidade) && (
                <View
                  style={[
                    styles.badgeItem,
                    isDarkMode && { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                  ]}
                >
                  <Ionicons
                    name="location-sharp"
                    size={12}
                    color={isDarkMode ? '#93C5FD' : '#3F7FC4'}
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      isDarkMode && { color: '#93C5FD' },
                    ]}
                  >
                    {userProfile?.perfil_cidade
                      ? `${userProfile.perfil_cidade}${userProfile.perfil_estado ? ` - ${userProfile.perfil_estado}` : ''}`
                      : weather?.cidade}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.trustBadge,
                  isDarkMode && { backgroundColor: 'rgba(217, 119, 6, 0.25)' },
                ]}
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={isDarkMode ? '#FBBF24' : '#D97706'}
                />
                <Text
                  style={[
                    styles.trustBadgeText,
                    isDarkMode && { color: '#FBBF24' },
                  ]}
                >
                  Score: {userProfile?.perfil_trust_score ?? 100} pts
                </Text>
              </View>

              {/* Indicador do Tema (Modo Claro / Modo Escuro) */}
              <View
                style={[
                  styles.badgeItem,
                  isDarkMode
                    ? { backgroundColor: 'rgba(139, 92, 246, 0.25)' }
                    : { backgroundColor: '#F3E8FF' },
                ]}
              >
                <Ionicons
                  name={isDarkMode ? 'moon' : 'sunny'}
                  size={11}
                  color={isDarkMode ? '#C084FC' : '#7C3AED'}
                />
                <Text
                  style={[
                    styles.badgeText,
                    isDarkMode ? { color: '#C084FC' } : { color: '#7C3AED' },
                  ]}
                >
                  {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                </Text>
              </View>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDarkMode ? '#94A3B8' : '#8B93A1'}
          />
        </TouchableOpacity>

        {/* =========================
            HEADER CLIMA (WEATHERAPI)
        ========================= */}
        <View style={styles.weatherHeader}>
          <View style={styles.sunContainer}>
            <View
              style={[
                styles.sunGlow,
                isDarkMode
                  ? { backgroundColor: isSunny ? 'rgba(255, 215, 106, 0.15)' : 'rgba(59, 130, 246, 0.15)' }
                  : !isSunny && { backgroundColor: '#E2E8F0' },
              ]}
            />
            {loadingWeather ? (
              <ActivityIndicator
                size="large"
                color={isDarkMode ? '#60A5FA' : '#4F8EF7'}
              />
            ) : (
              <Ionicons
                name={weatherIconName}
                size={88}
                color={
                  isSunny
                    ? '#FFD76A'
                    : isDarkMode
                    ? '#60A5FA'
                    : '#4F8EF7'
                }
              />
            )}
          </View>

          <View style={styles.weatherInfo}>
            <Text
              style={[
                styles.weatherDay,
                isDarkMode && { color: theme.text },
              ]}
            >
              {getFormattedDate()}
            </Text>

            <Text
              style={[
                styles.weatherCondition,
                isDarkMode && { color: theme.subtext },
              ]}
              numberOfLines={1}
            >
              {weather?.descricao
                ? weather.descricao.charAt(0).toUpperCase() + weather.descricao.slice(1)
                : 'Ensolarado'}
            </Text>

            <Text
              style={[
                styles.weatherTemperature,
                isDarkMode && { color: theme.text },
              ]}
            >
              {weather?.clima_temperatura_c !== undefined && weather?.clima_temperatura_c !== null
                ? `${weather.clima_temperatura_c}° Graus`
                : '22° Graus'}
            </Text>

            {weather?.clima_fonte && (
              <View
                style={[
                  styles.weatherSourceTag,
                  isDarkMode && { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                ]}
              >
                <Text
                  style={[
                    styles.weatherSourceText,
                    isDarkMode && { color: '#93C5FD' },
                  ]}
                >
                  via {weather.clima_fonte}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* =========================
            SAUDAÇÃO
        ========================= */}
        <View style={styles.greetingContainer}>
          <Text
            style={[
              styles.greetingSmall,
              isDarkMode && { color: theme.subtext },
            ]}
          >
            Olá, {userName}
          </Text>

          <Text
            style={[
              styles.greeting,
              isDarkMode && { color: theme.text },
            ]}
          >
            Como podemos ajudar
            <Text
              style={[
                styles.greetingHighlight,
                isDarkMode && { color: '#60A5FA' },
              ]}
            >
              {' você '}
            </Text>
            hoje?
          </Text>

          <View style={styles.greetingLine} />
        </View>

        {/* =========================
            RISCO ATUAL
        ========================= */}
        <View style={[styles.riskCard, { backgroundColor: riskBackground }]}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={[styles.riskLabel, { color: riskColor }]}>
                Nível de risco atual
              </Text>

              <Text style={[styles.riskLevel, { color: riskColor }]}>
                {RISK_LABEL[riskLevel].toUpperCase()}
              </Text>
            </View>

            <View style={[styles.iconBadge, { backgroundColor: riskColor }]}>
              <Ionicons
                name={
                  riskLevel === 'baixo'
                    ? 'checkmark-circle'
                    : riskLevel === 'moderado'
                    ? 'warning'
                    : 'alert-circle'
                }
                size={25}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={[styles.riskLocation, { color: riskColor }]}>
            {riskDescription}
          </Text>
        </View>

        {/* =========================
            CONDIÇÕES CLIMÁTICAS (RESUMO WEATHERAPI)
        ========================= */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && { color: theme.text },
            ]}
          >
            Condições Climáticas
          </Text>

          <View
            style={[
              styles.weatherSummary,
              isDarkMode && {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            {/* UMIDADE */}
            <View style={styles.weatherSummaryItem}>
              <View
                style={[
                  styles.weatherMiniIcon,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(59, 130, 246, 0.2)'
                      : '#E7F0FF',
                  },
                ]}
              >
                <Ionicons
                  name="water-outline"
                  size={19}
                  color={isDarkMode ? '#60A5FA' : '#3F7FC4'}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.weatherSummaryValue,
                    isDarkMode && { color: theme.text },
                  ]}
                >
                  {weather?.clima_umidade_pct !== undefined && weather?.clima_umidade_pct !== null
                    ? `${weather.clima_umidade_pct}%`
                    : '78%'}
                </Text>

                <Text
                  style={[
                    styles.weatherSummaryLabel,
                    isDarkMode && { color: theme.subtext },
                  ]}
                >
                  Umidade
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.weatherDivider,
                isDarkMode && { backgroundColor: theme.divider },
              ]}
            />

            {/* TEMPERATURA */}
            <View style={styles.weatherSummaryItem}>
              <View
                style={[
                  styles.weatherMiniIcon,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(244, 122, 58, 0.2)'
                      : '#FFF0E4',
                  },
                ]}
              >
                <Ionicons
                  name="thermometer-outline"
                  size={19}
                  color={isDarkMode ? '#FB923C' : '#F47A3A'}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.weatherSummaryValue,
                    isDarkMode && { color: theme.text },
                  ]}
                >
                  {weather?.clima_temperatura_c !== undefined && weather?.clima_temperatura_c !== null
                    ? `${weather.clima_temperatura_c}°C`
                    : '28°C'}
                </Text>

                <Text
                  style={[
                    styles.weatherSummaryLabel,
                    isDarkMode && { color: theme.subtext },
                  ]}
                >
                  Temperatura
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.weatherDivider,
                isDarkMode && { backgroundColor: theme.divider },
              ]}
            />

            {/* CHUVA / VENTO */}
            <View style={styles.weatherSummaryItem}>
              <View
                style={[
                  styles.weatherMiniIcon,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(98, 91, 255, 0.2)'
                      : '#EEEAFE',
                  },
                ]}
              >
                <Ionicons
                  name={weather?.clima_precipitacao_mm ? 'rainy-outline' : 'navigate-outline'}
                  size={19}
                  color={isDarkMode ? '#818CF8' : '#625BFF'}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.weatherSummaryValue,
                    isDarkMode && { color: theme.text },
                  ]}
                >
                  {weather?.clima_precipitacao_mm !== undefined && weather?.clima_precipitacao_mm > 0
                    ? `${weather.clima_precipitacao_mm} mm`
                    : `${weather?.clima_vento_kmh ?? 12} km/h`}
                </Text>

                <Text
                  style={[
                    styles.weatherSummaryLabel,
                    isDarkMode && { color: theme.subtext },
                  ]}
                >
                  {weather?.clima_precipitacao_mm !== undefined && weather?.clima_precipitacao_mm > 0
                    ? 'Chuva'
                    : 'Vento'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========================
            ALERTAS ATIVOS
        ========================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode && { color: theme.text },
              ]}
            >
              Alertas Ativos
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Alerts')}
            >
              <Text
                style={[
                  styles.seeAll,
                  isDarkMode && { color: '#818CF8' },
                ]}
              >
                Ver tudo
              </Text>
            </TouchableOpacity>
          </View>

          {activeAlerts.length > 0 ? (
            activeAlerts.map((alert, index) => (
              <TouchableOpacity
                key={alert.id || index}
                style={[
                  styles.alertItem,
                  index > 0 && { marginTop: 10 },
                  isDarkMode && {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Alerts')}
              >
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor: isDarkMode
                        ? 'rgba(244, 122, 58, 0.2)'
                        : '#FFF0E4',
                    },
                  ]}
                >
                  <Ionicons
                    name="warning-outline"
                    size={23}
                    color={isDarkMode ? '#FB923C' : '#F47A3A'}
                  />
                </View>

                <View style={styles.alertContent}>
                  <Text
                    style={[
                      styles.alertTitle,
                      isDarkMode && { color: theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {alert.alerta_titulo || alert.alerta_tipo_ocorrencia || 'Alerta Meteorológico'}
                  </Text>

                  <Text
                    style={[
                      styles.alertTime,
                      isDarkMode && { color: theme.subtext },
                    ]}
                    numberOfLines={1}
                  >
                    {alert.alerta_descricao || 'Monitorado via Defesa Civil / Conf-IA'}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={isDarkMode ? '#94A3B8' : '#8B93A1'}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={[
                styles.emptyAlertCard,
                isDarkMode && {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={26}
                color={isDarkMode ? '#34D399' : '#10B981'}
                style={{ marginBottom: 4 }}
              />
              <Text
                style={[
                  styles.emptyAlertText,
                  isDarkMode && { color: theme.subtext },
                ]}
              >
                Nenhum alerta crítico ativo no momento.
              </Text>
            </View>
          )}
        </View>

        {/* =========================
            BOTÃO REPORTAR
        ========================= */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.88}
          onPress={() => router.push("/Report")}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Reportar Novo Evento</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}