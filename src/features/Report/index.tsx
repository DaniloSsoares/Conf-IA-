import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/src/shared/constants/theme';
import { REPORT_CATEGORIES } from '@/src/shared/constants/reportCategories';
import { ReportCategory, ReportLocation } from '@/src/shared/types/report';
import { createReport } from '@/src/shared/service/reportService';
import { HelpModal } from '@/src/components/ui';
import { getStyles } from './styles';
import { supabaseConfig } from '@/src/config/supabase';
import ButtonBack from '@/src/components/ui/ButtonBack';
import { takePhoto } from '@/src/shared/utils/photoPicker';
import { SelectedPhoto } from '@/src/shared/types/photo';
import { getErrorMessage } from '@/src/shared/utils/supabaseErrors';

export default function ReportScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [location, setLocation] = useState<ReportLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [photo, setPhoto] = useState<SelectedPhoto| null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [helpModalVisible, setHelpModalVisible] = useState<boolean>(false);

  // Capturar Localização
  const handleCaptureLocation = async () => {
    setLoadingLocation(true);
    try {
      // 1. Checa a permissão do GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission denied',
          text2: 'Enable location access in settings.',
        });
        return;
      }

      let currentPosition: Location.LocationObject | null = null;

      // 2. Tenta capturar a localização atual com precisão equilibrada
      try {
        currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (gpsError) {
        console.warn('Falha no GPS em tempo real. Tentando última posição conhecida:', gpsError);
        // Fallback L1: Busca a última localização em cache do sistema operacional
        currentPosition = await Location.getLastKnownPositionAsync();
      }

      // Se nem o cache do SO retornar coordenadas, interrompe com aviso claro
      if (!currentPosition) {
        Toast.show({
          type: 'error',
          text1: 'GPS signal unavailable',
          text2: 'Could not get your position. Check that GPS is on.',
        });
        return;
      }

      const { latitude, longitude } = currentPosition.coords;

      // 3. Tenta realizar a geocodificação reversa (L2)
      let addressString = '';
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode) {
          const parts = [geocode.street, geocode.district, geocode.city].filter(Boolean);
          addressString = parts.join(', ');
        }
      } catch (geocodeError) {
        console.warn('Falha na geocodificação reversa, utilizando coordenadas brutas:', geocodeError);
        // Fallback L2: Salva coordenadas brutas em texto
        addressString = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
      }

      // Caso o serviço retorne com sucesso mas sem nomes de rua/bairro (área pouco mapeada)
      if (!addressString.trim()) {
        addressString = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
      }

      setLocation({
        latitude,
        longitude,
        endereco: addressString,
      });

      // Feedback claro ao usuário
      const isRawCoordinates = addressString.startsWith('Lat:');
      Toast.show({
        type: isRawCoordinates ? 'info' : 'success',
        text1: 'Location captured',
        text2: isRawCoordinates
          ? 'Address unavailable. Coordinates saved.'
          : addressString,
      });

    } catch (error) {
      console.error('Erro na captura de localização:', error);
      Toast.show({
        type: 'error',
        text1: 'Location error',
        text2: 'Failed to get your position.',
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  // Enviar Reporte
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Toast.show({
        type: 'info',
        text1: 'Select a category',
        text2: 'Choose what kind of incident is happening.',
      });
      return;
    }

    if (!location) {
      Toast.show({
        type: 'info',
        text1: 'Location required',
        text2: 'Tap capture location to tell us where it happened.',
      });
      return;
    }

    try {
      setSubmitting(true);

      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) return;

      const { data, error } = await createReport(user.id, {
        reporte_tipo_ocorrencia: selectedCategory,
        reporte_descricao: description.trim() || undefined,
        reporte_latitude: location.latitude,
        reporte_longitude: location.longitude,
        reporte_endereco: location.endereco,
        fotoBase64: photo?.base64,
        fotoExt: photo?.ext,
      });

      if (error) {
        console.error('Erro ao criar reporte:', error);   
        Toast.show({
          type: 'error',
          text1: 'Error sending report',
          text2: getErrorMessage(error, 'An error occurred while saving the report'),
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Report sent!',
        text2: 'The incident was successfully reported.',
      });

      // Limpar formulário
      setSelectedCategory(null);
      setLocation(null);
      setDescription('');
      setPhoto(null);

    } catch (err: any) {
      console.error('Erro ao submeter reporte:', err);
      Toast.show({
        type: 'error',
        text1: 'Unexpected error',
        text2: 'Could not send your report. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>

        {/* Header Bar */}
        <View style={styles.header}>
         <ButtonBack/>
          <Text style={styles.headerTitle}>Report an incident</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHelpModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Seção Categoria */}
          <View style={styles.sectionCategory}>
            <Text style={styles.subtitle}>New report</Text>
            <Text style={styles.title}>What is happening?</Text>

            <View style={styles.categoryGrid}>
              {REPORT_CATEGORIES.map((item) => {
                const isSelected = selectedCategory === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoryCard,
                      item.fullWidth && styles.categoryCardFullWidth,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => setSelectedCategory(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={26}
                      color={theme.primary}
                      style={styles.categoryIcon}
                    />
                    <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Seção Localização */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>

            <TouchableOpacity
              style={[styles.locationButton, location && styles.locationButtonCaptured]}
              onPress={handleCaptureLocation}
              activeOpacity={0.8}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <View style={styles.row}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={styles.buttonText}>Getting current location...</Text>
                </View>
              ) : location ? (
                <View style={styles.capturedContainer}>
                  <View style={styles.capturedInfo}>
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                    <View style={styles.textContainer}>
                      <Text style={styles.capturedTitle}>Location captured</Text>
                      <Text style={styles.capturedSub} numberOfLines={1}>
                        {location.endereco || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recaptureBadge}>
                    <Ionicons name="refresh-outline" size={16} color={theme.primary} />
                  </View>
                </View>
              ) : (
                <View style={styles.row}>
                  <Ionicons name="scan-outline" size={22} color={theme.primary} />
                  <Text style={styles.buttonText}>Tap to capture current location</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Seção Detalhes Adicionais */}
          <View style={styles.sectionContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Additional details (optional)</Text>
              <Text style={styles.counterText}>{description.length}/500</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the situation in a few words..."
              placeholderTextColor={theme.placeholderText}
              multiline
              numberOfLines={4}
              maxLength={500}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          {/* Seção Adicionar Foto */}
          <View style={styles.sectionContainer}>
            {photo ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhoto(null)} activeOpacity={0.8}>
                  <Ionicons name="close" size={18} color={theme.buttonText} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dashedCard}
                onPress={async () =>{ const foto = await takePhoto();
                  if(foto)setPhoto(foto);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={22} color={theme.primary} />
                <Text style={styles.buttonText}>Take Photo (optional)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão Enviar Reporte */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <View style={styles.row}>
                <ActivityIndicator size="small" color={theme.buttonText} />
                <Text style={styles.submitButtonText}>Enviando...</Text>
              </View>
            ) : (
              <View style={styles.row}>
                <Ionicons name="send-outline" size={20} color={theme.buttonText} style={styles.sendIcon} />
                <Text style={styles.submitButtonText}>Submit report</Text>
              </View>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* Componente Reutilizável de Modal de Ajuda */}
      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title='How does reporting work?'
        description={`1. Select the incident category.\n2. Capture your precise location via GPS.\n3. Optionally, add a description and photo.\n4. Submit so other users are alerted in real time.`}
        buttonText='Got it'
      />
    </LinearGradient>
  );
}