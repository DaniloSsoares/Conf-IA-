import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => {
  const isDark = theme.isDark;
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    headerText: {
      color: theme.text || '#2C2B30',
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(58, 167, 122, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text || '#2C2B30',
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: theme.subtext || '#616A78',
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(97, 106, 120, 0.3)',
      marginHorizontal: 4,
    },
    activeDot: {
      width: 24,
      backgroundColor: theme.primary || '#3AA77A',
    },
    footer: {
      paddingBottom: 40,
      alignItems: 'center',
    },
    nextButton: {
      flexDirection: 'row',
      backgroundColor: theme.primary || '#3AA77A',
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 24,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.primary || '#3AA77A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
    },
    nextButtonText: {
      color: '#FFFFFF',
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
      color: theme.subtext || '#616A78',
      fontSize: 14,
      fontWeight: '500',
    },
    loginLink: {
      color: theme.primary || '#3AA77A',
      fontSize: 14,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
};

export default getStyles;
