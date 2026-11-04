import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';
import { createTerms, DATA_TERMOS, VERSAO_TERMOS } from '@/src/shared/service/termsService';

interface SecaoTermos {
  titulo: string;
  paragrafos: string[];
  itens?: string[];
}

// O texto descreve só o que o app faz de verdade. Ao mudar qualquer regra aqui,
// suba VERSAO_TERMOS em termsService.ts para todos aceitarem de novo.
const SECOES: SecaoTermos[] = [
  {
    titulo: '1. Aceitação dos Termos',
    paragrafos: [
      'Ao criar uma conta ou utilizar o Conf-IA, você concorda com estes Termos de Uso, incluindo as regras de privacidade descritas na seção 6.',
    ],
  },
  {
    titulo: '2. Propósito do Aplicativo',
    paragrafos: [
      'O Conf-IA é uma ferramenta colaborativa para que moradores reportem e validem ocorrências na sua região (como alagamentos, deslizamentos, bloqueios de via, quedas de galho, falta de luz e fogo em mata) e acompanhem alertas próximos.',
      'As informações têm caráter informativo e preventivo e não substituem os órgãos oficiais. Em caso de emergência, ligue para a Defesa Civil (199) ou para o Corpo de Bombeiros (193).',
    ],
  },
  {
    titulo: '3. Regras de Conduta',
    paragrafos: ['Ao enviar reportes, fotos e comentários, é proibido:'],
    itens: [
      'Enviar relatos falsos, enganosos ou de teste.',
      'Enviar fotos que exponham pessoas, placas de veículos ou o interior de residências.',
      'Publicar conteúdo ofensivo, discriminatório, difamatório ou que incite violência.',
      'Divulgar dados pessoais de outras pessoas, como telefone ou endereço.',
      'Enviar spam, propaganda ou o mesmo conteúdo repetidas vezes.',
    ],
  },
  {
    titulo: '4. Validação e Moderação pela Comunidade',
    paragrafos: [
      'Os reportes são validados pelos próprios moradores, e o conteúdo inadequado é moderado de forma automática:',
    ],
    itens: [
      'Outros usuários podem confirmar ou contestar cada reporte. A partir de 3 votos, um reporte com 70% ou mais de confirmações passa a "Validado", e um reporte com menos de 30% passa a "Rejeitado" e deixa de aparecer no mapa.',
      'Qualquer usuário pode denunciar um reporte ou comentário. A sua identidade não é mostrada aos outros usuários. Quando um conteúdo recebe 3 denúncias de pessoas diferentes, ele é ocultado automaticamente para a comunidade; o autor continua vendo o conteúdo no próprio histórico.',
      'Cada usuário pode enviar até 5 reportes por hora.',
      'A foto de um novo reporte deve ser tirada com a câmera no momento do envio, como registro da ocorrência.',
      'Comentários têm no máximo 500 caracteres.',
      'A equipe responsável pelo projeto pode remover conteúdos ou contas que violem estes termos.',
    ],
  },
  {
    titulo: '5. Responsabilidade pelas Informações',
    paragrafos: [
      'Você é responsável pelo conteúdo que envia. As informações publicadas pela comunidade podem conter erros ou estar desatualizadas: confira a situação no local e as orientações dos órgãos oficiais antes de tomar decisões.',
    ],
  },
  {
    titulo: '6. Privacidade e Dados Pessoais (LGPD)',
    paragrafos: [
      'Tratamos os seus dados de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):',
    ],
    itens: [
      'Coletamos os dados do seu perfil (nome, e-mail e, se você informar, telefone e cidade), a localização no momento de cada reporte e as fotos e comentários que você envia.',
      'A sua localização é usada para registrar onde a ocorrência aconteceu e para mostrar o que está próximo de você no mapa.',
      'Outros usuários veem o reporte (categoria, descrição, foto, local e data) e, nos comentários, apenas o seu primeiro nome. O seu e-mail e o seu telefone não são exibidos no aplicativo.',
      'Seus dados não são vendidos nem compartilhados com terceiros para fins comerciais.',
      'Você pode corrigir os dados do seu perfil a qualquer momento e pode solicitar à equipe responsável pelo projeto o acesso ou a exclusão dos seus dados.',
    ],
  },
  {
    titulo: '7. Alterações destes Termos',
    paragrafos: [
      'Estes termos podem ser atualizados para refletir mudanças no aplicativo ou exigências legais. Quando houver uma alteração, o aplicativo pedirá que você leia e aceite a nova versão.',
    ],
  },
];

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
              <Text style={styles.lastUpdated}>
                Última atualização: {DATA_TERMOS} · Versão {VERSAO_TERMOS}
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
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}


export { TermsModal as TermsModel };
export default TermsModal;
