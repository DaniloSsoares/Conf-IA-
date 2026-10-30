export type ReportCategory =
  | 'alagamento'
  | 'deslizamento'
  | 'bloqueio_via'
  | 'fogo_em_mata'
  | 'queda_de_galho'
  | 'falta_de_luz'
  | 'outro';

export type ReportStatus = 'pendente' | 'validado' | 'rejeitado' | 'resolvido';


export interface ReportLocation {
  latitude: number;
  longitude: number;
  endereco?: string | null;
}

export interface ReportMedia {
  id: string;
  reporte_id: string;
  midia_url: string;
  midia_tipo: string;
  created_at: string;
}

export interface Report {
  id: string;
  perfil_id: string;
  reporte_tipo_ocorrencia: ReportCategory;
  reporte_descricao?: string | null;
  reporte_latitude: number;
  reporte_longitude: number;
  reporte_endereco?: string | null;
  reporte_status: ReportStatus;
  reporte_score_confianca: number;
  created_at: string;
  updated_at: string;
  reporte_midias?: ReportMedia[];
}

export interface CreateReportInput {
  reporte_tipo_ocorrencia: ReportCategory;
  reporte_descricao?: string;
  reporte_latitude: number;
  reporte_longitude: number;
  reporte_endereco?: string | null;
  fotoBase64?: string | null;
  fotoExt?: string;
}

export interface UpdateReportInput {
  reporte_tipo_ocorrencia?: ReportCategory;
  reporte_descricao?: string | null;
  reporte_latitude?: number;
  reporte_longitude?: number;
  reporte_endereco?: string | null;
  fotoBase64?: string | null;
  fotoExt?: string;
  removeFoto?: boolean;
}

export interface ReportCategoryItem {
  id: ReportCategory;
  label: string;
  icon: string;
  fullWidth?: boolean;
}

export type TipoValidacao = 'confirma'|'contesta';

export interface ReportValidation {
  perfil_id: string;
  validacao_tipo: TipoValidacao;
  validacao_comentario: string | null;
  created_at: string;
}

// Mesmo valor de v_min_votos no trigger recalculate_reporte_score
export const MIN_VOTOS_VALIDACAO = 3;
