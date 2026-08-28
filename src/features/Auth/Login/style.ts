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
    },
    logo: {
      width: 95,
      height: 70,
    },
    iconWrapper: {
      width: 130,
      height: 130,
      borderRadius: 65,
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
    forgotPassword: {
      alignItems: 'flex-end',
      marginBottom: 32,
      marginTop: -4,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: theme.linkText,
      fontWeight: '700',
    },
    loginButton: {
      backgroundColor: theme.buttonPrimary,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
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
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: theme.cardBorder,
    },
    dividerText: {
      marginHorizontal: 16,
      color: theme.subtext,
      fontSize: 13,
      fontWeight: '500',
    },
    signupButton: {
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
    },
    signupButtonText: {
      color: theme.linkText,
      fontSize: 16,
      fontWeight: '700',
    },
    labelError: {
      color: theme.alertRed,
      fontSize: 12,
      marginBottom: 10,
      marginLeft: 5,
      marginTop: 4,
    },
  });
};

export default getStyles;

