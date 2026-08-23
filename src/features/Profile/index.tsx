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
import { ChangePassModel } from '@/src/components/ui/ChangePassModel';
import { TermsModal } from '@/src/components/ui/TermsModal';
import { getTerms } from '@/src/shared/service/termsService';


export default function ProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const [preferences, setPreferences] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);


  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#0047FF");

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
        router.push('/(screens)/EditProfile');
        return;
      }
      setProfile(profileData);
      setPreferences({
        ...DEFAULT_ALERT_PREFERENCES,
        ...(profileData.perfil_preferencias_alertas || {}),
      });

      const accepted = await getTerms(user.id);
      setHasAcceptedTerms(accepted);
      if (!accepted) {
        setIsTermsModalVisible(true);
      }

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

  const handleAcceptTerms = async () => {
    const { data: { user } } = await supabaseConfig.auth.getUser();
    if (!user) return;
    const hasAccepted = await getTerms(user.id);
    if (hasAccepted) {
      Toast.show({
        type: 'info',
        text1: 'Termos de Serviço',
        text2: 'Você já aceitou os Termos de Serviço.',
      });
    } else {
      setIsTermsModalVisible(true);
    }
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
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
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
                <Ionicons name="person" size={54} color={iconColor} />
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
              <View style={styles.iconBg}><Ionicons name="call" size={18} color={iconColor} /></View>
              <Text style={styles.infoTitle}>Telefone</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.perfil_telefone || 'Não informado'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="location" size={18} color={iconColor} /></View>
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
              <View style={styles.iconBg}><Ionicons name="calendar" size={18} color={iconColor} /></View>
              <Text style={styles.infoTitle}>Membro desde</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.created_at ? formatDate(profile.created_at) : 'Não disponível'}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="shield-checkmark" size={18} color={iconColor} /></View>
              <Text style={styles.infoTitle}>Reputação</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.perfil_trust_score ?? 0} pontos</Text>
          </View>

          <TouchableOpacity style={styles.editButton}
            onPress={() => router.push('/EditProfile')}>
            <Ionicons name="pencil" size={16} color={iconColor} />
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
                    <Ionicons name={category.icon} size={18} color={iconColor} />
                  </View>
                  <Text style={styles.notificationTitle}>{category.label}</Text>
                </View>
                <Switch
                  value={preferences[category.key]}
                  onValueChange={() => handleTogglePreference(category.key)}
                  trackColor={{ false: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0', true: theme.primary || '#0047FF' }}
                  thumbColor={'#FFFFFF'}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Privacidade e Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança e Termos</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => setIsModalVisible(true)}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="lock-closed" size={18} color={iconColor} /></View>
              <Text style={styles.menuTitle}>Trocar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "rgba(255, 255, 255, 0.6)" : (theme.primary || "#0047FF")} />
          </TouchableOpacity>
          <View style={styles.divider} />

          {hasAcceptedTerms ? (
            <View style={styles.acceptedContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#4BB543" />
              <Text style={styles.acceptedText}>Você já aceitou estes termos.</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleAcceptTerms}>
              <View style={styles.menuLabel}>
                <View style={styles.iconBg}><Ionicons name="document-text" size={18} color={iconColor} /></View>
                <Text style={styles.menuTitle}>Termos de Serviço</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "rgba(255, 255, 255, 0.6)" : (theme.primary || "#0047FF")} />
            </TouchableOpacity>
          )}
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

      <ChangePassModel
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <TermsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
        onAccept={() => {
          setIsTermsModalVisible(false);
          setHasAcceptedTerms(true);
          Toast.show({
            type: 'success',
            text1: 'Sucesso',
            text2: 'Termos de serviço aceitos com sucesso!',
          });
        }}
      />

    </LinearGradient>


  );
}