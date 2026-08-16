import { StyleSheet } from "react-native";

export const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.background || 'transparent',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    segmentedControl: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: 12,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    segmentButtonActive: {
      backgroundColor: theme?.primary || '#3069E8',
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    segmentTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
 
    card: {
     backgroundColor: 'rgba(255,255,255,)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardDateText: {
      fontSize: 12,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.6)',
    },
    riskBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
    },
    riskBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 6,
      lineHeight: 22,
    },
    cardTitleUnread: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    cardLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    cardLocationText: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.65)',
      flex: 1,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
      paddingTop: 8,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.5)',
      textAlign: 'center',
    },
  });

export default getStyles;


