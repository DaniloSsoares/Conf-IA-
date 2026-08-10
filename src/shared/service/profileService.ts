import { supabaseConfig } from "@/src/config/supabase";
import { Profile } from "../types/profile";
import { decode } from "base64-arraybuffer";


export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const { data, error } = await supabaseConfig
            .from("perfil")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) throw error;

        return data as Profile;
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
    }
}

export async function updateProfile(
    userId: string,
    updates: Partial<
        Pick<
            Profile,
            | "perfil_nome_completo"
            | "perfil_cidade"
            | "perfil_estado"
            | "perfil_telefone"
            | "perfil_avatar_url"
            | "perfil_raio_notificacao_km"
            | "perfil_preferencias_alertas"
            | "perfil_latitude"
            | "perfil_longitude"
        >
    >
) {
    const {data, error} = await supabaseConfig
    .from("perfil")
    .upsert({ id: userId, ...updates })
    .select()
    .single();
    return { data: data as Profile | null, error};
}

export async function uploadAvatar(
    userId: string, 
    base64: string, 
    fileExt: string = 'png'
): Promise<string | null> {
  try {
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
    
    // Upload do arquivo decodificado do base64
    const { data: storageData, error: storageError } = await supabaseConfig.storage
      .from("avatars")
      .upload(fileName, decode(base64), {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (storageError) {
      console.error('Erro no upload do storage:', storageError);
      return null;
    }

    // Busca a URL pública do avatar
    const { data: urlData } = supabaseConfig.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Salva o link no perfil (usando a função updateProfile que já faz o upsert)
    const { error: dbError } = await updateProfile(userId, { perfil_avatar_url: publicUrl });
    if (dbError) throw dbError;

    return publicUrl;
  } catch (error) {
    console.error("Erro no upload do avatar:", error);
    return null;
  }
}