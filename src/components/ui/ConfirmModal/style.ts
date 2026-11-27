import { StyleSheet } from 'react-native';
export const getStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    cartao: {
      width: '100%',
      maxWidth: 420,
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#E2E8F0',
      shadowColor: '#2C2B30',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDarkMode ? 0.35 : 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    iconeFundo: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    titulo: {
      fontSize: 18,
      fontWeight: '700',
      color: theme?.text || '#2C2B30',
      textAlign: 'center',
      marginBottom: 8,
    },
    mensagem: {
      fontSize: 14,
      lineHeight: 21,
      color: theme?.subtext || '#616A78',
      textAlign: 'center',
      marginBottom: 22,
    },
    botoes: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    botao: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    botaoCancelar: {
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
    },
    botaoDesativado: {
      opacity: 0.7,
    },
    textoCancelar: {
      fontSize: 15,
      fontWeight: '600',
      color: theme?.text || '#2C2B30',
    },
    textoConfirmar: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
