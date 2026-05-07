import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const alerts = [
  {
    id: 1,
    title: 'Alerta de Chuva Intensa',
    description: 'Chuva forte prevista para as próximas 6 horas.',
    location: 'Zona Leste - São Paulo',
    severity: 'alto',
    time: 'Há 30 minutos',
    forecast: '80-120mm',
    icon: 'rainy',
  },
  {
    id: 2,
    title: 'Risco de Enchente',
    description: 'Rio Tietê com nível acima do normal.',
    location: 'Centro - São Paulo',
    severity: 'crítico',
    time: 'Há 1 hora',
    forecast: 'Aumento de 2-3 metros',
    icon: 'water',
  },
  {
    id: 3,
    title: 'Possível Deslizamento',
    description: 'Encostas saturadas em áreas de risco.',
    location: 'Serra da Cantareira',
    severity: 'médio',
    time: 'Há 2 horas',
    forecast: 'Se chuva persistir',
    icon: 'warning',
  },
  {
    id: 4,
    title: 'Vento Forte',
    description: 'Rajadas de vento acima de 40 km/h.',
    location: 'Zona Oeste - São Paulo',
    severity: 'médio',
    time: 'Há 3 horas',
    forecast: 'Até as 18h',
    icon: 'leaf',
  },
];

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'crítico': return '#E11D48'; // Rose 600
    case 'alto': return '#F97316'; // Orange 500
    case 'médio': return '#F59E0B'; // Amber 500
    case 'baixo':
    default: return '#10B981'; // Emerald 500
  }
};

const getSeverityBgColor = (severity) => {
  switch (severity) {
    case 'crítico': return '#FFE4E6';
    case 'alto': return '#FFEDD5';
    case 'médio': return '#FEF3C7';
    case 'baixo':
    default: return '#D1FAE5';
  }
};

export default function AlertScreen() {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const renderAlertCard = ({ item }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => setSelectedAlert(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardBorder, { backgroundColor: getSeverityColor(item.severity) }]} />
      <View style={styles.alertCardContent}>
        <View style={styles.alertCardHeader}>
          <View style={[styles.alertCardIcon, { backgroundColor: getSeverityBgColor(item.severity) }]}>
            <Ionicons name={item.icon} size={24} color={getSeverityColor(item.severity)} />
          </View>
          <View style={styles.alertCardTitleContainer}>
            <Text style={styles.alertTitle}>{item.title}</Text>
            <Text style={styles.alertTime}>{item.time}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{item.severity.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.alertDescription}>{item.description}</Text>
        <View style={styles.alertLocation}>
          <Ionicons name="location" size={14} color="#94A3B8" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailedAlert = (alert) => (
    <View style={styles.detailModal}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setSelectedAlert(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Detalhes do Alerta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.detailSeverityCard, { backgroundColor: getSeverityBgColor(alert.severity) }]}>
          <Ionicons name={alert.icon} size={54} color={getSeverityColor(alert.severity)} />
          <Text style={styles.detailAlertTitle}>{alert.title}</Text>
          <View style={[styles.detailSeverityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
            <Text style={styles.detailSeverityText}>{alert.severity.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Descrição</Text>
          <View style={styles.infoBox}>
             <Text style={styles.detailText}>{alert.description}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Localização</Text>
          <View style={styles.infoBox}>
            <Ionicons name="location" size={20} color="#4F46E5" />
            <Text style={styles.detailInfoText}>{alert.location}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Previsão</Text>
          <View style={styles.infoBox}>
            <Ionicons name="time" size={20} color="#4F46E5" />
            <Text style={styles.detailInfoText}>{alert.forecast}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Recomendações</Text>
          <View style={styles.infoBoxColumn}>
            <View style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.recommendationText}>Mantenha-se informado via esta plataforma</Text>
            </View>
            <View style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.recommendationText}>Evite áreas de risco se possível</Text>
            </View>
            <View style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.recommendationText}>Siga orientações da Defesa Civil</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Contatar Defesa Civil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="map" size={20} color="#4F46E5" />
          <Text style={styles.secondaryButtonText}>Ver no Mapa de Riscos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {selectedAlert ? (
        renderDetailedAlert(selectedAlert)
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerText}>
               <Text style={styles.headerCount}>{alerts.length}</Text> alerta{alerts.length !== 1 ? 's' : ''} ativo{alerts.length !== 1 ? 's' : ''} na sua região
            </Text>
          </View>

          <FlatList
            data={alerts}
            renderItem={renderAlertCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    flex: 1,
  },
  headerInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerCount: {
    fontWeight: '800',
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espaço para tab bar flutuante
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardBorder: {
    width: 6,
  },
  alertCardContent: {
    flex: 1,
    padding: 16,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertCardTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  severityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  detailModal: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailSeverityCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  detailAlertTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  detailSeverityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailSeverityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoBoxColumn: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  detailText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  detailInfoText: {
    fontSize: 15,
    color: '#1E293B',
    marginLeft: 12,
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#E11D48',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
