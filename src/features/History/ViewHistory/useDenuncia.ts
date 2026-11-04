import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { denunciar, getMyReportedIds } from '@/src/shared/service/denunciaService';
import { AlvoDenuncia, DenunciaMotivo } from '@/src/shared/types/denuncia';
import { getErrorMessage } from '@/src/shared/utils/supabaseErrors';

/**
 * Estado e regras da denúncia: qual conteúdo está sendo denunciado (modal aberto),
 * o envio e quais conteúdos o usuário já denunciou.
 * `onDenunciado` recarrega a tela: a denúncia pode ter ocultado o conteúdo.
 */
export function useDenuncia(userId: string, onDenunciado: () => void) {
  // alvo !== null significa modal aberto: um estado só, sem risco de dessincronizar
  const [alvo, setAlvo] = useState<AlvoDenuncia | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [denunciados, setDenunciados] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      if (userId) getMyReportedIds(userId).then(setDenunciados);
    }, [userId])
  );

  const marcarDenunciado = (id: string) =>
    setDenunciados((atual) => new Set(atual).add(id));

  const abrir = (novoAlvo: AlvoDenuncia) => setAlvo(novoAlvo);
  const fechar = () => {
    if (!enviando) setAlvo(null);
  };

  const enviar = async (motivo: DenunciaMotivo) => {
    if (!alvo || enviando || !userId) return;

    setEnviando(true);
    const { error } = await denunciar(userId, alvo, motivo);
    setEnviando(false);

    // UNIQUE: já tinha denunciado. Para o usuário não é um erro, o objetivo já foi cumprido
    if (error?.code === '23505') {
      marcarDenunciado(alvo.id);
      setAlvo(null);
      Toast.show({ type: 'info', text1: 'Você já denunciou este conteúdo' });
      return;
    }

    if (error) {
      console.error('Erro ao enviar denúncia:', error);
      Toast.show({
        type: 'error',
        text1: 'Não foi possível enviar a denúncia',
        text2: getErrorMessage(error, 'Tente novamente em instantes.'),
      });
      return;
    }

    marcarDenunciado(alvo.id);
    setAlvo(null);
    Toast.show({
      type: 'success',
      text1: 'Denúncia enviada',
      text2: 'Obrigado por ajudar a manter a comunidade confiável.',
    });
    onDenunciado();
  };

  return {
    alvo,
    enviando,
    abrir,
    fechar,
    enviar,
    jaDenunciou: (id: string) => denunciados.has(id),
  };
}

export type Denuncia = ReturnType<typeof useDenuncia>;
