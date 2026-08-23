import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from 'expo-router';
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/src/shared/constants/theme';
import Toast from 'react-native-toast-message';
import getStyles from './style';
import { supabaseConfig } from "@/src/config/supabase";
import { registerSchema } from '@/src/shared/yup';
import { Load } from '@/src/components/ui/Load';
import { TermsModal } from '@/src/components/ui/TermsModal';
import { createTerms } from '@/src/shared/service/termsService';

export default function RegisterScreen() {
  type FormData = yup.InferType<typeof registerSchema>;

  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#3AA77A");
  const placeholderColor = isDarkMode ? "rgba(255, 255, 255, 0.6)" : "#858D99";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
  });

  const executeCadastro = async (data: FormData) => {
    try {
      setLoading(true);
      const { error } = await supabaseConfig.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Erro no cadastro",
          text2: error.message,
        });
        console.log(error);
        return;
      }

      
      await createTerms();

      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Conta criada com sucesso!",
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Erro inesperado",
        text2: "Tente novamente mais tarde.",
      });
    }
  };

  const handleCadastro = async (data: FormData) => {
    if (!hasAcceptedTerms) {
      setPendingFormData(data);
      setIsTermsModalVisible(true);
      Toast.show({
        type: "info",
        text1: "Termos de Serviço",
        text2: "Por favor, leia e aceite os termos para concluir seu cadastro.",
      });
      return;
    }

    await executeCadastro(data);
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setIsTermsModalVisible(false);
    if (pendingFormData) {
      executeCadastro(pendingFormData);
      setPendingFormData(null);
    }
  };

  return (
    <LinearGradient
      colors={theme.primaryGradient}
      style={styles.container}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Load visible={loading} message="Criando sua conta..." subMessage="Por favor, aguarde" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>

            <View style={styles.iconWrapper}>
              <Ionicons name="person-add-outline" size={38} color={iconColor} />
            </View>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Conf</Text>
              <Text style={styles.logoIa}>-U</Text>
            </View>
            <Text style={styles.title}>Crie sua conta</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && { borderColor: "#D74247" },
                    ]}
                  >
                    <Ionicons name="mail-outline" size={20} color={iconColor} />
                    <TextInput
                      style={styles.input}
                      placeholder="seu.email@exemplo.com"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={styles.labelError}>{errors.email.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.password && { borderColor: "#D74247" },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={iconColor} />
                    <TextInput
                      style={styles.input}
                      placeholder="Sua senha"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={iconColor}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.labelError}>{errors.password.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirme sua senha</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.confirmPassword && { borderColor: "#D74247" },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={iconColor} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirme sua senha"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={iconColor}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.labelError}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Ao continuar, você concorda com nossos{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => setIsTermsModalVisible(true)}
                >
                  Termos
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmit(handleCadastro)}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
        onAccept={handleAcceptTerms}
      />
    </LinearGradient>
  );
}
