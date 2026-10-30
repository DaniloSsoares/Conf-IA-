import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportValidation } from '@/src/shared/types/report';
import { useViewHistoryStyles } from '../styles';
import { Divider } from './MetaRow';

interface CommentListProps {
  comentarios: ReportValidation[];
  currentUserId: string;
}

export function CommentList({ comentarios, currentUserId }: CommentListProps) {
  const { styles } = useViewHistoryStyles();
  if (comentarios.length === 0) return null;

  return (
    <>
      <Text style={[styles.sectionTitle, styles.voteSectionTitle]}>Comentários da comunidade</Text>
      <View style={styles.metaSection}>
        {comentarios.map((v, index) => (
          <View key={v.perfil_id}>
            {index > 0 && <Divider />}
            <CommentItem validacao={v} isMine={v.perfil_id === currentUserId} />
          </View>
        ))}
      </View>
    </>
  );
}

function CommentItem({ validacao, isMine }: { validacao: ReportValidation; isMine: boolean }) {
  const { styles } = useViewHistoryStyles();
  const confirma = validacao.validacao_tipo === 'confirma';

  return (
    <View style={styles.commentRow}>
      <Ionicons
        name={confirma ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={confirma ? '#10B981' : '#EF4444'}
      />
      <View style={styles.commentBody}>
        <Text style={styles.commentText}>{validacao.validacao_comentario}</Text>
        {/* Sem nome por enquanto (LGPD): o primeiro nome virá da view perfil_publico */}
        <Text style={styles.commentMeta}>
          {isMine ? 'Você' : 'Morador da região'} · {new Date(validacao.created_at).toLocaleString('pt-BR')}
        </Text>
      </View>
    </View>
  );
}
