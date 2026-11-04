import { AlvoDenuncia, DenunciaMotivoItem } from '../types/denuncia';

export const DENUNCIA_MOTIVOS: DenunciaMotivoItem[] = [
  { id: 'informacao_falsa', label: 'Informação falsa', icon: 'alert-circle-outline', aplicaA: ['reporte', 'comentario'] },
  { id: 'foto_inadequada', label: 'Foto inadequada', icon: 'image-outline', aplicaA: ['reporte'] },
  { id: 'comentario_ofensivo', label: 'Comentário ofensivo', icon: 'chatbubble-ellipses-outline', aplicaA: ['comentario'] },
  { id: 'spam', label: 'Spam', icon: 'megaphone-outline', aplicaA: ['reporte', 'comentario'] },
  { id: 'outro', label: 'Outro motivo', icon: 'ellipsis-horizontal', aplicaA: ['reporte', 'comentario'] },
];

// "Foto inadequada" não faz sentido num comentário, nem "Comentário ofensivo" num reporte
export function getMotivosPara(tipo: AlvoDenuncia['tipo']) {
  return DENUNCIA_MOTIVOS.filter((m) => m.aplicaA.includes(tipo));
}
