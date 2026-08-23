
import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons } from "@expo/vector-icons";
import { Control, Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { useAppTheme } from "@/src/shared/constants/theme";
import { getStyles } from "./style";
import { changePassSchema } from "@/src/shared/yup";
import { useState } from "react";
import { supabaseConfig } from "@/src/config/supabase";
import Toast from "react-native-toast-message";
import { Button, Modal, View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import Input from "../Input";


type FormData = yup.InferType<typeof changePassSchema>;

export interface ChangePassModelProps {
    visible: boolean;
    onClose: () => void;
}

export function ChangePassModel({ visible, onClose }: ChangePassModelProps) {
    const { theme, isDarkMode } = useAppTheme();
    const styles = getStyles(theme);
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(changePassSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const handleUpdatePassword = async (data: FormData) => {
        try {
            setLoading(true);
            const { error } = await supabaseConfig.auth.updateUser({
                password: data.password,
            });
            if (error) throw error;
            Toast.show({
                type: 'success',
                text1: 'Senha atualizada com sucesso!',
            });
            reset();
            onClose();
        } catch (error) {
            console.log(error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao atualizar senha',
            });
        } finally {
            setLoading(false);
        }

    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >

                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Alterar Senha</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Digite sua nova senha abaixo.</Text>

                    <Controller
                        control={control}
                        name="password"
                        render={
                            ({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder="Digite sua senha"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.password?.message}
                                />
                            )
                        }
                    />
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder="Confirme sua senha"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.confirmPassword?.message}
                            />
                        )}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit(handleUpdatePassword)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Atualizar Senha</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>


        </Modal>
    );
}
