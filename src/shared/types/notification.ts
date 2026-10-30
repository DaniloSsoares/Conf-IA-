import { ReportCategory } from "./report";

export type NivelRisco = 'baixo' |'moderado'| 'alto' | 'critico';
export type StatusAlerta = 'ativo' | 'expirado' | 'cancelado';
export type OrigemAlerta = 'sistema_ia' | 'defesa_civil' | 'colaborativo';

export interface Alerta {
    id: string;
    alerta_tipo_ocorrencia: ReportCategory;
    alerta_nivel_risco: NivelRisco;
    alerta_titulo: string;
    alerta_descricao: string;
    alerta_status: StatusAlerta;
    created_at: string;
    alerta_latitude?: number | null;
    alerta_longitude?: number | null;
    alerta_raio_km?: number | null;
    alerta_area_id?: string | null;
    alerta_origem?: OrigemAlerta | null;
    alerta_emitido_por?: string | null;
    alerta_expira_em?: string | null;
    updated_at?: string;
}

export interface AlertNotification{
   id: string;
   alerta_id: string;
   perfil_id: string;
   notificacao_canal : string;
   notificacao_lida: boolean;
   notificacao_enviada_em:string;
   alertas: Alerta;
   
}