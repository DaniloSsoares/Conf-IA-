import React, { useCallback, useState } from 'react';
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
import { getCurrentWeather } from '@/src/shared/service/weatherService';
import { getActiveReports } from '@/src/shared/service/reportService';
import { getActiveAlerts } from '@/src/shared/service/alertaNotificationService';
import { getEnabledCategories } from '@/src/shared/constants/alertCategories';
import { boundingBox } from '@/src/shared/utils/haversine';
import { MARGEM_ALERTA_KM, alertaPerto, reportePerto } from '@/src/shared/utils/proximidade';
import { WeatherData } from '@/src/shared/types/weather';
import { Profile } from '@/src/shared/types/profile';
import { useAppTheme } from '@/src/shared/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import styles from './style';
import { NivelRisco } from '@/src/shared/types/notification';
import { RISK_LABEL, getNivelRiscoReporte } from '@/src/shared/constants/nivelRisco';
import { getCategoryMeta } from '@/src/shared/constants/historyStatus';
import { NumerosEmergencia } from './components/NumerosEmergencia';

type Local = { latitude: number; longitude: number };

// Item da lista da Home: um alerta, ou um reporte quando não há alerta por perto.
// `tipo` diz qual tela de detalhes abrir
type ItemRegiao = {
  id: string;
  tipo: 'alerta' | 'reporte';
  titulo: string;
  descricao: string;
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
  const [activeAlerts, setActiveAlerts] = useState<ItemRegiao[]>([]);
  // true quando a lista mostra reportes (não havia alerta por perto): muda o título da seção
  const [mostrandoReportes, setMostrandoReportes] = useState(false);
  // null = sem localização: a Home não sabe qual é a região e não inventa um nível
  // Começa em null: antes de os dados chegarem, mostrar "BAIXO / Situação normal"
  // seria afirmar algo que a Home ainda não sabe
  const [riskLevel, setRiskLevel] = useState<NivelRisco | null>(null);
  const [riskDescription, setRiskDescription] = useState('Carregando os dados da sua região...');

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

  // Uma passada só: usuário e perfil, depois a localização, e então clima e risco
  // em paralelo (os dois precisam da localização). Antes, o risco era calculado
  // com os alertas e reportes do país inteiro
  const loadAllData = useCallback(async () => {
    try {
      setLoadingWeather(true);
      const { data: { user } } = await supabaseConfig.auth.getUser();
      const profileData = user ? await getProfile(user.id) : null;
      preencherUsuario(user, profileData);

      const local = await obterLocalizacao(profileData);
      await Promise.all([carregarClima(local), carregarRegiao(local, profileData)]);
    } catch (error) {
      console.error('Erro ao carregar a Home:', error);
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  const preencherUsuario = (user: any, profileData: Profile | null) => {
    if (profileData) setUserProfile(profileData);

    let name = profileData?.perfil_nome_completo || '';
    if (!name && user) {
      const metadata = user.user_metadata || {};
      name =
        metadata.nome ||
        metadata.name ||
        metadata.full_name ||
        metadata.display_name ||
        user.email?.split('@')[0] ||
        '';
    }
    name = name || 'Usuário';

    const nameParts = name.trim().split(' ');
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0].substring(0, 2);

    setUserName(name);
    setUserInitials(initials.toUpperCase() || 'U');
  };

  // Onde o usuário está, na mesma ordem do Mapa: última posição conhecida (cache do
  // celular, instantânea), senão o GPS, senão a última posição salva no perfil.
  // Sem nenhuma delas, null: nada de "centro de São Paulo" inventado
  const obterLocalizacao = async (profileData: Profile | null): Promise<Local | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const posicao =
          (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 })) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (posicao) {
          return { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude };
        }
      }
    } catch (locErr) {
      console.warn('Não foi possível obter a localização atual:', locErr);
    }

    const lat = Number(profileData?.perfil_latitude);
    const lng = Number(profileData?.perfil_longitude);
    return profileData?.perfil_latitude != null && !isNaN(lat) && !isNaN(lng)
      ? { latitude: lat, longitude: lng }
      : null;
  };

  // null quando nenhuma API respondeu (ou sem localização): a tela mostra "Clima indisponível"
  const carregarClima = async (local: Local | null) => {
    setWeather(local ? await getCurrentWeather(local.latitude, local.longitude) : null);
  };

  // Alertas e reportes perto do usuário, com o mesmo raio e as mesmas categorias do Mapa,
  // e o nível de risco calculado só com eles
  const carregarRegiao = async (local: Local | null, profileData: Profile | null) => {
    if (!local) {
      setActiveAlerts([]);
      setMostrandoReportes(false);
      setRiskLevel(null);
      setRiskDescription('Ative a localização para ver o risco da sua região.');
      return;
    }

    // numeric do banco chega como texto: sem o Number, "5" + 20 viraria "520"
    const raioKm = Number(profileData?.perfil_raio_notificacao_km ?? 5);
    const categorias = getEnabledCategories(profileData?.perfil_preferencias_alertas);

    const [alertasBrutos, reportesBrutos] = await Promise.all([
      getActiveAlerts(boundingBox(local.latitude, local.longitude, raioKm + MARGEM_ALERTA_KM), categorias),
      getActiveReports(boundingBox(local.latitude, local.longitude, raioKm)),
    ]);

    // Alguma consulta falhou: avisa em vez de mostrar "situação normal" sem dados
    if (alertasBrutos === null || reportesBrutos === null) {
      setActiveAlerts([]);
      setMostrandoReportes(false);
      setRiskLevel(null);
      setRiskDescription('Não foi possível atualizar os dados da região. Verifique sua conexão.');
      return;
    }

    // A caixa é um quadrado; o raio é um círculo: refina pela distância real
    const alertas = alertasBrutos.filter((a) => alertaPerto(local, raioKm, a));
    const reportes = reportesBrutos.filter((r) => reportePerto(local, raioKm, r));

    if (alertas.length > 0) {
      setMostrandoReportes(false);
      setActiveAlerts(
        alertas.map((a) => ({
          id: a.id,
          tipo: 'alerta',
          titulo: a.alerta_titulo || getCategoryMeta(a.alerta_tipo_ocorrencia).label,
          descricao: a.alerta_descricao || 'Monitorado via Defesa Civil / Conf-IA',
        })),
      );
    } else {
      // Sem alerta por perto: mostra as ocorrências mais recentes, identificadas como tal
      setMostrandoReportes(reportes.length > 0);
      setActiveAlerts(
        reportes.slice(0, 3).map((r) => ({
          id: r.id,
          tipo: 'reporte',
          titulo: getCategoryMeta(r.reporte_tipo_ocorrencia).label,
          descricao: r.reporte_descricao || 'Reportado por um morador próximo',
        })),
      );
    }

    // Nível de risco: o pior entre os alertas e os reportes da região
    // (o risco do reporte vem da categoria, mesma regra do trigger A.10)
    const niveis: NivelRisco[] = [
      ...alertas.map((a) => a.alerta_nivel_risco),
      ...reportes.map((r) => getNivelRiscoReporte(r.reporte_tipo_ocorrencia)),
    ];

    if (niveis.includes('critico')) {
      setRiskLevel('critico');
      setRiskDescription('Alerta crítico na sua região! Siga as orientações de segurança.');
    } else if (niveis.includes('alto')) {
      setRiskLevel('alto');
      setRiskDescription('Atenção elevada. Ocorrências de risco alto perto de você.');
    } else if (niveis.length > 0) {
      setRiskLevel('moderado');
      setRiskDescription('Risco moderado. Ocorrências ativas registradas na região.');
    } else {
      setRiskLevel('baixo');
      setRiskDescription('Situação normal. Nenhum risco relevante identificado no momento.');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData().finally(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    });
  }, [loadAllData]);

  // Cores adaptativas de Risco (Modo Claro vs Modo Escuro)
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'indisponivel':
        return isDarkMode ? '#94A3B8' : '#64748B';
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
      case 'indisponivel':
        return isDarkMode ? 'rgba(148, 163, 184, 0.18)' : '#F1F5F9';
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

  const riskColor = getRiskColor(riskLevel ?? 'indisponivel');
  const riskBackground = getRiskBgColor(riskLevel ?? 'indisponivel');

  // Icone do Clima
  // Sem dados do clima: ícone de "offline", nunca um sol inventado
  const weatherIconName = weather
    ? ((weather.icone_ionicon as any) || 'partly-sunny')
    : 'cloud-offline-outline';
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
                : weather
                ? '—'
                : 'Clima indisponível'}
            </Text>

            <Text
              style={[
                styles.weatherTemperature,
                isDarkMode && { color: theme.text },
              ]}
            >
              {weather?.clima_temperatura_c !== undefined && weather?.clima_temperatura_c !== null
                ? `${weather.clima_temperatura_c}° Graus`
                : '--'}
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
                {riskLevel
                  ? RISK_LABEL[riskLevel].toUpperCase()
                  : loadingWeather
                    ? 'CARREGANDO'
                    : 'INDISPONÍVEL'}
              </Text>
            </View>

            <View style={[styles.iconBadge, { backgroundColor: riskColor }]}>
              <Ionicons
                name={
                  riskLevel === null
                    ? loadingWeather
                      ? 'time-outline'
                      : 'location-outline'
                    : riskLevel === 'baixo'
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
            NÚMEROS DE EMERGÊNCIA
            Logo abaixo do risco: é o que a pessoa procura numa situação de perigo
        ========================= */}
        <NumerosEmergencia />

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
                    : '--'}
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
                    : '--'}
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
                    : weather?.clima_vento_kmh != null
                    ? `${weather.clima_vento_kmh} km/h`
                    : '--'}
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
              {mostrandoReportes ? 'Ocorrências Próximas' : 'Alertas Ativos'}
            </Text>

            {/* "Ver tudo" abre o Mapa, onde ficam todos os alertas e ocorrências da região */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Maps')}
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
                // Abre os detalhes do item (alerta ou reporte). Antes ia para a tela de Reportar
                onPress={() =>
                  router.push({
                    pathname: '/(screens)/ViewHistory',
                    params: { type: alert.tipo, id: alert.id },
                  })
                }
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
                    {alert.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.alertTime,
                      isDarkMode && { color: theme.subtext },
                    ]}
                    numberOfLines={1}
                  >
                    {alert.descricao}
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
                {riskLevel === null
                  ? 'Sem dados da sua região no momento.'
                  : 'Nenhum alerta ativo perto de você.'}
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