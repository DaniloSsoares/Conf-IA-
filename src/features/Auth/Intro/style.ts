import { StyleSheet } from 'react-native';
import { AppTheme } from '@/src/shared/constants/theme';

export const getStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 30, // For Android spacing
    },
    logo: {
      width: 100,
      height: 100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    headerText: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '700',
      marginLeft: 8,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -40,
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.iconCircleBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: theme.subtext,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 40,
      paddingHorizontal: 8,
      fontWeight: '400',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.dotInactive,
      marginHorizontal: 4,
    },
    activeDot: {
      width: 24,
      backgroundColor: theme.dotActive,
    },
    footer: {
      paddingBottom: 40,
      alignItems: 'center',
    },
    nextButton: {
      flexDirection: 'row',
      backgroundColor: theme.buttonPrimary,
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 24,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.buttonPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
    },
    nextButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: '700',
      marginRight: 8,
    },
    loginContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginText: {
      color: theme.subtext,
      fontSize: 14,
      fontWeight: '500',
    },
    loginLink: {
      color: theme.linkText,
      fontSize: 14,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
};

export default getStyles;

