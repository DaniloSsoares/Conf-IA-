import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import styles from './style';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/Intro'); 
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image source={require('@/src/shared/img/logo.png')} style={styles.logo} />
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Conf</Text>
          <Text style={styles.logoIa}>-U</Text>
        </View>
        <Text style={styles.subtitle}>Prevenção de Desastres Climáticos</Text>
      </View>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    </View>
  );
}
