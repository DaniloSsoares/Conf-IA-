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

export default function IntroScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    minHeight: 420,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 5,
  },
  activeDot: {
    width: 28,
    backgroundColor: '#4F46E5',
  },
  bottomSection: {
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
