import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRiskStyle, getCategoryMeta } from '@/src/shared/constants/historyStatus';
import { Alerta, OrigemAlerta } from '@/src/shared/types/notification';
import { useViewHistoryStyles } from '../styles';
import { MetaRow, Divider } from './MetaRow';

const ORIGEM_LABEL: Record<OrigemAlerta, string> = {
  defesa_civil: 'Defesa Civil',
  colaborativo: 'Comunidade',
  sistema_ia: 'Sistema',
};

export function AlertaDetails({ alerta }: { alerta: Alerta }) {
  const { styles, theme, isDarkMode } = useViewHistoryStyles();
  const meta = getCategoryMeta(alerta.alerta_tipo_ocorrencia);
  const risk = getRiskStyle(alerta.alerta_nivel_risco, theme);
  const iconColor = isDarkMode ? '#FFFFFF' : (theme.primary || '#0047FF');

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.iconRow}>
          <View style={styles.iconBg}>
            <Ionicons name={meta.icon as any} size={24} color={iconColor} />
          </View>
          <View style={[styles.badge, { backgroundColor: risk.bg }]}>
            <Text style={styles.badgeText}>{risk.label}</Text>
          </View>
        </View>

        <Text style={styles.title}>{alerta.alerta_titulo || meta.label}</Text>
        {alerta.alerta_descricao ? (
          <Text style={styles.description}>{alerta.alerta_descricao}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Informações</Text>
      <View style={styles.metaSection}>
        <MetaRow label="Tipo de ocorrência" value={meta.label} />
        <Divider />
        <MetaRow
          label="Origem"
          value={alerta.alerta_origem ? ORIGEM_LABEL[alerta.alerta_origem] : 'Sistema'}
        />
        <Divider />
        <MetaRow label="Status do alerta" value={alerta.alerta_status || 'Ativo'} />
        {alerta.alerta_expira_em ? (
          <>
            <Divider />
            <MetaRow
              label="Expira em"
              value={new Date(alerta.alerta_expira_em).toLocaleString('pt-BR')}
            />
          </>
        ) : null}
      </View>
    </>
  );
}
