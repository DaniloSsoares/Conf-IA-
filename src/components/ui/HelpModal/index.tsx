import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';

export interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function HelpModal({
  visible,
  onClose,
  title = 'Como funciona o reporte?',
  description = `1. Selecione a categoria da ocorrência.\n2. Capture sua localização precisa via GPS.\n3. Se desejar, adicione uma descrição e foto.\n4. Envie para que outros usuários fiquem alertas em tempo real.`,
  buttonText = 'Entendi',
}: HelpModalProps) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Ionicons name="information-circle" size={32} color={theme.primary || "#0047FF"} />
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <Text style={styles.modalBody}>{description}</Text>

          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
