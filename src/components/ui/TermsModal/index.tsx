import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';
import { createTerms } from '@/src/shared/service/termsService';
import { supabaseConfig } from '@/src/config/supabase';

export interface TermsModalProps {
  visible?: boolean;
  onClose?: () => void;
  onAccept?: () => void;
  buttonText?: string;
}

export function TermsModal({
  visible,
  onClose,
  onAccept,
  buttonText = "Li e Concordo",
}: TermsModalProps) {
 const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#0047FF");

  const handleConfirm = async () => {
    try {
      await createTerms();
      if (onAccept) onAccept();
      if (onClose) onClose();
    } catch (error) {
      console.error("Erro ao aceitar os termos:", error);
    }
  };

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
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="document-text" size={24} color={iconColor} />
                <Text style={styles.modalTitle}>Termos de Serviço</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={22} color={isDarkMode ? "#FFFFFF" : "#333333"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.lastUpdated}>Última atualização: Agosto de 2026</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
                <Text style={styles.paragraph}>
                  Ao acessar ou utilizar o aplicativo Conf-IA-, você concorda expressamente em cumprir e estar vinculado aos presentes Termos de Serviço e à nossa Política de Privacidade.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Propósito e Uso da Plataforma</Text>
                <Text style={styles.paragraph}>
                  O Conf-IA- é uma ferramenta colaborativa desenvolvida para facilitar a comunicação e o envio de alertas comunitários em tempo real. O aplicativo destina-se a fins informativos e preventivos de segurança.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Responsabilidade pelas Informações</Text>
                <Text style={styles.paragraph}>
                  O usuário é inteiramente responsável pelo conteúdo de qualquer ocorrência ou comentário reportado. É expressamente proibido enviar relatos falsos, enganosos, difamatórios ou incitadores de violência. O envio deliberado de dados incorretos poderá acarretar a suspensão imediata da conta e responsabilização legal.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Privacidade e Geolocalização</Text>
                <Text style={styles.paragraph}>
                  Para o funcionamento ideal dos alertas comunitários, o Conf-IA- solicita acesso à sua localização geográfica em tempo real. Os seus dados são tratados com rigor de acordo com a Lei Geral de Proteção de Dados (LGPD) e não serão comercializados com terceiros.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Reputação do Usuário (Trust Score)</Text>
                <Text style={styles.paragraph}>
                  O sistema de pontuação de confiança avalia a precisão e utilidade das suas colaborações na comunidade. Usuários com alto índice de confiança ajudam a validar alertas de maior prioridade na plataforma.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Alterações dos Termos</Text>
                <Text style={styles.paragraph}>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento para refletir atualizações no serviço ou exigências legais. Notificaremos os usuários sobre alterações significativas através do aplicativo.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}


export { TermsModal as TermsModel };
export default TermsModal;
