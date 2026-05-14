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
import { getStyles } from "./style";
import { darkTheme, lightTheme } from "@/app/shared/constants/theme";



export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [communityReports, setCommunityReports] = useState(true);
   const styles = getStyles(theme);

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