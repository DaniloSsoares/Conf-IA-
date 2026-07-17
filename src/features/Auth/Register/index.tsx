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
import { useAppTheme } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';
import styles from './style';
import { supabaseConfig } from "@/src/config/supabase";
import { registerSchema } from '@/src/shared/yup';

export default function RegisterScreen() {
  type FormData = yup.InferType<typeof registerSchema>;

  const router = useRouter();
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
  });

  const handleCadastro = async (data: FormData) => {
    try {
      setLoading(true);
      const { error } = await supabaseConfig.auth.signUp({
        email: data.email,
        password: data.password,
      });
      setLoading(false);

      if (error) {
        Toast.show({
          type: "error",
          text1: "Erro no cadastro",
          text2: error.message,
        });
        console.log(error);
        return;
      }

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

  return (
    <LinearGradient
      colors={theme.primaryGradient}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.iconWrapper}>
              <Ionicons name="person-add-outline" size={38} color="#FFFFFF" />
            </View>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Conf</Text>
              <Text style={styles.logoIa}>-IA</Text>
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
                      errors.email && { borderColor: "#FF6B6B" },
                    ]}
                  >
                    <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                    <TextInput
                      style={styles.input}
                      placeholder="seu.email@exemplo.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                      errors.password && { borderColor: "#FF6B6B" },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Sua senha"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                        color="#FFFFFF"
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
                      errors.confirmPassword && { borderColor: "#FF6B6B" },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirme sua senha"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.labelError}>{errors.confirmPassword.message}</Text>
              )}
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
    </LinearGradient>
  );
}