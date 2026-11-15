import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';
import { createTerms, DATA_TERMOS, VERSAO_TERMOS } from '@/src/shared/service/termsService';

interface SecaoTermos {
  titulo: string;
  paragrafos: string[];
  itens?: string[];
}

const SECOES: SecaoTermos[] = [
  {
    titulo: '1. Acceptance of Terms',
    paragrafos: [
      'By creating an account or using Conf-IA, you agree to these Terms of Use, including the privacy rules described in section 6.',
    ],
  },
  {
    titulo: '2. Purpose of the App',
    paragrafos: [
      'Conf-IA is a collaborative tool that lets residents report and validate incidents in their area (such as flooding, landslides, blocked roads, fallen branches, power outages and wildfires) and follow nearby alerts.',
      'The information is informative and preventive and does not replace official agencies. In an emergency, call the Civil Defense (199) or the Fire Department (193).',
    ],
  },
  {
    titulo: '3. Code of Conduct',
    paragrafos: ['When sending reports, photos and comments, it is forbidden to:'],
    itens: [
      'Send false, misleading or test reports.',
      'Send photos that expose people, vehicle license plates or the inside of homes.',
      'Post offensive, discriminatory or defamatory content, or content that incites violence.',
      "Share other people's personal data, such as phone numbers or addresses.",
      'Send spam, advertising or the same content repeatedly.',
    ],
  },
  {
    titulo: '4. Community Validation and Moderation',
    paragrafos: [
      'Reports are validated by the residents themselves, and inappropriate content is moderated automatically:',
    ],
    itens: [
      'Other users can confirm or dispute each report. From 3 votes on, a report with 70% or more confirmations becomes "Validated", and a report with less than 30% becomes "Rejected" and no longer appears on the map.',
      'Any user can flag a report or comment. Your identity is not shown to other users. When content receives 3 flags from different people, it is automatically hidden from the community; the author can still see it in their own history.',
      'Each user can send up to 5 reports per hour.',
      'The photo of a new report must be taken with the camera at the time of sending, as a record of the incident.',
      'Comments have a maximum of 500 characters.',
      'The project team may remove content or accounts that violate these terms.',
      'When a report is validated, it automatically becomes a community alert, visible to nearby residents. The alert ends if the report is no longer valid.',
    ],
  },
  {
    titulo: '5. Responsibility for Information',
    paragrafos: [
      'You are responsible for the content you send. Information published by the community may contain errors or be outdated: check the situation on site and the guidance from official agencies before making decisions.',
    ],
  },
  {
    titulo: '6. Privacy and Personal Data (LGPD)',
    paragrafos: [
      "We process your data in accordance with Brazil's General Data Protection Law (Law No. 13,709/2018):",
    ],
    itens: [
      'We collect your profile data (name, email and, if you provide them, phone and city), your location at the time of each report, and the photos and comments you send.',
      'Your location is used to record where the incident happened and to show what is near you on the map.',
      'Other users see the report (category, description, photo, place and date) and, in comments, only your first name. Your email and phone are not shown in the app.',
      'Your data is not sold or shared with third parties for commercial purposes.',
      'You can correct your profile data at any time and can ask the project team for access to or deletion of your data.',
    ],
  },
  {
    titulo: '7. Changes to These Terms',
    paragrafos: [
      'These terms may be updated to reflect changes in the app or legal requirements. When there is a change, the app will ask you to read and accept the new version.',
    ],
  },
];

export interface TermsModalProps {
  visible?: boolean;
  obrigatorio?: boolean;
  onRecusar?:()=> void;
  onClose?: () => void;
  onAccept?: () => void;
  buttonText?: string;
}

export function TermsModal({
  visible,
  onClose,
  obrigatorio,
  onRecusar,
  onAccept,
  buttonText = "I Have Read and Agree",
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
      // Obrigatório: o voltar do Android e o toque fora não fecham (só aceitar ou recusar)
      onRequestClose={obrigatorio ? undefined : onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={obrigatorio ? undefined : onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="document-text" size={24} color={iconColor} />
              <Text style={styles.modalTitle}>Terms of Service</Text>
            </View>
            {!obrigatorio && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={22} color={isDarkMode ? "#FFFFFF" : "#333333"} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.lastUpdated}>
              Last updated: {DATA_TERMOS} · Version {VERSAO_TERMOS}
            </Text>

            {SECOES.map((secao) => (
              <View key={secao.titulo} style={styles.section}>
                <Text style={styles.sectionTitle}>{secao.titulo}</Text>
                {secao.paragrafos.map((p) => (
                  <Text key={p} style={styles.paragraph}>{p}</Text>
                ))}
                {secao.itens?.map((item) => (
                  <Text key={item} style={styles.paragraph}>{`•  ${item}`}</Text>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
            {obrigatorio && (
              <TouchableOpacity style={styles.recusarButton} onPress={onRecusar}>
                <Text style={styles.recusarText}>Decline and sign out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}


export { TermsModal as TermsModel };
export default TermsModal;
