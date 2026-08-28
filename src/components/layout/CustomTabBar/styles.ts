import { StyleSheet } from 'react-native';
import { AppTheme } from '@/src/shared/constants/theme';

export const getStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    /* ==============================
       CONTAINER DA BARRA
    ============================== */
    wrapper: {
      position: 'absolute',
      left: 16,
      right: 16,
    },

    /* ==============================
       BARRA PRINCIPAL
    ============================== */
    tabBar: {
      height: 66,
      width: '100%',
      backgroundColor: theme.tabBarBg,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderRadius: 40,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.15,
      shadowRadius: 14,
      elevation: 9,
      overflow: 'visible',
    },

    /* ==============================
       INDICADOR DA ABA SELECIONADA
    ============================== */
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: 7,
      height: 52,
      borderRadius: 22,
      overflow: 'hidden',
    },

    indicatorFill: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 22,
      backgroundColor: theme.primary,
    },

    gradientFill: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 22,
    },

    /* ==============================
       ITEM DA ABA
    ============================== */
    tabItem: {
      flex: 1,
      height: 66,
      alignItems: 'center',
      justifyContent: 'center',
    },

    pressable: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    label: {
      fontSize: 8,
      fontWeight: '600',
      marginTop: 2,
    },

    /* ==============================
       ÁREA DO BOTÃO CENTRAL
    ============================== */
    alertArea: {
      width: 60,
      height: 66,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -18,
    },

    /* ==============================
       BOTÃO CENTRAL DE ALERTA
    ============================== */
    alertButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.alertRed,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.tabBarBg,
      shadowColor: theme.alertRed,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.3,
      shadowRadius: 9,
      elevation: 9,
    },

    /* ==============================
       PULSO DO BOTÃO CENTRAL
    ============================== */
    alertPulse: {
      position: 'absolute',
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.alertRed,
    },
  });
};

export default getStyles;