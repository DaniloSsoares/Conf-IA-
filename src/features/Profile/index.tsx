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
import { ALERT_CATEGORIES, DEFAULT_ALERT_PREFERENCES, normalizeAlertPreferences } from '@/src/shared/constants/alertCategories';
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

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not authenticated',
        });
        return;
      }
      setEmail(user.email || '');
      const profileData = await getProfile(user.id);
      if (!profileData) {
        Toast.show({
          type: 'info',
          text1: 'Incomplete Profile',
          text2: 'Please fill in your profile details.',
        });
        router.push('/(screens)/EditProfile');
        return;
      }
      setProfile(profileData);
      // Só as categorias oficiais: assim, ao trocar uma preferência, o que é salvo de
      // volta no banco já vai sem as chaves antigas (ex.: "chuva")
      setPreferences(normalizeAlertPreferences(profileData.perfil_preferencias_alertas));

      const accepted = await getTerms(user.id);
      setHasAcceptedTerms(accepted);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error loading profile',
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
        text1: 'Error',
        text2: 'Error signing out',
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Logout',
      text2: 'You have signed out',
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
        text1: 'Terms of Service',
        text2: 'You have already accepted the Terms of Service.',
      });
    } else {
      setIsTermsModalVisible(true);
    }
  };

  const handleDeleteAccount = () => {
    Toast.show({
      type: 'error',
      text1: 'Delete Account',
      text2: 'Are you sure? This action cannot be undone.'
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
        text1: 'Error',
        text2: 'Error updating preferences',
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
                <Ionicons name="person" size={54} color={theme.iconPrimary} />
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton} onPress={() => router.push('/EditProfile')}>
              <Ionicons name="camera" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.perfil_nome_completo || 'No Name'}</Text>
          <Text style={styles.userEmail}>{email || 'No Email'}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="call" size={18} color={theme.iconPrimary} /></View>
              <Text style={styles.infoTitle}>Phone</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.perfil_telefone || 'Not provided'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="location" size={18} color={theme.iconPrimary} /></View>
              <Text style={styles.infoTitle}>Location</Text>
            </View>
            <Text style={styles.infoValue}>
              {profile?.perfil_cidade && profile?.perfil_estado
                ? `${profile.perfil_cidade}, ${profile.perfil_estado}`
                : profile?.perfil_cidade || profile?.perfil_estado || 'Not provided'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="calendar" size={18} color={theme.iconPrimary} /></View>
              <Text style={styles.infoTitle}>Member since</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.created_at ? formatDate(profile.created_at) : 'Not available'}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <View style={styles.iconBg}><Ionicons name="shield-checkmark" size={18} color={theme.iconPrimary} /></View>
              <Text style={styles.infoTitle}>Reputation</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.perfil_trust_score ?? 0} pontos</Text>
          </View>

          <TouchableOpacity style={styles.editButton}
            onPress={() => router.push('/EditProfile')}>
            <Ionicons name="pencil" size={16} color={theme.linkText} />
            <Text style={styles.editButtonText}>Edit Information</Text>
          </TouchableOpacity>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Types</Text>

          {ALERT_CATEGORIES.map((category, index) => (
            <React.Fragment key={category.key}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.notificationItem}>
                <View style={styles.notificationLabel}>
                  <View style={styles.iconBg}>
                    <Ionicons name={category.icon} size={18} color={theme.iconPrimary} />
                  </View>
                  <Text style={styles.notificationTitle}>{category.label}</Text>
                </View>
                <Switch
                  value={preferences[category.key]}
                  onValueChange={() => handleTogglePreference(category.key)}
                  trackColor={{ false: theme.inputBorder, true: theme.primary }}
                  thumbColor={theme.white}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Privacidade e Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security and Terms</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => setIsModalVisible(true)}>
            <View style={styles.menuLabel}>
              <View style={styles.iconBg}><Ionicons name="lock-closed" size={18} color={theme.iconPrimary} /></View>
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
          </TouchableOpacity>
          <View style={styles.divider} />

          {hasAcceptedTerms ? (
            <View style={styles.acceptedContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#4BB543" />
              <Text style={styles.acceptedText}>You have already accepted these terms.</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleAcceptTerms}>
              <View style={styles.menuLabel}>
                <View style={styles.iconBg}><Ionicons name="document-text" size={18} color={theme.iconPrimary} /></View>
                <Text style={styles.menuTitle}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
            </TouchableOpacity>
          )}
        </View>


        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={22} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
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
            text1: 'Success',
            text2: 'Terms of service accepted successfully!',
          });
        }}
      />

    </LinearGradient>


  );
}