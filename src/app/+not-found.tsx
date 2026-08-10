import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

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
        colors={theme.primaryGradient || ['#0A1931', '#112240', '#050D1A']}
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top + 20, 40), paddingBottom: Math.max(insets.bottom + 20, 30) }
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header Branding */}
        <View style={styles.brandHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#00D1FF" style={{ marginRight: 8 }} />
          <Text style={styles.brandTitle}>Conf</Text>
          <Text style={styles.brandHighlight}>-IA</Text>
        </View>

        {/* Center Content */}
        <View style={styles.content}>
          {/* Icon Badge */}
          <View style={styles.iconGlowOuter}>
            <View style={styles.iconContainer}>
              <Ionicons name="compass-outline" size={64} color="#00D1FF" />
            </View>
          </View>

          {/* 404 Error Code */}
          <Text style={styles.errorCode}>404</Text>

          {/* Title & Description */}
          <Text style={styles.title}>Página Não Encontrada</Text>
          <Text style={styles.description}>
            Ops! A rota que você tentou acessar não existe ou foi removida do sistema de navegação do Conf-IA.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleGoHome}
            >
              <LinearGradient
                colors={['#0047FF', '#00D1FF']}
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
              activeOpacity={0.8}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryButtonText}>Voltar à tela anterior</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sistema de Alertas e Prevenção Climática</Text>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00D1FF',
    letterSpacing: 0.5,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  iconGlowOuter: {
    padding: 12,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  errorCode: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 209, 255, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
});

