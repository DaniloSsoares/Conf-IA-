import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';
import { Profile } from '@/src/shared/types/profile';
import { 
  anonimizarPerfil, 
  getPerfisAnonimizadosSupabase, 
  ProfileAnonimizado 
} from '@/src/shared/service/anonymizationService';
import Toast from 'react-native-toast-message';

export interface AnonymizationModalProps {
  visible?: boolean;
  onClose?: () => void;
  profile: Profile | null;
}

export function AnonymizationModal({
  visible,
  onClose,
  profile,
}: AnonymizationModalProps) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const iconColor = isDarkMode ? "#60A5FA" : (theme.primary || "#0047FF");

  const [loading, setLoading] = useState(false);
  const [dbResults, setDbResults] = useState<ProfileAnonimizado[] | null>(null);

  if (!visible) return null;

  // Aplica a função de anonimização no perfil do usuário atual
  const perfilAnonimo = profile ? anonimizarPerfil(profile) : null;

  const handleTestSupabase = async () => {
    try {
      setLoading(true);
      const perfis = await getPerfisAnonimizadosSupabase();
      setDbResults(perfis);

      Toast.show({
        type: 'success',
        text1: 'Anonimização Concluída',
        text2: `${perfis.length} registros buscados e anonimizados do Supabase.`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro na Anonimização',
        text2: err.message || 'Não foi possível buscar dados do Supabase.',
      });
    } finally {
      setLoading(false);
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="shield-checkmark" size={24} color={iconColor} />
                <Text style={styles.modalTitle}>Privacidade e LGPD</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color={isDarkMode ? "#FFFFFF" : "#333333"} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.subtitle}>
                Demonstração prática de como os dados pessoais do projeto são anonimizados para estatísticas e relatórios sem violar a LGPD.
              </Text>

              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>Comparativo: Dados Sensíveis vs. Dados Anonimizados</Text>
              </View>

              {/* Card Nome */}
              <View style={styles.comparisonCard}>
                <Text style={styles.cardLabel}>Nome Completo (Mascaramento)</Text>
                <View style={styles.row}>
                  <Text style={styles.originalValue}>{profile?.perfil_nome_completo || 'N/A'}</Text>
                  <Ionicons name="arrow-forward" size={16} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                  <Text style={styles.anonValue}>{perfilAnonimo?.nomeMascarado || 'D*** S***'}</Text>
                </View>
              </View>

              {/* Card Telefone */}
              <View style={styles.comparisonCard}>
                <Text style={styles.cardLabel}>Telefone (Mascaramento)</Text>
                <View style={styles.row}>
                  <Text style={styles.originalValue}>{profile?.perfil_telefone || 'N/A'}</Text>
                  <Ionicons name="arrow-forward" size={16} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                  <Text style={styles.anonValue}>{perfilAnonimo?.telefoneMascarado || '*****'}</Text>
                </View>
              </View>

              {/* Card ID */}
              <View style={styles.comparisonCard}>
                <Text style={styles.cardLabel}>Identificador ID (Pseudonimização)</Text>
                <View style={styles.row}>
                  <Text style={styles.originalValue}>
                    {profile?.id ? `${profile.id.substring(0, 8)}...` : 'UUID-Original'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                  <Text style={styles.anonValue}>{perfilAnonimo?.idAnonimo || 'USER-ANON-HASH'}</Text>
                </View>
              </View>

              {/* Card GPS */}
              <View style={styles.comparisonCard}>
                <Text style={styles.cardLabel}>Localização GPS (Generalização)</Text>
                <View style={styles.row}>
                  <Text style={styles.originalValue}>
                    {profile?.perfil_latitude && profile?.perfil_longitude 
                      ? `${profile.perfil_latitude.toFixed(5)}, ${profile.perfil_longitude.toFixed(5)}`
                      : 'GPS Exato'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                  <Text style={styles.anonValue}>
                    {perfilAnonimo?.localizacaoAproximada.latitude !== null
                      ? `${perfilAnonimo?.localizacaoAproximada.latitude}, ${perfilAnonimo?.localizacaoAproximada.longitude}`
                      : 'GPS Reduzido'}
                  </Text>
                </View>
              </View>

              {/* Botão de Testar Supabase */}
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={handleTestSupabase}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.testButtonText}>Buscar do Supabase e Anonimizar</Text>
                  </>
                )}
              </TouchableOpacity>

              {dbResults && dbResults.length > 0 && (
                <View style={[styles.comparisonCard, { marginTop: 12, backgroundColor: isDarkMode ? "#0284C720" : "#E0F2FE" }]}>
                  <Text style={[styles.cardLabel, { color: isDarkMode ? "#38BDF8" : "#0284C7" }]}>
                    Resultado do Supabase ({dbResults.length} registros)
                  </Text>
                  {dbResults.slice(0, 3).map((item, index) => (
                    <View key={index} style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, color: isDarkMode ? "#F1F5F9" : "#1E293B", fontWeight: "600" }}>
                        • {item.idAnonimo} - {item.nomeMascarado} ({item.cidade || 'Sem cidade'})
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
                <Text style={styles.closeFooterButtonText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}
