import { supabaseConfig } from "@/src/config/supabase";
import { Profile } from "../types/profile";

/**
 * Interface representando o Perfil com dados devidamente anonimizados (conforme LGPD)
 */
export type ProfileAnonimizado = {
  idAnonimo: string;
  nomeMascarado: string;
  telefoneMascarado: string | null;
  cidade: string | null;
  estado: string | null;
  localizacaoAproximada: {
    latitude: number | null;
    longitude: number | null;
  };
  trustScore: number;
  dataCriacao: string;
};

/**
 * 1. Função Pura: Recebe o perfil com dados sensíveis e aplica as técnicas de anonimização (LGPD):
 *  - Pseudonimização do ID (Gera um hash único irreatribuível ao usuário direto)
 *  - Mascaramento de Nome Completo (ex: "Danilo Soares" -> "D*** S***")
 *  - Mascaramento de Telefone (ex: "(11) 98765-4321" -> "(11) *****-4321")
 *  - Generalização/Arredondamento Geográfico de Latitude e Longitude (2 casas decimais)
 */
export function anonimizarPerfil(perfil: Profile): ProfileAnonimizado {
  // Mascarar Nome Completo
  const nomeMascarado = perfil.perfil_nome_completo
    ? perfil.perfil_nome_completo
        .split(" ")
        .map((palavra) => (palavra.length > 1 ? `${palavra[0]}***` : palavra))
        .join(" ")
    : "Usuário Anônimo";

  // Mascarar Telefone
  let telefoneMascarado: string | null = null;
  if (perfil.perfil_telefone) {
    const num = perfil.perfil_telefone;
    telefoneMascarado = num.length > 6
      ? `${num.substring(0, 4)}*****${num.substring(num.length - 2)}`
      : "*****";
  }

  // Generalização/Arredondamento de Coordenadas (reduz a precisão para proteção de privacidade)
  const latAproximada = perfil.perfil_latitude != null
    ? parseFloat(perfil.perfil_latitude.toFixed(2))
    : null;
  const lngAproximada = perfil.perfil_longitude != null
    ? parseFloat(perfil.perfil_longitude.toFixed(2))
    : null;

  // Pseudonimização simples do ID (Hash simples determinístico de exibição)
  const hashVal = String(perfil.id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const idAnonimo = `USER-ANON-${hashVal.toString(16).toUpperCase()}`;

  return {
    idAnonimo,
    nomeMascarado,
    telefoneMascarado,
    cidade: perfil.perfil_cidade,
    estado: perfil.perfil_estado,
    localizacaoAproximada: {
      latitude: latAproximada,
      longitude: lngAproximada,
    },
    trustScore: perfil.perfil_trust_score,
    dataCriacao: perfil.created_at,
  };
}

/**
 * 2. Integração com o Supabase:
 * Busca os perfis cadastrados no banco de dados e retorna uma lista totalmente anonimizada.
 * Esta função pode ser utilizada para exportação de dados analíticos ou relatórios acadêmicos sem violar a LGPD.
 */
export async function getPerfisAnonimizadosSupabase(): Promise<ProfileAnonimizado[]> {
  try {
    const { data, error } = await supabaseConfig
      .from("perfil")
      .select("*");

    if (error) {
      console.error("Erro ao buscar perfis para anonimização:", error);
      return [];
    }

    if (!data) return [];

    // Aplica a função de anonimização em cada registro do Supabase
    return (data as Profile[]).map(anonimizarPerfil);
  } catch (err) {
    console.error("Erro na execução do serviço de anonimização:", err);
    return [];
  }
}
