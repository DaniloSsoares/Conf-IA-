import { StyleSheet } from 'react-native';

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;

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
      backgroundColor: theme?.tabBarBg || (isDark ? '#0F172A' : '#FFFFFF'),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderRadius: 40,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme?.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.15)' : 'transparent'),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: isDark ? 0.35 : 0.10,
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
      backgroundColor: theme?.primary || (isDark ? '#3B82F6' : '#0047FF'),
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
      backgroundColor: theme?.alertRed || '#E64550',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme?.tabBarBg || (isDark ? '#0F172A' : '#FFFFFF'),
      shadowColor: theme?.alertRed || '#E64550',
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
      backgroundColor: theme?.alertRed || '#E64550',
    },
  });
};

export default getStyles;