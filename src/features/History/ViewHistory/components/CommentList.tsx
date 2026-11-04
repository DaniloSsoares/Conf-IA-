import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportComment } from '@/src/shared/types/report';
import { useViewHistoryStyles } from '../styles';
import { Denuncia } from '../useDenuncia';
import { Divider } from './MetaRow';
import { ReportFlag } from './ReportFlag';

interface CommentListProps {
  comentarios: ReportComment[];
  currentUserId: string;
  denuncia: Denuncia;
}

export function CommentList({ comentarios, currentUserId, denuncia }: CommentListProps) {
  const { styles } = useViewHistoryStyles();
  if (comentarios.length === 0) return null;

  return (
    <>
      <Text style={[styles.sectionTitle, styles.voteSectionTitle]}>Comentários da comunidade</Text>
      <View style={styles.metaSection}>
        {comentarios.map((v, index) => (
          <View key={v.id}>
            {index > 0 && <Divider />}
            <CommentItem
              validacao={v}
              isMine={v.perfil_id === currentUserId}
              denuncia={denuncia}
            />
          </View>
        ))}
      </View>
    </>
  );
}

interface CommentItemProps {
  validacao: ReportComment;
  isMine: boolean;
  denuncia: Denuncia;
}

function CommentItem({ validacao, isMine, denuncia }: CommentItemProps) {
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
        {/* Só o primeiro nome (view perfil_publico, LGPD); sem nome → "Morador da região" */}
        <Text style={styles.commentMeta}>
          {isMine ? 'Você' : validacao.autor_nome ?? 'Morador da região'} ·{' '}
          {new Date(validacao.created_at).toLocaleString('pt-BR')}
        </Text>
      </View>

      {/* O banco também impede denunciar o próprio comentário; aqui só não mostra o botão */}
      {!isMine && (
        <ReportFlag
          compacto
          jaDenunciado={denuncia.jaDenunciou(validacao.id)}
          onPress={() => denuncia.abrir({ tipo: 'comentario', id: validacao.id })}
        />
      )}
    </View>
  );
}
