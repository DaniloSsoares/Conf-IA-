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
import styles from './style';
import { supabaseConfig } from "@/src/config/supabase";
import { loginSchema } from '@/src/shared/yup';
import { Load } from '@/src/components/ui/Load';

export default function LoginScreen() {
  type FormData = yup.InferType<typeof loginSchema>;

  const router = useRouter();
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
  });

  const handleLogin = async (data: FormData) => {
    try {
      setLoading(true);
      const { error } = await supabaseConfig.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      setLoading(false);

      if (error) {
        Toast.show({
          type: "error",
          text1: "Falha no acesso",
          text2: error.message.includes("Invalid login credentials")
            ? "E-mail ou senha incorretos."
            : error.message,
        });
        return;
      }

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
  }

  return (
    <LinearGradient
      colors={theme.primaryGradient}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Load visible={loading} message="Autenticando..." subMessage="Conectando à sua conta" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
            </View>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Conf</Text>
              <Text style={styles.logoIa}>-U</Text>
            </View>
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>
              Acesse sua plataforma inteligente de prevenção.
            </Text>
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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmit(handleLogin)}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Conectando...' : 'Entrar na Conta'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={() => {
              router.push('/(auth)/Register');
            }}>
              <Text style={styles.signupButtonText}>Criar nova conta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao continuar, você concorda com nossos{' '}
              <Text style={styles.footerLink}>Termos</Text> e{' '}
              <Text style={styles.footerLink}>Privacidade</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}