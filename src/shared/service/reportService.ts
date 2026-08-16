import { supabaseConfig } from "@/src/config/supabase";
import { decode } from "base64-arraybuffer";
import { CreateReportInput, Report } from "../types/report";

export async function uploadReportPhoto(
  userId: string,
  base64: string,
  fileExt: string = "jpg"
): Promise<string | null> {
  try {
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data: storageData, error: storageError } = await supabaseConfig.storage
      .from("fotos-ocorrencia")
      .upload(fileName, decode(base64), {
        contentType: `image/${fileExt === "png" ? "png" : "jpeg"}`,
        upsert: true,
      });

    if (storageError) {
      console.error("Erro no upload da foto do reporte:", storageError);
      return null;
    }

    const { data: urlData } = supabaseConfig.storage
      .from("fotos-ocorrencia")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Erro ao realizar upload da imagem:", error);
    return null;
  }
}

export async function createReport(
  userId: string,
  input: CreateReportInput
): Promise<{ data: Report | null; error: any }> {
  try {
    const { data: reportData, error: reportError } = await supabaseConfig
      .from('reportes')
      .insert({
        perfil_id: userId,
        reporte_tipo_ocorrencia: input.reporte_tipo_ocorrencia,
        reporte_descricao: input.reporte_descricao || null,
        reporte_latitude: input.reporte_latitude,
        reporte_longitude: input.reporte_longitude,
        reporte_endereco: input.reporte_endereco || null,
      })
      .select()
      .single();
    if (reportError) {
      return {
        data: null, error: reportError
      };
    }
    if (input.fotoBase64) {
      const photoUrl = await uploadReportPhoto(userId, input.fotoBase64, input.fotoExt);

      if (photoUrl) {
        const { error: midiaError } = await supabaseConfig
          .from("reporte_midias")
          .insert({
            reporte_id: reportData.id,
            midia_url: photoUrl,
            midia_tipo: "foto",
          });

        if (midiaError) {
          console.error("Reporte criado, mas falhou ao salvar a foto:", midiaError);
        }
      }
    }
    return { data: reportData as Report, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getUserReports(userId: string): Promise<Report[]> {
  try {
     const { data, error } = await supabaseConfig
      .from("reportes")
      .select("*, reporte_midias(*)")
      .eq("perfil_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Report[]) || [];
  } catch (error) {
    console.error("Erro ao buscar reportes do usuário:", error);
    return [];
  }
}
