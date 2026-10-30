import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getReportById } from '@/src/shared/service/reportService';
import { getAlertaById } from '@/src/shared/service/alertaNotificationService';
import { Alerta } from '@/src/shared/types/notification';
import { Report } from '@/src/shared/types/report';

export type HistoryItemType = 'alerta' | 'reporte';

function parseData(data?: string) {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Busca o alerta ou reporte pelo id e recarrega sempre que a tela ganha foco
 * (cobre a volta da tela de edição). `data` é só fallback: mostra algo na hora
 * enquanto a versão do banco não chega.
 */
export function useHistoryItem(type: HistoryItemType, id?: string, data?: string) {
  const [item, setItem] = useState<Alerta | Report | null>(() => parseData(data));
  const [loading, setLoading] = useState(true);

  const itemId = id ?? item?.id;

  const reload = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }
    const result = type === 'alerta' ? await getAlertaById(itemId) : await getReportById(itemId);
    if (result) setItem(result);
    setLoading(false);
  }, [type, itemId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { item, loading, reload };
}
