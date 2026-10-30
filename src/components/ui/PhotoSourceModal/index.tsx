import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { SelectedPhoto } from '@/src/shared/types/photo';
import { PhotoPickerOptions, pickFromGallery, takePhoto } from '@/src/shared/utils/photoPicker';
import { getStyles } from './style';

export interface PhotoSourceModalProps {
  visible: boolean;
  onClose: () => void;
  /** Chamado só quando o usuário de fato escolhe uma foto (cancelar não chama) */
  onPicked: (photo: SelectedPhoto) => void;
  title?: string;
  pickerOptions?: PhotoPickerOptions;
}

/**
 * Menu "Tirar foto / Escolher da galeria".
 *
 * Quando a tela só deve aceitar câmera (ex.: reporte novo, foto como evidência),
 * NÃO use este modal: chame `takePhoto()` direto no botão. Um menu com uma
 * opção só é um toque a mais sem motivo.
 *
 * Uso:
 *   <PhotoSourceModal
 *     visible={visivel}
 *     onClose={() => setVisivel(false)}
 *     onPicked={setFoto}
 *   />
 */
export function PhotoSourceModal({
  visible,
  onClose,
  onPicked,
  title = 'Adicionar foto',
  pickerOptions,
}: PhotoSourceModalProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const iconColor = theme?.primary || '#0047FF';

  // Fecha o modal antes de abrir câmera/galeria: no iOS o seletor do sistema
  // não abre enquanto um Modal do React Native está visível
  const handlePick = async (source: 'camera' | 'gallery') => {
    onClose();
    const photo =
      source === 'camera' ? await takePhoto(pickerOptions) : await pickFromGallery(pickerOptions);
    if (photo) onPicked(photo);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* View sem onPress: toque dentro do conteúdo não fecha o modal */}
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>

          <TouchableOpacity style={styles.optionButton} onPress={() => handlePick('camera')}>
            <Ionicons name="camera-outline" size={22} color={iconColor} />
            <Text style={styles.optionText}>Tirar foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => handlePick('gallery')}>
            <Ionicons name="images-outline" size={22} color={iconColor} />
            <Text style={styles.optionText}>Escolher da galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
