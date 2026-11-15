import { NivelRisco } from '@/src/shared/types/notification';
import { REPORT_CATEGORIES } from './reportCategories';

// Valores do enum nivel_risco do banco → texto exibido na tela
export const RISK_LABEL: Record<NivelRisco, string> = {
  // DEMO (pitch em inglês)
  baixo: 'Low',
  moderado: 'Moderate',
  alto: 'High',
  critico: 'Critical',
};

// Reporte não tem coluna de risco: vem da categoria, com a mesma regra do
// trigger do alerta colaborativo (A.10). Categoria desconhecida → 'moderado',
// o mesmo ELSE do trigger
export function getNivelRiscoReporte(tipo?: string | null): NivelRisco {
  return REPORT_CATEGORIES.find((c) => c.id === tipo)?.nivelRisco ?? 'moderado';
}
