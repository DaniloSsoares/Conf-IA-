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
import styles from './style';

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
    <View style={styles.container}>
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
    </View>
  );
}