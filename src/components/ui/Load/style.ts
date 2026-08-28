import { StyleSheet, Dimensions } from 'react-native';
import { AppTheme } from '@/src/shared/constants/theme';

const { width } = Dimensions.get('window');

export const getStyles = (theme: AppTheme) => {
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
      backgroundColor: theme.loadOverlayBg,
    },
    glowRing: {
      position: 'absolute',
      top: 24,
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: theme.loadCircleBg,
    },
    iconWrapper: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: theme.loadCircleInnerBg,
      borderWidth: 1.5,
      borderColor: theme.loadBorder,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: 30,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    logoText: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: 0.5,
    },
    logoIa: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.primary,
      marginLeft: 2,
      letterSpacing: 0.5,
    },
    spinner: {
      marginVertical: 12,
    },
    messageText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 4,
    },
    subMessageText: {
      color: theme.subtext,
      fontSize: 13,
      fontWeight: '400',
      textAlign: 'center',
      marginTop: 6,
    },
  });
};

