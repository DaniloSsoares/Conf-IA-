import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [communityReports, setCommunityReports] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Deseja sair da aplicação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Perfil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={54} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>João Silva</Text>
          <Text style={styles.userEmail}>joao.silva@email.com</Text>
        </View>

        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="phone" size={18} color="#4F46E5" /></View>
              <Text style={styles.infoTitle}>Telefone</Text>
            </View>
            <Text style={styles.infoValue}>(11) 9 8765-4321</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="location" size={18} color="#4F46E5" /></View>
              <Text style={styles.infoTitle}>Localização</Text>
            </View>
            <Text style={styles.infoValue}>São Paulo, SP</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="calendar" size={18} color="#4F46E5" /></View>
              <Text style={styles.infoTitle}>Membro desde</Text>
            </View>
            <Text style={styles.infoValue}>15 Mai 2026</Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#4F46E5" />
            <Text style={styles.editButtonText}>Editar Informações</Text>
          </TouchableOpacity>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLabel}>
              <View style={styles.iconBg}><Ionicons name="notifications" size={18} color="#4F46E5" /></View>
              <Text style={styles.notificationTitle}>Todas as Notificações</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
              thumbColor={notificationsEnabled ? '#4F46E5' : '#F1F5F9'}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.divider} />
              <View style={styles.notificationItem}>
                <View style={styles.notificationLabel}>
                  <View style={styles.iconBg}><Ionicons name="cloudy" size={18} color="#4F46E5" /></View>
                  <Text style={styles.notificationTitle}>Alertas Climáticos</Text>
                </View>
                <Switch
                  value={weatherAlerts}
                  onValueChange={setWeatherAlerts}
                  trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                  thumbColor={weatherAlerts ? '#4F46E5' : '#F1F5F9'}
                />
              </View>

              <View style={styles.divider} />
              <View style={styles.notificationItem}>
                <View style={styles.notificationLabel}>
                  <View style={styles.iconBg}><Ionicons name="people" size={18} color="#4F46E5" /></View>
                  <Text style={styles.notificationTitle}>Reportes da Comunidade</Text>
                </View>
                <Switch
                  value={communityReports}
                  onValueChange={setCommunityReports}
                  trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                  thumbColor={communityReports ? '#4F46E5' : '#F1F5F9'}
                />
              </View>
            </>
          )}
        </View>

        {/* Privacidade e Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança e Termos</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="lock-closed" size={18} color="#4F46E5" /></View>
              <Text style={styles.menuTitle}>Trocar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="shield-checkmark" size={18} color="#4F46E5" /></View>
              <Text style={styles.menuTitle}>Privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="document-text" size={18} color="#4F46E5" /></View>
              <Text style={styles.menuTitle}>Termos de Serviço</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Ações Perigosas */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={22} color="#E11D48" />
            <Text style={styles.dangerButtonText}>Sair da Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Excluir Minha Conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Conf-IA v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 100, // Espaço para Tab Bar flutuante
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E293B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  editButton: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  menuLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  dangerSection: {
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFE4E6',
    borderRadius: 20,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    color: '#E11D48',
  },
  deleteButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
  },
});
