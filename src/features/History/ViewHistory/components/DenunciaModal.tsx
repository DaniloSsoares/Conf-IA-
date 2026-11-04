import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMotivosPara } from '@/src/shared/constants/denunciaMotivos';
import { useViewHistoryStyles } from '../styles';
import { Denuncia } from '../useDenuncia';

export function DenunciaModal({ denuncia }: { denuncia: Denuncia }) {
  const { styles, theme } = useViewHistoryStyles();
  const { alvo, enviando, fechar, enviar } = denuncia;
  const iconColor = theme?.primary || '#0047FF';

  const motivos = alvo ? getMotivosPara(alvo.tipo) : [];
  const titulo = alvo?.tipo === 'comentario' ? 'Denunciar comentário' : 'Denunciar reporte';

  return (
    <Modal visible={alvo !== null} transparent animationType="slide" onRequestClose={fechar}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={fechar}>
        {/* View que responde ao toque: tocar dentro do conteúdo não fecha o modal */}
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>{titulo}</Text>
          <Text style={styles.modalSubtitle}>
            A denúncia é anônima. Com 3 denúncias, o conteúdo deixa de aparecer para a comunidade.
          </Text>

          {motivos.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.motivoButton}
              onPress={() => enviar(m.id)}
              disabled={enviando}
            >
              <Ionicons name={m.icon as any} size={20} color={iconColor} />
              <Text style={styles.motivoText}>{m.label}</Text>
            </TouchableOpacity>
          ))}

          {enviando ? (
            <ActivityIndicator style={styles.modalCancel} color={iconColor} />
          ) : (
            <TouchableOpacity style={styles.modalCancel} onPress={fechar}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
