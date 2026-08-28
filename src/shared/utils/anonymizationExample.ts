import { 
  anonimizarPerfil, 
  getPerfisAnonimizadosSupabase, 
  ProfileAnonimizado 
} from "../service/anonymizationService";
import { Profile } from "../types/profile";

/**
 * Exemplo de uso para demonstrar a aplicabilidade da anonimização de dados no projeto.
 * Pode ser executado em componentes, serviços ou para fins de apresentação/atividade acadêmica.
 */

// Dados mockados para teste estático
const perfilExemplo: Profile = {
  id: "uuid-1234-5678-90ab",
  perfil_nome_completo: "Danilo Soares",
  perfil_avatar_url: "https://example.com/avatar.jpg",
  perfil_telefone: "(11) 98765-4321",
  perfil_cidade: "São Paulo",
  perfil_estado: "SP",
  perfil_raio_notificacao_km: 10,
  perfil_preferencias_alertas: {
    alagamento: true,
    deslizamento: false,
    bloqueio_via: true,
    fogo_em_mata: false,
    queda_de_galho: false,
    falta_de_luz: true,
    outro: false,
  },
  perfil_latitude: -23.55052,
  perfil_longitude: -46.6333,
  perfil_trust_score: 95,
  created_at: "2026-01-15T10:00:00Z",
  updated_at: "2026-08-28T19:00:00Z",
};

/**
 * Função de demonstração que anonimiza um perfil estático e busca do Supabase
 */
export async function demonstrarAnonimizacao() {
  console.log("=== 1. TESTE DE ANONIMIZAÇÃO LOCAL ===");
  console.log("Dado Original (Sensível):", {
    nome: perfilExemplo.perfil_nome_completo,
    telefone: perfilExemplo.perfil_telefone,
    latitude: perfilExemplo.perfil_latitude,
    longitude: perfilExemplo.perfil_longitude,
  });

  const anonimizado = anonimizarPerfil(perfilExemplo);
  console.log("Dado Anonimizado (LGPD):", anonimizado);

  console.log("\n=== 2. TESTE DE BUSCA ANONIMIZADA DO SUPABASE ===");
  const perfisDoBanco: ProfileAnonimizado[] = await getPerfisAnonimizadosSupabase();
  console.log(`Total de perfis buscados e anonimizados do Supabase: ${perfisDoBanco.length}`);
  console.log("Exemplo de perfis anonimizados:", perfisDoBanco);
}
