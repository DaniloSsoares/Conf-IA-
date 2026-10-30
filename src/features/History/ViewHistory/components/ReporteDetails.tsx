import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getStatusStyle, getCategoryMeta } from '@/src/shared/constants/historyStatus';
import { MIN_VOTOS_VALIDACAO, Report } from '@/src/shared/types/report';
import { useViewHistoryStyles } from '../styles';
import { ReportVoting } from '../useReportVoting';
import { MetaRow, Divider } from './MetaRow';
import { VoteSection } from './VoteSection';
import { CommentList } from './CommentList';

interface ReporteDetailsProps {
  reporte: Report;
  isOwner: boolean;
  currentUserId: string;
  voting: ReportVoting;
}

export function ReporteDetails({ reporte, isOwner, currentUserId, voting }: ReporteDetailsProps) {
  const router = useRouter();
  const { styles, theme, isDarkMode } = useViewHistoryStyles();
  const meta = getCategoryMeta(reporte.reporte_tipo_ocorrencia);
  const statusStyle = getStatusStyle(reporte.reporte_status, theme);
  const photoUrl = reporte.reporte_midias?.[0]?.midia_url;
  const iconColor = isDarkMode ? '#FFFFFF' : (theme.primary || '#0047FF');
  const { totalVotos } = voting;

  // banco guarda fração 0.00–1.00 (numeric chega como texto, por isso o Number)
  const scorePct = Math.round(Number(reporte.reporte_score_confianca ?? 0) * 100);

  // Enquanto pendente, mostra quanto falta para o trigger decidir o status
  const votosLabel =
    reporte.reporte_status === 'pendente' && totalVotos < MIN_VOTOS_VALIDACAO
      ? `${totalVotos} de ${MIN_VOTOS_VALIDACAO} necessários`
      : `${totalVotos} ${totalVotos === 1 ? 'voto' : 'votos'}`;

  const handleEdit = () => {
    router.push({
      pathname: '/(screens)/EditReport' as any,
      params: { id: reporte.id, data: JSON.stringify(reporte) },
    });
  };

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.iconRow}>
          <View style={styles.iconBg}>
            <Ionicons name={meta.icon as any} size={24} color={iconColor} />
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <Text style={styles.title}>{meta.label}</Text>

        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
        ) : null}

        {reporte.reporte_descricao ? (
          <Text style={styles.description}>{reporte.reporte_descricao}</Text>
        ) : (
          <Text style={styles.descriptionMuted}>Sem descrição adicional.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Detalhes do Reporte</Text>
      <View style={styles.metaSection}>
        {reporte.reporte_endereco ? (
          <>
            <MetaRow label="Localização" value={reporte.reporte_endereco} />
            <Divider />
          </>
        ) : null}
        <MetaRow label="Score de confiança" value={`${scorePct}%`} />
        <Divider />
        <MetaRow label="Votos da comunidade" value={votosLabel} />
        <Divider />
        <MetaRow label="Enviado em" value={new Date(reporte.created_at).toLocaleString('pt-BR')} />
      </View>

      {isOwner && (
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color={theme.primary || '#3AA77A'} />
          <Text style={styles.editButtonText}>Editar Reporte</Text>
        </TouchableOpacity>
      )}

      <CommentList comentarios={voting.comentarios} currentUserId={currentUserId} />

      {/* Votação por último (como num chat): ao abrir o teclado a tela rola até o fim e o campo fica visível */}
      {!isOwner && reporte.reporte_status !== 'resolvido' && <VoteSection voting={voting} />}
    </>
  );
}
