import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useAppTheme } from '@/src/shared/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '@/src/components/ui/Input';
import { getStyles } from './style';
import * as yup from 'yup';
import { profileSchema } from '@/src/shared/yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from 'react-hook-form';
import { supabaseConfig } from '@/src/config/supabase';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { updateProfile, getProfile, uploadAvatar } from '@/src/shared/service/profileService';
import { Load } from '@/src/components/ui/Load';

export default function EditProfileScreen() {
  type FormData = yup.InferType<typeof profileSchema>;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(profileSchema),
  });

  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [raioNotificacao, setRaioNotificacao] = useState(5);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { data: { user } } = await supabaseConfig.auth.getUser();
        if (!user) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Usuário não autenticado',
          });
          return;
        }
        const profileData = await getProfile(user.id);
        if (profileData) {
          reset({
            name: profileData.perfil_nome_completo || '',
            cellphone: profileData.perfil_telefone || '',
            city: profileData.perfil_cidade || '',
            state: profileData.perfil_estado || '',
          });
          setAvatarUrl(profileData.perfil_avatar_url || null);
          if (profileData.perfil_latitude && profileData.perfil_longitude) {
            setLocation({
              latitude: profileData.perfil_latitude,
              longitude: profileData.perfil_longitude,
            });
          }
          if (profileData.perfil_raio_notificacao_km) {
            setRaioNotificacao(profileData.perfil_raio_notificacao_km);
          }
        } else {
          reset({
            name: '',
            cellphone: '',
            city: '',
            state: '',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar perfil',
          text2: error.message,
        });
      }
    };

    loadProfileData();
  }, [reset]);

  const handleGetLocation = async () => {

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Permissão de localização negada',
        });
        return;
      }
      setGettingLocation(true);
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Usuário não autenticado',
        });
        return;
      }

      const { error } = await updateProfile(user.id, {
        perfil_latitude: latitude,
        perfil_longitude: longitude,
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar localização',
          text2: error.message,
        });
        return;
      }

      setLocation({ latitude, longitude });
      Toast.show({
        type: 'success',
        text1: 'Localização atualizada!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao obter localização',
        text2: error.message,
      });
    } finally {
      setGettingLocation(false);
    }
  }

  const handleSelectAndUploadAvatar = async () => {
    try {
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Usuário não autenticado',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      if (!file.base64) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar a imagem selecionada.',
        });
        return;
      }

      setUploading(true);
      const fileExt = file.uri.split('.').pop() || 'jpeg';
      const publicUrl = await uploadAvatar(user.id, file.base64, fileExt);

      if (publicUrl) {
        setAvatarUrl(publicUrl);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Foto de perfil atualizada!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível fazer o upload da foto.',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro no upload',
        text2: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabaseConfig.auth.getUser();
      if (!user) {
        setSaving(false);
        return;
      }
      const { error } = await updateProfile(user.id, {
        perfil_nome_completo: data.name,
        perfil_telefone: data.cellphone,
        perfil_cidade: data.city,
        perfil_estado: data.state,
        perfil_latitude: location?.latitude,
        perfil_longitude: location?.longitude,
        perfil_raio_notificacao_km: raioNotificacao,
      });
      setSaving(false);
      if (error) {
        Toast.show({ type: "error", text1: "Erro ao salvar", text2: error.message });
        return;
      }

      Toast.show({ type: "success", text1: "Perfil atualizado!" });
      router.back();
    } catch (error: any) {
      setSaving(false);
      Toast.show({ type: "error", text1: "Erro ao salvar", text2: error.message });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Load
        visible={saving || uploading}
        message={saving ? "Salvando perfil..." : "Enviando foto..."}
        subMessage="Por favor, aguarde"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Informações</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleSelectAndUploadAvatar} activeOpacity={0.8}>
              <View style={styles.avatar}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 48 }} />
                ) : (
                  <Ionicons name="person" size={54} color="#FFFFFF" />
                )}
                {uploading && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 48 }}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleSelectAndUploadAvatar}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome Completo"
                  iconName="person-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu nome"
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="cellphone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Telefone"
                  iconName="call-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="(00) 0 0000-0000"
                  keyboardType="phone-pad"
                  error={errors.cellphone?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Localização"
                  iconName="location-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Sua cidade"
                  error={errors.city?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Estado"
                  iconName="location-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu estado"
                  error={errors.state?.message}
                />
              )}
            />

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={gettingLocation}
              activeOpacity={0.8}
            >
              {gettingLocation ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons
                  name={location ? 'checkmark-circle' : 'locate'}
                  size={18}
                  color="#FFFFFF"
                />
              )}
              <Text style={styles.locationButtonText}>
                {gettingLocation
                  ? 'Obtendo localização...'
                  : location
                    ? 'Localização capturada'
                    : 'Usar minha localização atual'}
              </Text>
            </TouchableOpacity>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                Raio de notificação: {raioNotificacao} km
              </Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={raioNotificacao}
                onValueChange={setRaioNotificacao}
                minimumTrackTintColor="#3069E8"
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor="#FFFFFF"
              />
              <View style={styles.sliderRange}>
                <Text style={styles.sliderRangeText}>1 km</Text>
                <Text style={styles.sliderRangeText}>50 km</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(handleSave)}>
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}