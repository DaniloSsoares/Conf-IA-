export type ReportCategory =
  | 'alagamento'
  | 'deslizamento'
  | 'via_bloqueada'
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

export interface ReportCategoryItem {
  id: ReportCategory;
  label: string;
  icon: string;
  fullWidth?: boolean;
}