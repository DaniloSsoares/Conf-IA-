import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/src/components/ui';
import { useViewHistoryStyles } from '../styles';
import { ReportVoting } from '../useReportVoting';

export function VoteSection({ voting }: { voting: ReportVoting }) {
  const { styles } = useViewHistoryStyles();
  const { myVote, sending, comentario, setComentario, comentarioErro, vote } = voting;

  return (
    <>
      <Text style={[styles.sectionTitle, styles.voteSectionTitle]}>Essa ocorrência é real?</Text>

      <Input
        label="Comentário (opcional)"
        iconName="chatbubble-outline"
        value={comentario}
        onChangeText={setComentario}
        placeholder="Ex.: água na altura do joelho"
        maxLength={500}
        editable={!sending}
        error={comentarioErro}
      />

      <View style={styles.voteRow}>
        <TouchableOpacity
          style={[styles.voteButton, myVote === 'confirma' && styles.voteConfirmActive]}
          onPress={() => vote('confirma')}
          disabled={sending}
        >
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.voteText}>Confirmar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.voteButton, myVote === 'contesta' && styles.voteContestActive]}
          onPress={() => vote('contesta')}
          disabled={sending}
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
          <Text style={styles.voteText}>Contestar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
