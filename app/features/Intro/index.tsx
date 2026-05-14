import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './style';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    icon: 'alert-circle',
    title: 'Alertas em Tempo Real',
    description:
      'Receba notificações personalizadas sobre riscos climáticos na sua localização.',
    color: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: 2,
    icon: 'map',
    title: 'Mapa de Riscos',
    description:
      'Visualize em tempo real as áreas de risco com classificação por nível de gravidade.',
    color: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: 3,
    icon: 'add-circle',
    title: 'Reporte Comunitário',
    description:
      'Contribua com a comunidade reportando eventos e situações de risco observadas.',
    color: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: 4,
    icon: 'analytics',
    title: 'Análise Inteligente',
    description:
      'IA integrada analisa dados climáticos para prever riscos com antecedência.',
    color: '#EEF2FF',
    iconColor: '#4F46E5',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/features/Login');
    }
  };

  const handleSkip = () => {
    router.replace('/features/Login');
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
            <Ionicons name={slide.icon} size={90} color={slide.iconColor} />
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

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

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Começar Agora' : 'Próximo'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Passo {currentSlide + 1} de {slides.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
