import { StyleSheet } from "react-native";

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.background || 'transparent',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: theme?.text || '#2C2B30',
      fontSize: 17,
      fontWeight: '600',
    },
    content: {
      padding: 20,
    },
    heroCard: {
      marginBottom: 16,
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    iconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 71, 255, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme?.text || '#2C2B30',
      marginBottom: 8,
    },
    description: {
      fontSize: 15,
      color: isDark ? 'rgba(255,255,255,0.8)' : '#616A78',
      lineHeight: 22,
      marginBottom: 24,
    },
    descriptionMuted: {
      fontSize: 14,
      color: isDark ? 'rgba(255,255,255,0.4)' : '#858D99',
      fontStyle: 'italic',
      marginBottom: 24,
    },
    metaSection: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
      borderRadius: 14,
      padding: 16,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#E2E8F0',
      shadowColor: '#2C2B30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 0 : 2,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      gap: 12,
    },
    metaLabel: {
      fontSize: 13,
      color: isDark ? 'rgba(255,255,255,0.6)' : '#616A78',
    },
    metaValue: {
      fontSize: 13,
      color: theme?.text || '#2C2B30',
      fontWeight: '600',
      flexShrink: 1,
      textAlign: 'right',
    },
    divider: {
      height: 0.5,
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#ECEEF2',
    },
    errorText: {
      color: theme?.text || '#2C2B30',
      textAlign: 'center',
      marginTop: 100,
    },
    photo: {
      width: '100%',
      height: 200,
      borderRadius: 14,
      marginBottom: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4F5F7',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme?.text || '#2C2B30',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    editButton: {
      backgroundColor: theme?.primary || '#3AA77A',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 24,
      marginHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    editButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
};


export default getStyles;