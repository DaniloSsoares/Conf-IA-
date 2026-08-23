import { supabaseConfig } from "@/src/config/supabase";

export  async function createTerms(){
    const {data: {user}} = await supabaseConfig.auth.getUser();
    if (!user) return;

    const {error}= await supabaseConfig.from('perfil_aceites')
    .insert({
        perfil_id:user.id,
        versao_termo: '1.0.0'
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
    .eq('versao_termo', '1.0.0')
    .single();

  return !!data;
}