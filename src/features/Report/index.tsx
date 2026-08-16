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

export interface SelectedPhoto {
  uri: string;
  base64?: string;
  ext?: string;
}

export default function ReportScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [location, setLocation] = useState<ReportLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [helpModalVisible, setHelpModalVisible] = useState<boolean>(false);
  const [photoModalVisible, setPhotoModalVisible] = useState<boolean>(false);
  const iconColor = isDarkMode ? "#FFFFFF" : "#2C2B30";
  const primaryColor = theme.primary || "#0047FF";

  // Capturar Localização
  const handleCaptureLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permissão negada',
          text2: 'Precisamos de acesso à localização para registrar o reporte.',
        });
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentPosition.coords;
      let addressString = '';

      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode) {
          const street = geocode.street || geocode.name || '';
          const subregion = geocode.subregion || geocode.district || '';
          const city = geocode.city || geocode.subregion || '';
          const parts = [street, subregion, city].filter(Boolean);
          addressString = parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
      } catch (e) {
        addressString = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
      }

      setLocation({
        latitude,
        longitude,
        endereco: addressString,
      });

      Toast.show({
        type: 'success',
        text1: 'Localização capturada',
        text2: addressString || 'Coordenadas salvas com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao capturar localização:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de Localização',
        text2: 'Não foi possível obter sua localização atual.',
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  // Tirar foto com Câmera
  const handleTakePhoto = async () => {
    setPhotoModalVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permissão necessária',
          text2: 'É preciso permitir acesso à câmera para tirar uma foto.',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uriParts = asset.uri.split('.');
        const ext = uriParts[uriParts.length - 1] || 'jpg';

        setPhoto({
          uri: asset.uri,
          base64: asset.base64 || undefined,
          ext,
        });
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível capturar a foto.',
      });
    }
  };

  // Escolher da Galeria
  const handlePickFromGallery = async () => {
    setPhotoModalVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permissão necessária',
          text2: 'É preciso permitir acesso à galeria para selecionar foto.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uriParts = asset.uri.split('.');
        const ext = uriParts[uriParts.length - 1] || 'jpg';

        setPhoto({
          uri: asset.uri,
          base64: asset.base64 || undefined,
          ext,
        });
      }
    } catch (error) {
      console.error('Erro ao escolher da galeria:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar a foto.',
      });
    }
  };

  // Enviar Reporte
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Toast.show({
        type: 'info',
        text1: 'Selecione uma categoria',
        text2: 'Escolha qual tipo de ocorrência está acontecendo.',
      });
      return;
    }

    if (!location) {
      Toast.show({
        type: 'info',
        text1: 'Localização necessária',
        text2: 'Toque em capturar localização para informar onde ocorreu o evento.',
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
        Toast.show({
          type: 'error',
          text1: 'Erro ao enviar reporte',
          text2: error.message || 'Ocorreu um erro ao salvar o reporte.',
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Reporte enviado!',
        text2: 'A ocorrência foi registrada com sucesso.',
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
        text1: 'Erro inesperado',
        text2: 'Não foi possível enviar seu reporte. Tente novamente.',
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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reportar ocorrência</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHelpModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={26} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Seção Categoria */}
          <View style={styles.sectionCategory}>
            <Text style={styles.subtitle}>Nova ocorrência</Text>
            <Text style={styles.title}>O que está acontecendo?</Text>

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
                      color={primaryColor}
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
              <Ionicons name="location" size={20} color={primaryColor} />
              <Text style={styles.sectionTitle}>Localização</Text>
            </View>

            <TouchableOpacity
              style={[styles.locationButton, location && styles.locationButtonCaptured]}
              onPress={handleCaptureLocation}
              activeOpacity={0.8}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <View style={styles.row}>
                  <ActivityIndicator size="small" color={primaryColor} />
                  <Text style={styles.buttonText}>Obtendo localização atual...</Text>
                </View>
              ) : location ? (
                <View style={styles.capturedContainer}>
                  <View style={styles.capturedInfo}>
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                    <View style={styles.textContainer}>
                      <Text style={styles.capturedTitle}>Localização capturada</Text>
                      <Text style={styles.capturedSub} numberOfLines={1}>
                        {location.endereco || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recaptureBadge}>
                    <Ionicons name="refresh-outline" size={16} color={primaryColor} />
                  </View>
                </View>
              ) : (
                <View style={styles.row}>
                  <Ionicons name="scan-outline" size={22} color={primaryColor} />
                  <Text style={styles.buttonText}>Toque para capturar localização atual</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Seção Detalhes Adicionais */}
          <View style={styles.sectionContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Detalhes adicionais (opcional)</Text>
              <Text style={styles.counterText}>{description.length}/500</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Descreva a situação em poucas palavras..."
              placeholderTextColor={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "#858D99"}
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
                  <Ionicons name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dashedCard}
                onPress={() => setPhotoModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={22} color={primaryColor} />
                <Text style={styles.buttonText}>Adicionar foto (opcional)</Text>
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
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Enviando...</Text>
              </View>
            ) : (
              <View style={styles.row}>
                <Ionicons name="send-outline" size={20} color="#FFFFFF" style={styles.sendIcon} />
                <Text style={styles.submitButtonText}>Enviar reporte</Text>
              </View>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* Componente Reutilizável de Modal de Ajuda */}
      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      {/* Modal de Foto (Câmera / Galeria) */}
      <Modal visible={photoModalVisible} transparent animationType="slide" onRequestClose={() => setPhotoModalVisible(false)}>
        <TouchableOpacity style={styles.photoModalOverlay} activeOpacity={1} onPress={() => setPhotoModalVisible(false)}>
          <View style={styles.photoModalContent}>
            <Text style={styles.photoModalTitle}>Adicionar foto</Text>
            <TouchableOpacity style={styles.photoOptionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={22} color="#3069E8" />
              <Text style={styles.photoOptionText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOptionButton} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={22} color="#3069E8" />
              <Text style={styles.photoOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoCancelButton} onPress={() => setPhotoModalVisible(false)}>
              <Text style={styles.photoCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </LinearGradient>
  );
}