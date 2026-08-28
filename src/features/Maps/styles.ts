import { StyleSheet } from 'react-native';

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

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  const primaryColor = theme?.primary || '#0047FF';
  const cardBg = theme?.cardBg || (isDark ? '#0F172A' : '#FFFFFF');
  const textColor = theme?.text || (isDark ? '#FFFFFF' : '#111827');
  const subtextColor = theme?.subtext || (isDark ? 'rgba(255, 255, 255, 0.7)' : '#6B7280');
  const borderColor = theme?.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.15)' : '#E2E8F0');

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.background || (isDark ? '#020617' : '#FFFFFF'),
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
      backgroundColor: theme?.background || (isDark ? '#020617' : '#FFFFFF'),
    },
    loadingCard: {
      backgroundColor: cardBg,
      padding: 24,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },
    loadingText: {
      marginTop: 14,
      fontSize: 14,
      fontWeight: '500',
      color: textColor,
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
      backgroundColor: cardBg,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.12,
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
      color: textColor,
    },
    radiusBadge: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 71, 255, 0.08)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 71, 255, 0.2)',
    },
    radiusBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: primaryColor,
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
    },
    filterChipActive: {
      backgroundColor: primaryColor,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: subtextColor,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
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
      backgroundColor: cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.35 : 0.15,
      shadowRadius: 6,
      elevation: 6,
    },

    /* USER MARKER */
    userMarkerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
    },
    userMarkerPulse: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 71, 255, 0.25)',
    },
    userMarkerDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: primaryColor,
      borderWidth: 3,
      borderColor: '#FFFFFF',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },

    /* RISK MARKERS */
    markerWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerBadgeOfficial: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#3B82F6',
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      zIndex: 2,
    },
    iconHighRisk: {
      backgroundColor: '#EF4444',
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: '#FFFFFF',
      elevation: 6,
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
    },
    iconMediumRisk: {
      backgroundColor: '#F59E0B',
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: '#FFFFFF',
      elevation: 6,
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
    },
    iconLowRisk: {
      backgroundColor: '#10B981',
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: '#FFFFFF',
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
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: borderColor,
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
      color: '#EF4444',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    calloutTagReporte: {
      fontSize: 10,
      fontWeight: '700',
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    calloutRiskBadge: {
      fontSize: 9,
      fontWeight: '800',
      textTransform: 'uppercase',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      overflow: 'hidden',
    },
    riskBadgeHigh: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#EF4444',
    },
    riskBadgeMedium: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      color: '#F59E0B',
    },
    riskBadgeLow: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      color: '#10B981',
    },
    calloutTitle: {
      fontWeight: '700',
      fontSize: 14,
      color: textColor,
      marginBottom: 4,
    },
    calloutDescription: {
      fontSize: 12,
      color: subtextColor,
      lineHeight: 16,
    },
    calloutFooter: {
      marginTop: 8,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: borderColor,
    },
    calloutHint: {
      fontSize: 11,
      fontWeight: '600',
      color: primaryColor,
    },

previewCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: theme.background || '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
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
    backgroundColor: 'rgba(0, 71, 255, 0.1)',
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
    color: theme.text || '#333',
    marginBottom: 6,
},
previewDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
},
previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
detailsButton: {
    backgroundColor: theme.primary || '#0047FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
},
detailsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 8,
},
riskBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
}




  });
};

export default getStyles;