import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => {
  const isDark = theme.isDark;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 28,
      paddingVertical: 50,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
      marginTop: 20,
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: 0,
      padding: 10,
      zIndex: 10,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(58, 167, 122, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    logoText: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text || '#2C2B30',
      letterSpacing: 0.5,
    },
    logoIa: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.primary || '#3AA77A',
      marginLeft: 2,
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text || '#2C2B30',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.subtext || '#616A78',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 20,
    },
    formContainer: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text || '#2C2B30',
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#F4F5F7',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#E2E8F0',
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    input: {
      flex: 1,
      paddingHorizontal: 12,
      fontSize: 15,
      color: theme.text || '#2C2B30',
      height: '100%',
    },
    eyeIcon: {
      padding: 10,
    },
    loginButton: {
      backgroundColor: theme.primary || '#3AA77A',
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 30,
      shadowColor: theme.primary || '#3AA77A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,

    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    
    },
    labelError: {
      color: '#D74247',
      fontSize: 12,
      marginBottom: 10,
      marginLeft: 5,
      marginTop: 4,
    },
     footer: {
     
      alignItems: 'center',
    },
    footerText: {
      fontSize: 13,
      color: theme.subtext || '#616A78',
      textAlign: 'center',
      lineHeight: 20,
    },
    footerLink: {
      color: theme.primary || '#3AA77A',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
};

export default getStyles;
