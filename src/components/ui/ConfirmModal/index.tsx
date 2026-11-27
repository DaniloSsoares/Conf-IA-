import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

// Confirmação no visual do app, no lugar do Alert.alert nativo (que fica com a cara do
// sistema e não segue o modo escuro). O resultado da ação continua sendo avisado por toast
export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const [executando, setExecutando] = useState(false);

  const corAcao = variant === 'danger' ? theme.alertRed : theme.primary;
  const iconeFinal = icon ?? (variant === 'danger' ? 'warning-outline' : 'help-circle-outline');

  const confirmar = async () => {
    if (executando) return;
    setExecutando(true);
    try {
      await onConfirm();
    } finally {
      setExecutando(false);
    }
  };

  // Durante a ação, não fecha por toque fora nem pelo voltar do Android
  const cancelar = () => {
    if (!executando) onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancelar}>
      <View style={styles.overlay}>
        {/* Fundo irmão do cartão (não pai), como no TermsModal: toque fora fecha */}
        <Pressable style={StyleSheet.absoluteFill} onPress={cancelar} />

        <View style={styles.cartao} accessibilityViewIsModal>
          <View style={[styles.iconeFundo, { backgroundColor: corAcao + '22' }]}>
            <Ionicons name={iconeFinal} size={30} color={corAcao} />
          </View>

          <Text style={styles.titulo}>{title}</Text>
          <Text style={styles.mensagem}>{message}</Text>

          <View style={styles.botoes}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={cancelar}
              disabled={executando}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={styles.textoCancelar}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, { backgroundColor: corAcao }, executando && styles.botaoDesativado]}
              onPress={confirmar}
              disabled={executando}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {executando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.textoConfirmar}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ConfirmModal;
