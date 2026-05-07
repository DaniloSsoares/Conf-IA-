import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const reportTypes = [
  { id: 1, label: 'Alagamento', icon: 'water', color: '#0EA5E9' },
  { id: 2, label: 'Deslizamento', icon: 'alert-circle', color: '#E11D48' },
  { id: 3, label: 'Bloqueio de Via', icon: 'ban', color: '#F97316' },
  { id: 4, label: 'Enxurrada', icon: 'cloud-drizzle', color: '#3B82F6' },
  { id: 5, label: 'Árvore Caída', icon: 'leaf', color: '#65A30D' },
  { id: 6, label: 'Outro', icon: 'help-circle', color: '#64748B' },
];

export default function ReportScreen() {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de evento');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva o evento');
      return;
    }

    setLoading(true);

    try {
      // Simular envio - em produção conectar com backend
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Sucesso',
          'Seu reporte foi enviado com sucesso!\nObrigado por contribuir com a comunidade.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedType(null);
                setDescription('');
              },
            },
          ]
        );
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Falha ao enviar reporte. Tente novamente.');
    }
  };

  const handleUseCurrentLocation = () => {
    Alert.alert('Localização', 'Usando localização atual: São Paulo, SP');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={28} color="#4F46E5" />
            <Text style={styles.infoText}>
              Sua contribuição é essencial para alertar a comunidade sobre riscos climáticos.
            </Text>
          </View>

          {/* Tipo de Evento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Evento *</Text>
            <View style={styles.typesGrid}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    selectedType?.id === type.id && styles.typeCardSelected,
                    selectedType?.id === type.id && { borderColor: type.color }
                  ]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.typeIconContainer,
                      {
                        backgroundColor: selectedType?.id === type.id ? type.color + '15' : '#F8FAFC',
                      },
                    ]}
                  >
                    <Ionicons
                      name={type.icon}
                      size={28}
                      color={selectedType?.id === type.id ? type.color : '#94A3B8'}
                    />
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    selectedType?.id === type.id && { color: type.color, fontWeight: '700' }
                  ]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Localização */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização *</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationInput}>
                <Ionicons
                  name="location"
                  size={20}
                  color="#4F46E5"
                  style={styles.locationIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Rua, número, bairro"
                  placeholderTextColor="#94A3B8"
                  value={location}
                  onChangeText={setLocation}
                  editable={true}
                />
              </View>
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={handleUseCurrentLocation}
              >
                <Ionicons name="navigate" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Toque no ícone para usar sua localização atual
            </Text>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição do Evento *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Descreva o que está acontecendo com o máximo de detalhe..."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>

          {/* Foto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adicionar Foto (Opcional)</Text>
            <TouchableOpacity style={styles.photoButton}>
              <Ionicons name="camera" size={32} color="#4F46E5" />
              <Text style={styles.photoButtonText}>
                Tirar foto ou selecionar da galeria
              </Text>
            </TouchableOpacity>
          </View>

          {/* Termos */}
          <TouchableOpacity style={styles.termsContainer} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
            <Text style={styles.termsText}>
              Confirmo que as informações fornecidas são precisas e consinto
              com o uso desses dados para alertas à comunidade.
            </Text>
          </TouchableOpacity>

          {/* Botões de Ação */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100, // Espaço para Tab Bar
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#3730A3',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  typeCardSelected: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  locationIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  gpsButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
    minHeight: 120,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
  photoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C7D2FE',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 12,
    fontWeight: '600',
  },
  termsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  termsText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
});
