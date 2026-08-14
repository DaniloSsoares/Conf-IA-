export type AlertPreferences = {
    alagamento: boolean;
    deslizamento: boolean;
    bloqueio_via: boolean;
    fogo_em_mata: boolean;
    queda_de_galho: boolean;
    falta_de_luz: boolean;
    outro: boolean;
}

export type Profile = {
    id: string;
    perfil_nome_completo:string
    perfil_avatar_url: string | null;
    perfil_telefone: string | null;
    perfil_cidade: string | null;
    perfil_estado: string | null;
    perfil_raio_notificacao_km:number;
    perfil_preferencias_alertas:AlertPreferences;
    perfil_latitude: number | null;
    perfil_longitude: number | null;
    created_at:string;
    updated_at:string;
}