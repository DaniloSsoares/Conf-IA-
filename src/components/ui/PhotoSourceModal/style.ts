import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme?.transparency || 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: theme?.cardBg || '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme?.cardBorder || '#E2E8F0',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme?.text || '#2C2B30',
      marginBottom: 20,
      textAlign: 'center',
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: theme?.inputBg || '#F4F5F7',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 14,
      marginBottom: 12,
    },
    optionText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme?.text || '#2C2B30',
    },
    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    cancelText: {
      fontSize: 15,
      color: theme?.subtext || '#616A78',
      fontWeight: '600',
    },
  });
