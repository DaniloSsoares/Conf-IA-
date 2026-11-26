import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
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
    return await toSelectedPhoto(result);
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
    return await toSelectedPhoto(result);
  } catch (error) {
    console.error('Erro ao escolher foto da galeria:', error);
    Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível selecionar a imagem.' });
    return null;
  }
}

// Largura máxima da foto enviada. Uma foto de câmera moderna tem 4000 px ou mais
// (3 a 6 MB); com 1280 px ela fica com uns 200 a 400 KB e continua nítida no celular.
// No 4G, a diferença é entre segundos e "o envio falhou"
const LARGURA_MAXIMA = 1280;
const QUALIDADE_JPEG = 0.7;

function buildPickerOptions({
  allowsEditing = false,
  aspect,
  quality = QUALIDADE_JPEG,
}: PhotoPickerOptions): ImagePicker.ImagePickerOptions {
  return {
    mediaTypes: ['images'],
    allowsEditing,
    aspect,
    quality,
    // Sem base64 aqui: ele é gerado depois de reduzir a foto (gerar da foto original
    // ocuparia muita memória à toa)
    base64: false,
  };
}

async function toSelectedPhoto(result: ImagePicker.ImagePickerResult): Promise<SelectedPhoto | null> {
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const contexto = ImageManipulator.manipulate(asset.uri);
  // Só reduz: uma foto menor que o limite não é ampliada
  if (asset.width > LARGURA_MAXIMA) {
    contexto.resize({ width: LARGURA_MAXIMA });
  }
  const imagem = await contexto.renderAsync();
  // Sempre JPEG: é o formato que o upload declara (image/jpeg) e o mais leve para foto
  const salva = await imagem.saveAsync({
    compress: QUALIDADE_JPEG,
    format: SaveFormat.JPEG,
    base64: true,
  });

  return {
    uri: salva.uri,
    base64: salva.base64 ?? undefined,
    ext: 'jpg',
  };
}
