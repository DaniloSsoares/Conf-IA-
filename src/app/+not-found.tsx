import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/shared/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, isDarkMode);

  const primaryGradientColors = isDarkMode
    ? ['#0047FF', '#00D1FF'] as const
    : [(theme.primary || '#0047FF'), (theme.second || '#3B82F6')] as const;

  const iconColor = isDarkMode ? "#00D1FF" : (theme.primary || "#0047FF");

  const handleGoHome = () => {
    if (router.canGoBack()) {
      router.replace('/(tabs)');
    } else {
      router.replace('/');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada', headerShown: false }} />
      <LinearGradient
        colors={theme.primaryGradient || (isDarkMode ? ['#0A1931', '#112240', '#050D1A'] : ['#FFFFFF', '#F8F9FA', '#FFFFFF'])}
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top + 16, 36), paddingBottom: Math.max(insets.bottom + 16, 24) }
        ]}
      >
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <View style={styles.brandHeader}>
          <Ionicons name="shield-checkmark" size={26} color={iconColor} style={{ marginRight: 8 }} />
          <Text style={styles.brandTitle}>Conf</Text>
          <Text style={styles.brandHighlight}>-U</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.iconGlowOuter}>
            <View style={styles.iconContainer}>
              <Ionicons name="compass-outline" size={56} color={iconColor} />
            </View>
          </View>
          <View style={styles.errorBadge}>
            <Text style={styles.errorCode}>404</Text>
          </View>
          <Text style={styles.title}>Página Não Encontrada</Text>
          <Text style={styles.description}>
            Ops! A rota que você tentou acessar não existe ou foi movida no sistema de navegação do Conf-IA.
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleGoHome}
            >
              <LinearGradient
                colors={primaryGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="home-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>Voltar para o Início</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }}
            >
              <Ionicons name="arrow-back" size={20} color={theme.text || (isDarkMode ? "#FFFFFF" : "#2C2B30")} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryButtonText}>Voltar à tela anterior</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="location-outline" size={14} color={styles.footerText.color} style={{ marginRight: 4 }} />
          <Text style={styles.footerText}>Sistema de Alertas e Prevenção Climática</Text>
        </View>
      </LinearGradient>
    </>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brandHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    brandTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme?.text || (isDark ? '#FFFFFF' : '#2C2B30'),
      letterSpacing: 0.5,
    },
    brandHighlight: {
      fontSize: 22,
      fontWeight: '800',
      color: isDark ? '#00D1FF' : (theme?.primary || '#0047FF'),
      letterSpacing: 0.5,
    },
    cardContainer: {
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 32,
 
   
    },
    iconGlowOuter: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: isDark ? 'rgba(0, 209, 255, 0.12)' : 'rgba(0, 71, 255, 0.08)',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(0, 209, 255, 0.25)' : 'rgba(0, 71, 255, 0.18)',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 71, 255, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 71, 255, 0.1)',
    },
    errorBadge: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(0, 209, 255, 0.15)' : 'rgba(0, 71, 255, 0.1)',
      marginBottom: 12,
    },
    errorCode: {
      fontSize: 38,
      fontWeight: '900',
      color: isDark ? '#00D1FF' : (theme?.primary || '#0047FF'),
      letterSpacing: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme?.text || (isDark ? '#FFFFFF' : '#2C2B30'),
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: theme?.subtext || (isDark ? 'rgba(255, 255, 255, 0.7)' : '#616A78'),
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    actionsContainer: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: isDark ? '#00D1FF' : (theme?.primary || '#0047FF'),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonGradient: {
      height: 52,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    secondaryButton: {
      height: 52,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F4F5F7',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E2E8F0',
      paddingHorizontal: 20,
    },
    secondaryButtonText: {
      color: theme?.text || (isDark ? '#FFFFFF' : '#2C2B30'),
      fontSize: 14,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    footerText: {
      fontSize: 12,
      color: theme?.subtext || (isDark ? 'rgba(255, 255, 255, 0.4)' : '#858D99'),
      letterSpacing: 0.3,
    },
  });
