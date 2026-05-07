import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [riskLevel, setRiskLevel] = useState('baixo');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getRiskColor = (level) => {
    switch (level) {
      case 'crítico': return '#E11D48'; // Rose 600
      case 'alto': return '#F97316'; // Orange 500
      case 'médio': return '#F59E0B'; // Amber 500
      case 'baixo':
      default: return '#10B981'; // Emerald 500
    }
  };

  const getRiskBgColor = (level) => {
    switch (level) {
      case 'crítico': return '#FFE4E6';
      case 'alto': return '#FFEDD5';
      case 'médio': return '#FEF3C7';
      case 'baixo':
      default: return '#D1FAE5';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'crítico': return 'alert-circle';
      case 'alto': return 'warning';
      case 'médio': return 'alert';
      case 'baixo':
      default: return 'checkmark-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço para a Tab Bar
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Olá, Danilo</Text>
            <Text style={styles.headerSubtitle}>
              <Ionicons name="location" size={14} color="#64748B" /> São Paulo, SP
            </Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
             <Ionicons name="person-circle" size={40} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Card de Risco */}
        <View style={[styles.riskCard, { backgroundColor: getRiskBgColor(riskLevel) }]}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={[styles.riskLabel, { color: getRiskColor(riskLevel) }]}>Nível de Risco Atual</Text>
              <Text style={[styles.riskLevel, { color: getRiskColor(riskLevel) }]}>
                {riskLevel.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.iconBadge, { backgroundColor: getRiskColor(riskLevel) }]}>
               <Ionicons name={getRiskIcon(riskLevel)} size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.riskLocation, { color: getRiskColor(riskLevel) }]}>
            Situação normal. Fique atento a novas atualizações.
          </Text>
        </View>

        {/* Informações Climáticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condições Climáticas</Text>
          <View style={styles.weatherGrid}>
            <View style={styles.weatherCard}>
              <View style={[styles.weatherIconBg, { backgroundColor: '#DBEAFE' }]}>
                 <Ionicons name="water-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.weatherValue}>78%</Text>
              <Text style={styles.weatherLabel}>Umidade</Text>
            </View>
            <View style={styles.weatherCard}>
              <View style={[styles.weatherIconBg, { backgroundColor: '#FFEDD5' }]}>
                 <Ionicons name="thermometer-outline" size={24} color="#F97316" />
              </View>
              <Text style={styles.weatherValue}>28°C</Text>
              <Text style={styles.weatherLabel}>Temperatura</Text>
            </View>
            <View style={styles.weatherCard}>
              <View style={[styles.weatherIconBg, { backgroundColor: '#E0E7FF' }]}>
                 <Ionicons name="cloud-outline" size={24} color="#6366F1" />
              </View>
              <Text style={styles.weatherValue}>12 mm</Text>
              <Text style={styles.weatherLabel}>Precipitação</Text>
            </View>
          </View>
        </View>

        {/* Alertas Próximos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertas Ativos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alertas')}>
              <Text style={styles.seeAll}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.alertItem} onPress={() => navigation.navigate('Alertas')}>
            <View style={[styles.alertIcon, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="alert" size={24} color="#F97316" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Chuva Moderada Prevista</Text>
              <Text style={styles.alertTime}>Próximas 6 horas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.alertItem}>
            <View style={[styles.alertIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="water" size={24} color="#3B82F6" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Alagamentos em Área Próxima</Text>
              <Text style={styles.alertTime}>Há 2 horas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Call to Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Report')}
          activeOpacity={0.9}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Reportar Novo Evento</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  profileBtn: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  riskCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  riskLevel: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  riskLocation: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAll: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  weatherCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  weatherLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  alertItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
