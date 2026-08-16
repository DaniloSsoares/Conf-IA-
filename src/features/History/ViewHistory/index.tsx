import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStatusStyle, getRiskStyle, getCategoryMeta } from '@/src/shared/constants/historyStatus';
import { getStyles } from './styles';

type ParamType = 'alerta' | 'reporte';

export default function ViewHistoryScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { type, data } = useLocalSearchParams<{ type: ParamType; data: string }>();

  const iconColor = isDarkMode ? "#FFFFFF" : "#2C2B30";
  const parsed = data ? JSON.parse(data) : null;

  if (!parsed) {
    return (
      <LinearGradient colors={theme.primaryGradient} style={styles.container}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.errorText}>Não foi possível carregar os detalhes.</Text>
      </LinearGradient>
    );
  }

  const isAlerta = type === 'alerta';
  const meta = getCategoryMeta(isAlerta ? parsed.alerta_tipo_ocorrencia : parsed.reporte_tipo_ocorrencia);

  return (
    <LinearGradient colors={theme.primaryGradient} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isAlerta ? 'Detalhes da notificação' : 'Detalhes do reporte'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isAlerta ? (
          <AlertaContent parsed={parsed} meta={meta} theme={theme} styles={styles} isDarkMode={isDarkMode} />
        ) : (
          <ReporteContent parsed={parsed} meta={meta} theme={theme} styles={styles} isDarkMode={isDarkMode} />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function AlertaContent({ parsed, meta, theme, styles, isDarkMode }: any) {
  const risk = getRiskStyle(parsed.alerta_nivel_risco, theme);
  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#0047FF");

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

        <Text style={styles.title}>{parsed.alerta_titulo || meta.label}</Text>
        {parsed.alerta_descricao ? (
          <Text style={styles.description}>{parsed.alerta_descricao}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Informações</Text>
      <View style={styles.metaSection}>
        <MetaRow label="Tipo de ocorrência" value={meta.label} styles={styles} />
        <Divider styles={styles} />
        <MetaRow
          label="Origem"
          value={
            parsed.alerta_origem === 'defesa_civil'
              ? 'Defesa Civil'
              : parsed.alerta_origem === 'colaborativo'
              ? 'Comunidade'
              : 'Sistema'
          }
          styles={styles}
        />
        <Divider styles={styles} />
        <MetaRow label="Status do alerta" value={parsed.alerta_status || 'Ativo'} styles={styles} />
        {parsed.alerta_expira_em ? (
          <>
            <Divider styles={styles} />
            <MetaRow
              label="Expira em"
              value={new Date(parsed.alerta_expira_em).toLocaleString('pt-BR')}
              styles={styles}
            />
          </>
        ) : null}
      </View>
    </>
  );
}

function ReporteContent({ parsed, meta, theme, styles, isDarkMode }: any) {
  const statusStyle = getStatusStyle(parsed.reporte_status, theme);
  const photoUrl = parsed.reporte_midias?.[0]?.midia_url;
  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#0047FF");

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

        {parsed.reporte_descricao ? (
          <Text style={styles.description}>{parsed.reporte_descricao}</Text>
        ) : (
          <Text style={styles.descriptionMuted}>Sem descrição adicional.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Detalhes do Reporte</Text>
      <View style={styles.metaSection}>
        {parsed.reporte_endereco ? (
          <>
            <MetaRow label="Localização" value={parsed.reporte_endereco} styles={styles} />
            <Divider styles={styles} />
          </>
        ) : null}
        <MetaRow
          label="Score de confiança"
          value={String(parsed.reporte_score_confianca ?? 0)}
          styles={styles}
        />
        <Divider styles={styles} />
        <MetaRow
          label="Enviado em"
          value={new Date(parsed.created_at).toLocaleString('pt-BR')}
          styles={styles}
        />
      </View>
    </>
  );
}

function MetaRow({ label, value, styles }: { label: string; value: string; styles: any }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function Divider({ styles }: { styles: any }) {
  return <View style={styles.divider} />;
}
