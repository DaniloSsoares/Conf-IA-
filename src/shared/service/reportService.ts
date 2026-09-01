import { supabaseConfig } from "@/src/config/supabase";
import { decode } from "base64-arraybuffer";
import { CreateReportInput, Report, UpdateReportInput } from "../types/report";

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

export async function updateReport(
  reportId: string,
  userId: string,
  input: UpdateReportInput
): Promise<{ data: Report | null; error: any }> {
  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.reporte_tipo_ocorrencia !== undefined) {
      updatePayload.reporte_tipo_ocorrencia = input.reporte_tipo_ocorrencia;
    }
    if (input.reporte_descricao !== undefined) {
      updatePayload.reporte_descricao = input.reporte_descricao;
    }
    if (input.reporte_latitude !== undefined) {
      updatePayload.reporte_latitude = input.reporte_latitude;
    }
    if (input.reporte_longitude !== undefined) {
      updatePayload.reporte_longitude = input.reporte_longitude;
    }
    if (input.reporte_endereco !== undefined) {
      updatePayload.reporte_endereco = input.reporte_endereco;
    }

    const { data: updatedReport, error: updateError } = await supabaseConfig
      .from('reportes')
      .update(updatePayload)
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: updateError };
    }

    if (input.removeFoto) {
      const { error: deleteMediaError } = await supabaseConfig
        .from('reporte_midias')
        .delete()
        .eq('reporte_id', reportId);

      if (deleteMediaError) {
        console.error('Erro ao remover mídia do reporte:', deleteMediaError);
      }
    }

    if (input.fotoBase64) {
      const photoUrl = await uploadReportPhoto(userId, input.fotoBase64, input.fotoExt || 'jpg');

      if (photoUrl) {
        await supabaseConfig
          .from('reporte_midias')
          .delete()
          .eq('reporte_id', reportId);

        const { error: midiaError } = await supabaseConfig
          .from('reporte_midias')
          .insert({
            reporte_id: reportId,
            midia_url: photoUrl,
            midia_tipo: 'foto',
          });

        if (midiaError) {
          console.error('Falhou ao salvar a nova foto:', midiaError);
        }
      }
    }

    return { data: updatedReport as Report, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteReport(
  reportId: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error: mediaError } = await supabaseConfig
      .from('reporte_midias')
      .delete()
      .eq('reporte_id', reportId);

    if (mediaError) {
      console.error('Erro ao excluir mídias do reporte:', mediaError);
    }

    const { error: reportError } = await supabaseConfig
      .from('reportes')
      .delete()
      .eq('id', reportId);

    if (reportError) {
      return { success: false, error: reportError };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
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

export async function getActiveReports(): Promise<Report[]> {
  try {
    const { data, error } = await supabaseConfig
      .from("reportes")
      .select("*")
      .neq("reporte_status", "rejeitado");
    if (error) throw error;
    return (data as Report[]) || [];
  } catch (error) {
    console.error("Erro ao buscar reportes ativos:", error);
    return [];
  }
}

