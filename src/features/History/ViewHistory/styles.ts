import { StyleSheet } from "react-native";

export const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
    },
    content: {
      padding: 20,
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
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
      color: '#FFFFFF',
      marginBottom: 8,
    },
    description: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.8)',
      lineHeight: 22,
      marginBottom: 24,
    },
    descriptionMuted: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.4)',
      fontStyle: 'italic',
      marginBottom: 24,
    },
    metaSection: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: 16,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      gap: 12,
    },
    metaLabel: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.6)',
    },
    metaValue: {
      fontSize: 13,
      color: '#FFFFFF',
      fontWeight: '600',
      flexShrink: 1,
      textAlign: 'right',
    },
    divider: {
      height: 0.5,
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    errorText: {
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: 100,
    },
    photo: {
      width: '100%',
      height: 200,
      borderRadius: 14,
      marginBottom: 20,
      backgroundColor: 'rgba(255,255,255,0.08)',
    }, 
     sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
  });


export default getStyles;