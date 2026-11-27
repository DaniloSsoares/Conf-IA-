import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/src/shared/constants/theme';
import { supabaseConfig } from '@/src/config/supabase';

// Tempo mínimo da tela de abertura, só para o logo não "piscar"
const ABERTURA_MINIMA_MS = 800;

export default function Index() {
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();

  // O Supabase guarda a sessão no aparelho (persistSession). Com sessão, vai direto
  // para o app; sem sessão, para a Intro. Antes, o app pedia login toda vez que abria
  useEffect(() => {
    let ativo = true;

    const decidirRota = async () => {
      const [{ data: { session } }] = await Promise.all([
        supabaseConfig.auth.getSession(), // lê do aparelho, não faz chamada de rede
        new Promise((resolve) => setTimeout(resolve, ABERTURA_MINIMA_MS)),
      ]);
      if (!ativo) return;
      router.replace(session ? '/(tabs)' : '/(auth)/Intro');
    };

    decidirRota();
    return () => {
      ativo = false;
    };
  }, [router]);

  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#3AA77A");
  const textColor = isDarkMode ? "#FFFFFF" : (theme.text || "#2C2B30");
  const iaColor = isDarkMode ? "rgba(255, 255, 255, 0.8)" : (theme.primary || "#3AA77A");

  return (
    <LinearGradient
      colors={theme.primaryGradient}
      style={styles.container}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(58, 167, 122, 0.12)' }]}>
          <Ionicons name="shield-checkmark" size={64} color={iconColor} />
        </View>

        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: textColor }]}>Conf</Text>
          <Text style={[styles.logoIa, { color: iaColor }]}>-U</Text>
        </View>

        <Text style={[styles.subtitle, { color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#616A78' }]}>Prevenção de Desastres Climáticos</Text>
      </View>

      <ActivityIndicator size="large" color={theme.primary || "#3AA77A"} style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    borderRadius: 30,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoIa: {
    fontSize: 48,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)', 
    marginLeft: 2,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loader: {
    marginBottom: 40,
  },
});
