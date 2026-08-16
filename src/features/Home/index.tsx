import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabaseConfig } from '@/src/config/supabase';
import styles from './style';

export default function DashboardScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Usuário');

  const riskLevel = 'baixo';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const {
        data: { user },
      } = await supabaseConfig.auth.getUser();

      if (!user) {
        return;
      }

      const metadata = user.user_metadata || {};

      const name =
        metadata.nome ||
        metadata.name ||
        metadata.full_name ||
        metadata.display_name ||
        user.email?.split('@')[0] ||
        'Usuário';

      setUserName(name);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    loadUser().finally(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 800);
    });
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'crítico':
        return '#E11D48';

      case 'alto':
        return '#F97316';

      case 'médio':
        return '#F59E0B';

      case 'baixo':
      default:
        return '#10B981';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'crítico':
        return '#FFE4E6';

      case 'alto':
        return '#FFEDD5';

      case 'médio':
        return '#FEF3C7';

      case 'baixo':
      default:
        return '#D1FAE5';
    }
  };

  const riskColor = getRiskColor(riskLevel);
  const riskBackground = getRiskBgColor(riskLevel);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F8EF7"
          />
        }
      >
        {/* =========================
            CLIMA
        ========================= */}

        <View style={styles.weatherHeader}>
          <View style={styles.sunContainer}>
            <View style={styles.sunGlow} />

            <Ionicons
              name="sunny"
              size={92}
              color="#FFD76A"
            />
          </View>

          <View style={styles.weatherInfo}>
            <Text style={styles.weatherDay}>
              Hoje - Sábado
            </Text>

            <Text style={styles.weatherCondition}>
              Ensolarado
            </Text>

            <Text style={styles.weatherTemperature}>
              22° Graus
            </Text>
          </View>
        </View>

        {/* =========================
            SAUDAÇÃO
        ========================= */}

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSmall}>
            Olá, {userName}
          </Text>

          <Text style={styles.greeting}>
            Como podemos ajudar
            <Text style={styles.greetingHighlight}>
              {' você '}
            </Text>
            hoje?
          </Text>

          <View style={styles.greetingLine} />
        </View>

        {/* =========================
            RISCO
        ========================= */}

        <View
          style={[
            styles.riskCard,
            {
              backgroundColor: riskBackground,
            },
          ]}
        >
          <View style={styles.riskHeader}>
            <View>
              <Text
                style={[
                  styles.riskLabel,
                  {
                    color: riskColor,
                  },
                ]}
              >
                Nível de risco atual
              </Text>

              <Text
                style={[
                  styles.riskLevel,
                  {
                    color: riskColor,
                  },
                ]}
              >
                {riskLevel.toUpperCase()}
              </Text>
            </View>

            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: riskColor,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={25}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text
            style={[
              styles.riskLocation,
              {
                color: riskColor,
              },
            ]}
          >
            Situação normal. Nenhum risco relevante
            identificado no momento.
          </Text>
        </View>

        {/* =========================
            CONDIÇÕES CLIMÁTICAS
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Condições Climáticas
          </Text>

          <View style={styles.weatherSummary}>
            {/* UMIDADE */}
            <View style={styles.weatherSummaryItem}>
              <View
                style={[
                  styles.weatherMiniIcon,
                  {
                    backgroundColor: '#E7F0FF',
                  },
                ]}
              >
                <Ionicons
                  name="water-outline"
                  size={19}
                  color="#3F7FC4"
                />
              </View>

              <View>
                <Text style={styles.weatherSummaryValue}>
                  78%
                </Text>

                <Text style={styles.weatherSummaryLabel}>
                  Umidade
                </Text>
              </View>
            </View>

            <View style={styles.weatherDivider} />

            {/* TEMPERATURA */}
            <View style={styles.weatherSummaryItem}>
              <View
                style={[
                  styles.weatherMiniIcon,
                  {
                    backgroundColor: '#FFF0E4',
                  },
                ]}
              >
                <Ionicons
                  name="thermometer-outline"
                  size={19}
                  color="#F47A3A"
                />
              </View>

              <View>
                <Text style={styles.weatherSummaryValue}>
                  28°C
                </Text>

                <Text style={styles.weatherSummaryLabel}>
                  Temperatura
                </Text>
              </View>
            </View>

            <View style={styles.weatherDivider} />

            {/* CHUVA */}
            <View style={styles.weatherSummaryItem}>
              <View
                style={[
                  styles.weatherMiniIcon,
                  {
                    backgroundColor: '#EEEAFE',
                  },
                ]}
              >
                <Ionicons
                  name="rainy-outline"
                  size={19}
                  color="#625BFF"
                />
              </View>

              <View>
                <Text style={styles.weatherSummaryValue}>
                  12 mm
                </Text>

                <Text style={styles.weatherSummaryLabel}>
                  Chuva
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
            <Text style={styles.sectionTitle}>
              Alertas Ativos
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('Alerts/index')
              }
            >
              <Text style={styles.seeAll}>
                Ver tudo
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.alertItem}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Alerts/index')
            }
          >
            <View
              style={[
                styles.alertIcon,
                {
                  backgroundColor: '#FFF0E4',
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={23}
                color="#F47A3A"
              />
            </View>

            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                Chuva Moderada Prevista
              </Text>

              <Text style={styles.alertTime}>
                Próximas 6 horas
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#8B93A1"
            />
          </TouchableOpacity>
        </View>

        {/* =========================
            BOTÃO REPORTAR
        ========================= */}

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('Report/index')
          }
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.actionButtonText}>
            Reportar Novo Evento
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}