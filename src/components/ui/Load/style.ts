import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    overlayContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    inlineContainer: {
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContainer: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF',

    },
    glowRing: {
      position: 'absolute',
      top: 24,
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: isDark ? 'rgba(0, 209, 255, 0.25)' : 'rgba(0, 71, 255, 0.15)',
    },
    iconWrapper: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 71, 255, 0.12)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 71, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      marginTop:30
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    logoText: {
      fontSize: 26,
      fontWeight: '800',
      color: theme?.text || '#2C2B30',
      letterSpacing: 0.5,
    },
    logoIa: {
      fontSize: 26,
      fontWeight: '800',
      color: theme?.primary || '#0047FF',
      marginLeft: 2,
      letterSpacing: 0.5,
    },
    spinner: {
      marginVertical: 12,
    },
    messageText: {
      color: theme?.text || '#2C2B30',
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 4,
    },
    subMessageText: {
      color: theme?.subtext || '#616A78',
      fontSize: 13,
      fontWeight: '400',
      textAlign: 'center',
      marginTop: 6,
    },
  });
};
