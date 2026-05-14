import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './style';

export default function SplashScreen() {
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
