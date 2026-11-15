import { AlvoDenuncia, DenunciaMotivoItem } from '../types/denuncia';

export const DENUNCIA_MOTIVOS: DenunciaMotivoItem[] = [
  { id: 'informacao_falsa', label: 'False information', icon: 'alert-circle-outline', aplicaA: ['reporte', 'comentario'] },
  { id: 'foto_inadequada', label: 'Inappropriate photo', icon: 'image-outline', aplicaA: ['reporte'] },
  { id: 'comentario_ofensivo', label: 'Offensive comment', icon: 'chatbubble-ellipses-outline', aplicaA: ['comentario'] },
  { id: 'spam', label: 'Spam', icon: 'megaphone-outline', aplicaA: ['reporte', 'comentario'] },
  { id: 'outro', label: 'Other reason', icon: 'ellipsis-horizontal', aplicaA: ['reporte', 'comentario'] },
];

// "Inappropriate photo" não faz sentido num comentário, nem "Offensive comment" num reporte
export function getMotivosPara(tipo: AlvoDenuncia['tipo']) {
  return DENUNCIA_MOTIVOS.filter((m) => m.aplicaA.includes(tipo));
}
