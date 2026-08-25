import { StyleSheet } from "react-native";

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.background || 'transparent',
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
    },
      headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text || "#2C2B30",
      letterSpacing: 0.3,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(44, 43, 48, 0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    segmentedControl: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 4,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#F4F5F7',
      borderRadius: 12,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    segmentButtonActive: {
      backgroundColor: theme?.primary || '#3AA77A',
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#616A78',
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      borderLeftWidth: 4,
      shadowColor: '#2C2B30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
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
      color: theme?.subtext || '#616A78',
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
      color: theme?.text || '#2C2B30',
      marginBottom: 6,
      lineHeight: 22,
    },
    cardTitleUnread: {
      color: theme?.text || '#2C2B30',
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
      color: theme?.subtext || '#616A78',
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(44, 43, 48, 0.05)',
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
      color: theme?.text || '#2C2B30',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme?.subtext || '#858D99',
      textAlign: 'center',
    },
  });
};

export default getStyles;


