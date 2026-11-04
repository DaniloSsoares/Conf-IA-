import { supabaseConfig } from "@/src/config/supabase";

// Ao mudar o texto dos termos, suba a versão: todos os usuários precisam aceitar de novo
// (o consentimento da LGPD vale para o texto que a pessoa leu, não para o novo).
export const VERSAO_TERMOS = '1.1.0';
export const DATA_TERMOS = 'Novembro de 2026';

export  async function createTerms(){
    const {data: {user}} = await supabaseConfig.auth.getUser();
    if (!user) return;

    const {error}= await supabaseConfig.from('perfil_aceites')
    .insert({
        perfil_id:user.id,
        versao_termo: VERSAO_TERMOS
    });

     if (error && error.code !== '23505') { // Ignora erro de já aceito (unique constraint)
      throw error;
     }
}

export async function getTerms(userId: string){
    const {data, error} = await supabaseConfig
    .from('perfil_aceites')
    .select('id')
    .eq('perfil_id', userId)
    .eq('versao_termo', VERSAO_TERMOS)
    .single();

  return !!data;
}
