import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

import { Feather, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useRouter } from 'expo-router';
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import Toast from 'react-native-toast-message';
import styles from './style';

export default function Cadastro() {

    type FormData = { email: string; password: string };
    const schema = yup.object({
        email: yup.string().email("Email inválido").required("Inform seu email"),
        password: yup.string().min(6, "Senha deve ter pelo menos 6 caracteres").required("Informe sua senha"),
    })
    type RootParamList = {
        index: undefined;
        "features/Login/index": undefined;
        "features/home/index": undefined;
        Home: undefined;
        Carrosel: undefined;
    };
    type NavigationProps = StackNavigationProp<RootParamList>;

    const router = useRouter();
    const navigation = useNavigation<NavigationProps>();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });


    const handleCadastro = async (data: FormData) => {
        setLoading(true);
        try {
            const { error } = await supabaseConfig.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                Toast.show({
                    type: "error",
                    text1: "Falha no acesso",
                    text2:
                        error.message === "Invalido o acesso de credenciais"
                            ? "E-mail ou senha incorretos."
                            : error.message,
                });
                setLoading(false);
            } else {
                router.replace("/(tabs)");
            }
        } catch (err) {
            Toast.show({
                type: "error",
                text1: "Erro inesperado",
                text2: "Tente novamente mais tarde.",
            });
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="shield-checkmark" size={40} color="#4F46E5" />
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
                                        errors.email && { borderColor: "#FF4136" },
                                    ]}
                                >
                                    <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="seu.email@exemplo.com"
                                        placeholderTextColor="#CBD5E1"
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
                                        errors.password && { borderColor: "#FF4136" },
                                    ]}
                                >
                                    <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Sua senha"
                                        placeholderTextColor="#CBD5E1"
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
                                            color="#94A3B8"
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
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        errors.password && { borderColor: "#FF4136" },
                                    ]}
                                >
                                    <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirme sua senha"
                                        placeholderTextColor="#CBD5E1"
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
                                            color="#94A3B8"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.password && (
                            <Text style={styles.labelError}>{errors.password.message}</Text>
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
    );
}