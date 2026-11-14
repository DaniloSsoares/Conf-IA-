import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
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
    title: 'Your safety comes first.',
    description:
      'Get real-time alerts and work with your community to face climate disasters.',
  },
  {
    id: 2,
    iconName: 'map-outline',
    iconFamily: 'Ionicons',
    title: 'Risk Map',
    description:
      'See risk areas in real time, classified by severity.',
  },
  {
    id: 3,
    iconName: 'megaphone-outline',
    iconFamily: 'Ionicons',
    title: 'Community Reporting',
    description:
      'Help your community by reporting events and risk situations you see.',
  },
  {
    id: 4,
    iconName: 'analytics-outline',
    iconFamily: 'Ionicons',
    title: 'Smart Analysis',
    description:
      'Built-in AI analyzes climate data to predict risks in advance.',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const [currentSlide, setCurrentSlide] = useState(0);

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
          
          <Image source={require('@/src/shared/img/logo.png')} style={styles.logo} />
        </View>

        <View style={styles.content}>
          {/* Icon Circle */}
          <View style={styles.iconCircle}>
            {slide.iconFamily === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons name={slide.iconName as any} size={70} color={theme.iconPrimary} />
            ) : (
              <Ionicons name={slide.iconName as any} size={70} color={theme.iconPrimary} />
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
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={22} color={theme.buttonText} />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

