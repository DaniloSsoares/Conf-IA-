// Valores iguais ao CHECK de denuncias.denuncia_motivo no banco
export type DenunciaMotivo =
  | 'foto_inadequada'
  | 'comentario_ofensivo'
  | 'informacao_falsa'
  | 'spam'
  | 'outro';

// O que está sendo denunciado: um reporte ou um comentário (linha de reporte_validacoes).
// Tipo discriminado: impossível montar um alvo com os dois ids, igual ao CHECK do banco.
export type AlvoDenuncia =
  | { tipo: 'reporte'; id: string }
  | { tipo: 'comentario'; id: string };

export interface DenunciaMotivoItem {
  id: DenunciaMotivo;
  label: string;
  icon: string;
  aplicaA: AlvoDenuncia['tipo'][];
}
