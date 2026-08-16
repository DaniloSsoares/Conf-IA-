import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/src/shared/constants/theme';
import getStyles from './style';

const slides = [
  {
    id: 1,
    iconName: 'tsunami',
    iconFamily: 'MaterialCommunityIcons',
    title: 'Sua segurança em primeiro lugar.',
    description:
      'Receba alertas em tempo real e colabore com sua comunidade para enfrentar desastres climáticos.',
  },
  {
    id: 2,
    iconName: 'map-outline',
    iconFamily: 'Ionicons',
    title: 'Mapa de Riscos',
    description:
      'Visualize em tempo real as áreas de risco com classificação por nível de gravidade.',
  },
  {
    id: 3,
    iconName: 'megaphone-outline',
    iconFamily: 'Ionicons',
    title: 'Reporte Comunitário',
    description:
      'Contribua com a comunidade reportando eventos e situações de risco observadas.',
  },
  {
    id: 4,
    iconName: 'analytics-outline',
    iconFamily: 'Ionicons',
    title: 'Análise Inteligente',
    description:
      'IA integrada analisa dados climáticos para prever riscos com antecedência.',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const [currentSlide, setCurrentSlide] = useState(0);

  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#3AA77A");

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/Login');
    }
  };

  const handleLogin = () => {
    router.replace('/(auth)/Login');
  };

  const slide = slides[currentSlide];

  return (
    <LinearGradient
      colors={theme.primaryGradient}
      style={styles.container}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="shield-outline" size={28} color={iconColor} />
          <Text style={styles.headerText}>Conf-U</Text>
        </View>

        <View style={styles.content}>
          {/* Icon Circle */}
          <View style={styles.iconCircle}>
            {slide.iconFamily === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons name={slide.iconName as any} size={70} color={iconColor} />
            ) : (
              <Ionicons name={slide.iconName as any} size={70} color={iconColor} />
            )}
          </View>

          {/* Texts */}
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          {/* Dots */}
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Começar Agora' : 'Próximo'}
            </Text>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já possui uma conta? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}
