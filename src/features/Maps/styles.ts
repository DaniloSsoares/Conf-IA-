import { PixelRatio, StyleSheet } from 'react-native';
import { AppTheme } from '@/src/shared/constants/theme';


export const TAMANHO_MARCADOR = Math.floor(100 / PixelRatio.get());
export const DIAMETRO_MARCADOR = TAMANHO_MARCADOR - 1;
export const ICONE_MARCADOR = Math.round(DIAMETRO_MARCADOR * 0.56);
export const TAMANHO_SELO = Math.max(12, Math.round(TAMANHO_MARCADOR * 0.36));

export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b687a" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b687a" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#021019" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c4568" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
];

export const getStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    map: {
      width: '100%',
      height: '100%',
    },

    /* LOADING & PERMISSION */
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      backgroundColor: theme.background,
    },
    loadingCard: {
      backgroundColor: theme.cardBg,
      padding: 24,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },
    loadingText: {
      marginTop: 14,
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
      textAlign: 'center',
      lineHeight: 20,
    },

    /* TOP FLOATING OVERLAY */
    topOverlay: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 10,
    },
    headerCard: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#22C55E',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    radiusBadge: {
      backgroundColor: theme.badgeBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    radiusBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.primary,
    },
    headerRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    /* WEATHER CARD */
    weatherCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.inputBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 10,
    },
    avisoSemConexao: {
      borderWidth: 1,
      borderColor: theme.alertRed,
    },
    avisoSemConexaoTexto: {
      color: theme.alertRed,
      flexShrink: 1,
    },
    weatherMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    weatherTempText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    weatherDescText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.subtext,
      textTransform: 'capitalize',
    },
    weatherStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    weatherStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    weatherStatText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.subtext,
    },

    /* FILTERS */
    filtersRow: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: theme.inputBg,
    },
    filterChipActive: {
      backgroundColor: theme.buttonPrimary,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.subtext,
    },
    filterChipTextActive: {
      color: theme.buttonText,
    },

    /* FAB RECENTER */
    fabContainer: {
      position: 'absolute',
      right: 16,
      zIndex: 10,
    },
    fabButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },

    /* USER MARKER */
    userMarkerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: TAMANHO_MARCADOR,
      height: TAMANHO_MARCADOR,
    },
    userMarkerPulse: {
      position: 'absolute',
      width: TAMANHO_MARCADOR,
      height: TAMANHO_MARCADOR,
      borderRadius: TAMANHO_MARCADOR / 2,
      backgroundColor: theme.badgeBg,
    },
    userMarkerDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.primary,
      borderWidth: 3,
      borderColor: theme.white,
      elevation: 5,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },

    /* RISK MARKERS */
    markerWrapper: {
      width: TAMANHO_MARCADOR,
      height: TAMANHO_MARCADOR,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerBadgeOfficial: {
      position: 'absolute',
      // Dentro da caixa do marcador: o que sai dela não é desenhado (ver TAMANHO_MARCADOR)
      top: 0,
      right: 0,
      backgroundColor: theme.primary,
      width: TAMANHO_SELO,
      height: TAMANHO_SELO,
      borderRadius: TAMANHO_SELO / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.white,
      // Fica acima do ícone (elevation 6) sem zIndex: na Nova Arquitetura o zIndex reordena
      // os filhos, e o marcador do react-native-maps quebra ("addViewAt: failed to insert view")
      elevation: 7,
    },
    iconHighRisk: {
      backgroundColor: theme.alertRed,
      width: DIAMETRO_MARCADOR,
      height: DIAMETRO_MARCADOR,
      borderRadius: DIAMETRO_MARCADOR / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.white,
      elevation: 6,
      shadowColor: theme.alertRed,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
    },
    iconMediumRisk: {
      backgroundColor: '#F59E0B',
      width: DIAMETRO_MARCADOR,
      height: DIAMETRO_MARCADOR,
      borderRadius: DIAMETRO_MARCADOR / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.white,
      elevation: 6,
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
    },
    iconLowRisk: {
      backgroundColor: '#10B981',
      width: DIAMETRO_MARCADOR,
      height: DIAMETRO_MARCADOR,
      borderRadius: DIAMETRO_MARCADOR / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.white,
      elevation: 6,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
    },

    /* CALLOUT */
    calloutContainer: {
      minWidth: 180,
      maxWidth: 240,
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    calloutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    calloutTagAlerta: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.alertRed,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    calloutTagReporte: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    calloutRiskBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      overflow: 'hidden',
    },
    riskBadgeHigh: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      borderWidth: 1,
    },
    riskBadgeMedium: {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      borderWidth: 1,
    },
    riskBadgeLow: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      borderWidth: 1,
    },
    calloutTitle: {
      fontWeight: '700',
      fontSize: 14,
      color: theme.text,
      marginBottom: 4,
    },
    calloutDescription: {
      fontSize: 12,
      color: theme.subtext,
      lineHeight: 16,
    },
    calloutFooter: {
      marginTop: 8,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    calloutHint: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.primary,
    },

    previewCard: {
      position: 'absolute',
      left: 20,
      right: 20,
      backgroundColor: theme.background,
      borderRadius: 20,
      padding: 20,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      zIndex: 1000,
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    previewTypeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.badgeBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    previewTypeText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primary,
      marginLeft: 6,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 6,
    },
    previewDescription: {
      fontSize: 14,
      color: theme.subtext,
      marginBottom: 16,
      lineHeight: 20,
    },
    previewFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailsButton: {
      backgroundColor: theme.buttonPrimary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    detailsButtonText: {
      color: theme.buttonText,
      fontWeight: 'bold',
      marginRight: 8,
    },
    riskBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    riskBadgeTextHigh: {
      color: '#EF4444',
    },
    riskBadgeTextMedium: {
      color: '#F59E0B',
    },
    riskBadgeTextLow: {
      color: '#10B981',
    },
  });
};

export default getStyles;