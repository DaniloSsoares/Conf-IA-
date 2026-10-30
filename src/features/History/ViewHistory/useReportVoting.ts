import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ValidationError } from 'yup';
import Toast from 'react-native-toast-message';
import {
  getMyValidation,
  getReportValidations,
  voteReport,
} from '@/src/shared/service/reportService';
import { ReportComment, TipoValidacao } from '@/src/shared/types/report';
import { validateComent } from '@/src/shared/yup';

// Mesmo voto e mesmo comentário: nada mudou, não precisa enviar
export function hasVoteChanged(
  voto: TipoValidacao,
  comentario: string | null,
  myVote: TipoValidacao | null,
  myComment: string,
) {
  return voto !== myVote || (comentario ?? '') !== myComment;
}

/**
 * Estado e regras da votação de um reporte: voto do usuário, lista de votos,
 * comentário e envio. Com `reportId` undefined (tela de alerta) não faz nada.
 * `onVoted` é chamado depois de um voto para recarregar o reporte (score e status
 * recalculados pelo trigger no banco).
 *
 * O comentário é um estado simples deste hook (e não react-hook-form): é um único
 * campo opcional, e o estado fica no componente pai, então nada que aconteça nos
 * componentes filhos consegue apagar o que o usuário está digitando.
 */
export function useReportVoting(
  reportId: string | undefined,
  userId: string,
  onVoted: () => void,
) {
  const [myVote, setMyVote] = useState<TipoValidacao | null>(null);
  const [myComment, setMyComment] = useState('');
  const [validacoes, setValidacoes] = useState<ReportComment[]>([]);
  const [sending, setSending] = useState(false);

  const [comentario, setComentarioState] = useState('');
  const [comentarioErro, setComentarioErro] = useState<string | undefined>();
  // Refs para o loadVotes ler o valor atual sem ser recriado a cada tecla
  const comentarioAtual = useRef('');
  const lastSyncedComment = useRef('');

  const setComentario = useCallback((texto: string) => {
    comentarioAtual.current = texto;
    setComentarioState(texto);
    setComentarioErro(undefined);
  }, []);

  const loadVotes = useCallback(async () => {
    if (!reportId) return;
    const [minha, todas] = await Promise.all([
      userId ? getMyValidation(reportId, userId) : Promise.resolve(null),
      getReportValidations(reportId),
    ]);
    const salvo = minha?.validacao_comentario ?? '';
    setMyVote(minha?.validacao_tipo ?? null);
    setMyComment(salvo);
    // Preenche o campo com o comentário já enviado, mas só se o usuário não digitou nada
    // desde a última sincronização: senão uma resposta que chega depois apaga o que ele escreve
    if (comentarioAtual.current === lastSyncedComment.current) {
      setComentario(salvo);
    }
    lastSyncedComment.current = salvo;
    setValidacoes(todas);
  }, [reportId, userId, setComentario]);

  useFocusEffect(
    useCallback(() => {
      loadVotes();
    }, [loadVotes])
  );

  const sendVote = async (voto: TipoValidacao) => {
    if (!reportId) return;
    const texto = comentario.trim() || null;
    if (sending || !hasVoteChanged(voto, texto, myVote, myComment)) return;

    const mesmoVoto = voto === myVote;
    setSending(true);
    const { error } = await voteReport(reportId, userId, voto, texto);
    setSending(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Não foi possível registrar seu voto' });
      return;
    }
    Toast.show({
      type: 'success',
      text1: mesmoVoto
        ? 'Comentário atualizado'
        : voto === 'confirma' ? 'Ocorrência confirmada' : 'Ocorrência contestada',
    });
    loadVotes();
    onVoted();
  };

  // Valida o comentário com o schema yup antes de votar
  const vote = (voto: TipoValidacao) => {
    try {
      validateComent.validateSync({ comentario });
    } catch (e) {
      if (e instanceof ValidationError) setComentarioErro(e.message);
      return;
    }
    sendVote(voto);
  };

  return {
    myVote,
    sending,
    validacoes,
    totalVotos: validacoes.length,
    comentarios: validacoes.filter((v) => v.validacao_comentario),
    comentario,
    setComentario,
    comentarioErro,
    vote,
  };
}

export type ReportVoting = ReturnType<typeof useReportVoting>;
