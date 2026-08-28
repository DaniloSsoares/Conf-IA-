import { StyleSheet } from 'react-native';
import { AppTheme } from '@/src/shared/constants/theme';

export const getStyles = (theme: AppTheme) => {
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
      backgroundColor: theme.iconCircleBg,
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
      color: theme.text,
      letterSpacing: 0.5,
    },
    logoIa: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.primary,
      marginLeft: 2,
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.subtext,
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
      color: theme.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    input: {
      flex: 1,
      paddingHorizontal: 12,
      fontSize: 15,
      color: theme.text,
      height: '100%',
    },
    eyeIcon: {
      padding: 10,
    },
    loginButton: {
      backgroundColor: theme.buttonPrimary,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 30,
      shadowColor: theme.buttonPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
    },
    loginButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    labelError: {
      color: theme.alertRed,
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
      color: theme.subtext,
      textAlign: 'center',
      lineHeight: 20,
    },
    footerLink: {
      color: theme.linkText,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
};

export default getStyles;

