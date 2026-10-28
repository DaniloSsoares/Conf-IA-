import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStatusStyle, getRiskStyle, getCategoryMeta } from '@/src/shared/constants/historyStatus';
import { supabaseConfig } from '@/src/config/supabase';
import { getMyVote, getReportById, voteReport } from '@/src/shared/service/reportService';
import { getAlertaById } from '@/src/shared/service/alertaNotificationService';
import { Load } from '@/src/components/ui';
import { getStyles } from './styles';
import { TipoValidacao } from '@/src/shared/types/report';
import Toast from 'react-native-toast-message';

type ParamType = 'alerta' | 'reporte';

function parseData(data?: string) {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export default function ViewHistoryScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { type, id, data } = useLocalSearchParams<{ type: ParamType; id?: string; data?: string }>();

  const [parsed, setParsed] = useState<any>(() => parseData(data));
  const [loading, setLoading] = useState(true);
  const [currentUseId, setCurrentUserId] = useState<string>('');
  const [myVote, setMyVote]= useState<TipoValidacao | null>(null);
  const [voting, setVoting] = useState(false);

  const itemId = id ?? parsed?.id;

  const load = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }
    const result = type === 'alerta' ? await getAlertaById(itemId) : await getReportById(itemId);

      if(type === "reporte"&& currentUseId){
        setMyVote(await getMyVote(itemId, currentUseId));
      }

    if (result) setParsed(result);
    setLoading(false);
  }, [type, itemId, currentUseId]);

  // Recarrega ao focar: cobre a volta da tela de edição e, depois, o voto
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleVote = async(voto: TipoValidacao)=> {
    if(voting || voto === myVote)return;
      setVoting(true);
      const {error}= await voteReport(parsed.id, currentUseId,voto);
      setVoting(false);

      if(error){
        Toast.show({type:'error', text1:'Não foi possivel registrar seu voto'});
        return
      }
        Toast.show({ type: 'success', text1: voto === 'confirma' ? 'Ocorrência confirmada' : 'Ocorrência contestada' });
         load();   // busca score e status recalculados pelo trigger
      };
  

  const iconColor = isDarkMode ? "#FFFFFF" : "#2C2B30";

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabaseConfig.auth.getUser();
      setCurrentUserId(user?.id || '');
    };
    fetchUserId();
  }, []);
  const isOwner =  Boolean(currentUseId && parsed?.perfil_id === currentUseId);

  if (loading && !parsed) {
    return (
      <LinearGradient colors={theme.primaryGradient} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <Load />
      </LinearGradient>
    );
  }

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
          <ReporteContent parsed={parsed} meta={meta} theme={theme} styles={styles} isDarkMode={isDarkMode} isOwner={isOwner} myVote={myVote} voting={voting} onVote={handleVote} />
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

function ReporteContent({ parsed, meta, theme, styles, isDarkMode, isOwner,myVote, voting, onVote }: any) {
  const statusStyle = getStatusStyle(parsed.reporte_status, theme);
  const photoUrl = parsed.reporte_midias?.[0]?.midia_url;
  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#0047FF");
  const handleEdit = () => {
    router.push({
      pathname: '/(screens)/EditReport' as any, 
      params: { id: parsed?.id, data: JSON.stringify(parsed) }
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
          // banco guarda fração 0.00–1.00 (numeric chega como texto, por isso o Number)
          value={`${Math.round(Number(parsed.reporte_score_confianca ?? 0) * 100)}%`}
          styles={styles}
        />
        <Divider styles={styles} />
        <MetaRow
          label="Enviado em"
          value={new Date(parsed.created_at).toLocaleString('pt-BR')}
          styles={styles}
        />
      </View>

     {isOwner && (
       <TouchableOpacity style={styles.editButton} onPress={() => {handleEdit()}}>
         <Ionicons name="create-outline" size={20} color={theme.primary || '#3AA77A'} />
         <Text style={styles.editButtonText}>Editar Reporte</Text>
       </TouchableOpacity>
     )}

      {!isOwner && parsed.reporte_status !== 'resolvido' && (
     <>
       <Text style={styles.sectionTitle}>Essa ocorrência é real?</Text>
        <View style={styles.voteRow}>
         <TouchableOpacity
        style={[styles.voteButton, myVote === 'confirma' && styles.voteConfirmActive]}
        onPress={() => onVote('confirma')}
        disabled={voting}
      >
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        <Text style={styles.voteText}>Confirmar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.voteButton, myVote === 'contesta' && styles.voteContestActive]}
        onPress={() => onVote('contesta')}
        disabled={voting}
      >
        <Ionicons name="close-circle" size={20} color="#EF4444" />
        <Text style={styles.voteText}>Contestar</Text>
      </TouchableOpacity>
    </View>
  </>
)}
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
