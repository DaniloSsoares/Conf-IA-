import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/features/Intro'); 
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={64} color="#FFFFFF" />
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Conf</Text>
          <Text style={styles.logoIa}>-IA</Text>
        </View>
        <Text style={styles.subtitle}>Prevenção de Desastres Climáticos</Text>
      </View>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F46E5', // Indigo-600
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
    color: '#818CF8', // Indigo-400
    marginLeft: 2,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF', // Indigo-100
    marginTop: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loader: {
    marginBottom: 40,
  },
});

