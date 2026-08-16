import { ReportCategory } from "./report";

export type NivelRisco = 'baixo' |'moderado'| 'medio' | 'alto' | 'critico';
export type StatusAlerta = 'ativo' | 'expirado' | 'cancelado';

export interface Alerta {
    id: string;
    alerta_tipo_ocorrencia: ReportCategory;
    alerta_nivel_risco: NivelRisco;
    alerta_titulo: string;
    alerta_descricao: string;
    alerta_status: StatusAlerta;
    created_at: string;
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