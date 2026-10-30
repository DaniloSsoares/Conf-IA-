import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { SelectedPhoto } from '@/src/shared/types/photo';

export interface PhotoPickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export async function takePhoto(options: PhotoPickerOptions = {}): Promise<SelectedPhoto | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permissão necessária',
        text2: 'É preciso permitir o acesso à câmera para tirar uma foto.',
      });
      return null;
    }

    const result = await ImagePicker.launchCameraAsync(buildPickerOptions(options));
    return toSelectedPhoto(result);
  } catch (error) {
    console.error('Erro ao tirar foto:', error);
    Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível capturar a foto.' });
    return null;
  }
}

export async function pickFromGallery(options: PhotoPickerOptions = {}): Promise<SelectedPhoto | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permissão necessária',
        text2: 'É preciso permitir o acesso à galeria para escolher uma foto.',
      });
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync(buildPickerOptions(options));
    return toSelectedPhoto(result);
  } catch (error) {
    console.error('Erro ao escolher foto da galeria:', error);
    Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível selecionar a imagem.' });
    return null;
  }
}

function buildPickerOptions({
  allowsEditing = false,
  aspect,
  quality = 0.7,
}: PhotoPickerOptions): ImagePicker.ImagePickerOptions {
  return {
    mediaTypes: ['images'],
    allowsEditing,
    aspect,
    quality,
    base64: true, // o upload para o Supabase Storage usa base64
  };
}

function toSelectedPhoto(result: ImagePicker.ImagePickerResult): SelectedPhoto | null {
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 ?? undefined,
    ext: getExtension(asset),
  };
}

// O mimeType é mais confiável que o fim da uri (que às vezes vem sem extensão)
function getExtension(asset: ImagePicker.ImagePickerAsset): string {
  const fromMime = asset.mimeType?.split('/')[1];
  const fromUri = asset.uri.split('.').pop();
  const ext = (fromMime || fromUri || 'jpg').toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
}
