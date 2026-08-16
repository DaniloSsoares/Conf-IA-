import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme?.text || '#2C2B30',
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme?.inputBg || '#F4F5F7',
      borderWidth: 1,
      borderColor: theme?.inputBorder || '#E2E8F0',
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    inputError: {
      borderColor: theme?.ternary || '#D74247',
    },
    icon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme?.text || '#2C2B30',
      height: '100%',
    },
    eyeIcon: {
      padding: 10,
    },
    errorText: {
      color: theme?.ternary || '#D74247',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
};
