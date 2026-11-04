import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useViewHistoryStyles } from '../styles';

interface ReportFlagProps {
  jaDenunciado: boolean;
  onPress: () => void;
  /** Só o ícone (em cada comentário) ou ícone + texto (no reporte) */
  compacto?: boolean;
}

// Botão "Denunciar": discreto de propósito, para não virar o botão mais chamativo da tela
export function ReportFlag({ jaDenunciado, onPress, compacto = false }: ReportFlagProps) {
  const { styles, isDarkMode } = useViewHistoryStyles();
  const cor = jaDenunciado ? '#F5A623' : isDarkMode ? 'rgba(255,255,255,0.5)' : '#858D99';

  return (
    <TouchableOpacity
      style={styles.reportFlag}
      onPress={onPress}
      disabled={jaDenunciado}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={jaDenunciado ? 'Conteúdo já denunciado' : 'Denunciar conteúdo'}
    >
      <Ionicons name={jaDenunciado ? 'flag' : 'flag-outline'} size={compacto ? 14 : 15} color={cor} />
      {!compacto && (
        <Text style={[styles.reportFlagText, { color: cor }]}>
          {jaDenunciado ? 'Denunciado' : 'Denunciar'}
        </Text>
      )}
    </TouchableOpacity>
  );
}
