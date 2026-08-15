import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from "./style";
import { useAppTheme } from '@/src/shared/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabaseConfig } from '@/src/config/supabase';
import { getProfile, updateProfile } from '@/src/shared/service/profileService';
import { Profile } from '@/src/shared/types/profile';
import { formatDate } from '@/src/shared/utils/dateMember'
import { ALERT_CATEGORIES, DEFAULT_ALERT_PREFERENCES } from '@/src/shared/constants/alertCategories';
import { AlertPreferences } from '@/src/shared/types/profile';


export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const [preferences, setPreferences] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Usuário não autenticado',
        });
        return;
      }
      setEmail(user.email || '');
      const profileData = await getProfile(user.id);
      if (!profileData) {
        Toast.show({
          type: 'info',
          text1: 'Perfil Incompleto',
          text2: 'Por favor, preencha seus dados de perfil.',
        });
        router.push('/EditProfile');
        return;
      }
      setProfile(profileData);
      setPreferences({
        ...DEFAULT_ALERT_PREFERENCES,
        ...(profileData.perfil_preferencias_alertas || {}),
      });

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar perfil',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );



  const handleLogout = async () => {
    const { error } = await supabaseConfig.auth.signOut();
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao sair',
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Logout',
      text2: 'Você saiu da aplicação',
    });
    router.replace('/Login');
  };

  const handleDeleteAccount = () => {
    Toast.show({
      type: 'error',
      text1: 'Excluir Conta',
      text2: 'Tem certeza? Esta ação não pode ser desfeita.'
    });
  };
  const handleTogglePreference = async (key: keyof AlertPreferences) => {
    const previous = preferences;
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);

    const { data: { user } } = await supabaseConfig.auth.getUser();
    if (!user) return;
    const { error } = await updateProfile(user.id, { perfil_preferencias_alertas: updated });
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao atualizar preferências',
      });
      setPreferences(previous);
      return;
    }

  }
  return (
    <LinearGradient
      colors={theme.primaryGradient}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Perfil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile?.perfil_avatar_url ? (
                <Image source={{ uri: profile.perfil_avatar_url }} style={{ width: '100%', height: '100%', borderRadius: 48 }} />
              ) : (
                <Ionicons name="person" size={54} color="#FFFFFF" />
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton} onPress={() => router.push('/EditProfile')}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.perfil_nome_completo || 'Sem Nome'}</Text>
          <Text style={styles.userEmail}>{email || 'Sem Email'}</Text>
        </View>

        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="call" size={18} color="#FFFFFF" /></View>
              <Text style={styles.infoTitle}>Telefone</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.perfil_telefone || 'Não informado'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="location" size={18} color="#FFFFFF" /></View>
              <Text style={styles.infoTitle}>Localização</Text>
            </View>
            <Text style={styles.infoValue}>
              {profile?.perfil_cidade && profile?.perfil_estado
                ? `${profile.perfil_cidade}, ${profile.perfil_estado}`
                : profile?.perfil_cidade || profile?.perfil_estado || 'Não informado'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="calendar" size={18} color="#FFFFFF" /></View>
              <Text style={styles.infoTitle}>Membro desde</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.created_at ? formatDate(profile.created_at) : 'Não disponível'}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="shield-checkmark" size={18} color="#FFFFFF" /></View>
              <Text style={styles.infoTitle}>Reputação</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.perfil_trust_score ?? 0} pontos</Text>
          </View>

          <TouchableOpacity style={styles.editButton}
            onPress={() => router.push('/EditProfile')}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar Informações</Text>
          </TouchableOpacity>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Alerta</Text>

          {ALERT_CATEGORIES.map((category, index) => (
            <React.Fragment key={category.key}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.notificationItem}>
                <View style={styles.notificationLabel}>
                  <View style={styles.iconBg}>
                    <Ionicons name={category.icon} size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.notificationTitle}>{category.label}</Text>
                </View>
                <Switch
                  value={preferences[category.key]}
                  onValueChange={() => handleTogglePreference(category.key)}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#3069E8' }}
                  thumbColor={'#FFFFFF'}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Privacidade e Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança e Termos</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="lock-closed" size={18} color="#FFFFFF" /></View>
              <Text style={styles.menuTitle}>Trocar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="document-text" size={18} color="#FFFFFF" /></View>
              <Text style={styles.menuTitle}>Termos de Serviço</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={22} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Sair da Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Excluir Minha Conta</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </LinearGradient>
  );
}