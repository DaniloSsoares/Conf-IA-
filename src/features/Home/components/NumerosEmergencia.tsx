import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '@/src/shared/constants/theme';
import { NUMEROS_EMERGENCIA, NumeroEmergencia } from '@/src/shared/constants/emergencia';

// Cartões com os números de emergência. Tocar COPIA o número (não liga): a pessoa
// cola no discador e decide se liga. Evita ligação por toque acidental na Home
export function NumerosEmergencia() {
  const { theme, isDarkMode } = useAppTheme();

  const copiar = async ({ numero, nome }: NumeroEmergencia) => {
    try {
      await Clipboard.setStringAsync(numero);
      Toast.show({
        type: 'success',
        text1: `${nome}: ${numero} copiado`,
        text2: 'Cole no discador do celular para ligar.',
      });
    } catch (error) {
      console.warn('Não foi possível copiar o número:', error);
      Toast.show({
        type: 'error',
        text1: 'Não foi possível copiar',
        text2: `O número da ${nome} é ${numero}.`,
      });
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.titulo, isDarkMode && { color: theme.text }]}>
        Números de emergência
      </Text>
      <Text style={[styles.subtitulo, isDarkMode && { color: theme.subtext }]}>
        Toque para copiar o número
      </Text>

      <View style={styles.linha}>
        {NUMEROS_EMERGENCIA.map((item) => (
          <TouchableOpacity
            key={item.numero}
            style={[
              styles.cartao,
              isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
            activeOpacity={0.8}
            onPress={() => copiar(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.nome}, ${item.numero}. Toque para copiar o número`}
          >
            <View style={[styles.icone, { backgroundColor: isDarkMode ? 'rgba(215, 66, 71, 0.22)' : '#FDECEC' }]}>
              <Ionicons name={item.icone as any} size={20} color={theme.alertRed} />
            </View>
            <Text style={[styles.numero, { color: theme.alertRed }]}>{item.numero}</Text>
            <Text style={[styles.nome, isDarkMode && { color: theme.subtext }]} numberOfLines={1}>
              {item.nome}
            </Text>
            <View style={styles.copiarLinha}>
              <Ionicons name="copy-outline" size={11} color={isDarkMode ? theme.subtext : '#8B93A1'} />
              <Text style={[styles.copiarTexto, isDarkMode && { color: theme.subtext }]}>Copiar</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Mesmo visual dos cartões da Home (bordas, raio e sombra do alertItem)
const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 23,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172033',
    letterSpacing: -0.2,
  },
  subtitulo: {
    fontSize: 12.5,
    color: '#8B93A1',
    marginTop: 2,
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    gap: 10,
  },
  cartao: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#F0F1F5',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  numero: {
    fontSize: 20,
    fontWeight: '800',
  },
  nome: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 1,
  },
  copiarLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  copiarTexto: {
    fontSize: 11,
    color: '#8B93A1',
  },
});
